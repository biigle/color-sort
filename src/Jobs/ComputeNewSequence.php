<?php

namespace Biigle\Modules\ColorSort\Jobs;

use Biigle\Jobs\Job;
use Biigle\Modules\ColorSort\Sequence;
use Biigle\Modules\ColorSort\Support\Sort;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

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
     * Ignore this job if the annotation does not exist any more.
     *
     * @var bool
     */
    protected $deleteWhenMissingModels = true;

    /**
     * The number of times the job may be attempted.
     *
     * @var int
     */
    public $tries = 1;

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
        $sort = resolve(Sort::class);
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
