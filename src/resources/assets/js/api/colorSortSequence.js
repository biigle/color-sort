/**
 * Resource for color sort sequences.
 *
 * var resource = biigle.$require('api.colorSortSequence');
 *
 * Get all available colors for a volume:
 * resource.query({volume_id: 1}).then(...);
 *
 * Get the image IDs of a specific color sort sequence:
 * resource.get({volume_id: 1, color: 'bada55'}).then(...);
 *
 * Request a new color sort sequence:
 * resource.save({volume_id: 1}, {color: 'c0ffee'}).then(...);
 *
 * @type {Vue.resource}
 */
biigle.$declare('api.colorSortSequence', Vue.resource('api/v1/volumes{/volume_id}/color-sort-sequence{/color}'));
