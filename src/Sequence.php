<?php

namespace Dias\Modules\Copria\ColorSort;

use Illuminate\Database\Eloquent\Model;

/**
 * This model represents a sequence of transect images sorted by a specific color
 */
class Sequence extends Model
{

    /**
     * Name of the database table that is used for this model
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
        'transect',
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
     * The transect, this image belongs to.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function transect()
    {
        return $this->belongsTo('Dias\Transect');
    }

    public function generateToken()
    {
        // do this like the password reset tokens, see: https://github.com/laravel/framework/blob/67226679df52894f41f3bf1a53a9537ed33e7fa9/src/Illuminate/Auth/Passwords/DatabaseTokenRepository.php#L171
        $this->token = hash_hmac('sha256', str_random(40), config('app.key'));
    }
}
