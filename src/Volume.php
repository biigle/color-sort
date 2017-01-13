<?php

namespace Biigle\Modules\Copria\ColorSort;

use Biigle\Volume as BaseVolume;

/**
 * Extends the base Biigle volume by the color sort sequence relation
 */
class Volume extends BaseVolume {

    /**
     * Converts a regular Biigle volume to a Copria color sort volume
     *
     * @param BaseVolume $volume Regular Biigle volume instance
     *
     * @return User
     */
    public static function convert(BaseVolume $volume)
    {
        $instance = new static;
        $instance->setRawAttributes($volume->attributes);
        $instance->exists = $volume->exists;
        return $instance->setRelations($volume->relations);
    }

    /**
     * The color sort sequences belonging to this volume
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function colorSortSequences()
    {
        return $this->hasMany('Biigle\Modules\Copria\ColorSort\Sequence');
    }
}
