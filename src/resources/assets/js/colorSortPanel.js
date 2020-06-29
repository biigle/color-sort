import ColorSortApi from './api/colorSortSequence';
import {handleErrorResponse} from './import';
import {LoaderMixin} from './import';

/**
 * The panel for editing color sort sequences
 */
let listItem = {
    props: ['sequence'],
    computed: {
        title() {
            return 'Delete sequence for color #' + this.color;
        },
        styleObject() {
            return {'background-color': '#' + this.color};
        },
        color() {
            return this.sequence.color;
        },
    },
    methods: {
        remove() {
            this.$emit('remove', this.sequence);
        },
    }
};

export default {
    mixins: [LoaderMixin],
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
        handleRemove(sequence) {
            if (!this.loading && confirm(`Do you really want to delete the sequence for color #${sequence.color}?`)) {
                this.startLoading();
                ColorSortApi.delete({volume_id: this.volumeId, color: sequence.color})
                    .then(() => this.sequenceRemoved(sequence.id))
                    .catch(handleErrorResponse)
                    .finally(this.finishLoading);
            }
        },
        sequenceRemoved(id) {
            this.sequences = this.sequences.filter((s) => s.id !== id);
        },
    },
    created() {
        this.sequences = biigle.$require('volumes.colorSortSequences')
            .map((color, id) => ({color, id}));
        this.volumeId = biigle.$require('volumes.id');
    },
};
