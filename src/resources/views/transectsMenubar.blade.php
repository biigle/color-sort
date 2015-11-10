@section('scripts')
    <script src="{{ asset('vendor/copria-color-sort/scripts/transects.js') }}"></script>
@append

@section('styles')
    <link href="{{ asset('vendor/copria-color-sort/styles/transects.css') }}" rel="stylesheet">
@append

<div data-ng-controller="ColorSortController">
    <button class="btn btn-regular transect-menubar__item" data-popover-placement="right" data-uib-popover-template="'colorSortPopover.html'" type="button" title="Sort images by color" data-ng-click="openPopover()">
        <span class="glyphicon glyphicon-tint" aria-hidden="true"></span>
    </button>
    <script type="text/ng-template" id="colorSortPopover.html">
        <div class="color-sort-popup">
            <ul class="list-unstyled available-colors-list">
                <li class="available-colors-item" data-ng-repeat="color in colors" style="background-color:#@{{color}};" title="Sort by this color" data-ng-click="sortBy(color)" data-ng-class="{active:color===activeColor}"></li>
            </ul>
            @if (Copria::userHasKey())
                <form class="form new-color-form" data-ng-submit="requestNewColor()" data-ng-if="!isComputing">
                    <input type="color" class="btn color-picker" id="color-sort-color" title="Choose a color" data-ng-model="new.color">
                    <input type="submit" class="btn btn-success" value="Compute new" title="Compute sorting for the chosen color">
                </form>
                <div data-ng-if="isComputing">
                    Computing...
                </div>
            @endif
        </div>
    </script>
</div>
