<?php

/*
|--------------------------------------------------------------------------
| Create The Application
|--------------------------------------------------------------------------
|
| The first thing we will do is create a new Laravel application instance
| which serves as the "glue" for all the components of Laravel, and is
| the IoC container for the system binding all of the various parts.
|
*/

$app = new Illuminate\Foundation\Application(
    $_ENV['APP_BASE_PATH'] ?? dirname(__DIR__)
);

/*
|--------------------------------------------------------------------------
| Allow public/ to live outside the app's base path
|--------------------------------------------------------------------------
|
| On some shared-hosting layouts, index.php is served from a document-root
| folder (e.g. public_html) that sits OUTSIDE this app's own folder, rather
| than from an in-place public/ subfolder like on local dev. Laravel's
| public_path() always resolves to {base_path}/public by default, which
| would be unreachable by the browser in that layout — breaking anything
| that writes there (see UploadController::storeImage). APP_PUBLIC_PATH
| lets a deployment declare the real, browser-servable path explicitly.
| Read directly from .env here since the Dotenv bootstrapper hasn't run yet.
|
*/
$envFile = dirname(__DIR__).'/.env';
if (is_file($envFile) && ($envLines = @file($envFile))) {
    foreach ($envLines as $line) {
        if (preg_match('/^APP_PUBLIC_PATH=(.*)$/', trim($line), $m)) {
            $publicPath = trim($m[1], " \t\n\r\0\x0B\"'");
            if ($publicPath !== '') {
                $app->instance('path.public', $publicPath);
            }
            break;
        }
    }
}

/*
|--------------------------------------------------------------------------
| Bind Important Interfaces
|--------------------------------------------------------------------------
|
| Next, we need to bind some important interfaces into the container so
| we will be able to resolve them when needed. The kernels serve the
| incoming requests to this application from both the web and CLI.
|
*/

$app->singleton(
    Illuminate\Contracts\Http\Kernel::class,
    App\Http\Kernel::class
);

$app->singleton(
    Illuminate\Contracts\Console\Kernel::class,
    App\Console\Kernel::class
);

$app->singleton(
    Illuminate\Contracts\Debug\ExceptionHandler::class,
    App\Exceptions\Handler::class
);

/*
|--------------------------------------------------------------------------
| Return The Application
|--------------------------------------------------------------------------
|
| This script returns the application instance. The instance is given to
| the calling script so we can separate the building of the instances
| from the actual running of the application and sending responses.
|
*/

return $app;
