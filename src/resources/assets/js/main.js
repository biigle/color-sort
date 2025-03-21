import {VolumeSorters} from './import.js';
import ColorSorter from './colorSorterComponent.vue';
import ColorSortPanel from './colorSortPanel.vue';

if (Array.isArray(VolumeSorters)) {
    VolumeSorters.push({
        id: 'color',
        types: ['image'],
        component: ColorSorter,
    });
}

biigle.$mount('color-sort-panel', ColorSortPanel);
