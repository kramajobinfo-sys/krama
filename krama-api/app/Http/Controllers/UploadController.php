<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class UploadController extends Controller
{
    public function storeImage(Request $request)
    {
        $this->requirePermission('site_settings');

        $request->validate([
            'image' => 'required|image|max:5120', // 5 MB max
        ]);

        $file = $request->file('image');
        $ext  = strtolower($file->getClientOriginalExtension()) ?: 'jpg';
        $name = 'img_' . uniqid() . '.' . $ext;
        $file->move(public_path('uploads'), $name);

        // Build the URL dynamically so it works regardless of APP_URL config.
        // Request URL is e.g. http://localhost/krama/krama-api/public/api/admin/upload/image
        // Strip everything from /api/ onward to get the public base.
        $base = preg_replace('#/api/.*$#', '', $request->url());

        return response()->json(['url' => $base . '/uploads/' . $name]);
    }
}
