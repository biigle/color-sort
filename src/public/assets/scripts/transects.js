/**
 * @ngdoc factory
 * @name ColorSortSequence
 * @memberOf dias.transects
 * @description Provides the resource for color sort sequences.
 * @requires $resource
 * @returns {Object} A new [ngResource](https://docs.angularjs.org/api/ngResource/service/$resource) object
 * @example
// get all available colors
var colors = ColorSortSequence.query({transect_id: 1}, function () {
   console.log(colors); // ["bada55", "c0ffee", ...]
});
// get the sort order (of image IDs) for one specific color
var sequence = ColorSortSequence.get({transect_id: 1, color: 'bada55'}, function () {
    console.log(sequence) ; // [2, 3, 1, 4]
});
// request a new color sort sequence
var sequence = ColorSortSequence.request({transect_id: TRANSECT_ID}, {color: 'c0ffee'}, function () {
    console.log(sequence); // {color: 'c0ffee'}
});
 *
 */
angular.module('dias.transects').factory('ColorSortSequence', ["$resource", "URL", function ($resource, URL) {
    "use strict";

    return $resource(URL + '/api/v1/transects/:transect_id/color-sort-sequence/:color', {}, {
        get: {method: 'GET', isArray: true},
        request: {method: 'POST'}
    });
}]);

/**
 * @namespace dias.transects
 * @ngdoc controller
 * @name ColorSortController
 * @memberOf dias.transects
 * @description Global controller for the color sort feature
 */
angular.module('dias.transects').controller('ColorSortController', ["$scope", "ColorSortSequence", "$interval", "msg", "TRANSECT_ID", function ($scope, ColorSortSequence, $interval, msg, TRANSECT_ID) {
        "use strict";

        var popoverOpen = false;

        var localStorageActiveColorKey = 'dias.transects.' + TRANSECT_ID + '.color-sort.active-color';

        // stores all sorting sequence arrays with the related colors as keys
        var sequencesCache = {};

        $scope.show = {
            help: false
        };

        // array of all available colors
        $scope.colors = [];

        $scope.isComputing = false;

        $scope.new = {
            // currently selected color in the 'compute new' form
            color: '#000000'
        };

        // currently active color for sorting
        $scope.activeColor = '';

        // regularly check if a requested color is now available
        var poll = function (color) {
            var promise;
            var success = function (sequence) {
                // TODO what if the transect _is_ empty?
                if (sequence.length > 0) {
                    $interval.cancel(promise);
                    $scope.isComputing = false;
                    sequencesCache[color] = sequence;
                    $scope.colors.push(color);
                    msg.success('The new color is now available for sorting.');
                }
            };

            var error = function (response) {
                $interval.cancel(promise);
                $scope.isComputing = false;
                if (response.status === 404) {
                    msg.danger('The COPRIA pipeline for computing a new color sort sequence failed.');
                } else {
                    msg.responseError(response);
                }
            };

            var check = function () {
                ColorSortSequence.get({transect_id: TRANSECT_ID, color: color}, success, error);
            };

            // poll every 5 seconds
            promise = $interval(check, 5000);
        };

        $scope.openPopover = function () {
            popoverOpen = !popoverOpen;
            if (popoverOpen) {
                // refresh the list of available colors every time the popover is opened
                ColorSortSequence.query({transect_id: TRANSECT_ID}, function (value) {
                    $scope.colors = value;
                });
            }
        };

        // submit a new request to compute a color sort sequence
        $scope.requestNewColor = function () {
            // don't accept new request while the old one is still computing
            if ($scope.isComputing) return;

            // omit the '#' at the beginning of the hex color
            var color = $scope.new.color.substring(1);

            var success = function () {
                $scope.isComputing = true;
                poll(color);
            };

            var error = function (response) {
                if (response.status === 405) {
                    msg.warning('This color is already available (or still computing).');
                } else {
                    msg.responseError(response);
                }
            };

            ColorSortSequence.request({transect_id: TRANSECT_ID}, {color: color}, success, error);
        };

        var activateCachedColor = function (color) {
            // call transect controller function
            $scope.setImagesSequence(sequencesCache[color]);
            $scope.activeColor = color;
        };

        // sort the images using an available color sort sequence
        $scope.sortBy = function (color) {
            if (color === $scope.activeColor) {
                // if color was clicked twice, reset/unselect
                $scope.setImagesSequence();
                $scope.activeColor = '';
                return;
            }

            if (sequencesCache[color] !== undefined) {
                activateCachedColor(color);
            } else {
                var success = function (sequence) {
                    sequencesCache[color] = sequence;
                    activateCachedColor(color);
                };

                ColorSortSequence.get({transect_id: TRANSECT_ID, color: color}, success, msg.responseError);
            }
        };

        // store the currently active color persistently
        $scope.$watch('activeColor', function (color) {
            window.localStorage[localStorageActiveColorKey] = color;
        });

        // initially set the stored color as active.
        // we don't need to fetch the actual images sequence here because that is stored by
        // the transect controller.
        if (window.localStorage[localStorageActiveColorKey]) {
            $scope.activeColor = window.localStorage[localStorageActiveColorKey];
        }
    }]
);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZhY3Rvcmllcy9Db2xvclNvcnRTZXF1ZW5jZS5qcyIsImNvbnRyb2xsZXJzL0NvbG9yU29ydENvbnRyb2xsZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFzQkEsUUFBQSxPQUFBLGtCQUFBLFFBQUEsMENBQUEsVUFBQSxXQUFBLEtBQUE7SUFDQTs7SUFFQSxPQUFBLFVBQUEsTUFBQSw2REFBQSxJQUFBO1FBQ0EsS0FBQSxDQUFBLFFBQUEsT0FBQSxTQUFBO1FBQ0EsU0FBQSxDQUFBLFFBQUE7Ozs7Ozs7Ozs7O0FDcEJBLFFBQUEsT0FBQSxrQkFBQSxXQUFBLDBGQUFBLFVBQUEsUUFBQSxtQkFBQSxXQUFBLEtBQUEsYUFBQTtRQUNBOztRQUVBLElBQUEsY0FBQTs7UUFFQSxJQUFBLDZCQUFBLG9CQUFBLGNBQUE7OztRQUdBLElBQUEsaUJBQUE7O1FBRUEsT0FBQSxPQUFBO1lBQ0EsTUFBQTs7OztRQUlBLE9BQUEsU0FBQTs7UUFFQSxPQUFBLGNBQUE7O1FBRUEsT0FBQSxNQUFBOztZQUVBLE9BQUE7Ozs7UUFJQSxPQUFBLGNBQUE7OztRQUdBLElBQUEsT0FBQSxVQUFBLE9BQUE7WUFDQSxJQUFBO1lBQ0EsSUFBQSxVQUFBLFVBQUEsVUFBQTs7Z0JBRUEsSUFBQSxTQUFBLFNBQUEsR0FBQTtvQkFDQSxVQUFBLE9BQUE7b0JBQ0EsT0FBQSxjQUFBO29CQUNBLGVBQUEsU0FBQTtvQkFDQSxPQUFBLE9BQUEsS0FBQTtvQkFDQSxJQUFBLFFBQUE7Ozs7WUFJQSxJQUFBLFFBQUEsVUFBQSxVQUFBO2dCQUNBLFVBQUEsT0FBQTtnQkFDQSxPQUFBLGNBQUE7Z0JBQ0EsSUFBQSxTQUFBLFdBQUEsS0FBQTtvQkFDQSxJQUFBLE9BQUE7dUJBQ0E7b0JBQ0EsSUFBQSxjQUFBOzs7O1lBSUEsSUFBQSxRQUFBLFlBQUE7Z0JBQ0Esa0JBQUEsSUFBQSxDQUFBLGFBQUEsYUFBQSxPQUFBLFFBQUEsU0FBQTs7OztZQUlBLFVBQUEsVUFBQSxPQUFBOzs7UUFHQSxPQUFBLGNBQUEsWUFBQTtZQUNBLGNBQUEsQ0FBQTtZQUNBLElBQUEsYUFBQTs7Z0JBRUEsa0JBQUEsTUFBQSxDQUFBLGFBQUEsY0FBQSxVQUFBLE9BQUE7b0JBQ0EsT0FBQSxTQUFBOzs7Ozs7UUFNQSxPQUFBLGtCQUFBLFlBQUE7O1lBRUEsSUFBQSxPQUFBLGFBQUE7OztZQUdBLElBQUEsUUFBQSxPQUFBLElBQUEsTUFBQSxVQUFBOztZQUVBLElBQUEsVUFBQSxZQUFBO2dCQUNBLE9BQUEsY0FBQTtnQkFDQSxLQUFBOzs7WUFHQSxJQUFBLFFBQUEsVUFBQSxVQUFBO2dCQUNBLElBQUEsU0FBQSxXQUFBLEtBQUE7b0JBQ0EsSUFBQSxRQUFBO3VCQUNBO29CQUNBLElBQUEsY0FBQTs7OztZQUlBLGtCQUFBLFFBQUEsQ0FBQSxhQUFBLGNBQUEsQ0FBQSxPQUFBLFFBQUEsU0FBQTs7O1FBR0EsSUFBQSxzQkFBQSxVQUFBLE9BQUE7O1lBRUEsT0FBQSxrQkFBQSxlQUFBO1lBQ0EsT0FBQSxjQUFBOzs7O1FBSUEsT0FBQSxTQUFBLFVBQUEsT0FBQTtZQUNBLElBQUEsVUFBQSxPQUFBLGFBQUE7O2dCQUVBLE9BQUE7Z0JBQ0EsT0FBQSxjQUFBO2dCQUNBOzs7WUFHQSxJQUFBLGVBQUEsV0FBQSxXQUFBO2dCQUNBLG9CQUFBO21CQUNBO2dCQUNBLElBQUEsVUFBQSxVQUFBLFVBQUE7b0JBQ0EsZUFBQSxTQUFBO29CQUNBLG9CQUFBOzs7Z0JBR0Esa0JBQUEsSUFBQSxDQUFBLGFBQUEsYUFBQSxPQUFBLFFBQUEsU0FBQSxJQUFBOzs7OztRQUtBLE9BQUEsT0FBQSxlQUFBLFVBQUEsT0FBQTtZQUNBLE9BQUEsYUFBQSw4QkFBQTs7Ozs7O1FBTUEsSUFBQSxPQUFBLGFBQUEsNkJBQUE7WUFDQSxPQUFBLGNBQUEsT0FBQSxhQUFBOzs7O0FBSUEiLCJmaWxlIjoidHJhbnNlY3RzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbmdkb2MgZmFjdG9yeVxuICogQG5hbWUgQ29sb3JTb3J0U2VxdWVuY2VcbiAqIEBtZW1iZXJPZiBkaWFzLnRyYW5zZWN0c1xuICogQGRlc2NyaXB0aW9uIFByb3ZpZGVzIHRoZSByZXNvdXJjZSBmb3IgY29sb3Igc29ydCBzZXF1ZW5jZXMuXG4gKiBAcmVxdWlyZXMgJHJlc291cmNlXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBBIG5ldyBbbmdSZXNvdXJjZV0oaHR0cHM6Ly9kb2NzLmFuZ3VsYXJqcy5vcmcvYXBpL25nUmVzb3VyY2Uvc2VydmljZS8kcmVzb3VyY2UpIG9iamVjdFxuICogQGV4YW1wbGVcbi8vIGdldCBhbGwgYXZhaWxhYmxlIGNvbG9yc1xudmFyIGNvbG9ycyA9IENvbG9yU29ydFNlcXVlbmNlLnF1ZXJ5KHt0cmFuc2VjdF9pZDogMX0sIGZ1bmN0aW9uICgpIHtcbiAgIGNvbnNvbGUubG9nKGNvbG9ycyk7IC8vIFtcImJhZGE1NVwiLCBcImMwZmZlZVwiLCAuLi5dXG59KTtcbi8vIGdldCB0aGUgc29ydCBvcmRlciAob2YgaW1hZ2UgSURzKSBmb3Igb25lIHNwZWNpZmljIGNvbG9yXG52YXIgc2VxdWVuY2UgPSBDb2xvclNvcnRTZXF1ZW5jZS5nZXQoe3RyYW5zZWN0X2lkOiAxLCBjb2xvcjogJ2JhZGE1NSd9LCBmdW5jdGlvbiAoKSB7XG4gICAgY29uc29sZS5sb2coc2VxdWVuY2UpIDsgLy8gWzIsIDMsIDEsIDRdXG59KTtcbi8vIHJlcXVlc3QgYSBuZXcgY29sb3Igc29ydCBzZXF1ZW5jZVxudmFyIHNlcXVlbmNlID0gQ29sb3JTb3J0U2VxdWVuY2UucmVxdWVzdCh7dHJhbnNlY3RfaWQ6IFRSQU5TRUNUX0lEfSwge2NvbG9yOiAnYzBmZmVlJ30sIGZ1bmN0aW9uICgpIHtcbiAgICBjb25zb2xlLmxvZyhzZXF1ZW5jZSk7IC8vIHtjb2xvcjogJ2MwZmZlZSd9XG59KTtcbiAqXG4gKi9cbmFuZ3VsYXIubW9kdWxlKCdkaWFzLnRyYW5zZWN0cycpLmZhY3RvcnkoJ0NvbG9yU29ydFNlcXVlbmNlJywgZnVuY3Rpb24gKCRyZXNvdXJjZSwgVVJMKSB7XG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgICByZXR1cm4gJHJlc291cmNlKFVSTCArICcvYXBpL3YxL3RyYW5zZWN0cy86dHJhbnNlY3RfaWQvY29sb3Itc29ydC1zZXF1ZW5jZS86Y29sb3InLCB7fSwge1xuICAgICAgICBnZXQ6IHttZXRob2Q6ICdHRVQnLCBpc0FycmF5OiB0cnVlfSxcbiAgICAgICAgcmVxdWVzdDoge21ldGhvZDogJ1BPU1QnfVxuICAgIH0pO1xufSk7XG4iLCIvKipcbiAqIEBuYW1lc3BhY2UgZGlhcy50cmFuc2VjdHNcbiAqIEBuZ2RvYyBjb250cm9sbGVyXG4gKiBAbmFtZSBDb2xvclNvcnRDb250cm9sbGVyXG4gKiBAbWVtYmVyT2YgZGlhcy50cmFuc2VjdHNcbiAqIEBkZXNjcmlwdGlvbiBHbG9iYWwgY29udHJvbGxlciBmb3IgdGhlIGNvbG9yIHNvcnQgZmVhdHVyZVxuICovXG5hbmd1bGFyLm1vZHVsZSgnZGlhcy50cmFuc2VjdHMnKS5jb250cm9sbGVyKCdDb2xvclNvcnRDb250cm9sbGVyJywgZnVuY3Rpb24gKCRzY29wZSwgQ29sb3JTb3J0U2VxdWVuY2UsICRpbnRlcnZhbCwgbXNnLCBUUkFOU0VDVF9JRCkge1xuICAgICAgICBcInVzZSBzdHJpY3RcIjtcblxuICAgICAgICB2YXIgcG9wb3Zlck9wZW4gPSBmYWxzZTtcblxuICAgICAgICB2YXIgbG9jYWxTdG9yYWdlQWN0aXZlQ29sb3JLZXkgPSAnZGlhcy50cmFuc2VjdHMuJyArIFRSQU5TRUNUX0lEICsgJy5jb2xvci1zb3J0LmFjdGl2ZS1jb2xvcic7XG5cbiAgICAgICAgLy8gc3RvcmVzIGFsbCBzb3J0aW5nIHNlcXVlbmNlIGFycmF5cyB3aXRoIHRoZSByZWxhdGVkIGNvbG9ycyBhcyBrZXlzXG4gICAgICAgIHZhciBzZXF1ZW5jZXNDYWNoZSA9IHt9O1xuXG4gICAgICAgICRzY29wZS5zaG93ID0ge1xuICAgICAgICAgICAgaGVscDogZmFsc2VcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBhcnJheSBvZiBhbGwgYXZhaWxhYmxlIGNvbG9yc1xuICAgICAgICAkc2NvcGUuY29sb3JzID0gW107XG5cbiAgICAgICAgJHNjb3BlLmlzQ29tcHV0aW5nID0gZmFsc2U7XG5cbiAgICAgICAgJHNjb3BlLm5ldyA9IHtcbiAgICAgICAgICAgIC8vIGN1cnJlbnRseSBzZWxlY3RlZCBjb2xvciBpbiB0aGUgJ2NvbXB1dGUgbmV3JyBmb3JtXG4gICAgICAgICAgICBjb2xvcjogJyMwMDAwMDAnXG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gY3VycmVudGx5IGFjdGl2ZSBjb2xvciBmb3Igc29ydGluZ1xuICAgICAgICAkc2NvcGUuYWN0aXZlQ29sb3IgPSAnJztcblxuICAgICAgICAvLyByZWd1bGFybHkgY2hlY2sgaWYgYSByZXF1ZXN0ZWQgY29sb3IgaXMgbm93IGF2YWlsYWJsZVxuICAgICAgICB2YXIgcG9sbCA9IGZ1bmN0aW9uIChjb2xvcikge1xuICAgICAgICAgICAgdmFyIHByb21pc2U7XG4gICAgICAgICAgICB2YXIgc3VjY2VzcyA9IGZ1bmN0aW9uIChzZXF1ZW5jZSkge1xuICAgICAgICAgICAgICAgIC8vIFRPRE8gd2hhdCBpZiB0aGUgdHJhbnNlY3QgX2lzXyBlbXB0eT9cbiAgICAgICAgICAgICAgICBpZiAoc2VxdWVuY2UubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAkaW50ZXJ2YWwuY2FuY2VsKHByb21pc2UpO1xuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuaXNDb21wdXRpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgc2VxdWVuY2VzQ2FjaGVbY29sb3JdID0gc2VxdWVuY2U7XG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5jb2xvcnMucHVzaChjb2xvcik7XG4gICAgICAgICAgICAgICAgICAgIG1zZy5zdWNjZXNzKCdUaGUgbmV3IGNvbG9yIGlzIG5vdyBhdmFpbGFibGUgZm9yIHNvcnRpbmcuJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgdmFyIGVycm9yID0gZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgJGludGVydmFsLmNhbmNlbChwcm9taXNlKTtcbiAgICAgICAgICAgICAgICAkc2NvcGUuaXNDb21wdXRpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2Uuc3RhdHVzID09PSA0MDQpIHtcbiAgICAgICAgICAgICAgICAgICAgbXNnLmRhbmdlcignVGhlIENPUFJJQSBwaXBlbGluZSBmb3IgY29tcHV0aW5nIGEgbmV3IGNvbG9yIHNvcnQgc2VxdWVuY2UgZmFpbGVkLicpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIG1zZy5yZXNwb25zZUVycm9yKHJlc3BvbnNlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB2YXIgY2hlY2sgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgQ29sb3JTb3J0U2VxdWVuY2UuZ2V0KHt0cmFuc2VjdF9pZDogVFJBTlNFQ1RfSUQsIGNvbG9yOiBjb2xvcn0sIHN1Y2Nlc3MsIGVycm9yKTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIC8vIHBvbGwgZXZlcnkgNSBzZWNvbmRzXG4gICAgICAgICAgICBwcm9taXNlID0gJGludGVydmFsKGNoZWNrLCA1MDAwKTtcbiAgICAgICAgfTtcblxuICAgICAgICAkc2NvcGUub3BlblBvcG92ZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBwb3BvdmVyT3BlbiA9ICFwb3BvdmVyT3BlbjtcbiAgICAgICAgICAgIGlmIChwb3BvdmVyT3Blbikge1xuICAgICAgICAgICAgICAgIC8vIHJlZnJlc2ggdGhlIGxpc3Qgb2YgYXZhaWxhYmxlIGNvbG9ycyBldmVyeSB0aW1lIHRoZSBwb3BvdmVyIGlzIG9wZW5lZFxuICAgICAgICAgICAgICAgIENvbG9yU29ydFNlcXVlbmNlLnF1ZXJ5KHt0cmFuc2VjdF9pZDogVFJBTlNFQ1RfSUR9LCBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmNvbG9ycyA9IHZhbHVlO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIC8vIHN1Ym1pdCBhIG5ldyByZXF1ZXN0IHRvIGNvbXB1dGUgYSBjb2xvciBzb3J0IHNlcXVlbmNlXG4gICAgICAgICRzY29wZS5yZXF1ZXN0TmV3Q29sb3IgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAvLyBkb24ndCBhY2NlcHQgbmV3IHJlcXVlc3Qgd2hpbGUgdGhlIG9sZCBvbmUgaXMgc3RpbGwgY29tcHV0aW5nXG4gICAgICAgICAgICBpZiAoJHNjb3BlLmlzQ29tcHV0aW5nKSByZXR1cm47XG5cbiAgICAgICAgICAgIC8vIG9taXQgdGhlICcjJyBhdCB0aGUgYmVnaW5uaW5nIG9mIHRoZSBoZXggY29sb3JcbiAgICAgICAgICAgIHZhciBjb2xvciA9ICRzY29wZS5uZXcuY29sb3Iuc3Vic3RyaW5nKDEpO1xuXG4gICAgICAgICAgICB2YXIgc3VjY2VzcyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAkc2NvcGUuaXNDb21wdXRpbmcgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHBvbGwoY29sb3IpO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgdmFyIGVycm9yID0gZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlLnN0YXR1cyA9PT0gNDA1KSB7XG4gICAgICAgICAgICAgICAgICAgIG1zZy53YXJuaW5nKCdUaGlzIGNvbG9yIGlzIGFscmVhZHkgYXZhaWxhYmxlIChvciBzdGlsbCBjb21wdXRpbmcpLicpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIG1zZy5yZXNwb25zZUVycm9yKHJlc3BvbnNlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBDb2xvclNvcnRTZXF1ZW5jZS5yZXF1ZXN0KHt0cmFuc2VjdF9pZDogVFJBTlNFQ1RfSUR9LCB7Y29sb3I6IGNvbG9yfSwgc3VjY2VzcywgZXJyb3IpO1xuICAgICAgICB9O1xuXG4gICAgICAgIHZhciBhY3RpdmF0ZUNhY2hlZENvbG9yID0gZnVuY3Rpb24gKGNvbG9yKSB7XG4gICAgICAgICAgICAvLyBjYWxsIHRyYW5zZWN0IGNvbnRyb2xsZXIgZnVuY3Rpb25cbiAgICAgICAgICAgICRzY29wZS5zZXRJbWFnZXNTZXF1ZW5jZShzZXF1ZW5jZXNDYWNoZVtjb2xvcl0pO1xuICAgICAgICAgICAgJHNjb3BlLmFjdGl2ZUNvbG9yID0gY29sb3I7XG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gc29ydCB0aGUgaW1hZ2VzIHVzaW5nIGFuIGF2YWlsYWJsZSBjb2xvciBzb3J0IHNlcXVlbmNlXG4gICAgICAgICRzY29wZS5zb3J0QnkgPSBmdW5jdGlvbiAoY29sb3IpIHtcbiAgICAgICAgICAgIGlmIChjb2xvciA9PT0gJHNjb3BlLmFjdGl2ZUNvbG9yKSB7XG4gICAgICAgICAgICAgICAgLy8gaWYgY29sb3Igd2FzIGNsaWNrZWQgdHdpY2UsIHJlc2V0L3Vuc2VsZWN0XG4gICAgICAgICAgICAgICAgJHNjb3BlLnNldEltYWdlc1NlcXVlbmNlKCk7XG4gICAgICAgICAgICAgICAgJHNjb3BlLmFjdGl2ZUNvbG9yID0gJyc7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoc2VxdWVuY2VzQ2FjaGVbY29sb3JdICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBhY3RpdmF0ZUNhY2hlZENvbG9yKGNvbG9yKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdmFyIHN1Y2Nlc3MgPSBmdW5jdGlvbiAoc2VxdWVuY2UpIHtcbiAgICAgICAgICAgICAgICAgICAgc2VxdWVuY2VzQ2FjaGVbY29sb3JdID0gc2VxdWVuY2U7XG4gICAgICAgICAgICAgICAgICAgIGFjdGl2YXRlQ2FjaGVkQ29sb3IoY29sb3IpO1xuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICBDb2xvclNvcnRTZXF1ZW5jZS5nZXQoe3RyYW5zZWN0X2lkOiBUUkFOU0VDVF9JRCwgY29sb3I6IGNvbG9yfSwgc3VjY2VzcywgbXNnLnJlc3BvbnNlRXJyb3IpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIC8vIHN0b3JlIHRoZSBjdXJyZW50bHkgYWN0aXZlIGNvbG9yIHBlcnNpc3RlbnRseVxuICAgICAgICAkc2NvcGUuJHdhdGNoKCdhY3RpdmVDb2xvcicsIGZ1bmN0aW9uIChjb2xvcikge1xuICAgICAgICAgICAgd2luZG93LmxvY2FsU3RvcmFnZVtsb2NhbFN0b3JhZ2VBY3RpdmVDb2xvcktleV0gPSBjb2xvcjtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gaW5pdGlhbGx5IHNldCB0aGUgc3RvcmVkIGNvbG9yIGFzIGFjdGl2ZS5cbiAgICAgICAgLy8gd2UgZG9uJ3QgbmVlZCB0byBmZXRjaCB0aGUgYWN0dWFsIGltYWdlcyBzZXF1ZW5jZSBoZXJlIGJlY2F1c2UgdGhhdCBpcyBzdG9yZWQgYnlcbiAgICAgICAgLy8gdGhlIHRyYW5zZWN0IGNvbnRyb2xsZXIuXG4gICAgICAgIGlmICh3aW5kb3cubG9jYWxTdG9yYWdlW2xvY2FsU3RvcmFnZUFjdGl2ZUNvbG9yS2V5XSkge1xuICAgICAgICAgICAgJHNjb3BlLmFjdGl2ZUNvbG9yID0gd2luZG93LmxvY2FsU3RvcmFnZVtsb2NhbFN0b3JhZ2VBY3RpdmVDb2xvcktleV07XG4gICAgICAgIH1cbiAgICB9XG4pO1xuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9