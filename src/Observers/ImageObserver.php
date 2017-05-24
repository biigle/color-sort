<?php

namespace Biigle\Modules\ColorSort\Observers;

use Biigle\Modules\ColorSort\Sequence;

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
        $sequences = Sequence::where('volume_id', $image->volume_id)
            ->whereNotNull('sequence')
            ->select('id', 'sequence')
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
