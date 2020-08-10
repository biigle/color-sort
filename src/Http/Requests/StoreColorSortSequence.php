<?php

namespace Biigle\Modules\ColorSort\Http\Requests;

use Biigle\Modules\ColorSort\Sequence;
use Biigle\Volume;
use Illuminate\Foundation\Http\FormRequest;

class StoreColorSortSequence extends FormRequest
{
    /**
     * The volume for which the new sequence should be computed.
     *
     * @var Volume
     */
    public $volume;

    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
    {
        $this->volume = Volume::findOrFail($this->route('id'));

        return $this->user()->can('edit-in', $this->volume);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules()
    {
        return [
            'color' => 'required|regex:/^[0-9a-fA-F]{6}$/',
        ];
    }

    /**
     * Configure the validator instance.
     *
     * @param  \Illuminate\Validation\Validator  $validator
     * @return void
     */
    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            if ($this->volume->isVideoVolume()) {
                $validator->errors()->add('id', 'Color sort sequences are not available for video volumes.');
            }

            $isDuplicate = Sequence::where('volume_id', $this->route('id'))
                ->where('color', $this->input('color'))
                ->exists();

            if ($isDuplicate) {
                $validator->errors()->add('id', 'The color sort sequence already exists for this volume');
            }
        });
    }

    /**
     * Get the error messages for the defined validation rules.
     *
     * @return array
     */
    public function messages()
    {
        return [
            'color.regex' => 'The color must be in valid hexadecimal format.',
        ];
    }
}
