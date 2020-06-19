import ColorSortApi from './api/colorSortSequence';
import {handleErrorResponse} from './import';
import {Loader} from './import';

/**
 * The panel for editing color sort sequences
 */
let listItem = {
    props: ['color'],
    computed: {
        title() {
            return 'Delete sequence for color #' + this.color;
        },
        styleObject() {
            return {'background-color': '#' + this.color};
        },
    },
    methods: {
        remove() {
            this.$emit('remove', this.color);
        },
    }
};

export default {
    mixins: [Loader],
    data: {
        sequences: [],
        volumeId: null,
    },
    components: {
        listItem: listItem,
    },
    computed: {
        hasSequences() {
            return this.sequences.length > 0;
        },
    },
    methods: {
        handleRemove(color) {
            if (!this.loading && confirm(`Do you really want to delete the sequence for color #${color}?`)) {
                this.startLoading();
                ColorSortApi.delete({volume_id: volumeId, color: color})
                    .then(() => this.sequenceRemoved(color))
                    .catch(handleErrorResponse)
                    .finally(this.finishLoading);
            }
        },
        sequenceRemoved(color) {
            let index = this.sequences.indexOf(color);
            if (index !== -1) {
                this.sequences.splice(index, 1);
            }
        },
    },
    created() {
        this.sequences = biigle.$require('volumes.colorSortSequences');
        this.volumeId = biigle.$require('volumes.id');
    },
};
