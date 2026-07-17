<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            // Bakong KHQR: the generated QR payload and its md5 hash (used to verify
            // the transaction against NBC Bakong's check_transaction_by_md5 endpoint).
            $table->text('khqr')->nullable()->after('method');
            $table->string('md5', 64)->nullable()->after('khqr')->index();
        });
    }

    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropColumn(['khqr', 'md5']);
        });
    }
};
