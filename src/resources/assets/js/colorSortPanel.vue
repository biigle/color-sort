<script>
import ColorSortApi from './api/colorSortSequence.js';
import ListItem from './colorSortListItem.vue';
import {handleErrorResponse} from './import.js';
import {LoaderMixin} from './import.js';

export default {
    mixins: [LoaderMixin],
    data() {
        return {
            sequences: [],
            volumeId: null,
        };
    },
    components: {
        listItem: ListItem,
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
</script>
