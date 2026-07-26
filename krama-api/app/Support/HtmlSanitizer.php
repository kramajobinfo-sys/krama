<?php

namespace App\Support;

use HTMLPurifier;
use HTMLPurifier_Config;

/**
 * Central sanitizer for untrusted rich-text HTML (job descriptions, company
 * "about", etc.) that is later rendered with dangerouslySetInnerHTML on public
 * and admin-facing pages. Closes the stored-XSS hole (C-S1) at the data layer:
 * anything not on the allowlist below — <script>, <svg>, <iframe>, inline event
 * handlers, javascript: URLs, <style> — is stripped before it is ever stored.
 */
class HtmlSanitizer
{
    private static ?HTMLPurifier $purifier = null;

    private static function purifier(): HTMLPurifier
    {
        if (self::$purifier) {
            return self::$purifier;
        }

        $config = HTMLPurifier_Config::createDefault();

        // Writable cache dir (created on demand) so purifier never writes into vendor/.
        $cacheDir = storage_path('app/htmlpurifier');
        if (! is_dir($cacheDir)) {
            @mkdir($cacheDir, 0775, true);
        }
        $config->set('Cache.SerializerPath', $cacheDir);

        // Allowlist: the tags a rich-text editor legitimately emits. Deny by default.
        $config->set('HTML.Allowed',
            'p,br,b,strong,i,em,u,s,sub,sup,'.
            'ul,ol,li,blockquote,pre,code,hr,'.
            'h1,h2,h3,h4,h5,h6,'.
            'a[href|title],span,div'
        );

        // Only safe link schemes — blocks javascript:/data: URLs.
        $config->set('URI.AllowedSchemes', ['http' => true, 'https' => true, 'mailto' => true, 'tel' => true]);

        // External links open safely (adds rel="noreferrer noopener").
        $config->set('HTML.TargetBlank', true);
        $config->set('Attr.AllowedFrameTargets', ['_blank']);
        $config->set('AutoFormat.RemoveEmpty', true);

        return self::$purifier = new HTMLPurifier($config);
    }

    /**
     * Sanitize untrusted rich-text HTML. Null-safe; empty/whitespace passes through.
     */
    public static function clean(?string $html): ?string
    {
        if ($html === null) {
            return null;
        }
        if (trim($html) === '') {
            return $html;
        }

        return self::purifier()->purify($html);
    }
}
