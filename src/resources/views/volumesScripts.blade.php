@unless ($volume->isRemote())
<script src="{{ cachebust_asset('vendor/color-sort/scripts/volumes.js') }}"></script>
<script type="text/x-template" id="color-sort-template">
    <span class="list-group-item color-sort-list-group-item" title="Sort images by color">
        <div class="clearfix">
            @can('edit-in', $volume)
                <span class="pull-right">
                    <form v-on:submit.prevent="requestNewColor">
                        <loader v-if="computingSequence" :active="computingSequence"></loader>
                        <input type="color" class="btn btn-default btn-xs color-picker" id="color-sort-color" v-model="newColor" title="Choose a new color">
                        <button :disabled="!canRequestNewColor" type="submit" class="btn btn-default btn-xs" title="Request a new color sort sequence for the chosen color"><span class="glyphicon glyphicon-plus" aria-hidden="true"></span></button>
                    </form>
                </span>
            @endcan
            Color
            <span v-if="fetchingColors" class="text-muted">
                (fetching colors...)
            </span>
            <span v-else v-if="!hasColors" class=text-muted>
                (no colors available)
            </span>
        </div>
        <ul class="list-unstyled available-colors-list" v-if="hasColors">
            <li class="available-colors-item" v-for="color in colors" :style="{'background-color': '#'+color}" title="Sort by this color" v-on:click="select(color)" :class="{active: isActive(color)}"></li>
        </ul>
    </span>
</script>
@endunless
