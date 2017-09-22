biigle.$viewModel("color-sort-panel",function(e){var o=biigle.$require("messages.store"),t=biigle.$require("volumes.id"),i={props:["color"],computed:{title:function(){return"Delete sequence for color #"+this.color},styleObject:function(){return{"background-color":"#"+this.color}}},methods:{remove:function(){this.$emit("remove",this.color)}}};new Vue({el:e,mixins:[biigle.$require("core.mixins.loader")],data:{sequences:biigle.$require("volumes.colorSortSequences")},components:{listItem:i},computed:{hasSequences:function(){return this.sequences.length>0}},methods:{handleRemove:function(e){if(!this.loading&&confirm("Do you really want to delete the sequence for color #"+e+"?")){this.startLoading();var i=this;biigle.$require("api.colorSortSequence").delete({volume_id:t,color:e}).then(function(){i.sequenceRemoved(e)}).catch(o.handleErrorResponse).finally(this.finishLoading)}},sequenceRemoved:function(e){var o=this.sequences.indexOf(e);-1!==o&&this.sequences.splice(o,1)}}})}),biigle.$require("volumes.stores.sorters").push({id:"color",component:{template:"#color-sort-template",mixins:[biigle.$require("volumes.mixins.sortComponent")],components:{loader:biigle.$require("core.components.loader")},data:function(){return{title:"Sort images by color",text:"Color",volumeId:biigle.$require("volumes.volumeId"),fetchingColors:!0,colors:[],activeColor:null,cache:{},loadingSequence:!1,computingSequence:!1,newColor:"#000000"}},computed:{hasColors:function(){return this.colors.length>0},id:function(){return"color-"+this.activeColor},active:function(){return this.activeSorter.startsWith("color-")},canRequestNewColor:function(){return!this.fetchingColors&&!this.loadingSequence&&!this.computingSequence},api:function(){return biigle.$require("api.colorSortSequence")}},methods:{getSequence:function(){var e=this.activeColor,o=this;return this.cache.hasOwnProperty(e)?new Vue.Promise(function(t){t(o.cache[e])}):(this.loadingSequence=!0,this.api.get({volume_id:this.volumeId,color:e}).then(this.parseResponse).then(function(t){return o.cache[e]=t,t}).finally(function(){o.loadingSequence=!1}))},parseResponse:function(e){return e.data},initColors:function(e){this.colors=e.data},select:function(e){this.isActive(e)||this.loadingSequence||(this.activeColor=e,this.$emit("select",this))},isActive:function(e){return this.active&&e===this.activeColor},fetchColors:function(){var e=this;this.api.query({volume_id:this.volumeId}).then(this.initColors).catch(biigle.$require("messages.store").handleErrorResponse).finally(function(){e.fetchingColors=!1})},pollNewSequence:function(e){var o=this,t=e.body.color;return new Vue.Promise(function(e,i){var n=window.setInterval(function(){o.api.get({volume_id:o.volumeId,color:t}).then(function(o){o.data&&(window.clearInterval(n),e(o))},function(e){window.clearInterval(n),404===e.status&&(e.body.message="Computing the color sort sequence failed. Sorry."),i(e)})},2500)})},requestNewColor:function(){this.computingSequence=!0;var e=this,o=this.newColor.substr(1);this.api.save({volume_id:this.volumeId},{color:o}).then(this.pollNewSequence).then(function(t){e.cache[o]=t.data,e.colors.push(o),e.select(o)}).catch(biigle.$require("messages.store").handleErrorResponse).finally(function(){e.computingSequence=!1})}},mounted:function(){biigle.$require("events").$once("sidebar.open.sorting",this.fetchColors),this.active&&(this.activeColor=this.activeSorter.substr(this.activeSorter.indexOf("-")+1))}}}),biigle.$declare("api.colorSortSequence",Vue.resource("api/v1/volumes{/volume_id}/color-sort-sequence{/color}"));