<a href="#" class="list-group-item color-sort-list-group-item" title="Sort images by color" data-ng-class="{active: active()}" data-ng-controller="SortByColorController" data-ng-click="catchClick($event)">
    Color <span class="text-muted" data-ng-show="isFetchingColors()">(fetching colors...)</span>
    <ul class="list-unstyled available-colors-list" data-ng-if="hasColors()">
        <li class="available-colors-item" data-ng-repeat="color in getColors()" style="background-color:#@{{color}};" title="Sort by this color" data-ng-click="toggle(color)" data-ng-class="{active: active(color)}"></li>
    </ul>
</a>
