<?php

namespace Dias\Modules\Copria\ColorSort;

use Dias\Transect as BaseTransect;

/**
 * Extends the base Dias transect by the color sort sequence relation
 */
class Transect extends BaseTransect {

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
