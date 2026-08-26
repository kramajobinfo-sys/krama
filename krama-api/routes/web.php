<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\SeoController;

// ── SEO: server-rendered, crawlable pages for search engines + Google for Jobs ──
Route::get('/sitemap.xml',           [SeoController::class, 'sitemap']);
Route::get('/salary',                [SeoController::class, 'salaryGuide']);
Route::get('/career',                [SeoController::class, 'careerList']);
Route::get('/career/{slug}',         [SeoController::class, 'careerArticle']);
Route::get('/account/delete',        [SeoController::class, 'accountDelete']);
Route::get('/unsubscribe/{token}',   [SeoController::class, 'unsubscribe']);
Route::get('/unsubscribe-list/{token}', [SeoController::class, 'unsubscribeList']);
// Email open/click tracking (hit from marketing emails; token is HMAC-signed).
Route::get('/e/o/{campaign}/{token}', [\App\Http\Controllers\EmailTrackingController::class, 'open'])->whereNumber('campaign');
Route::get('/e/c/{campaign}/{token}', [\App\Http\Controllers\EmailTrackingController::class, 'click'])->whereNumber('campaign');
Route::get('/privacy',               [SeoController::class, 'privacy']);
Route::get('/terms',                 [SeoController::class, 'terms']);
Route::get('/jobs/{slug}/og.png',    [SeoController::class, 'jobOg']);
Route::get('/jobs/{slug}',           [SeoController::class, 'job']);
Route::get('/companies/{id}/og.png', [SeoController::class, 'companyOg'])->whereNumber('id');
Route::get('/companies/{id}',        [SeoController::class, 'company'])->whereNumber('id');
Route::get('/cv/{token}',            [SeoController::class, 'candidateCv']);

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', function () {
    return view('welcome');
});
