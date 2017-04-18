/**
 * Sorter for the color sorting.
 */
biigle.$require('volumes.stores.sorters').push({
    id: 'color',
    component: {
        template: '#color-sort-template',
        mixins: [biigle.$require('volumes.mixins.sortComponent')],
        components: {
            loader: biigle.$require('core.components.loader'),
        },
        data: function () {
            return {
                title: 'Sort images by color',
                text: 'Color',
                volumeId: biigle.$require('volumes.volumeId'),
                fetchingColors: true,
                colors: [],
                activeColor: null,
                cache: {},
                loadingSequence: false,
                computingSequence: false,
                newColor: '#000000',
            };
        },
        computed: {
            hasColors: function () {
                return this.colors.length > 0;
            },
            id: function () {
                return 'color-' + this.activeColor;
            },
            active: function () {
                return this.activeSorter.startsWith('color-');
            },
            canRequestNewColor: function () {
                return !this.fetchingColors && !this.loadingSequence && !this.computingSequence;
            },
        },
        methods: {
            getSequence: function () {
                var color = this.activeColor;
                var self = this;

                if (this.cache.hasOwnProperty(color)) {
                    return new Vue.Promise(function (resolve) {
                        resolve(self.cache[color]);
                    });
                }

                this.loadingSequence = true;
                return biigle.$require('api.colorSortSequence')
                    .get({volume_id: this.volumeId, color: color})
                        .then(this.parseResponse)
                        .then(function (sequence) {
                            self.cache[color] = sequence;
                            return sequence;
                        })
                        .finally(function () {
                            self.loadingSequence = false;
                        });
            },
            parseResponse: function (response) {
                return response.data;
            },
            initColors: function (response) {
                this.colors = response.data;
            },
            select: function (color) {
                if (!this.isActive(color) && !this.loadingSequence) {
                    this.activeColor = color;
                    this.$emit('select', this);
                }
            },
            isActive: function (color) {
                return this.active && color === this.activeColor;
            },
            fetchColors: function () {
                var self = this;
                biigle.$require('api.colorSortSequence')
                    .query({volume_id: this.volumeId})
                        .then(this.initColors)
                        .catch(biigle.$require('messages.store').handleErrorResponse)
                        .finally(function () {
                            self.fetchingColors = false;
                        });
            },
            requestNewColor: function () {
                this.computingSequence = true;
                var self = this;
                var color = this.newColor.substr(1);
                biigle.$require('api.colorSortSequence')
                    .save({volume_id: this.volumeId}, {color: color})
                        .then(function (response) {
                            self.cache[color] = response.data;
                            self.colors.push(color);
                            self.select(color);
                        })
                        .catch(biigle.$require('messages.store').handleErrorResponse)
                        .finally(function () {
                            self.computingSequence = false;
                        });
            },
        },
        mounted: function () {
            biigle.$require('biigle.events').$once('sidebar.open.sorting', this.fetchColors);

            if (this.active) {
                this.activeColor = this.activeSorter.substr(
                    this.activeSorter.indexOf('-') + 1
                );
            }
        },
    },
});
