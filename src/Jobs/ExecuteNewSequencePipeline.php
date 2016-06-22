<?php

namespace Dias\Modules\Copria\ColorSort\Jobs;

use DB;
use Dias\Jobs\Job;
use Dias\Modules\Copria\ColorSort\Sequence;
use Dias\User;
use Dias\Modules\Copria\User as CopriaUser;
use Illuminate\Queue\SerializesModels;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;
use Dias\Modules\Copria\PipelineCallback;
use Dias\Modules\Copria\ColorSort\Http\Controllers\Api\TransectColorSortSequenceController;

class ExecuteNewSequencePipeline extends Job implements ShouldQueue
{
    use InteractsWithQueue, SerializesModels;

    /**
     * The color sort sequence that should be computed
     *
     * @var Sequence
     */
    private $sequence;

    /**
     * The user who requested the new color sort sequence
     *
     * @var User
     */
    private $user;

    /**
     * Create a new job instance.
     *
     * @param Sequence $sequence The color sort sequence that should be computed
     * @param User $user The user who requested the new color sort sequence
     * @return void
     */
    public function __construct(Sequence $sequence, User $user)
    {
        $this->sequence = $sequence;
        $this->user = $user;
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        $callback = new PipelineCallback;
        $callback->generateToken();
        $callback->function = TransectColorSortSequenceController::class.'@result';
        $callback->payload = ['id' => $this->sequence->id];

        $transect = $this->sequence->transect()->with('images')->first();

        CopriaUser::convert($this->user)
            ->executeCopriaPipeline(config('copria_color_sort.pipeline_id'), $callback->url, [
                config('copria_color_sort.hex_color_selector') => $this->sequence->color,
                config('copria_color_sort.images_directory_selector') => $transect->url,
                config('copria_color_sort.images_filenames_selector') => $transect->images->pluck('filename')->implode(','),
                config('copria_color_sort.images_ids_selector') => $transect->images->pluck('id')->implode(','),
                config('copria_color_sort.target_url_selector') => $callback->url,
            ]);

        // only save callback if everything went right
        $callback->save();
    }
}
