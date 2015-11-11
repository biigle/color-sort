/**
 * @namespace dias.transects
 * @ngdoc controller
 * @name ColorSortController
 * @memberOf dias.transects
 * @description Global controller for the color sort feature
 */
angular.module('dias.transects').controller('ColorSortController', ["$scope", "ColorSortSequence", "$interval", "msg", function ($scope, ColorSortSequence, $interval, msg) {
        "use strict";

        var popoverOpen = false;

        var localStorageActiveColorKey = 'dias.transects.' + $scope.transectId + '.color-sort.active-color';

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
                ColorSortSequence.get({transect_id: $scope.transectId, color: color}, success, error);
            };

            // poll every 5 seconds
            promise = $interval(check, 5000);
        };

        $scope.openPopover = function () {
            popoverOpen = !popoverOpen;
            if (popoverOpen) {
                // refresh the list of available colors every time the popover is opened
                ColorSortSequence.query({transect_id: $scope.transectId}, function (value) {
                    $scope.colors = value;
                });
            }
        };

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

            ColorSortSequence.request({transect_id: $scope.transectId}, {color: color}, success, error);
        };

        var activateCachedColor = function (color) {
            // call transect controller function
            $scope.setImagesSequence(sequencesCache[color]);
            $scope.activeColor = color;
        };

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

                ColorSortSequence.get({transect_id: $scope.transectId, color: color}, success, msg.responseError);
            }
        };

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
var sequence = ColorSortSequence.request({transect_id: $scope.transectId}, {color: 'c0ffee'}, function () {
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNvbnRyb2xsZXJzL0NvbG9yU29ydENvbnRyb2xsZXIuanMiLCJmYWN0b3JpZXMvQ29sb3JTb3J0U2VxdWVuY2UuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7QUFPQSxRQUFBLE9BQUEsa0JBQUEsV0FBQSwyRUFBQSxVQUFBLFFBQUEsbUJBQUEsV0FBQSxLQUFBO1FBQ0E7O1FBRUEsSUFBQSxjQUFBOztRQUVBLElBQUEsNkJBQUEsb0JBQUEsT0FBQSxhQUFBOzs7UUFHQSxJQUFBLGlCQUFBOztRQUVBLE9BQUEsT0FBQTtZQUNBLE1BQUE7Ozs7UUFJQSxPQUFBLFNBQUE7O1FBRUEsT0FBQSxjQUFBOztRQUVBLE9BQUEsTUFBQTs7WUFFQSxPQUFBOzs7O1FBSUEsT0FBQSxjQUFBOztRQUVBLElBQUEsT0FBQSxVQUFBLE9BQUE7WUFDQSxJQUFBO1lBQ0EsSUFBQSxVQUFBLFVBQUEsVUFBQTs7Z0JBRUEsSUFBQSxTQUFBLFNBQUEsR0FBQTtvQkFDQSxVQUFBLE9BQUE7b0JBQ0EsT0FBQSxjQUFBO29CQUNBLGVBQUEsU0FBQTtvQkFDQSxPQUFBLE9BQUEsS0FBQTtvQkFDQSxJQUFBLFFBQUE7Ozs7WUFJQSxJQUFBLFFBQUEsVUFBQSxVQUFBO2dCQUNBLFVBQUEsT0FBQTtnQkFDQSxPQUFBLGNBQUE7Z0JBQ0EsSUFBQSxTQUFBLFdBQUEsS0FBQTtvQkFDQSxJQUFBLE9BQUE7dUJBQ0E7b0JBQ0EsSUFBQSxjQUFBOzs7O1lBSUEsSUFBQSxRQUFBLFlBQUE7Z0JBQ0Esa0JBQUEsSUFBQSxDQUFBLGFBQUEsT0FBQSxZQUFBLE9BQUEsUUFBQSxTQUFBOzs7O1lBSUEsVUFBQSxVQUFBLE9BQUE7OztRQUdBLE9BQUEsY0FBQSxZQUFBO1lBQ0EsY0FBQSxDQUFBO1lBQ0EsSUFBQSxhQUFBOztnQkFFQSxrQkFBQSxNQUFBLENBQUEsYUFBQSxPQUFBLGFBQUEsVUFBQSxPQUFBO29CQUNBLE9BQUEsU0FBQTs7Ozs7UUFLQSxPQUFBLGtCQUFBLFlBQUE7O1lBRUEsSUFBQSxPQUFBLGFBQUE7OztZQUdBLElBQUEsUUFBQSxPQUFBLElBQUEsTUFBQSxVQUFBOztZQUVBLElBQUEsVUFBQSxZQUFBO2dCQUNBLE9BQUEsY0FBQTtnQkFDQSxLQUFBOzs7WUFHQSxJQUFBLFFBQUEsVUFBQSxVQUFBO2dCQUNBLElBQUEsU0FBQSxXQUFBLEtBQUE7b0JBQ0EsSUFBQSxRQUFBO3VCQUNBO29CQUNBLElBQUEsY0FBQTs7OztZQUlBLGtCQUFBLFFBQUEsQ0FBQSxhQUFBLE9BQUEsYUFBQSxDQUFBLE9BQUEsUUFBQSxTQUFBOzs7UUFHQSxJQUFBLHNCQUFBLFVBQUEsT0FBQTs7WUFFQSxPQUFBLGtCQUFBLGVBQUE7WUFDQSxPQUFBLGNBQUE7OztRQUdBLE9BQUEsU0FBQSxVQUFBLE9BQUE7WUFDQSxJQUFBLFVBQUEsT0FBQSxhQUFBOztnQkFFQSxPQUFBO2dCQUNBLE9BQUEsY0FBQTtnQkFDQTs7O1lBR0EsSUFBQSxlQUFBLFdBQUEsV0FBQTtnQkFDQSxvQkFBQTttQkFDQTtnQkFDQSxJQUFBLFVBQUEsVUFBQSxVQUFBO29CQUNBLGVBQUEsU0FBQTtvQkFDQSxvQkFBQTs7O2dCQUdBLGtCQUFBLElBQUEsQ0FBQSxhQUFBLE9BQUEsWUFBQSxPQUFBLFFBQUEsU0FBQSxJQUFBOzs7O1FBSUEsT0FBQSxPQUFBLGVBQUEsVUFBQSxPQUFBO1lBQ0EsT0FBQSxhQUFBLDhCQUFBOzs7Ozs7UUFNQSxJQUFBLE9BQUEsYUFBQSw2QkFBQTtZQUNBLE9BQUEsY0FBQSxPQUFBLGFBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQzlHQSxRQUFBLE9BQUEsa0JBQUEsUUFBQSwwQ0FBQSxVQUFBLFdBQUEsS0FBQTtJQUNBOztJQUVBLE9BQUEsVUFBQSxNQUFBLDZEQUFBLElBQUE7UUFDQSxLQUFBLENBQUEsUUFBQSxPQUFBLFNBQUE7UUFDQSxTQUFBLENBQUEsUUFBQTs7O0FBR0EiLCJmaWxlIjoidHJhbnNlY3RzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbmFtZXNwYWNlIGRpYXMudHJhbnNlY3RzXG4gKiBAbmdkb2MgY29udHJvbGxlclxuICogQG5hbWUgQ29sb3JTb3J0Q29udHJvbGxlclxuICogQG1lbWJlck9mIGRpYXMudHJhbnNlY3RzXG4gKiBAZGVzY3JpcHRpb24gR2xvYmFsIGNvbnRyb2xsZXIgZm9yIHRoZSBjb2xvciBzb3J0IGZlYXR1cmVcbiAqL1xuYW5ndWxhci5tb2R1bGUoJ2RpYXMudHJhbnNlY3RzJykuY29udHJvbGxlcignQ29sb3JTb3J0Q29udHJvbGxlcicsIGZ1bmN0aW9uICgkc2NvcGUsIENvbG9yU29ydFNlcXVlbmNlLCAkaW50ZXJ2YWwsIG1zZykge1xuICAgICAgICBcInVzZSBzdHJpY3RcIjtcblxuICAgICAgICB2YXIgcG9wb3Zlck9wZW4gPSBmYWxzZTtcblxuICAgICAgICB2YXIgbG9jYWxTdG9yYWdlQWN0aXZlQ29sb3JLZXkgPSAnZGlhcy50cmFuc2VjdHMuJyArICRzY29wZS50cmFuc2VjdElkICsgJy5jb2xvci1zb3J0LmFjdGl2ZS1jb2xvcic7XG5cbiAgICAgICAgLy8gc3RvcmVzIGFsbCBzb3J0aW5nIHNlcXVlbmNlIGFycmF5cyB3aXRoIHRoZSByZWxhdGVkIGNvbG9ycyBhcyBrZXlzXG4gICAgICAgIHZhciBzZXF1ZW5jZXNDYWNoZSA9IHt9O1xuXG4gICAgICAgICRzY29wZS5zaG93ID0ge1xuICAgICAgICAgICAgaGVscDogZmFsc2VcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBhcnJheSBvZiBhbGwgYXZhaWxhYmxlIGNvbG9yc1xuICAgICAgICAkc2NvcGUuY29sb3JzID0gW107XG5cbiAgICAgICAgJHNjb3BlLmlzQ29tcHV0aW5nID0gZmFsc2U7XG5cbiAgICAgICAgJHNjb3BlLm5ldyA9IHtcbiAgICAgICAgICAgIC8vIGN1cnJlbnRseSBzZWxlY3RlZCBjb2xvciBpbiB0aGUgJ2NvbXB1dGUgbmV3JyBmb3JtXG4gICAgICAgICAgICBjb2xvcjogJyMwMDAwMDAnXG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gY3VycmVudGx5IGFjdGl2ZSBjb2xvciBmb3Igc29ydGluZ1xuICAgICAgICAkc2NvcGUuYWN0aXZlQ29sb3IgPSAnJztcblxuICAgICAgICB2YXIgcG9sbCA9IGZ1bmN0aW9uIChjb2xvcikge1xuICAgICAgICAgICAgdmFyIHByb21pc2U7XG4gICAgICAgICAgICB2YXIgc3VjY2VzcyA9IGZ1bmN0aW9uIChzZXF1ZW5jZSkge1xuICAgICAgICAgICAgICAgIC8vIFRPRE8gd2hhdCBpZiB0aGUgdHJhbnNlY3QgX2lzXyBlbXB0eT9cbiAgICAgICAgICAgICAgICBpZiAoc2VxdWVuY2UubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAkaW50ZXJ2YWwuY2FuY2VsKHByb21pc2UpO1xuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuaXNDb21wdXRpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgc2VxdWVuY2VzQ2FjaGVbY29sb3JdID0gc2VxdWVuY2U7XG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5jb2xvcnMucHVzaChjb2xvcik7XG4gICAgICAgICAgICAgICAgICAgIG1zZy5zdWNjZXNzKCdUaGUgbmV3IGNvbG9yIGlzIG5vdyBhdmFpbGFibGUgZm9yIHNvcnRpbmcuJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgdmFyIGVycm9yID0gZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgJGludGVydmFsLmNhbmNlbChwcm9taXNlKTtcbiAgICAgICAgICAgICAgICAkc2NvcGUuaXNDb21wdXRpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2Uuc3RhdHVzID09PSA0MDQpIHtcbiAgICAgICAgICAgICAgICAgICAgbXNnLmRhbmdlcignVGhlIENPUFJJQSBwaXBlbGluZSBmb3IgY29tcHV0aW5nIGEgbmV3IGNvbG9yIHNvcnQgc2VxdWVuY2UgZmFpbGVkLicpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIG1zZy5yZXNwb25zZUVycm9yKHJlc3BvbnNlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB2YXIgY2hlY2sgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgQ29sb3JTb3J0U2VxdWVuY2UuZ2V0KHt0cmFuc2VjdF9pZDogJHNjb3BlLnRyYW5zZWN0SWQsIGNvbG9yOiBjb2xvcn0sIHN1Y2Nlc3MsIGVycm9yKTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIC8vIHBvbGwgZXZlcnkgNSBzZWNvbmRzXG4gICAgICAgICAgICBwcm9taXNlID0gJGludGVydmFsKGNoZWNrLCA1MDAwKTtcbiAgICAgICAgfTtcblxuICAgICAgICAkc2NvcGUub3BlblBvcG92ZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBwb3BvdmVyT3BlbiA9ICFwb3BvdmVyT3BlbjtcbiAgICAgICAgICAgIGlmIChwb3BvdmVyT3Blbikge1xuICAgICAgICAgICAgICAgIC8vIHJlZnJlc2ggdGhlIGxpc3Qgb2YgYXZhaWxhYmxlIGNvbG9ycyBldmVyeSB0aW1lIHRoZSBwb3BvdmVyIGlzIG9wZW5lZFxuICAgICAgICAgICAgICAgIENvbG9yU29ydFNlcXVlbmNlLnF1ZXJ5KHt0cmFuc2VjdF9pZDogJHNjb3BlLnRyYW5zZWN0SWR9LCBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmNvbG9ycyA9IHZhbHVlO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgICRzY29wZS5yZXF1ZXN0TmV3Q29sb3IgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAvLyBkb24ndCBhY2NlcHQgbmV3IHJlcXVlc3Qgd2hpbGUgdGhlIG9sZCBvbmUgaXMgc3RpbGwgY29tcHV0aW5nXG4gICAgICAgICAgICBpZiAoJHNjb3BlLmlzQ29tcHV0aW5nKSByZXR1cm47XG5cbiAgICAgICAgICAgIC8vIG9taXQgdGhlICcjJyBhdCB0aGUgYmVnaW5uaW5nIG9mIHRoZSBoZXggY29sb3JcbiAgICAgICAgICAgIHZhciBjb2xvciA9ICRzY29wZS5uZXcuY29sb3Iuc3Vic3RyaW5nKDEpO1xuXG4gICAgICAgICAgICB2YXIgc3VjY2VzcyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAkc2NvcGUuaXNDb21wdXRpbmcgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHBvbGwoY29sb3IpO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgdmFyIGVycm9yID0gZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlLnN0YXR1cyA9PT0gNDA1KSB7XG4gICAgICAgICAgICAgICAgICAgIG1zZy53YXJuaW5nKCdUaGlzIGNvbG9yIGlzIGFscmVhZHkgYXZhaWxhYmxlIChvciBzdGlsbCBjb21wdXRpbmcpLicpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIG1zZy5yZXNwb25zZUVycm9yKHJlc3BvbnNlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBDb2xvclNvcnRTZXF1ZW5jZS5yZXF1ZXN0KHt0cmFuc2VjdF9pZDogJHNjb3BlLnRyYW5zZWN0SWR9LCB7Y29sb3I6IGNvbG9yfSwgc3VjY2VzcywgZXJyb3IpO1xuICAgICAgICB9O1xuXG4gICAgICAgIHZhciBhY3RpdmF0ZUNhY2hlZENvbG9yID0gZnVuY3Rpb24gKGNvbG9yKSB7XG4gICAgICAgICAgICAvLyBjYWxsIHRyYW5zZWN0IGNvbnRyb2xsZXIgZnVuY3Rpb25cbiAgICAgICAgICAgICRzY29wZS5zZXRJbWFnZXNTZXF1ZW5jZShzZXF1ZW5jZXNDYWNoZVtjb2xvcl0pO1xuICAgICAgICAgICAgJHNjb3BlLmFjdGl2ZUNvbG9yID0gY29sb3I7XG4gICAgICAgIH07XG5cbiAgICAgICAgJHNjb3BlLnNvcnRCeSA9IGZ1bmN0aW9uIChjb2xvcikge1xuICAgICAgICAgICAgaWYgKGNvbG9yID09PSAkc2NvcGUuYWN0aXZlQ29sb3IpIHtcbiAgICAgICAgICAgICAgICAvLyBpZiBjb2xvciB3YXMgY2xpY2tlZCB0d2ljZSwgcmVzZXQvdW5zZWxlY3RcbiAgICAgICAgICAgICAgICAkc2NvcGUuc2V0SW1hZ2VzU2VxdWVuY2UoKTtcbiAgICAgICAgICAgICAgICAkc2NvcGUuYWN0aXZlQ29sb3IgPSAnJztcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChzZXF1ZW5jZXNDYWNoZVtjb2xvcl0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIGFjdGl2YXRlQ2FjaGVkQ29sb3IoY29sb3IpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB2YXIgc3VjY2VzcyA9IGZ1bmN0aW9uIChzZXF1ZW5jZSkge1xuICAgICAgICAgICAgICAgICAgICBzZXF1ZW5jZXNDYWNoZVtjb2xvcl0gPSBzZXF1ZW5jZTtcbiAgICAgICAgICAgICAgICAgICAgYWN0aXZhdGVDYWNoZWRDb2xvcihjb2xvcik7XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIENvbG9yU29ydFNlcXVlbmNlLmdldCh7dHJhbnNlY3RfaWQ6ICRzY29wZS50cmFuc2VjdElkLCBjb2xvcjogY29sb3J9LCBzdWNjZXNzLCBtc2cucmVzcG9uc2VFcnJvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgJHNjb3BlLiR3YXRjaCgnYWN0aXZlQ29sb3InLCBmdW5jdGlvbiAoY29sb3IpIHtcbiAgICAgICAgICAgIHdpbmRvdy5sb2NhbFN0b3JhZ2VbbG9jYWxTdG9yYWdlQWN0aXZlQ29sb3JLZXldID0gY29sb3I7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIGluaXRpYWxseSBzZXQgdGhlIHN0b3JlZCBjb2xvciBhcyBhY3RpdmUuXG4gICAgICAgIC8vIHdlIGRvbid0IG5lZWQgdG8gZmV0Y2ggdGhlIGFjdHVhbCBpbWFnZXMgc2VxdWVuY2UgaGVyZSBiZWNhdXNlIHRoYXQgaXMgc3RvcmVkIGJ5XG4gICAgICAgIC8vIHRoZSB0cmFuc2VjdCBjb250cm9sbGVyLlxuICAgICAgICBpZiAod2luZG93LmxvY2FsU3RvcmFnZVtsb2NhbFN0b3JhZ2VBY3RpdmVDb2xvcktleV0pIHtcbiAgICAgICAgICAgICRzY29wZS5hY3RpdmVDb2xvciA9IHdpbmRvdy5sb2NhbFN0b3JhZ2VbbG9jYWxTdG9yYWdlQWN0aXZlQ29sb3JLZXldO1xuICAgICAgICB9XG4gICAgfVxuKTtcbiIsIi8qKlxuICogQG5nZG9jIGZhY3RvcnlcbiAqIEBuYW1lIENvbG9yU29ydFNlcXVlbmNlXG4gKiBAbWVtYmVyT2YgZGlhcy50cmFuc2VjdHNcbiAqIEBkZXNjcmlwdGlvbiBQcm92aWRlcyB0aGUgcmVzb3VyY2UgZm9yIGNvbG9yIHNvcnQgc2VxdWVuY2VzLlxuICogQHJlcXVpcmVzICRyZXNvdXJjZVxuICogQHJldHVybnMge09iamVjdH0gQSBuZXcgW25nUmVzb3VyY2VdKGh0dHBzOi8vZG9jcy5hbmd1bGFyanMub3JnL2FwaS9uZ1Jlc291cmNlL3NlcnZpY2UvJHJlc291cmNlKSBvYmplY3RcbiAqIEBleGFtcGxlXG4vLyBnZXQgYWxsIGF2YWlsYWJsZSBjb2xvcnNcbnZhciBjb2xvcnMgPSBDb2xvclNvcnRTZXF1ZW5jZS5xdWVyeSh7dHJhbnNlY3RfaWQ6IDF9LCBmdW5jdGlvbiAoKSB7XG4gICBjb25zb2xlLmxvZyhjb2xvcnMpOyAvLyBbXCJiYWRhNTVcIiwgXCJjMGZmZWVcIiwgLi4uXVxufSk7XG4vLyBnZXQgdGhlIHNvcnQgb3JkZXIgKG9mIGltYWdlIElEcykgZm9yIG9uZSBzcGVjaWZpYyBjb2xvclxudmFyIHNlcXVlbmNlID0gQ29sb3JTb3J0U2VxdWVuY2UuZ2V0KHt0cmFuc2VjdF9pZDogMSwgY29sb3I6ICdiYWRhNTUnfSwgZnVuY3Rpb24gKCkge1xuICAgIGNvbnNvbGUubG9nKHNlcXVlbmNlKSA7IC8vIFsyLCAzLCAxLCA0XVxufSk7XG4vLyByZXF1ZXN0IGEgbmV3IGNvbG9yIHNvcnQgc2VxdWVuY2VcbnZhciBzZXF1ZW5jZSA9IENvbG9yU29ydFNlcXVlbmNlLnJlcXVlc3Qoe3RyYW5zZWN0X2lkOiAkc2NvcGUudHJhbnNlY3RJZH0sIHtjb2xvcjogJ2MwZmZlZSd9LCBmdW5jdGlvbiAoKSB7XG4gICAgY29uc29sZS5sb2coc2VxdWVuY2UpOyAvLyB7Y29sb3I6ICdjMGZmZWUnfVxufSk7XG4gKlxuICovXG5hbmd1bGFyLm1vZHVsZSgnZGlhcy50cmFuc2VjdHMnKS5mYWN0b3J5KCdDb2xvclNvcnRTZXF1ZW5jZScsIGZ1bmN0aW9uICgkcmVzb3VyY2UsIFVSTCkge1xuICAgIFwidXNlIHN0cmljdFwiO1xuXG4gICAgcmV0dXJuICRyZXNvdXJjZShVUkwgKyAnL2FwaS92MS90cmFuc2VjdHMvOnRyYW5zZWN0X2lkL2NvbG9yLXNvcnQtc2VxdWVuY2UvOmNvbG9yJywge30sIHtcbiAgICAgICAgZ2V0OiB7bWV0aG9kOiAnR0VUJywgaXNBcnJheTogdHJ1ZX0sXG4gICAgICAgIHJlcXVlc3Q6IHttZXRob2Q6ICdQT1NUJ31cbiAgICB9KTtcbn0pO1xuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9