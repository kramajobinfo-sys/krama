<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\SeoController;

// ── SEO: server-rendered, crawlable pages for search engines + Google for Jobs ──
Route::get('/sitemap.xml',           [SeoController::class, 'sitemap']);
Route::get('/privacy',               [SeoController::class, 'privacy']);
Route::get('/terms',                 [SeoController::class, 'terms']);
Route::get('/jobs/{slug}/og.png',    [SeoController::class, 'jobOg']);
Route::get('/jobs/{slug}',           [SeoController::class, 'job']);
Route::get('/companies/{id}/og.png', [SeoController::class, 'companyOg'])->whereNumber('id');
Route::get('/companies/{id}',        [SeoController::class, 'company'])->whereNumber('id');

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
