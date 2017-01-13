<?php

namespace Biigle\Modules\Copria\ColorSort\Observers;

use Biigle\Modules\Copria\ColorSort\Volume;

class ImageObserver
{
    /**
     * Updates the color sort sequences containing the ID of the deleted image.
     *
     * @param \Biigle\Image $image
     * @return bool
     */
    public function deleted($image)
    {
        $sequences = Volume::find($image->volume_id)->colorSortSequences()
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
