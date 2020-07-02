const mix = require('laravel-mix');
require('laravel-mix-artisan-publish');

/*
 |--------------------------------------------------------------------------
 | Mix Asset Management
 |--------------------------------------------------------------------------
 |
 | Mix provides a clean, fluent API for defining some Webpack build steps
 | for your Laravel application. By default, we are compiling the Sass
 | file for the application as well as bundling up all the JS files.
 |
 */

mix.disableSuccessNotifications();
mix.options({processCssUrls: false});

mix.setPublicPath('src/public');

mix.js('src/resources/assets/js/volumes.js', 'assets/scripts')
    .sass('src/resources/assets/sass/volumes.scss', 'assets/styles')
    .publish({
        provider: 'Biigle\\Modules\\ColorSort\\ColorSortServiceProvider',
        tag: 'public',
    });

if (mix.inProduction()) {
    mix.version();
}