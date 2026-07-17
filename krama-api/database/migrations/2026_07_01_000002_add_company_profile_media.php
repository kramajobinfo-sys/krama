<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            if (! Schema::hasColumn('companies', 'about_image_url')) {
                $table->string('about_image_url', 255)->nullable()->after('description');
            }
        });

        Schema::table('company_photos', function (Blueprint $table) {
            if (! Schema::hasColumn('company_photos', 'caption')) {
                $table->string('caption', 255)->nullable()->after('url');
            }
        });

        Schema::table('company_awards', function (Blueprint $table) {
            if (! Schema::hasColumn('company_awards', 'image_url')) {
                $table->string('image_url', 255)->nullable()->after('description');
            }
        });
    }

    public function down(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            if (Schema::hasColumn('companies', 'about_image_url')) { $table->dropColumn('about_image_url'); }
        });
        Schema::table('company_photos', function (Blueprint $table) {
            if (Schema::hasColumn('company_photos', 'caption')) { $table->dropColumn('caption'); }
        });
        Schema::table('company_awards', function (Blueprint $table) {
            if (Schema::hasColumn('company_awards', 'image_url')) { $table->dropColumn('image_url'); }
        });
    }
};
