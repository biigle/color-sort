@unless ($volume->isRemote())
<script src="{{ cachebust_asset('vendor/copria-color-sort/scripts/volumes.js') }}"></script>
<script type="text/javascript">
    biigle.$declare('volumes.colorSortSequences', {!! \Biigle\Modules\Copria\ColorSort\Volume::convert($volume)->colorSortSequences()->pluck('color') !!});
</script>
@endunless
