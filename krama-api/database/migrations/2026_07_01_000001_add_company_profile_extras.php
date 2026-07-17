<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            if (! Schema::hasColumn('companies', 'social_links')) {
                $table->json('social_links')->nullable()->after('description');
            }
        });

        if (! Schema::hasTable('company_photos')) {
            Schema::create('company_photos', function (Blueprint $table) {
                $table->id();
                $table->foreignId('company_id')->constrained('companies')->cascadeOnDelete();
                $table->string('url', 255);
                $table->unsignedInteger('sort_order')->default(0);
                $table->timestamps();
                $table->index(['company_id', 'sort_order']);
            });
        }

        if (! Schema::hasTable('company_awards')) {
            Schema::create('company_awards', function (Blueprint $table) {
                $table->id();
                $table->foreignId('company_id')->constrained('companies')->cascadeOnDelete();
                $table->string('title', 190);
                $table->string('year', 8)->nullable();
                $table->string('description', 500)->nullable();
                $table->unsignedInteger('sort_order')->default(0);
                $table->timestamps();
                $table->index(['company_id', 'sort_order']);
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('company_awards');
        Schema::dropIfExists('company_photos');
        Schema::table('companies', function (Blueprint $table) {
            if (Schema::hasColumn('companies', 'social_links')) {
                $table->dropColumn('social_links');
            }
        });
    }
};
