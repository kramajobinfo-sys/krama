<?php

namespace App\Http\Controllers;

use App\Models\EmailTemplate;
use App\Support\HtmlSanitizer;
use Illuminate\Http\Request;

// Reusable email templates for the campaigns tool. Body is sanitized on write (same as
// article/campaign HTML). Merge fields {{name}} / {{org}} are substituted at send time.
class EmailTemplateController extends Controller
{
    public function index(Request $request)
    {
        $this->requirePermission('site_settings');
        return response()->json([
            'data' => EmailTemplate::orderByDesc('id')->get(['id', 'name', 'subject', 'body', 'updated_at']),
        ]);
    }

    public function store(Request $request)
    {
        $this->requirePermission('site_settings');
        $data = $this->validated($request);
        $t = EmailTemplate::create([
            'name' => $data['name'], 'subject' => $data['subject'],
            'body' => HtmlSanitizer::clean($data['body']),
            'created_by' => optional($request->user())->id,
            'created_at' => now(), 'updated_at' => now(),
        ]);
        return response()->json($t, 201);
    }

    public function update(Request $request, $id)
    {
        $this->requirePermission('site_settings');
        $t = EmailTemplate::findOrFail($id);
        $data = $this->validated($request);
        $t->update([
            'name' => $data['name'], 'subject' => $data['subject'],
            'body' => HtmlSanitizer::clean($data['body']), 'updated_at' => now(),
        ]);
        return response()->json($t);
    }

    public function destroy(Request $request, $id)
    {
        $this->requirePermission('site_settings');
        EmailTemplate::whereKey($id)->delete();
        return response()->json(['message' => 'Template deleted.']);
    }

    private function validated(Request $request): array
    {
        return $request->validate([
            'name'    => 'required|string|max:150',
            'subject' => 'required|string|max:200',
            'body'    => 'required|string',
        ]);
    }
}
