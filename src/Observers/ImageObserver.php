<?php

namespace Dias\Modules\Copria\ColorSort\Observers;

use Dias\Modules\Copria\ColorSort\Transect;

class ImageObserver
{
    /**
     * Updates the color sort sequences containing the ID of the deleted image.
     *
     * @param \Dias\Image $image
     * @return bool
     */
    public function deleted($image)
    {
        $sequences = Transect::find($image->transect_id)->colorSortSequences()
            ->select('id', 'sequence')
            ->whereNotNull('sequence')
            ->get();
        $id = $image->id;
        foreach ($sequences as $sequence) {
            $ids = $sequence->sequence;
            $offset = array_search($id, $ids);
            if ($offset !== false) {
                // remove the ID of the deleted image from the color sort sequence
                array_splice($ids, $offset, 1);
                $sequence->sequence = $ids;
                $sequence->save();
            }
        }
    }
}
