<div id="color-sort-panel" class="panel panel-default">
    <div class="panel-heading">
        Color sort sequences
        <span class="pull-right"><loader :active="loading"></loader></span>
    </div>
    <ul class="list-group" v-cloak>
        <list-item
            v-for="sequence in sequences"
            v-bind:key="sequence.id"
            v-bind:sequence="sequence"
            v-on:remove="handleRemove"
            inline-template
            >
            <li class="list-group-item">
                <button type="button" class="close" :title="title" v-on:click="remove"><span aria-hidden="true">&times;</span></button>
                <span class="color-sort-sequence-color" :style="styleObject"></span>#<span v-text="color"></span>
            </li>
        </list-item>
        <li class="list-group-item text-muted" v-if="!hasSequences">This volume has no color sort sequences. Add some in the sorting tab of the <a href="{{route('volume', $volume->id)}}">volume overview</a>.</li>
    </ul>
</div>
