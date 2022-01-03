@if ($volume->isImageVolume())
    <script src="{{ cachebust_asset('vendor/color-sort/scripts/volumes.js') }}"></script>
    <script type="text/javascript">
        biigle.$declare('volumes.canEdit', @can('edit-in', $volume) true @else false @endcan);
    </script>
@endif
