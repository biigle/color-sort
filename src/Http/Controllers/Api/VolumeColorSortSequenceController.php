<?php

namespace Biigle\Modules\Copria\ColorSort\Http\Controllers\Api;

use Biigle\Image;
use Illuminate\Http\Request;
use Biigle\Volume as BaseVolume;
use Illuminate\Contracts\Auth\Guard;
use Biigle\Http\Controllers\Api\Controller;
use Biigle\Modules\Copria\ColorSort\Volume;
use Biigle\Modules\Copria\ColorSort\Sequence;
use Biigle\Modules\Copria\ColorSort\Jobs\ExecuteNewSequencePipeline;

class VolumeColorSortSequenceController extends Controller
{
    /**
     * Creates a new VolumeColorSortSequenceController instance.
     */
    public function __construct()
    {
        // the user has to have their Copria key configured to request a new color sort sequence
        $this->middleware('copria.key', ['only' => 'store']);
    }

    /**
     * List all color sort sequence colors of the specified volume.
     *
     * @api {get} volumes/:id/color-sort-sequence Get all sequences
     * @apiGroup Volumes
     * @apiName IndexVolumeColorSortSequences
     * @apiPermission projectMember
     * @apiDescription Returns a list of all colors of color sort sequences of the volume. Note that this list does _not_ contain the sequences still computing (i.e. having no sorting data yet).
     *
     * @apiParam {Number} id The volume ID.
     *
     * @apiSuccessExample {json} Success response:
     * [
     *     "BADA55",
     *     "C0FFEE"
     * ]
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function index($id)
    {
        $volume = BaseVolume::findOrFail($id);
        $this->authorize('access', $volume);

        return Volume::convert($volume)
            ->colorSortSequences()
            ->whereNotNull('sequence')
            ->pluck('color');
    }

    /**
     * Show the sequence of images sorted by a specific color
     *
     * @api {get} volumes/:id/color-sort-sequence/:color Get the sequence of a color
     * @apiGroup Volumes
     * @apiName ShowVolumeColorSortSequence
     * @apiPermission projectMember
     * @apiDescription Returns an array of image IDs sorted by the color
     *
     * @apiParam {Number} id The volume ID.
     * @apiParam {String} color The hex color
     *
     * @apiSuccessExample {json} Success response:
     * [2, 3, 1, 4]
     *
     * @param  int  $id
     * @param  string  $color
     * @return \Illuminate\Http\Response
     */
    public function show($id, $color)
    {
        $volume = BaseVolume::findOrFail($id);
        // check this first before fetching the sequence so unauthorized users can't see
        // which sequences exist and which not
        $this->authorize('access', $volume);

        $sequence = Volume::convert($volume)
            ->colorSortSequences()
            ->whereColor($color)
            ->select('sequence')
            ->first();

        if ($sequence === null) {
            abort(404);
        }

        return $sequence->sequence;
    }

    /**
     * Request a new color sort sequence
     *
     * @api {post} volumes/:id/color-sort-sequence Request a new color sort sequence
     * @apiGroup Volumes
     * @apiName StoreVolumeColorSortSequence
     * @apiPermission projectEditor
     * @apiDescription Initiates computing of a new color sort sequence. Poll the "show" endpoint to see when computing has finished.
     * **Computing of a color sort sequence is not available for remote volumes.**
     *
     * @apiParam {Number} id The volume ID.
     * @apiParam (Required attributes) {String} color The color of the new color sort sequence.
     *
     * @param Request $request
     * @param Guard $auth
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request, Guard $auth, $id)
    {
        $this->validate($request, Sequence::$createRules);
        $volume = BaseVolume::findOrFail($id);
        $this->authorize('edit-in', $volume);

        if ($volume->isRemote()) {
            return $this->buildFailedValidationResponse($request, [
                'id' => 'Computing of a color sort sequence is not available for remote volumes.',
            ]);
        }

        $s = new Sequence;
        $s->volume_id = $id;
        $s->color = $request->input('color');

        try {
            $s->save();
        } catch (\Illuminate\Database\QueryException $e) {
            abort(405, 'The color sort sequence already exists for this volume');
        }

        $this->dispatch(new ExecuteNewSequencePipeline($s, $auth->user()));
    }

    /**
     * Return a computation result for a new color sort sequence
     *
     * @apiParam (Required attributes) {String} pin1 Image IDs, imploded with a ',', when the images are sorted by the color of the color sort sequence. If this attribute is not present, `state` must be.
     * @apiParam (Required attributes) {String} state Json object. If this attribute is not present, `pin1` must be.
     *
     * @param Request $request
     * @param  array  $payload Payload of the PipelineCallback that was called with the result of the pipeline
     * @return \Illuminate\Http\Response
     */
    public function result(Request $request, $payload)
    {
        $sequence = Sequence::findOrFail($payload['id']);

        if ($request->has(config('copria_color_sort.result_request_param'))) {
            // job was successfully computed
            $returnedIds = array_map('intval', explode(',', $request->input(config('copria_color_sort.result_request_param'))));
            $imagesIds = Image::where('volume_id', $sequence->volume_id)->pluck('id')->toArray();

            // take only those of the returned IDs that actually belong to the volume
            // (e.g. images could have been deleted while the color sort sequence was computing)
            $sequence->sequence = array_values(array_intersect($returnedIds, $imagesIds));
            $sequence->save();
        } else if ($request->has('state')) {
            // route was called with the Copria SubmittedJob object instead of the result.
            // we can assume that the job failed
            $sequence->delete();
        } else {
            // request doesn't have the required data
            return response('Invalid request parameters. You must either provide "'.config('copria_color_sort.result_request_param').'" or "state".', 422);
        }
    }
}
