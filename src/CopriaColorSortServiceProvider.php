<?php

namespace Dias\Modules\Copria\ColorSort;

use Illuminate\Support\ServiceProvider;
use Dias\Modules\Copria\ColorSort\Console\Commands\Install as InstallCommand;
use Dias\Modules\Copria\ColorSort\Console\Commands\Clear as ClearCommand;
use Dias\Modules\Copria\ColorSort\Console\Commands\Uninstall as UninstallCommand;
use Dias\Services\Modules;

class CopriaColorSortServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap the application events.
     *
     * @return void
     */
    public function boot(Modules $modules)
    {
        // $this->loadViewsFrom(__DIR__.'/resources/views', 'transects');

        // $this->publishes([
        //     __DIR__.'/public/assets' => public_path('vendor/transects'),
        // ], 'public');

        // include __DIR__.'/Http/routes.php';

        // $modules->addMixin('transects', 'dashboard.projects');
        // $modules->addMixin('transects', 'dashboardStyles');
        // $modules->addMixin('transects', 'projects');
        // $modules->addMixin('transects', 'adminMenu');
        // $modules->addMixin('transects', 'adminIndex');
    }

    /**
     * Register the service provider.
     *
     * @return void
     */
    public function register()
    {
        // set up the console commands
        $this->app->singleton('command.copria-color-sort.install', function ($app) {
            return new InstallCommand();
        });
        $this->commands('command.copria-color-sort.install');

        $this->app->singleton('command.copria-color-sort.clear', function ($app) {
            return new ClearCommand();
        });
        $this->commands('command.copria-color-sort.clear');

        $this->app->singleton('command.copria-color-sort.uninstall', function ($app) {
            return new UninstallCommand();
        });
        $this->commands('command.copria-color-sort.uninstall');
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
            'command.copria-color-sort.clear',
            'command.copria-color-sort.uninstall',
        ];
    }
}
