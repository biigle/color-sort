<?php

namespace Biigle\Modules\Copria\ColorSort\Jobs;

use Biigle\Jobs\Job;
use Illuminate\Queue\SerializesModels;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;
use Biigle\Modules\Copria\ColorSort\Sequence;
use Biigle\Modules\Copria\ColorSort\Support\Sort;

class ComputeNewSequence extends Job implements ShouldQueue
{
    use InteractsWithQueue, SerializesModels;

    /**
     * The color sort sequence that should be computed.
     *
     * @var Sequence
     */
    private $sequence;

    /**
     * Create a new job instance.
     *
     * @param Sequence $sequence The color sort sequence that should be computed
     * @return void
     */
    public function __construct(Sequence $sequence)
    {
        $this->sequence = $sequence;
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        $sort = app()->make(Sort::class);
        $output = $sort->execute($this->sequence->volume, $this->sequence->color);
        $this->sequence->sequence = $output;
        $this->sequence->save();
    }

    /**
     * Handle a job failure.
     *
     * @return void
     */
    public function failed()
    {
        $this->sequence->delete();
    }
}
