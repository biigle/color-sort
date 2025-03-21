<template>
    <span class="list-group-item color-sort-list-group-item" title="Sort images by color">
        <div class="clearfix">
            <span v-if="canEdit" class="pull-right">
                <form v-on:submit.prevent="requestNewColor">
                    <loader v-if="computingSequence" :active="computingSequence"></loader>
                    <input type="color" class="btn btn-default btn-xs color-picker" id="color-sort-color" v-model="newColor" title="Choose a new color">
                    <button :disabled="!canRequestNewColor" type="submit" class="btn btn-default btn-xs" title="Request a new color sort sequence for the chosen color"><span class="fa fa-plus" aria-hidden="true"></span></button>
                </form>
            </span>
            Color
            <span v-if="fetchingColors" class="text-muted">
                (fetching colors...)
            </span>
            <span v-else-if="!hasColors" class=text-muted>
                (no colors available)
            </span>
        </div>
        <ul class="list-unstyled available-colors-list" v-if="hasColors">
            <li class="available-colors-item" v-for="color in colors" :style="{'background-color': '#'+color}" title="Sort by this color" v-on:click="select(color)" :class="{active: isActive(color)}"></li>
        </ul>
    </span>
</template>

<script>
import ColorSortApi from './api/colorSortSequence.js';
import {Events} from './import.js';
import {handleErrorResponse} from './import.js';
import {LoaderComponent} from './import.js';
import {SortComponent} from './import.js';

/**
 * Sorter for the color sorting.
 */
export default {
    mixins: [SortComponent],
    components: {
        loader: LoaderComponent,
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
            canEdit: false,
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
                return new Promise((resolve) => {
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

            return new Promise((resolve, reject) => {
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
        this.canEdit = biigle.$require('volumes.canEdit');
    },
    mounted() {
        Events.$once('sidebar.open.sorting', this.fetchColors);

        if (this.active) {
            this.activeColor = this.activeSorter.substr(
                this.activeSorter.indexOf('-') + 1
            );
        }
    },
};
</script>
