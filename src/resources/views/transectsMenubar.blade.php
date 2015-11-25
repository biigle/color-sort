@section('scripts')
    <script src="{{ asset('vendor/copria-color-sort/scripts/transects.js') }}"></script>
@append

@section('styles')
    <link href="{{ asset('vendor/copria-color-sort/styles/transects.css') }}" rel="stylesheet">
@append

<div data-ng-controller="ColorSortController">
    <button class="btn btn-default transect-menubar__item" data-popover-placement="right" data-uib-popover-template="'colorSortPopover.html'" type="button" title="Sort images by color" data-ng-click="openPopover()" data-ng-class="{'btn-info':activeColor!==''}">
        <span class="glyphicon glyphicon-tint" aria-hidden="true"></span>
    </button>
    <script type="text/ng-template" id="colorSortPopover.html">
        <div class="color-sort-popup" data-ng-class="{help:show.help}">
            <ul class="list-unstyled available-colors-list" data-ng-if="colors.length>0">
                <li class="available-colors-item" data-ng-repeat="color in colors" style="background-color:#@{{color}};" title="Sort by this color" data-ng-click="sortBy(color)" data-ng-class="{active:color===activeColor}"></li>
            </ul>
            <p data-ng-if="colors.length===0">
                There are no colors available for sorting yet.
            </p>
            @if (auth()->user()->canEditInOneOfProjects($transect->projectIds()))
                @if (Copria::userHasKey())
                    <form class="form new-color-form" data-ng-submit="requestNewColor()" data-ng-if="!isComputing">
                        <input type="color" class="btn btn-default color-picker" id="color-sort-color" title="Choose a color" data-ng-model="new.color">
                        <input type="submit" class="btn btn-success" value="Request new" title="Compute sorting for the chosen color">
                    </form>
                    <div data-ng-if="isComputing">
                        <i class="glyphicon glyphicon-repeat glyphicon-spin"></i> Computing...
                    </div>
                @else
                    <a href="{{route('settings-tokens')}}">Connect your COPRIA account</a> to make own requests for sorting colors.
                @endif
            @endif
            <button type="button" class="btn btn-default" title="What is this?" data-ng-click="show.help=true" data-ng-if="!isComputing"><i class="glyphicon glyphicon-question-sign"></i></button>
            <div class="color-sort-popup-help" data-ng-if="show.help">
                <p>
                    Here you can sort the images according to color. Choose a color from the palette at the top and the most similar images will be shown first.
                </p>
                @if (auth()->user()->canEditInOneOfProjects($transect->projectIds()))
                    <p>
                        To compute the sorting order for a new color, choose the color with the color picker at the bottom and click "Request new". If you stay on this page, you will be notified when the new color is available, otherwise it will appear on a later visit. Computing a new color can take several minutes depending on the size of the transect and load of the computing cluster.
                    </p>
                @else
                    <p>
                        You need editor privileges to request computing of the sorting order for a new color.
                    </p>
                @endif
            </div>
            <button type="button" class="close-button btn btn-default btn-xs" title="Close help" data-ng-click="show.help=false" data-ng-if="show.help">&times;</button>
        </div>
    </script>
</div>
