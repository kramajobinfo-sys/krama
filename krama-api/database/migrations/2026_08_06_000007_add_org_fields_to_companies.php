<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    // Non-commercial employers (NGO / government / education / international) can be verified
    // for a free plan. `org_type` is the CLAIMED category; `org_status` is the admin-verified
    // truth — the free benefit gates on org_status='verified', never on the self-declared type,
    // so org_status is set only by the admin review endpoint (kept out of $fillable).
    public function up(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            $table->string('org_type', 20)->default('company');     // company|ngo|government|education|international
            $table->string('org_status', 12)->default('none');       // none|pending|verified|rejected
            $table->string('org_reg_no')->nullable();                // NGO registration / MoU number
            $table->string('org_doc_url')->nullable();               // uploaded proof document
            $table->text('org_note')->nullable();                    // admin note / rejection reason
            $table->timestamp('org_verified_at')->nullable();
            $table->index('org_status');
        });
    }

    public function down(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            $table->dropIndex(['org_status']);
            $table->dropColumn(['org_type', 'org_status', 'org_reg_no', 'org_doc_url', 'org_note', 'org_verified_at']);
        });
    }
};
