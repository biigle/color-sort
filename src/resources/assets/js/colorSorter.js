import ColorSortApi from './api/colorSortSequence';
import {Events} from './import';
import {handleErrorResponse} from './import';
import {Loader} from './import';
import {SortComponent} from './import';
import {VolumeSorters} from './import';

/**
 * Sorter for the color sorting.
 */
VolumeSorters.push({
    id: 'color',
    component: {
        template: '#color-sort-template',
        mixins: [SortComponent],
        components: {
            loader: Loader,
        },
        data() {
            return {
                title: 'Sort images by color',
                text: 'Color',
                volumeId: null,
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
            hasColors() {
                return this.colors.length > 0;
            },
            id() {
                return 'color-' + this.activeColor;
            },
            active() {
                return this.activeSorter.startsWith('color-');
            },
            canRequestNewColor() {
                return !this.fetchingColors && !this.loadingSequence && !this.computingSequence;
            },
        },
        methods: {
            getSequence() {
                let color = this.activeColor;

                if (this.cache.hasOwnProperty(color)) {
                    return new Vue.Promise((resolve) => {
                        resolve(this.cache[color]);
                    });
                }

                this.loadingSequence = true;
                return ColorSortApi.get({volume_id: this.volumeId, color: color})
                    .then(this.parseResponse)
                    .then((sequence) => {
                        this.cache[color] = sequence;
                        return sequence;
                    })
                    .finally(() => this.loadingSequence = false);
            },
            parseResponse(response) {
                return response.data;
            },
            initColors(response) {
                this.colors = response.data;
            },
            select(color) {
                if (!this.isActive(color) && !this.loadingSequence) {
                    this.activeColor = color;
                    this.$emit('select', this);
                }
            },
            isActive(color) {
                return this.active && color === this.activeColor;
            },
            fetchColors() {
                ColorSortApi.query({volume_id: this.volumeId})
                    .then(this.initColors)
                    .catch(handleErrorResponse)
                    .finally(() => this.fetchingColors = false);
            },
            pollNewSequence(response) {
                let color = response.body.color;

                return new Vue.Promise((resolve, reject) => {
                    let interval = window.setInterval(() => {
                        ColorSortApi.get({volume_id: this.volumeId, color: color})
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
            requestNewColor() {
                this.computingSequence = true;
                let color = this.newColor.substr(1);
                ColorSortApi.save({volume_id: this.volumeId}, {color: color})
                    .then(this.pollNewSequence)
                    .then((response) => {
                        this.cache[color] = response.data;
                        this.colors.push(color);
                        this.select(color);
                    })
                    .catch(handleErrorResponse)
                    .finally(() => this.computingSequence = false);
            },
        },
        created() {
            this.volumeId = biigle.$require('volumes.volumeId');
        },
        mounted() {
            Events.$once('sidebar.open.sorting', this.fetchColors);

            if (this.active) {
                this.activeColor = this.activeSorter.substr(
                    this.activeSorter.indexOf('-') + 1
                );
            }
        },
    },
});
