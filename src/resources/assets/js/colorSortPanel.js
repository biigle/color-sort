/**
 * The panel for editing color sort sequences
 */
biigle.$viewModel('color-sort-panel', function (element) {
    var messages = biigle.$require('messages.store');
    var volumeId = biigle.$require('volumes.id');

    var listItem = {
        props: ['color'],
        computed: {
            title: function () {
                return 'Delete sequence for color #' + this.color;
            },
            styleObject: function () {
                return {'background-color': '#' + this.color};
            },
        },
        methods: {
            remove: function () {
                this.$emit('remove', this.color);
            },
        }
    };

    new Vue({
        el: element,
        mixins: [
            biigle.$require('core.mixins.loader'),
        ],
        data: {
            sequences: biigle.$require('volumes.colorSortSequences'),
        },
        components: {
            listItem: listItem,
        },
        computed: {
            hasSequences: function () {
                return this.sequences.length > 0;
            },
        },
        methods: {
            handleRemove: function (color) {
                if (!this.loading && confirm('Do you really want to delete the sequence for color #' + color + '?')) {
                    this.startLoading();
                    var self = this;
                    biigle.$require('api.colorSortSequence').delete({volume_id: volumeId, color: color})
                        .then(function () {self.sequenceRemoved(color);})
                        .catch(messages.handleErrorResponse)
                        .finally(this.finishLoading);
                }
            },
            sequenceRemoved: function (color) {
                var index = this.sequences.indexOf(color);
                if (index !== -1) {
                    this.sequences.splice(index, 1);
                }
            },
        },
    });
});
