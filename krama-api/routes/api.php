<?php

use App\Http\Controllers\ApplicationController;
use App\Http\Controllers\ResumeController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\TeamController;
use App\Http\Controllers\BannerController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\CompanyController;
use App\Http\Controllers\ExperienceLevelController;
use App\Http\Controllers\HealthController;
use App\Http\Controllers\LocationController;
use App\Http\Controllers\JobController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\CompanyFollowerController;
use App\Http\Controllers\CompanyReviewController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\JobAlertController;
use App\Http\Controllers\SettingController;
use App\Http\Controllers\RecommendationController;
use App\Http\Controllers\UploadController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

// Health check — no auth, no throttle (load balancer polling)
Route::get('health', [HealthController::class, 'check']);

// Public auth endpoints — strict rate limit (5 req/min per IP)
Route::prefix('auth')->middleware('throttle:auth')->group(function () {
    Route::post('request-otp', [AuthController::class, 'requestOtp']);
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login',    [AuthController::class, 'login']);
    Route::post('refresh',  [AuthController::class, 'refresh']);
    Route::post('password/forgot', [AuthController::class, 'forgotPassword']);
    Route::post('password/reset',  [AuthController::class, 'resetPassword']);
    Route::post('social',          [AuthController::class, 'socialLogin']);
});

// Email verification — signed URL, no auth required
Route::get('auth/email/verify/{id}/{hash}', [AuthController::class, 'verifyEmail'])
    ->name('verification.verify');

// Protected auth endpoints
Route::middleware('auth:api')->prefix('auth')->group(function () {
    Route::post('logout',         [AuthController::class, 'logout']);
    Route::get('me',              [AuthController::class, 'me']);
    Route::patch('me',            [AuthController::class, 'updateMe']);
    Route::post('me/password',    [AuthController::class, 'changePassword']);
    Route::post('me/avatar',      [AuthController::class, 'uploadAvatar']);
    Route::post('email/resend',   [AuthController::class, 'resendVerification']);
});

// Plans — public
Route::get('plans', [PaymentController::class, 'plans']);

// Reference data — public
Route::get('categories',        [CategoryController::class,      'index']);
Route::get('locations',         [LocationController::class,       'index']);
Route::get('experience-levels', [ExperienceLevelController::class, 'index']);

// Banners — public (active only)
Route::get('banners', [BannerController::class, 'index']);

// Settings — public (safe groups: homepage, chat UI config)
Route::get('settings/{group}', [SettingController::class, 'publicGroup']);

// Public chat assistant — proxies to the LLM server-side (API key never exposed)
Route::post('chat', [\App\Http\Controllers\ChatController::class, 'send'])->middleware('throttle:20,1');

// ABA PayWay pushback callback — gateway posts here on payment result; we re-verify server-side.
Route::post('payments/aba/callback', [PaymentController::class, 'abaCallback'])->middleware('throttle:60,1');

// Stripe webhook — gateway posts checkout events; we re-verify the session server-side.
Route::post('payments/stripe/webhook', [PaymentController::class, 'stripeWebhook'])->middleware('throttle:120,1');

// Telegram webhook — the bot delivers /start deep-link presses here (secret-header verified).
Route::post('telegram/webhook', [\App\Http\Controllers\TelegramController::class, 'webhook'])->middleware('throttle:120,1');

// Companies — public
Route::get('companies',               [CompanyController::class, 'index']);
Route::get('companies/{id}',          [CompanyController::class, 'show']);
Route::get('companies/{id}/reviews',  [CompanyReviewController::class, 'index']);

// Jobs — public
Route::get('jobs',     [JobController::class, 'index']);
Route::get('jobs/{id}', [JobController::class, 'show']);

// Community forum — public reads (guest access honours the forum.allow_guest_read setting)
Route::get('forum/categories',            [\App\Http\Controllers\ForumCategoryController::class, 'index']);
Route::get('forum/threads',               [\App\Http\Controllers\ForumThreadController::class, 'index']);
Route::get('forum/threads/{id}',          [\App\Http\Controllers\ForumThreadController::class, 'show']);
Route::get('forum/threads/{id}/replies',  [\App\Http\Controllers\ForumReplyController::class, 'index']);

// Companies + Jobs — employer + candidate (requires JWT)
Route::middleware('auth:api')->group(function () {
    // Employer: own company
    Route::get('employer/company',              [CompanyController::class, 'mine']);
    Route::post('companies',                    [CompanyController::class, 'store']);
    Route::put('companies/{id}',                [CompanyController::class, 'update']);
    Route::post('companies/{id}/logo',          [CompanyController::class, 'uploadLogo'])->middleware('throttle:10,1');
    Route::post('companies/{id}/about-image',    [CompanyController::class, 'uploadAboutImage'])->middleware('throttle:10,1');
    Route::post('companies/{id}/cover-banner',   [CompanyController::class, 'uploadCoverBanner'])->middleware('throttle:10,1');
    Route::post('companies/{id}/gallery',        [CompanyController::class, 'uploadGalleryPhoto'])->middleware('throttle:20,1');
    Route::patch('companies/{id}/gallery/{photoId}',  [CompanyController::class, 'updateGalleryPhoto']);
    Route::delete('companies/{id}/gallery/{photoId}', [CompanyController::class, 'deleteGalleryPhoto']);
    Route::post('companies/{id}/awards',          [CompanyController::class, 'storeAward'])->middleware('throttle:20,1');
    Route::post('companies/{id}/awards/{awardId}/image', [CompanyController::class, 'uploadAwardImage'])->middleware('throttle:20,1');
    Route::delete('companies/{id}/awards/{awardId}',  [CompanyController::class, 'deleteAward']);

    // Employer: payments + subscriptions (strict limit — billing ops)
    Route::get('employer/subscription',     [PaymentController::class, 'mySubscription']);
    Route::post('employer/subscribe',       [PaymentController::class, 'subscribe'])->middleware('throttle:5,1');
    Route::get('employer/payments',         [PaymentController::class, 'myPayments']);
    Route::post('employer/payments/{id}/khqr',           [PaymentController::class, 'generateKhqr'])->middleware('throttle:20,1');
    Route::post('employer/payments/{id}/stripe-checkout',[PaymentController::class, 'stripeCheckout'])->middleware('throttle:20,1');
    Route::get('employer/payments/{id}/verify',          [PaymentController::class, 'verifyPayment'])->middleware('throttle:60,1');

    // Employer: Telegram alerts (deep-link connect flow for new-application alerts)
    Route::post('employer/telegram/link',   [\App\Http\Controllers\TelegramController::class, 'link'])->middleware('throttle:20,1');
    Route::get('employer/telegram/status',  [\App\Http\Controllers\TelegramController::class, 'status']);
    Route::post('employer/telegram/unlink', [\App\Http\Controllers\TelegramController::class, 'unlink']);
    Route::post('employer/telegram/test',   [\App\Http\Controllers\TelegramController::class, 'test'])->middleware('throttle:10,1');

    // Candidate: apply
    Route::post('jobs/{id}/apply',              [ApplicationController::class, 'apply'])->middleware('throttle:20,1');
    Route::get('jobs/{id}/applied',             [ApplicationController::class, 'checkApplied']);
    Route::delete('applications/{id}',          [ApplicationController::class, 'withdraw']);
    Route::get('candidate/applications',        [ApplicationController::class, 'myApplications']);
    Route::post('jobs/{id}/save',               [ApplicationController::class, 'save']);
    Route::delete('jobs/{id}/save',             [ApplicationController::class, 'unsave']);
    Route::get('candidate/saved-jobs',          [ApplicationController::class, 'savedJobs']);
    Route::get('candidate/recommended',         [RecommendationController::class, 'recommended']);

    // Candidate: company reviews
    Route::post('companies/{id}/reviews',   [CompanyReviewController::class, 'store']);
    Route::delete('candidate/reviews/{id}', [CompanyReviewController::class, 'destroy']);

    // Candidate: company following
    Route::post('companies/{id}/follow',        [CompanyFollowerController::class, 'follow']);
    Route::delete('companies/{id}/follow',      [CompanyFollowerController::class, 'unfollow']);
    Route::get('companies/{id}/follow',         [CompanyFollowerController::class, 'status']);
    Route::get('candidate/following',           [CompanyFollowerController::class, 'myFollowing']);

    // Candidate: job alerts
    Route::get('candidate/alerts',              [JobAlertController::class, 'index']);
    Route::post('candidate/alerts',             [JobAlertController::class, 'store']);
    Route::delete('candidate/alerts/{id}',      [JobAlertController::class, 'destroy']);

    // Messaging (candidate + employer)
    Route::get('conversations/unread',          [MessageController::class, 'unreadCount']);
    Route::get('conversations',                 [MessageController::class, 'index']);
    Route::post('conversations',                [MessageController::class, 'store']);
    Route::get('conversations/{id}',            [MessageController::class, 'show']);
    Route::get('conversations/{id}/messages',   [MessageController::class, 'newMessages']);
    Route::post('conversations/{id}/messages',  [MessageController::class, 'sendMessage']);

    // In-app notifications (candidate + employer)
    Route::get('notifications/unread',          [NotificationController::class, 'unreadCount']);
    Route::get('notifications',                 [NotificationController::class, 'index']);
    Route::post('notifications/read-all',       [NotificationController::class, 'markAllRead']);
    Route::post('notifications/{id}/read',      [NotificationController::class, 'markRead']);

    // Candidate: resume
    Route::get('candidate/resume',              [ResumeController::class, 'show']);
    Route::put('candidate/resume',              [ResumeController::class, 'save']);
    Route::post('candidate/resume/upload',      [ResumeController::class, 'upload'])->middleware('throttle:10,1');
    Route::get('candidate/resume/cv',           [ResumeController::class, 'downloadCv'])->name('resume.download');

    // Employer: CV match (credits-based; deterministic + AI)
    Route::get('employer/cv-match/candidates',   [\App\Http\Controllers\EmployerCvMatchController::class, 'candidates']);
    Route::get('employer/cv-match/credits',      [\App\Http\Controllers\EmployerCvMatchController::class, 'credits']);
    Route::post('employer/cv-match/buy-credits', [\App\Http\Controllers\EmployerCvMatchController::class, 'buyCredits'])->middleware('throttle:20,1');
    Route::post('employer/cv-match/run',         [\App\Http\Controllers\EmployerCvMatchController::class, 'run'])->middleware('throttle:60,1');
    Route::get('employer/cv-match/history',       [\App\Http\Controllers\EmployerCvMatchController::class, 'history']);
    Route::get('employer/cv-match/history/{id}',  [\App\Http\Controllers\EmployerCvMatchController::class, 'historyShow']);

    // Employer: applicant pipeline
    Route::get('employer/jobs/{id}/applications',   [ApplicationController::class, 'jobApplications']);
    Route::patch('applications/{id}/stage',         [ApplicationController::class, 'updateStage']);
    Route::get('applications/{id}/cv',              [ApplicationController::class, 'downloadCv']);

    // Employer: own jobs
    // Note: 'verified' middleware removed — this is a JWT API (no verification.notice route),
    // and recruiters are created programmatically without email verification.
    Route::get('employer/jobs',              [JobController::class, 'myJobs']);
    Route::post('employer/upload/image',     [UploadController::class, 'employerImage'])->middleware('throttle:20,1');
    Route::post('jobs',                      [JobController::class, 'store'])->middleware('throttle:30,1');
    Route::put('jobs/{id}',                  [JobController::class, 'update']);
    Route::delete('jobs/{id}',               [JobController::class, 'destroy']);
    Route::patch('jobs/{id}/submit',         [JobController::class, 'submit']);
    Route::patch('jobs/{id}/close',          [JobController::class, 'close']);

    // Employer: featured-job boost (spend a plan credit, else start a paid boost)
    Route::get('employer/jobs/{id}/boost',   [JobController::class, 'boostQuote']);
    Route::post('employer/jobs/{id}/boost',  [JobController::class, 'boost']);

    // Employer: company-level job approval (company admin approves/rejects recruiter jobs)
    Route::patch('employer/jobs/{id}/approve', [JobController::class, 'companyApprove']);
    Route::patch('employer/jobs/{id}/reject',  [JobController::class, 'companyReject']);

    // Employer: team management
    Route::get('employer/team',                [TeamController::class, 'index']);
    Route::post('employer/team',               [TeamController::class, 'store'])->middleware('throttle:10,1');
    Route::delete('employer/team/{id}',        [TeamController::class, 'destroy']);
    Route::patch('employer/team/{id}/password',[TeamController::class, 'setPassword']);

    // Community forum — participation (any authenticated user; throttled anti-spam)
    Route::post('forum/threads',                 [\App\Http\Controllers\ForumThreadController::class, 'store'])->middleware('throttle:20,1');
    Route::put('forum/threads/{id}',             [\App\Http\Controllers\ForumThreadController::class, 'update']);
    Route::delete('forum/threads/{id}',          [\App\Http\Controllers\ForumThreadController::class, 'destroy']);
    Route::post('forum/threads/{id}/vote',       [\App\Http\Controllers\ForumThreadController::class, 'vote'])->middleware('throttle:60,1');
    Route::post('forum/threads/{id}/subscribe',  [\App\Http\Controllers\ForumThreadController::class, 'subscribe']);
    Route::delete('forum/threads/{id}/subscribe',[\App\Http\Controllers\ForumThreadController::class, 'unsubscribe']);
    Route::post('forum/threads/{id}/replies',    [\App\Http\Controllers\ForumReplyController::class, 'store'])->middleware('throttle:30,1');
    Route::put('forum/replies/{id}',             [\App\Http\Controllers\ForumReplyController::class, 'update']);
    Route::delete('forum/replies/{id}',          [\App\Http\Controllers\ForumReplyController::class, 'destroy']);
    Route::post('forum/replies/{id}/vote',       [\App\Http\Controllers\ForumReplyController::class, 'vote'])->middleware('throttle:60,1');
    Route::post('forum/report',                  [\App\Http\Controllers\ForumReportController::class, 'store'])->middleware('throttle:20,1');
});

// Community forum — admin moderation (requires moderate_forum permission)
Route::middleware(['auth:api', 'permission:moderate_forum'])->group(function () {
    Route::get('admin/forum/categories',              [\App\Http\Controllers\ForumCategoryController::class, 'adminIndex']);
    Route::post('admin/forum/categories',             [\App\Http\Controllers\ForumCategoryController::class, 'store']);
    Route::put('admin/forum/categories/{id}',         [\App\Http\Controllers\ForumCategoryController::class, 'update']);
    Route::delete('admin/forum/categories/{id}',      [\App\Http\Controllers\ForumCategoryController::class, 'destroy']);

    Route::get('admin/forum/threads',                 [\App\Http\Controllers\ForumThreadController::class, 'adminIndex']);
    Route::patch('admin/forum/threads/{id}/moderate', [\App\Http\Controllers\ForumThreadController::class, 'moderate']);
    Route::delete('admin/forum/threads/{id}',         [\App\Http\Controllers\ForumThreadController::class, 'adminDestroy']);

    Route::patch('admin/forum/replies/{id}/moderate', [\App\Http\Controllers\ForumReplyController::class, 'moderate']);
    Route::delete('admin/forum/replies/{id}',         [\App\Http\Controllers\ForumReplyController::class, 'adminDestroy']);

    Route::get('admin/forum/reports',                 [\App\Http\Controllers\ForumReportController::class, 'adminIndex']);
    Route::patch('admin/forum/reports/{id}',          [\App\Http\Controllers\ForumReportController::class, 'resolve']);
});

// Admin routes — requires JWT + site_settings permission (role-level gate)
// Individual controllers add a second, action-specific requirePermission() check.
Route::middleware(['auth:api', 'permission:site_settings'])->group(function () {
    // Admin: resumes
    Route::get('admin/resumes',              [ResumeController::class, 'adminIndex']);
    Route::get('admin/resumes/{id}',         [ResumeController::class, 'adminShow']);
    Route::get('admin/resumes/{id}/cv',      [ResumeController::class, 'adminDownloadCv'])->name('admin.resume.download');

    // Admin: banners
    Route::get('admin/banners',                [BannerController::class, 'adminIndex']);
    Route::post('admin/banners',               [BannerController::class, 'store']);
    Route::put('admin/banners/{id}',           [BannerController::class, 'update']);
    Route::delete('admin/banners/{id}',        [BannerController::class, 'destroy']);
    Route::patch('admin/banners/reorder',      [BannerController::class, 'reorder']);

    // Admin: settings
    Route::get('admin/settings',               [SettingController::class, 'adminAll']);
    Route::get('admin/settings/{group}',       [SettingController::class, 'adminGroup']);
    Route::patch('admin/settings/{group}',     [SettingController::class, 'update']);
    Route::post('admin/settings/smtp/test',    [SettingController::class, 'testSmtp']);
    Route::post('admin/settings/sms/test',     [SettingController::class, 'testSms']);
    Route::post('admin/settings/social/test',  [SettingController::class, 'testSocial']);
    Route::post('admin/settings/telegram/test', [SettingController::class, 'testTelegram']);
    Route::post('admin/settings/telegram/activate', [SettingController::class, 'activateTelegram']);

    // Admin: image upload (banner/hero backgrounds)
    Route::post('admin/upload/image',          [UploadController::class, 'storeImage']);

    // Admin: payments + plans
    Route::get('admin/payments',                    [PaymentController::class, 'adminIndex']);
    Route::post('admin/payments/{id}/mark-paid',    [PaymentController::class, 'markPaid']);
    Route::post('admin/payments/{id}/refund',       [PaymentController::class, 'refund']);
    Route::get('admin/plans',                       [PaymentController::class, 'adminPlans']);
    Route::post('admin/plans',                      [PaymentController::class, 'storePlan']);
    Route::put('admin/plans/{id}',                  [PaymentController::class, 'updatePlan']);
    Route::delete('admin/plans/{id}',               [PaymentController::class, 'destroyPlan']);
    Route::get('admin/subscriptions',               [PaymentController::class, 'adminSubscriptions']);
    Route::post('admin/subscriptions',              [PaymentController::class, 'adminCreateSubscription']);
    Route::put('admin/subscriptions/{id}',          [PaymentController::class, 'adminUpdateSubscription']);

    // Admin: reports
    Route::get('admin/reports/summary',             [ReportController::class, 'summary']);

    // Admin: audit log viewer (parses storage/logs/audit-*.log)
    Route::get('admin/audit',                       [\App\Http\Controllers\AuditController::class, 'index']);

    // Admin: CV matching / comparison (deterministic scoring)
    Route::post('admin/cv-match/compare',           [\App\Http\Controllers\CvMatchController::class, 'compare']);
    Route::post('admin/cv-match/suggest',           [\App\Http\Controllers\CvMatchController::class, 'suggest']);

    // Admin: candidate management
    Route::get('admin/candidates',                  [UserController::class, 'adminCandidates']);
    Route::patch('admin/candidates/{id}/status',    [UserController::class, 'setStatus']);
    // Admin: all-user management (super_admin only for role changes)
    Route::get('admin/users',                       [UserController::class, 'adminUsers']);
    Route::post('admin/users',                      [UserController::class, 'adminCreateUser']);
    Route::patch('admin/users/{id}',                [UserController::class, 'adminUpdateUser']);

    // Admin: experience levels
    Route::get('admin/experience-levels',          [ExperienceLevelController::class, 'adminIndex']);
    Route::post('admin/experience-levels',         [ExperienceLevelController::class, 'store']);
    Route::put('admin/experience-levels/{id}',     [ExperienceLevelController::class, 'update']);
    Route::delete('admin/experience-levels/{id}',  [ExperienceLevelController::class, 'destroy']);

    // Admin: locations
    Route::get('admin/locations',         [LocationController::class, 'adminIndex']);
    Route::post('admin/locations',        [LocationController::class, 'store']);
    Route::put('admin/locations/{id}',    [LocationController::class, 'update']);
    Route::delete('admin/locations/{id}', [LocationController::class, 'destroy']);

    // Admin: categories
    Route::get('admin/categories',           [CategoryController::class, 'adminIndex']);
    Route::post('admin/categories',          [CategoryController::class, 'store']);
    Route::put('admin/categories/{id}',      [CategoryController::class, 'update']);
    Route::delete('admin/categories/{id}',   [CategoryController::class, 'destroy']);

    // Admin: reviews moderation
    Route::get('admin/reviews',                   [CompanyReviewController::class, 'adminIndex']);
    Route::patch('admin/reviews/{id}/approve',    [CompanyReviewController::class, 'approve']);
    Route::patch('admin/reviews/{id}/reject',     [CompanyReviewController::class, 'reject']);

    // Admin: company moderation
    Route::get('admin/companies',               [CompanyController::class, 'adminIndex']);
    Route::patch('admin/companies/{id}/approve', [CompanyController::class, 'approve']);
    Route::patch('admin/companies/{id}/reject',  [CompanyController::class, 'reject']);
    Route::patch('admin/companies/{id}/suspend', [CompanyController::class, 'suspend']);
    Route::patch('admin/companies/{id}/verify',  [CompanyController::class, 'verify']);
    Route::post('admin/companies/{id}/logo',         [CompanyController::class, 'adminUploadLogo'])->middleware('throttle:20,1');
    Route::post('admin/companies/{id}/cover-banner', [CompanyController::class, 'adminUploadCoverBanner'])->middleware('throttle:20,1');

    // Admin: job moderation
    Route::get('admin/jobs',                 [JobController::class, 'adminIndex']);
    Route::patch('jobs/{id}/approve',        [JobController::class, 'approve']);
    Route::patch('jobs/{id}/reject',         [JobController::class, 'reject']);
    Route::patch('admin/jobs/{id}/feature',  [JobController::class, 'toggleFeatured']);
});
