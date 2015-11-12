<?php

namespace Dias\Modules\Copria\ColorSort\Console\Commands;

use Illuminate\Console\Command;
use Dias\Modules\Copria\ColorSort\CopriaColorSortServiceProvider as ServiceProvider;

class Install extends Command {

    /**
     * The console command name.
     *
     * @var string
     */
    protected $name = 'copria-color-sort:install';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Publish the migration of this package and run it';

    /**
     * Execute the command.
     *
     * @return void
     */
    public function handle()
    {
        $this->call('vendor:publish', [
            '--provider' => ServiceProvider::class,
            '--tag' => ['migrations'],
        ]);

        if ($this->confirm('Do you want to run the migration right away?')) {
            $this->call('migrate');
        }

        // publish the public assets
        $this->call('copria-color-sort:publish');
    }
}
