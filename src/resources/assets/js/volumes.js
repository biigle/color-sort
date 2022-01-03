import {VolumeSorters} from './import';
import ColorSorter from './colorSorterComponent';
import ColorSortPanel from './colorSortPanel';

if (Array.isArray(VolumeSorters)) {
    VolumeSorters.push({
        id: 'color',
        types: ['image'],
        component: ColorSorter,
    });
}

biigle.$mount('color-sort-panel', ColorSortPanel);
