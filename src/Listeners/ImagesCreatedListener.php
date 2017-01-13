<?php

namespace Biigle\Modules\Copria\ColorSort\Listeners;

use Biigle\Modules\Copria\ColorSort\Sequence;

class ImagesCreatedListener
{
    /**
     * Handle the event.
     *
     * Remove all color sort sequences for the volume since they don't include the
     * newly added images.
     *
     * @param int $id Volume ID
     * @param  array  $ids  Image ids
     * @return void
     */
    public function handle($id, array $ids)
    {
        Sequence::where('volume_id', $id)->delete();
    }
}
