<?php

namespace Dias\Modules\Copria\ColorSort\Http\Controllers\Api;

use Dias\Transect as BaseTransect;
use Dias\Modules\Copria\ColorSort\Transect;
use Dias\Modules\Copria\ColorSort\Sequence;
use Dias\Http\Controllers\Api\Controller;
use Illuminate\Http\Request;
use Dias\Modules\Copria\ColorSort\Jobs\ExecuteNewSequencePipeline;
use Dias\Image;

class TransectColorSortSequenceController extends Controller
{
    /**
     * Creates a new TransectColorSortSequenceController instance.
     *
     * @param Request $request
     */
    public function __construct(Request $request)
    {
        parent::__construct($request);
        // the user has to have their Copria key configured to request a new color sort sequence
        $this->middleware('copria.key', ['only' => 'store']);
    }

    /**
     * List all color sort sequence colors of the specified transect.
     *
     * @api {get} transects/:id/color-sort-sequence Get all sequences
     * @apiGroup Transects
     * @apiName IndexTransectColorSortSequences
     * @apiPermission projectMember
     * @apiDescription Returns a list of all colors of color sort sequences of the transect. Note that this list does _not_ contain the sequences still computing (i.e. having no sorting data yet).
     *
     * @apiParam {Number} id The transect ID.
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
        $transect = BaseTransect::findOrFail($id);
        $this->authorize('access', $transect);

        return Transect::convert($transect)
            ->colorSortSequences()
            ->whereNotNull('sequence')
            ->pluck('color');
    }

    /**
     * Show the sequence of images sorted by a specific color
     *
     * @api {get} transects/:id/color-sort-sequence/:color Get the sequence of a color
     * @apiGroup Transects
     * @apiName ShowTransectColorSortSequence
     * @apiPermission projectMember
     * @apiDescription Returns an array of image IDs sorted by the color
     *
     * @apiParam {Number} id The transect ID.
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
        $transect = BaseTransect::findOrFail($id);
        // check this first before fetching the sequence so unauthorized users can't see
        // which sequences exist and which not
        $this->authorize('access', $transect);

        $sequence = Transect::convert($transect)
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
     * @api {post} transects/:id/color-sort-sequence Request a new color sort sequence
     * @apiGroup Transects
     * @apiName StoreTransectColorSortSequence
     * @apiPermission projectEditor
     * @apiDescription Initiates computing of a new color sort sequence. Poll the "show" endpoint to see when computing has finished.
     *
     * @apiParam {Number} id The transect ID.
     * @apiParam (Required attributes) {String} color The color of the new color sort sequence.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function store($id)
    {
        $this->validate($this->request, Sequence::$createRules);
        $transect = BaseTransect::findOrFail($id);
        $this->authorize('edit-in', $transect);

        $s = new Sequence;
        $s->transect_id = $id;
        $s->color = $this->request->input('color');

        try {
            $s->save();
        } catch (\Illuminate\Database\QueryException $e) {
            abort(405, 'The color sort sequence already exists for this transect');
        }

        $this->dispatch(new ExecuteNewSequencePipeline($s, $this->user));
    }

    /**
     * Return a computation result for a new color sort sequence
     *
     * @apiParam (Required attributes) {String} pin1 Image IDs, imploded with a ',', when the images are sorted by the color of the color sort sequence. If this attribute is not present, `state` must be.
     * @apiParam (Required attributes) {String} state Json object. If this attribute is not present, `pin1` must be.
     *
     * @param  array  $payload Payload of the PipelineCallback that was called with the result of the pipeline
     * @return \Illuminate\Http\Response
     */
    public function result($payload)
    {
        $sequence = Sequence::findOrFail($payload['id']);

        $request = $this->request;

        if ($request->has(config('copria_color_sort.result_request_param'))) {
            // job was successfully computed
            $returnedIds = array_map('intval', explode(',', $request->input(config('copria_color_sort.result_request_param'))));
            $imagesIds = Image::where('transect_id', $sequence->transect_id)->lists('id')->toArray();

            // take only those of the returned IDs that actually belong to the transect
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
