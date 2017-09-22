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
            api: function () {
                return biigle.$require('api.colorSortSequence');
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
                return this.api.get({volume_id: this.volumeId, color: color})
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
                this.api.query({volume_id: this.volumeId})
                    .then(this.initColors)
                    .catch(biigle.$require('messages.store').handleErrorResponse)
                    .finally(function () {
                        self.fetchingColors = false;
                    });
            },
            pollNewSequence: function (response) {
                var self = this;
                var color = response.body.color;

                return new Vue.Promise(function (resolve, reject) {
                    var interval = window.setInterval(function () {
                        self.api.get({volume_id: self.volumeId, color: color})
                            .then(function (response) {
                                if (response.data) {
                                    window.clearInterval(interval);
                                    resolve(response);
                                }
                            }, function (response) {
                                window.clearInterval(interval);
                                if (response.status === 404) {
                                    response.body.message = 'Computing the color sort sequence failed. Sorry.';
                                }
                                reject(response);
                            });
                    }, 2500);
                });
            },
            requestNewColor: function () {
                this.computingSequence = true;
                var self = this;
                var color = this.newColor.substr(1);
                this.api.save({volume_id: this.volumeId}, {color: color})
                    .then(this.pollNewSequence)
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
            biigle.$require('events').$once('sidebar.open.sorting', this.fetchColors);

            if (this.active) {
                this.activeColor = this.activeSorter.substr(
                    this.activeSorter.indexOf('-') + 1
                );
            }
        },
    },
});
