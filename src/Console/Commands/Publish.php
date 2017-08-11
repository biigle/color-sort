<?php

namespace Biigle\Modules\ColorSort\Console\Commands;

use Illuminate\Console\Command;
use Biigle\Modules\ColorSort\ColorSortServiceProvider as ServiceProvider;

class Publish extends Command
{
    /**
     * The console command name.
     *
     * @var string
     */
    protected $name = 'color-sort:publish';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Publish or refresh the public assets of this package';

    /**
     * Execute the command.
     *
     * @return void
     */
    public function handle()
    {
        $response = $this->call('vendor:publish', [
            '--provider' => ServiceProvider::class,
            '--tag' => ['public'],
            '--force' => true,
        ]);
    }
}
