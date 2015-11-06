<?php

namespace Dias\Modules\Copria\ColorSort\Console\Commands;

use Illuminate\Console\Command;
use Dias\Modules\Copria\ColorSort\Sequence;
use Schema;

class Uninstall extends Command
{
    /**
     * The console command name.
     *
     * @var string
     */
    protected $name = 'copria-color-sort:uninstall';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Remove the DB tables of the Copria color sort package';

    /**
     * Execute the command.
     *
     * @return void
     */
    public function handle()
    {
        Schema::dropIfExists(Sequence::DB_TABLE_NAME);
        $this->info('Done');
    }
}
