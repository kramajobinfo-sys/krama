<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            if (! Schema::hasColumn('companies', 'cover_banner_url')) {
                $table->string('cover_banner_url', 255)->nullable()->after('about_image_url');
            }
            if (! Schema::hasColumn('companies', 'company_size')) {
                // e.g. "1-10", "11-50", "51-200", "201-500", "500+"
                $table->string('company_size', 20)->nullable()->after('cover_banner_url');
            }
            if (! Schema::hasColumn('companies', 'culture_values')) {
                $table->text('culture_values')->nullable()->after('company_size');
            }
            if (! Schema::hasColumn('companies', 'benefits_tags')) {
                // JSON array of tag strings e.g. ["health","remote","learning"]
                $table->json('benefits_tags')->nullable()->after('culture_values');
            }
        });

        // Add caption column to company_photos if missing
        Schema::table('company_photos', function (Blueprint $table) {
            if (! Schema::hasColumn('company_photos', 'caption')) {
                $table->string('caption', 255)->nullable()->after('url');
            }
        });
    }

    public function down(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            $table->dropColumn(array_filter([
                Schema::hasColumn('companies', 'benefits_tags')    ? 'benefits_tags'    : null,
                Schema::hasColumn('companies', 'culture_values')   ? 'culture_values'   : null,
                Schema::hasColumn('companies', 'company_size')     ? 'company_size'     : null,
                Schema::hasColumn('companies', 'cover_banner_url') ? 'cover_banner_url' : null,
            ]));
        });
        Schema::table('company_photos', function (Blueprint $table) {
            if (Schema::hasColumn('company_photos', 'caption')) {
                $table->dropColumn('caption');
            }
        });
    }
};
