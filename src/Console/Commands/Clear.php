<?php

namespace Dias\Modules\Copria\ColorSort\Console\Commands;

use Illuminate\Console\Command;
use Dias\Modules\Copria\ColorSort\CopriaColorSortServiceProvider as ServiceProvider;
use Schema;
use DB;

class Clear extends Command
{
    /**
     * The console command name.
     *
     * @var string
     */
    protected $name = 'copria-color-sort:clear';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Clear color sort data for all transects';

    /**
     * Execute the command.
     *
     * @return void
     */
    public function handle()
    {
        if (Schema::hasTable(ServiceProvider::DB_TABLE_NAME)) {
            DB::table(ServiceProvider::DB_TABLE_NAME)->truncate();
            $this->info('Successfully cleared the '.ServiceProvider::DB_TABLE_NAME.' table');
        } else {
            $this->comment('The '.ServiceProvider::DB_TABLE_NAME.' table does not exist. Can\'t clear anything.');
        }
    }
}
