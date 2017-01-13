@unless ($volume->isRemote())
<span class="list-group-item color-sort-list-group-item" title="Sort images by color" data-ng-controller="SortByColorController">
    <div class="clearfix">
        @can('edit-in', $volume)
            @if (Copria::userHasKey())
                <span class="pull-right" data-ng-if="canRequestNewColor()">
                    <form data-ng-submit="requestNewColor()">
                        <input type="color" class="btn btn-default btn-xs color-picker" id="color-sort-color" data-ng-model="new.color" title="Choose a new color">
                        <button type="submit" class="btn btn-default btn-xs" title="Request a new color sort sequence for the chosen color"><span class="glyphicon glyphicon-plus" aria-hidden="true"></span></button>
                    </form>
                </span>
            @endif
        @endcan
        Color
        <span class="text-muted ng-hide" data-ng-show="isFetchingColors()">(fetching colors...)</span>
        <span class="text-muted ng-hide" data-ng-show="isComputingNewColor()">(computing new...)</span>
        <span class="text-muted ng-hide" data-ng-show="!hasColors() && !isFetchingColors() && !isComputingNewColor()">(none available)</span>
    </div>
    <ul class="list-unstyled available-colors-list" data-ng-if="hasColors()">
        <li class="available-colors-item" data-ng-repeat="color in getColors()" style="background-color:#@{{color}};" title="Sort by this color" data-ng-click="toggle(color)" data-ng-class="{active: active(color)}"></li>
    </ul>
</span>
@endunless
