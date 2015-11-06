<?php

namespace Dias\Modules\Copria\ColorSort\Http\Controllers\Api;

use Dias\Modules\Copria\ColorSort\Transect;
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
}
