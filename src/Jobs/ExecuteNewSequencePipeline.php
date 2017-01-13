<?php

namespace Biigle\Modules\Copria\ColorSort\Jobs;

use DB;
use Biigle\User;
use Biigle\Jobs\Job;
use Illuminate\Queue\SerializesModels;
use Illuminate\Queue\InteractsWithQueue;
use Biigle\Modules\Copria\PipelineCallback;
use Illuminate\Contracts\Queue\ShouldQueue;
use Biigle\Modules\Copria\ColorSort\Sequence;
use Biigle\Modules\Copria\User as CopriaUser;
use Biigle\Modules\Copria\ColorSort\Http\Controllers\Api\VolumeColorSortSequenceController;

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
        $callback->function = VolumeColorSortSequenceController::class.'@result';
        $callback->payload = ['id' => $this->sequence->id];

        $volume = $this->sequence->volume()->first();
        $images = $volume->images()
            ->orderBy('id')
            ->pluck('filename', 'id');

        CopriaUser::convert($this->user)
            ->executeCopriaPipeline(config('copria_color_sort.pipeline_id'), $callback->url, [
                config('copria_color_sort.hex_color_selector') => $this->sequence->color,
                config('copria_color_sort.images_directory_selector') => $volume->url,
                config('copria_color_sort.images_filenames_selector') => $images->values()->implode(','),
                config('copria_color_sort.images_ids_selector') => $images->keys()->implode(','),
                config('copria_color_sort.target_url_selector') => $callback->url,
            ]);

        // only save callback if everything went right
        $callback->save();
    }
}
