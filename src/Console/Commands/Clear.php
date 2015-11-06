<?php

namespace Dias\Modules\Copria\ColorSort\Console\Commands;

use Illuminate\Console\Command;
use Dias\Modules\Copria\ColorSort\Sequence;
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
        if (Schema::hasTable(Sequence::DB_TABLE_NAME)) {
            DB::table(Sequence::DB_TABLE_NAME)->truncate();
            $this->info('Successfully cleared the '.Sequence::DB_TABLE_NAME.' table');
        } else {
            $this->comment('The '.Sequence::DB_TABLE_NAME.' table does not exist. Can\'t clear anything.');
        }
    }
}
