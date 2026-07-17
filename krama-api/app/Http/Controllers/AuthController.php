<?php

namespace App\Http\Controllers;

use App\Helpers\EmailTemplates;
use App\Helpers\MailConfig;
use App\Jobs\SendEmailVerificationJob;
use App\Models\AuthToken;
use App\Models\Role;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\Rule;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;

class AuthController extends Controller
{
    // POST /api/auth/request-otp — text a 6-digit code to a phone for registration.
    public function requestOtp(Request $request)
    {
        $data  = $request->validate(['phone' => 'required|string|max:20']);
        $phone = \App\Helpers\Phone::normalize($data['phone']);
        if (! \App\Helpers\Phone::isValid($phone)) {
            return response()->json(['message' => 'Enter a valid phone number.'], 422);
        }

        // Already registered → they should log in, not sign up again.
        if (User::where('phone', $phone)->exists()) {
            return response()->json(['message' => 'This phone number is already registered. Please log in instead.'], 422);
        }

        // Rate limit: at most 5 codes per hour per phone.
        $rlKey = 'otp:' . $phone;
        if (RateLimiter::tooManyAttempts($rlKey, 5)) {
            return response()->json(['message' => 'Too many code requests. Please try again later.'], 429);
        }
        RateLimiter::hit($rlKey, 3600);

        $code = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        \App\Models\OtpCode::where('phone', $phone)->where('purpose', 'register')->delete();
        \App\Models\OtpCode::create([
            'phone'      => $phone,
            'code_hash'  => Hash::make($code),
            'purpose'    => 'register',
            'expires_at' => now()->addMinutes(5),
            'attempts'   => 0,
            'created_at' => now(),
        ]);

        $text = 'Your Krama verification code is: ' . $code;
        if (\App\Services\SmsService::isEnabled()) {
            $res = \App\Services\SmsService::send($phone, $text);
            if (! $res['ok']) {
                return response()->json(['message' => 'Could not send SMS: ' . $res['error']], 422);
            }
        } else {
            // Dev fallback: no SMS gateway configured — log the code so local testing works.
            Log::info('OTP (SMS not configured) for ' . $phone . ': ' . $code);
        }

        return response()->json(['message' => 'Verification code sent.', 'expires_in' => 300]);
    }

    public function register(Request $request)
    {
        $data = $request->validate([
            'name'     => 'required|string|max:120',
            'email'    => 'nullable|email|unique:users,email',
            'phone'    => 'nullable|string|max:20',
            'otp'      => 'nullable|string|max:10',
            'password' => ['required', 'string', Password::min(8)->mixedCase()->numbers()->symbols()],
            'role'     => 'in:employer,candidate',
        ]);

        $email = $data['email'] ?? null;
        $phone = \App\Helpers\Phone::normalize($data['phone'] ?? null);

        if (! $email && ! $phone) {
            return response()->json(['message' => 'Provide an email or a phone number.'], 422);
        }

        // Phone registration must be verified with a valid, unexpired OTP.
        $phoneVerifiedAt = null;
        if ($phone) {
            if (! \App\Helpers\Phone::isValid($phone)) {
                return response()->json(['message' => 'Enter a valid phone number.'], 422);
            }
            if (User::where('phone', $phone)->exists()) {
                return response()->json(['message' => 'This phone number is already registered.'], 422);
            }
            $otp = (string) ($data['otp'] ?? '');
            $row = \App\Models\OtpCode::where('phone', $phone)->where('purpose', 'register')->orderByDesc('id')->first();
            if (! $row || now()->greaterThan($row->expires_at) || $row->attempts >= 5 || ! Hash::check($otp, $row->code_hash)) {
                if ($row) {
                    $row->increment('attempts');
                }
                return response()->json(['message' => 'Invalid or expired verification code.'], 422);
            }
            $row->delete();
            $phoneVerifiedAt = now();
        }

        $roleSlug = $data['role'] ?? 'candidate';
        $role = Role::where('slug', $roleSlug)->firstOrFail();

        $user = new User([
            'role_id'       => $role->id,
            'name'          => $data['name'],
            'email'         => $email,
            'phone'         => $phone,
            'password_hash' => Hash::make($data['password']),
        ]);
        $user->status            = 'active';
        $user->phone_verified_at = $phoneVerifiedAt;
        $user->created_at        = now();
        $user->updated_at        = now();
        $user->save();

        if ($email) {
            SendEmailVerificationJob::dispatch($user);
        }

        $token = JWTAuth::fromUser($user);

        return response()->json([
            'user'              => $this->userPayload($user),
            'access_token'      => $token,
            'token_type'        => 'bearer',
            'expires_in'        => config('jwt.ttl') * 60,
            'refresh_token'     => $this->issueRefreshToken($user),
            'email_verified'    => false,
            'message'           => $email
                ? 'Registration successful. Please check your email to verify your account.'
                : 'Registration successful.',
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'password' => 'required|string',
        ]);

        // Accept an email OR a phone number: `identifier` (preferred), the legacy
        // `email` field, or an explicit `phone`. An "@" means it's an email.
        $id = trim((string) ($request->input('identifier') ?? $request->input('email') ?? $request->input('phone') ?? ''));
        if ($id === '') {
            return response()->json(['message' => 'Enter your email or phone number.'], 422);
        }

        $query = User::with('role.permissions');
        if (strpos($id, '@') !== false) {
            $user = $query->where('email', $id)->first();
        } else {
            $user = $query->where('phone', \App\Helpers\Phone::normalize($id))->first();
        }

        if (! $user || ! Hash::check($request->input('password'), $user->password_hash) || $user->status !== 'active') {
            Log::channel('audit')->warning('auth.login_failed', [
                'identifier' => $id,
                'ip'    => $request->ip(),
                'ua'    => substr($request->userAgent() ?? '', 0, 200),
                'reason' => ! $user ? 'user_not_found' : ($user->status !== 'active' ? 'account_inactive' : 'bad_password'),
            ]);
            return response()->json(['message' => 'Invalid credentials or account not active.'], 401);
        }

        $token = JWTAuth::fromUser($user);

        $user->forceFill(['last_active_at' => now()])->save();

        return response()->json([
            'user'          => $this->userPayload($user),
            'access_token'  => $token,
            'token_type'    => 'bearer',
            'expires_in'    => config('jwt.ttl') * 60,
            'refresh_token' => $this->issueRefreshToken($user),
        ]);
    }

    public function refresh(Request $request)
    {
        $data = $request->validate(['refresh_token' => 'required|string']);

        $hash = hash('sha256', $data['refresh_token']);
        $record = AuthToken::where('token_hash', $hash)
            ->where('type', 'refresh')
            ->first();

        if (! $record || $record->isExpired()) {
            return response()->json(['message' => 'Refresh token invalid or expired.'], 401);
        }

        $user = User::with('role.permissions')->find($record->user_id);

        // Always delete the used refresh token (rotation)
        $record->delete();

        // Reject suspended or deleted accounts even with a valid refresh token
        if (! $user || $user->status !== 'active') {
            return response()->json(['message' => 'Account is not active.'], 401);
        }

        $token = JWTAuth::fromUser($user);

        return response()->json([
            'access_token'  => $token,
            'token_type'    => 'bearer',
            'expires_in'    => config('jwt.ttl') * 60,
            'refresh_token' => $this->issueRefreshToken($user),
        ]);
    }

    public function logout(Request $request)
    {
        $data = $request->validate(['refresh_token' => 'required|string']);

        $hash = hash('sha256', $data['refresh_token']);
        AuthToken::where('token_hash', $hash)->where('type', 'refresh')->delete();

        JWTAuth::invalidate(JWTAuth::getToken());

        return response()->json(['message' => 'Logged out.']);
    }

    public function me()
    {
        $user = auth()->user()->load('role.permissions');

        return response()->json($this->userPayload($user));
    }

    public function updateMe(Request $request)
    {
        $user = auth()->user();

        $data = $request->validate([
            'name'                     => 'sometimes|string|max:190',
            'email'                    => ['sometimes', 'email', 'max:190', Rule::unique('users', 'email')->ignore($user->id)],
            'phone'                    => 'nullable|string|max:30',
            'bio'                      => 'nullable|string|max:1000',
            'cv_visibility'            => 'nullable|in:public,employers,private',
            'allow_candidate_messages' => 'sometimes|boolean',
        ]);

        $user->update($data);

        return response()->json($this->userPayload($user->fresh()->load('role.permissions')));
    }

    public function changePassword(Request $request)
    {
        $user = auth()->user();

        $data = $request->validate([
            'current_password' => 'required|string',
            'password'         => ['required', 'string', 'confirmed', Password::min(8)],
        ]);

        if (!Hash::check($data['current_password'], $user->password_hash)) {
            return response()->json(['message' => 'Current password is incorrect.'], 422);
        }

        $user->update(['password_hash' => Hash::make($data['password'])]);

        return response()->json(['message' => 'Password updated successfully.']);
    }

    public function uploadAvatar(Request $request)
    {
        $request->validate(['avatar' => 'required|image|max:10240']); // 10 MB max raw

        $user = auth()->user();

        // Delete old avatar
        if ($user->avatar_url && str_contains($user->avatar_url, '/storage/avatars/')) {
            $oldPath = str_replace(url('/storage') . '/', '', $user->avatar_url);
            Storage::disk('public')->delete($oldPath);
        }

        $file        = $request->file('avatar');
        $maxDim      = 400;
        $quality     = 85;
        $filename    = $user->id . '_' . Str::random(8) . '.jpg';
        $storagePath = 'avatars/' . $filename;
        $fullPath    = storage_path('app/public/' . $storagePath);

        // Auto-detect and load image with GD (handles jpeg/png/gif/webp/bmp)
        $raw = file_get_contents($file->getRealPath());
        $src = @imagecreatefromstring($raw);

        if (!$src) {
            return response()->json(['message' => 'Could not process image. Please upload a JPEG, PNG, GIF or WebP file.'], 422);
        }

        $srcW  = imagesx($src);
        $srcH  = imagesy($src);
        $ratio = min($maxDim / $srcW, $maxDim / $srcH, 1.0);
        $dstW  = max(1, (int) round($srcW * $ratio));
        $dstH  = max(1, (int) round($srcH * $ratio));
        $dst   = imagecreatetruecolor($dstW, $dstH);

        // White background (flattens transparency)
        $white = imagecolorallocate($dst, 255, 255, 255);
        imagefilledrectangle($dst, 0, 0, $dstW - 1, $dstH - 1, $white);
        imagecopyresampled($dst, $src, 0, 0, 0, 0, $dstW, $dstH, $srcW, $srcH);

        if (!is_dir(dirname($fullPath))) mkdir(dirname($fullPath), 0755, true);
        imagejpeg($dst, $fullPath, $quality);
        imagedestroy($src);
        imagedestroy($dst);

        $url = url('/storage/' . $storagePath);
        $user->update(['avatar_url' => $url]);

        return response()->json($this->userPayload($user->fresh()->load('role.permissions')));
    }

    // GET /api/auth/email/verify/{id}/{hash} — called when user clicks link in email
    public function verifyEmail(Request $request, $id, $hash)
    {
        if (! $request->hasValidSignature()) {
            abort(403, 'Invalid or expired verification link.');
        }

        $user = User::findOrFail($id);

        if (! hash_equals((string) $hash, sha1($user->getEmailForVerification()))) {
            abort(403, 'Invalid verification link.');
        }

        $frontend = rtrim(config('app.frontend_url', 'http://localhost/krama'), '/');

        if ($user->hasVerifiedEmail()) {
            return redirect($frontend . '?verified=already');
        }

        $user->markEmailAsVerified();

        return redirect($frontend . '?verified=1');
    }

    // POST /api/auth/email/resend — resend verification email (auth required)
    public function resendVerification(Request $request)
    {
        $user = $request->user();

        if ($user->hasVerifiedEmail()) {
            return response()->json(['message' => 'Email already verified.'], 422);
        }

        // 3 resends per 10 minutes per user to prevent email spam
        $key = 'resend-verification:' . $user->id;
        if (RateLimiter::tooManyAttempts($key, 3)) {
            $seconds = RateLimiter::availableIn($key);
            return response()->json([
                'message' => 'Too many requests. Please wait ' . $seconds . ' seconds.',
            ], 429);
        }
        RateLimiter::hit($key, 600);

        SendEmailVerificationJob::dispatch($user);

        return response()->json(['message' => 'Verification email sent.']);
    }

    // POST /api/auth/password/forgot — request a password reset link.
    // Always returns a generic success message so the endpoint can't be used
    // to discover which email addresses have accounts.
    public function forgotPassword(Request $request)
    {
        $data = $request->validate(['email' => 'required|email|max:190']);

        $generic = response()->json([
            'message' => 'If an account exists for that email, a password reset link has been sent.',
        ]);

        // Extra rate limit on top of the route throttle: 5 requests / 15 min per email.
        $key = 'forgot-password:' . strtolower($data['email']);
        if (RateLimiter::tooManyAttempts($key, 5)) {
            return $generic;
        }
        RateLimiter::hit($key, 900);

        $user = User::where('email', $data['email'])->where('status', 'active')->first();
        if (! $user) {
            return $generic;
        }

        // One active reset token at a time — clear any previous ones.
        AuthToken::where('user_id', $user->id)->where('type', 'reset')->delete();

        $raw = Str::random(64);
        AuthToken::create([
            'user_id'    => $user->id,
            'type'       => 'reset',
            'token_hash' => hash('sha256', $raw),
            'expires_at' => now()->addMinutes(60),
            'created_at' => now(),
        ]);

        $frontend  = rtrim(config('app.frontend_url', 'http://localhost/krama'), '/');
        $resetUrl  = $frontend . '?reset=1&token=' . $raw . '&email=' . urlencode($user->email);

        if (MailConfig::isConfigured()) {
            try {
                MailConfig::applyFromDb();
                [$subject, $html] = EmailTemplates::passwordReset($user->name, $resetUrl);
                Mail::html($html, fn ($m) => $m->to($user->email, $user->name)->subject($subject));
            } catch (\Exception $e) {
                Log::warning('Password reset email failed: ' . $e->getMessage());
            }
        }

        return $generic;
    }

    // POST /api/auth/password/reset — set a new password using a valid reset token.
    public function resetPassword(Request $request)
    {
        $data = $request->validate([
            'email'    => 'required|email|max:190',
            'token'    => 'required|string',
            'password' => ['required', 'string', 'confirmed', Password::min(8)->mixedCase()->numbers()->symbols()],
        ]);

        $invalid = response()->json(['message' => 'This password reset link is invalid or has expired.'], 422);

        $user = User::where('email', $data['email'])->where('status', 'active')->first();
        if (! $user) {
            return $invalid;
        }

        $record = AuthToken::where('user_id', $user->id)
            ->where('type', 'reset')
            ->where('token_hash', hash('sha256', $data['token']))
            ->first();

        if (! $record || $record->isExpired()) {
            return $invalid;
        }

        $user->update(['password_hash' => Hash::make($data['password'])]);

        // Consume the reset token and revoke all sessions (reset + refresh) — force re-login.
        AuthToken::where('user_id', $user->id)->whereIn('type', ['reset', 'refresh'])->delete();

        Log::channel('audit')->info('auth.password_reset', [
            'user_id' => $user->id,
            'ip'      => $request->ip(),
        ]);

        return response()->json(['message' => 'Your password has been reset. You can now sign in with your new password.']);
    }

    // POST /api/auth/social — sign in / sign up with a Google or Facebook token.
    // The provider token is verified SERVER-SIDE; we never trust a client-supplied email.
    public function socialLogin(Request $request)
    {
        $data = $request->validate([
            'provider' => 'required|in:google,facebook',
            'token'    => 'required|string|max:4000',
        ]);

        $social = Setting::where('group', 'social')->pluck('value', 'key')->toArray();

        // Verify the token with the provider and extract a trusted profile.
        try {
            if ($data['provider'] === 'google') {
                if (empty($social['google_enabled']) || $social['google_enabled'] === '0' || empty($social['google_client_id'])) {
                    return response()->json(['message' => 'Google sign-in is not configured.'], 422);
                }
                $profile = $this->verifyGoogleToken($data['token'], $social['google_client_id']);
            } else {
                if (empty($social['facebook_enabled']) || $social['facebook_enabled'] === '0' || empty($social['facebook_app_id'])) {
                    return response()->json(['message' => 'Facebook sign-in is not configured.'], 422);
                }
                $profile = $this->verifyFacebookToken($data['token']);
            }
        } catch (\Exception $e) {
            Log::warning('Social login verification failed: ' . $e->getMessage());
            return response()->json(['message' => 'Could not verify your ' . ucfirst($data['provider']) . ' sign-in. Please try again.'], 401);
        }

        if (empty($profile['email'])) {
            return response()->json(['message' => 'Your ' . ucfirst($data['provider']) . ' account did not provide a verified email address.'], 422);
        }

        $user = User::with('role.permissions')->where('email', $profile['email'])->first();

        if ($user) {
            if ($user->status !== 'active') {
                return response()->json(['message' => 'This account is not active.'], 403);
            }
        } else {
            // First-time social sign-in → create a candidate account.
            $role = Role::where('slug', 'candidate')->firstOrFail();
            $user = new User([
                'role_id'       => $role->id,
                'name'          => $profile['name'] ?: strtok($profile['email'], '@'),
                'email'         => $profile['email'],
                'password_hash' => Hash::make(Str::random(40)), // random — user can set one via password reset
            ]);
            $user->status            = 'active';
            $user->email_verified_at = now(); // the provider already verified the email
            $user->created_at        = now();
            $user->updated_at        = now();
            $user->save();
            $user->load('role.permissions');
        }

        $token = JWTAuth::fromUser($user);
        $user->forceFill(['last_active_at' => now()])->save();

        return response()->json([
            'user'          => $this->userPayload($user),
            'access_token'  => $token,
            'token_type'    => 'bearer',
            'expires_in'    => config('jwt.ttl') * 60,
            'refresh_token' => $this->issueRefreshToken($user),
        ]);
    }

    // Verify a Google OAuth access token: confirm the audience matches our client ID
    // (blocks tokens minted for other apps) and return the verified profile.
    private function verifyGoogleToken(string $token, string $clientId): array
    {
        $info = Http::timeout(10)->get('https://www.googleapis.com/oauth2/v1/tokeninfo', ['access_token' => $token]);
        if (! $info->successful()) {
            throw new \RuntimeException('Google tokeninfo rejected the token.');
        }
        $ti = $info->json();
        if (($ti['audience'] ?? null) !== $clientId) {
            throw new \RuntimeException('Google token audience mismatch.');
        }
        // tokeninfo returns verified_email as a bool (or "true"/"false" string).
        if (! filter_var($ti['verified_email'] ?? false, FILTER_VALIDATE_BOOLEAN)) {
            throw new \RuntimeException('Google email not verified.');
        }

        $ui = Http::withToken($token)->timeout(10)->get('https://www.googleapis.com/oauth2/v3/userinfo');
        $name = $ui->successful() ? ($ui->json()['name'] ?? null) : null;

        return ['email' => $ti['email'] ?? null, 'name' => $name];
    }

    // Verify a Facebook access token via the Graph API and return the profile.
    private function verifyFacebookToken(string $token): array
    {
        $resp = Http::timeout(10)->get('https://graph.facebook.com/me', [
            'fields'       => 'id,name,email',
            'access_token' => $token,
        ]);
        if (! $resp->successful()) {
            throw new \RuntimeException('Facebook Graph API rejected the token.');
        }
        $me = $resp->json();

        return ['email' => $me['email'] ?? null, 'name' => $me['name'] ?? null];
    }

    private function issueRefreshToken(User $user): string
    {
        $raw  = Str::random(64);
        $hash = hash('sha256', $raw);

        AuthToken::create([
            'user_id'    => $user->id,
            'type'       => 'refresh',
            'token_hash' => $hash,
            'expires_at' => now()->addMinutes(config('jwt.refresh_ttl')),
            'created_at' => now(),
        ]);

        return $raw;
    }

    private function userPayload(User $user): array
    {
        $role = $user->role;
        $permissions = $role && $role->permissions ? $role->permissions->pluck('slug')->toArray() : [];

        return [
            'id'           => $user->id,
            'name'         => $user->name,
            'email'        => $user->email,
            'phone'        => $user->phone,
            'bio'          => $user->bio,
            'avatar_url'   => $user->avatar_url,
            'status'       => $user->status,
            'company_id'    => $user->company_id,
            'company_role'  => $user->company_role,
            'cv_visibility' => $user->cv_visibility ?? 'employers',
            'allow_candidate_messages' => (bool) $user->allow_candidate_messages,
            'role'          => $role ? ['id' => $role->id, 'slug' => $role->slug, 'name' => $role->name] : null,
            'permissions'   => $permissions,
        ];
    }
}
