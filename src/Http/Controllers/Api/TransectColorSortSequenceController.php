<?php

namespace Dias\Modules\Copria\ColorSort\Http\Controllers\Api;

use Dias\Modules\Copria\ColorSort\Transect;
use Dias\Modules\Copria\ColorSort\Sequence;
use Dias\Http\Controllers\Api\Controller;

class TransectColorSortSequenceController extends Controller
{
    /**
     * List all color sort sequence colors of the specified transect.
     *
     * @api {get} transects/:id/color-sort-sequence Get all sequences
     * @apiGroup Transects
     * @apiName IndexTransectColorSortSequences
     * @apiPermission projectMember
     * @apiDescription Returns a list of all colors of color sort sequences of the transect.
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
        $transect = $this->requireNotNull(Transect::find($id));
        $this->requireCanSee($transect);

        return $transect->colorSortSequences()->lists('color');
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
        $transect = $this->requireNotNull(Transect::select('id')->find($id));
        // check this first before fetching the sequence so unauthorized users can't see
        // which sequences exist and which not
        $this->requireCanSee($transect);

        return $this->requireNotNull(
            $transect->colorSortSequences()->whereColor($color)->select('sequence')->first()
        )->sequence;
    }

    /**
     * Request a new color sort sequence
     *
     * @api {post} transects/:id/color-sort-sequence Request a new color sort sequence
     * @apiGroup Transects
     * @apiName StoreTransectColorSortSequence
     * @apiPermission projectEditor
     * @apiDescription Initiates computing of a new color sort sequence. Poll the "sow" endpoint to see when computing has finished.
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
        $transect = $this->requireNotNull(Transect::select('id')->find($id));
        $this->requireCanEdit($transect);

        $s = new Sequence;
        $s->transect_id = $id;
        $s->color = $this->request->input('color');
        $s->save();
    }
}
