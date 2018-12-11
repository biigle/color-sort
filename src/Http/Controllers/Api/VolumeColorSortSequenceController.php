<?php

namespace Biigle\Modules\ColorSort\Http\Controllers\Api;

use Biigle\Image;
use Biigle\Volume;
use Biigle\Modules\ColorSort\Sequence;
use Biigle\Http\Controllers\Api\Controller;
use Illuminate\Validation\ValidationException;
use Biigle\Modules\ColorSort\Jobs\ComputeNewSequence;
use Biigle\Modules\ColorSort\Http\Requests\StoreColorSortSequence;

class VolumeColorSortSequenceController extends Controller
{
    /**
     * List all color sort sequence colors of the specified volume.
     *
     * @api {get} volumes/:id/color-sort-sequence Get all sequences
     * @apiGroup Color_Sort
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
        $volume = Volume::findOrFail($id);
        $this->authorize('access', $volume);

        return Sequence::where('volume_id', $id)
            ->whereNotNull('sequence')
            ->pluck('color');
    }

    /**
     * Show the sequence of images sorted by a specific color.
     *
     * @api {get} volumes/:id/color-sort-sequence/:color Get the sequence of a color
     * @apiGroup Color_Sort
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
        $volume = Volume::findOrFail($id);
        // check this first before fetching the sequence so unauthorized users can't see
        // which sequences exist and which not
        $this->authorize('access', $volume);

        $sequence = Sequence::where('volume_id', $id)
            ->where('color', $color)
            ->firstOrFail();

        return $sequence->sequence;
    }

    /**
     * Request a new color sort sequence.
     *
     * @api {post} volumes/:id/color-sort-sequence Request a sequence
     * @apiGroup Color_Sort
     * @apiName StoreVolumeColorSortSequence
     * @apiPermission projectEditor
     * @apiDescription Initiates computing of a new color sort sequence. Poll the "show" endpoint to see when computing has finished.
     *
     * @apiParam {Number} id The volume ID.
     * @apiParam (Required attributes) {String} color The color of the new color sort sequence.
     *
     * @param StoreColorSortSequence $request
     * @return \Illuminate\Http\Response
     */
    public function store(StoreColorSortSequence $request)
    {
        $s = new Sequence;
        $s->volume_id = $request->route('id');
        $s->color = $request->input('color');
        $s->save();

        ComputeNewSequence::dispatch($s)->onQueue('high');

        return $s;
    }

    /**
     * Delete a color sort sequence.
     *
     * @api {delete} volumes/:id/color-sort-sequence/:color Delete a sequence
     * @apiGroup Color_Sort
     * @apiName DestroyVolumeColorSortSequence
     * @apiPermission projectAdmin
     *
     * @apiParam {Number} id The volume ID.
     * @apiParam {String} color The hex color
     *
     * @param  int  $id
     * @param  string  $color
     * @return \Illuminate\Http\Response
     */
    public function destroy($id, $color)
    {
        $volume = Volume::findOrFail($id);
        $this->authorize('update', $volume);

        Sequence::where('volume_id', $id)
            ->where('color', $color)
            ->firstOrFail()
            ->delete();
    }
}
