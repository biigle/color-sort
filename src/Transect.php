<?php

namespace Dias\Modules\Copria\ColorSort;

use Dias\Transect as BaseTransect;

/**
 * Extends the base Dias transect by the color sort sequence relation
 */
class Transect extends BaseTransect {

    /**
     * Converts a regular Dias transect to a Copria color sort transect
     *
     * @param BaseTransect $transect Regular Dias transect instance
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
        return $this->hasMany('Dias\Modules\Copria\ColorSort\Sequence');
    }
}
