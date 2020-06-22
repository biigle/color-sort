<?php

namespace Biigle\Modules\ColorSort;

use Biigle\Services\Modules;
use Illuminate\Routing\Router;
use Illuminate\Support\ServiceProvider;

class ColorSortServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap the application events.
     *
     * @param  \Biigle\Services\Modules  $modules
     * @param  \Illuminate\Routing\Router  $router
     *
     * @return void
     */
    public function boot(Modules $modules, Router $router)
    {
        $this->loadViewsFrom(__DIR__.'/resources/views', 'color-sort');
        $this->loadMigrationsFrom(__DIR__.'/database/migrations');

        $this->publishes([
            __DIR__.'/public/assets' => public_path('vendor/color-sort'),
        ], 'public');

        $this->publishes([
            __DIR__.'/config/color_sort.php' => config_path('color_sort.php'),
        ], 'config');

        $router->group([
            'namespace' => 'Biigle\Modules\ColorSort\Http\Controllers',
            'middleware' => 'web',
        ], function ($router) {
            require __DIR__.'/Http/routes.php';
        });

        \Biigle\Image::observe(new Observers\ImageObserver);
        \Event::listen('images.created', Listeners\ImagesCreatedListener::class);

        $modules->register('color-sort', [
            'viewMixins' => [
                'volumesScripts',
                'volumesStyles',
                'volumesEditScripts',
                'volumesEditStyles',
                'volumesEditLeft',
            ],
            'apidoc' => [__DIR__.'/Http/Controllers/Api/'],
        ]);
    }

    /**
     * Register the service provider.
     *
     * @return void
     */
    public function register()
    {
        // apply default config that is not set by the user
        $this->mergeConfigFrom(__DIR__.'/config/color_sort.php', 'color_sort');

        // set up the console commands
        $this->app->singleton('command.color-sort.publish', function ($app) {
            return new \Biigle\Modules\ColorSort\Console\Commands\Publish();
        });
        $this->commands('command.color-sort.publish');
    }

    /**
     * Get the services provided by the provider.
     *
     * @return array
     */
    public function provides()
    {
        return [
            'command.color-sort.publish',
        ];
    }
}
