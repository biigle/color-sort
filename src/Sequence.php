<?php

namespace Biigle\Modules\Copria\ColorSort;

use Illuminate\Database\Eloquent\Model;

/**
 * This model represents a sequence of transect images sorted by a specific color.
 */
class Sequence extends Model {

    /**
     * Name of the database table that is used for this model.
     *
     * @var String
     */
    const DB_TABLE_NAME = 'copria_color_sort_sequence';

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = self::DB_TABLE_NAME;

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
     * The transect, this image belongs to.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function transect()
    {
        return $this->belongsTo('Biigle\Transect');
    }
}
