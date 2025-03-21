<template>
<li class="list-group-item">
    <button type="button" class="close" :title="title" v-on:click="remove"><span aria-hidden="true">&times;</span></button>
    <span class="color-sort-sequence-color" :style="styleObject"></span>#<span v-text="color"></span>
</li>
</template>
<script>
export default {
    emits: ['remove'],
    props: {
        sequence: {
            type: Object,
            required: true,
        },
    },
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
</script>
