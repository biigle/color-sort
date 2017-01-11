<?php

namespace Biigle\Modules\Copria\ColorSort;

use Biigle\Transect as BaseTransect;

/**
 * Extends the base Biigle transect by the color sort sequence relation
 */
class Transect extends BaseTransect {

    /**
     * Converts a regular Biigle transect to a Copria color sort transect
     *
     * @param BaseTransect $transect Regular Biigle transect instance
     *
     * @return User
     */
    public static function convert(BaseTransect $transect)
    {
        $instance = new static;
        $instance->setRawAttributes($transect->attributes);
        $instance->exists = $transect->exists;
        return $instance->setRelations($transect->relations);
    }

    /**
     * The color sort sequences belonging to this transect
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function colorSortSequences()
    {
        return $this->hasMany('Biigle\Modules\Copria\ColorSort\Sequence');
    }
}
