<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;

class UploadController extends Controller
{
    public function storeImage(Request $request)
    {
        $this->requirePermission('site_settings');

        $request->validate([
            'image' => 'required|image|mimes:jpeg,jpg,png,gif,webp|max:10240', // 10 MB max; SVG excluded (stored raw → XSS)
        ]);

        $name = $this->storeUploadedImage($request->file('image'), 'img');

        // Build the URL dynamically so it works regardless of APP_URL config.
        $base = preg_replace('#/api/.*$#', '', $request->url());

        return response()->json(['url' => $base . '/uploads/' . $name]);
    }

    // Employer image upload (e.g. a job's social-share banner). Gated on post_jobs
    // rather than site_settings so recruiters/company admins can use it.
    public function employerImage(Request $request)
    {
        $this->requirePermission('post_jobs');

        $request->validate([
            'image' => 'required|image|mimes:jpeg,jpg,png,gif,webp|max:10240', // 10 MB max; SVG excluded (stored raw → XSS)
        ]);

        $name = $this->storeUploadedImage($request->file('image'), 'job');

        $base = preg_replace('#/api/.*$#', '', $request->url());

        return response()->json(['url' => $base . '/uploads/' . $name]);
    }

    /**
     * Store a validated image into public/uploads and return the stored filename.
     *
     * Security: the stored extension is derived from the file's CONTENT (its detected
     * MIME type), never from the client-supplied original filename. This prevents an
     * image/PHP polyglot (e.g. a valid GIF whose original name is "shell.php") from
     * being written as an executable ".php" into a web-served directory (RCE). As a
     * second layer, a .htaccess that denies execution of any script is ensured in the
     * uploads directory.
     */
    private function storeUploadedImage(UploadedFile $file, string $prefix): string
    {
        $mimeToExt = [
            'image/jpeg' => 'jpg',
            'image/pjpeg' => 'jpg',
            'image/png'  => 'png',
            'image/gif'  => 'gif',
            'image/webp' => 'webp',
        ];
        $ext = $mimeToExt[strtolower((string) $file->getMimeType())] ?? 'jpg';

        $dir = public_path('uploads');
        if (! is_dir($dir)) {
            @mkdir($dir, 0755, true);
        }

        // Defense-in-depth: never execute a script served from /uploads, whatever lands there.
        $htaccess = $dir . '/.htaccess';
        if (! is_file($htaccess)) {
            @file_put_contents(
                $htaccess,
                "# Auto-generated: uploads are static assets only — never executed.\n"
                . "<FilesMatch \"\\.(php|phtml|php3|php4|php5|php7|phps|phar|pht|cgi|pl|py|sh)$\">\n"
                . "  Require all denied\n"
                . "</FilesMatch>\n"
            );
        }

        $name = $prefix . '_' . uniqid() . '.' . $ext;
        $file->move($dir, $name);

        return $name;
    }
}
