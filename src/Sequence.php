<?php

namespace Biigle\Modules\ColorSort;

use Illuminate\Database\Eloquent\Model;

/**
 * This model represents a sequence of volume images sorted by a specific color.
 */
class Sequence extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'color_sort_sequence';

    /**
     * Don't maintain timestamps for this model.
     *
     * @var bool
     */
    public $timestamps = false;

    /**
     * The attributes included in the model's JSON form. All other are hidden.
     *
     * @var array
     */
    protected $visible = [
        'color',
        'sequence',
    ];

    /**
     * The attributes that should be casted to native types.
     *
     * @var array
     */
    protected $casts = [
        'sequence' => 'array',
    ];

    /**
     * Validation rules for creating a new project.
     *
     * @var array
     */
    public static $createRules = [
        'color' => 'required|regex:/^[0-9a-fA-F]{6}$/',
    ];

    /**
     * The volume, this image belongs to.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function volume()
    {
        return $this->belongsTo('Biigle\Volume');
    }
}
