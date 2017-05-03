@unless ($volume->isRemote())
<script src="{{ cachebust_asset('vendor/copria-color-sort/scripts/volumes.js') }}"></script>
<script type="text/javascript">
    biigle.$declare('volumes.colorSortSequences', {!! \Biigle\Modules\Copria\ColorSort\Sequence::where('volume_id', $volume->id)->pluck('color') !!});
</script>
@endunless
