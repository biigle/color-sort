<?php

namespace Dias\Modules\Copria\ColorSort;

use Illuminate\Support\ServiceProvider;
use Illuminate\Routing\Router;
use Dias\Services\Modules;

class CopriaColorSortServiceProvider extends ServiceProvider {

    /**
     * Bootstrap the application events.
     *
     * @param  \Dias\Services\Modules  $modules
     * @param  \Illuminate\Routing\Router  $router
     *
     * @return void
     */
    public function boot(Modules $modules, Router $router)
    {
        $this->loadViewsFrom(__DIR__.'/resources/views', 'copria-color-sort');

        $this->publishes([
            __DIR__.'/public/assets' => public_path('vendor/copria-color-sort'),
        ], 'public');

        $this->publishes([
            __DIR__.'/config/copria_color_sort.php' => config_path('copria_color_sort.php'),
        ], 'config');

        $this->publishes([
            __DIR__.'/database/migrations/' => database_path('migrations')
        ], 'migrations');

        $router->group([
            'namespace' => 'Dias\Modules\Copria\ColorSort\Http\Controllers',
            'middleware' => 'web',
        ], function ($router) {
            require __DIR__.'/Http/routes.php';
        });


        \Dias\Image::observe(new \Dias\Modules\Copria\ColorSort\Observers\ImageObserver);

        $modules->addMixin('copria-color-sort', 'transectsSorters');
        $modules->addMixin('copria-color-sort', 'transectsScripts');
        $modules->addMixin('copria-color-sort', 'transectsStyles');
    }

    /**
     * Register the service provider.
     *
     * @return void
     */
    public function register()
    {
        // apply default config that is not set by the user
        $this->mergeConfigFrom(__DIR__.'/config/copria_color_sort.php', 'copria_color_sort');

        // set up the console commands
        $this->app->singleton('command.copria-color-sort.install', function ($app) {
            return new \Dias\Modules\Copria\ColorSort\Console\Commands\Install();
        });
        $this->commands('command.copria-color-sort.install');
        $this->app->singleton('command.copria-color-sort.publish', function ($app) {
            return new \Dias\Modules\Copria\ColorSort\Console\Commands\Publish();
        });
        $this->commands('command.copria-color-sort.publish');
    }

    /**
     * Get the services provided by the provider.
     *
     * @return array
     */
    public function provides()
    {
        return [
            'command.copria-color-sort.install',
            'command.copria-color-sort.publish',
        ];
    }
}
