<?php

namespace Biigle\Modules\Copria\ColorSort\Http\Controllers\Api;

use Biigle\Image;
use Illuminate\Http\Request;
use Biigle\Volume as BaseVolume;
use Illuminate\Contracts\Auth\Guard;
use Biigle\Http\Controllers\Api\Controller;
use Biigle\Modules\Copria\ColorSort\Volume;
use Biigle\Modules\Copria\ColorSort\Sequence;
use Biigle\Modules\Copria\ColorSort\Jobs\ComputeNewSequence;

class VolumeColorSortSequenceController extends Controller
{
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
     * Show the sequence of images sorted by a specific color.
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
     * Request a new color sort sequence.
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
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request, $id)
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

        $this->dispatchNow(new ComputeNewSequence($s));

        return $s->fresh()->sequence;
    }
}
