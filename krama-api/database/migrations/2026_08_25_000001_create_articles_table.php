<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Career-advice content hub — editorial articles, admin-authored, server-rendered at
// /career and /career/{slug} for SEO (like the salary guide). Body is sanitized HTML.
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('articles', function (Blueprint $table) {
            $table->id();
            $table->string('title', 255);
            $table->string('slug', 255)->unique();
            $table->string('category', 80)->nullable()->index();   // e.g. "Career advice", "CV & résumé", "Interview tips"
            $table->text('excerpt')->nullable();                    // short summary for cards + meta description fallback
            $table->longText('body')->nullable();                   // sanitized rich HTML
            $table->string('cover_image', 500)->nullable();
            $table->string('author_name', 120)->nullable();
            $table->string('meta_description', 255)->nullable();
            $table->enum('status', ['draft', 'published'])->default('draft')->index();
            $table->unsignedInteger('views')->default(0);
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('articles');
    }
};
