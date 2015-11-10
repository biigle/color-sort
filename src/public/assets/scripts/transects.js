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

        // stores all sorting sequence arrays with the related colors as keys
        var sequencesCache = {};

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
                    msg.warning('This color is already available (or computing).');
                } else {
                    msg.responseError(response);
                }
            };

            ColorSortSequence.request({transect_id: $scope.transectId}, {color: color}, success, error);
        };

        $scope.sortBy = function (color) {
            if (color === $scope.activeColor) {
                // if color was clicked twice, reset/unselect
                $scope.setImagesSequence();
                $scope.activeColor = '';
                return;
            }

            if (sequencesCache[color] !== undefined) {
                // call transect controller function
                $scope.setImagesSequence(sequencesCache[color]);
                $scope.activeColor = color;
            } else {
                var success = function (sequence) {
                    sequencesCache[color] = sequence;
                    $scope.setImagesSequence(sequence);
                    $scope.activeColor = color;
                };

                ColorSortSequence.get({transect_id: $scope.transectId, color: color}, success, msg.responseError);
            }
        };
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNvbnRyb2xsZXJzL0NvbG9yU29ydENvbnRyb2xsZXIuanMiLCJmYWN0b3JpZXMvQ29sb3JTb3J0U2VxdWVuY2UuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7QUFPQSxRQUFBLE9BQUEsa0JBQUEsV0FBQSwyRUFBQSxVQUFBLFFBQUEsbUJBQUEsV0FBQSxLQUFBO1FBQ0E7O1FBRUEsSUFBQSxjQUFBOzs7UUFHQSxJQUFBLGlCQUFBOzs7UUFHQSxPQUFBLFNBQUE7O1FBRUEsT0FBQSxjQUFBOztRQUVBLE9BQUEsTUFBQTs7WUFFQSxPQUFBOzs7O1FBSUEsT0FBQSxjQUFBOztRQUVBLElBQUEsT0FBQSxVQUFBLE9BQUE7WUFDQSxJQUFBO1lBQ0EsSUFBQSxVQUFBLFVBQUEsVUFBQTs7Z0JBRUEsSUFBQSxTQUFBLFNBQUEsR0FBQTtvQkFDQSxVQUFBLE9BQUE7b0JBQ0EsT0FBQSxjQUFBO29CQUNBLGVBQUEsU0FBQTtvQkFDQSxPQUFBLE9BQUEsS0FBQTtvQkFDQSxJQUFBLFFBQUE7Ozs7WUFJQSxJQUFBLFFBQUEsVUFBQSxVQUFBO2dCQUNBLFVBQUEsT0FBQTtnQkFDQSxPQUFBLGNBQUE7Z0JBQ0EsSUFBQSxTQUFBLFdBQUEsS0FBQTtvQkFDQSxJQUFBLE9BQUE7dUJBQ0E7b0JBQ0EsSUFBQSxjQUFBOzs7O1lBSUEsSUFBQSxRQUFBLFlBQUE7Z0JBQ0Esa0JBQUEsSUFBQSxDQUFBLGFBQUEsT0FBQSxZQUFBLE9BQUEsUUFBQSxTQUFBOzs7O1lBSUEsVUFBQSxVQUFBLE9BQUE7OztRQUdBLE9BQUEsY0FBQSxZQUFBO1lBQ0EsY0FBQSxDQUFBO1lBQ0EsSUFBQSxhQUFBOztnQkFFQSxrQkFBQSxNQUFBLENBQUEsYUFBQSxPQUFBLGFBQUEsVUFBQSxPQUFBO29CQUNBLE9BQUEsU0FBQTs7Ozs7UUFLQSxPQUFBLGtCQUFBLFlBQUE7O1lBRUEsSUFBQSxPQUFBLGFBQUE7OztZQUdBLElBQUEsUUFBQSxPQUFBLElBQUEsTUFBQSxVQUFBOztZQUVBLElBQUEsVUFBQSxZQUFBO2dCQUNBLE9BQUEsY0FBQTtnQkFDQSxLQUFBOzs7WUFHQSxJQUFBLFFBQUEsVUFBQSxVQUFBO2dCQUNBLElBQUEsU0FBQSxXQUFBLEtBQUE7b0JBQ0EsSUFBQSxRQUFBO3VCQUNBO29CQUNBLElBQUEsY0FBQTs7OztZQUlBLGtCQUFBLFFBQUEsQ0FBQSxhQUFBLE9BQUEsYUFBQSxDQUFBLE9BQUEsUUFBQSxTQUFBOzs7UUFHQSxPQUFBLFNBQUEsVUFBQSxPQUFBO1lBQ0EsSUFBQSxVQUFBLE9BQUEsYUFBQTs7Z0JBRUEsT0FBQTtnQkFDQSxPQUFBLGNBQUE7Z0JBQ0E7OztZQUdBLElBQUEsZUFBQSxXQUFBLFdBQUE7O2dCQUVBLE9BQUEsa0JBQUEsZUFBQTtnQkFDQSxPQUFBLGNBQUE7bUJBQ0E7Z0JBQ0EsSUFBQSxVQUFBLFVBQUEsVUFBQTtvQkFDQSxlQUFBLFNBQUE7b0JBQ0EsT0FBQSxrQkFBQTtvQkFDQSxPQUFBLGNBQUE7OztnQkFHQSxrQkFBQSxJQUFBLENBQUEsYUFBQSxPQUFBLFlBQUEsT0FBQSxRQUFBLFNBQUEsSUFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ3pGQSxRQUFBLE9BQUEsa0JBQUEsUUFBQSwwQ0FBQSxVQUFBLFdBQUEsS0FBQTtJQUNBOztJQUVBLE9BQUEsVUFBQSxNQUFBLDZEQUFBLElBQUE7UUFDQSxLQUFBLENBQUEsUUFBQSxPQUFBLFNBQUE7UUFDQSxTQUFBLENBQUEsUUFBQTs7O0FBR0EiLCJmaWxlIjoidHJhbnNlY3RzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbmFtZXNwYWNlIGRpYXMudHJhbnNlY3RzXG4gKiBAbmdkb2MgY29udHJvbGxlclxuICogQG5hbWUgQ29sb3JTb3J0Q29udHJvbGxlclxuICogQG1lbWJlck9mIGRpYXMudHJhbnNlY3RzXG4gKiBAZGVzY3JpcHRpb24gR2xvYmFsIGNvbnRyb2xsZXIgZm9yIHRoZSBjb2xvciBzb3J0IGZlYXR1cmVcbiAqL1xuYW5ndWxhci5tb2R1bGUoJ2RpYXMudHJhbnNlY3RzJykuY29udHJvbGxlcignQ29sb3JTb3J0Q29udHJvbGxlcicsIGZ1bmN0aW9uICgkc2NvcGUsIENvbG9yU29ydFNlcXVlbmNlLCAkaW50ZXJ2YWwsIG1zZykge1xuICAgICAgICBcInVzZSBzdHJpY3RcIjtcblxuICAgICAgICB2YXIgcG9wb3Zlck9wZW4gPSBmYWxzZTtcblxuICAgICAgICAvLyBzdG9yZXMgYWxsIHNvcnRpbmcgc2VxdWVuY2UgYXJyYXlzIHdpdGggdGhlIHJlbGF0ZWQgY29sb3JzIGFzIGtleXNcbiAgICAgICAgdmFyIHNlcXVlbmNlc0NhY2hlID0ge307XG5cbiAgICAgICAgLy8gYXJyYXkgb2YgYWxsIGF2YWlsYWJsZSBjb2xvcnNcbiAgICAgICAgJHNjb3BlLmNvbG9ycyA9IFtdO1xuXG4gICAgICAgICRzY29wZS5pc0NvbXB1dGluZyA9IGZhbHNlO1xuXG4gICAgICAgICRzY29wZS5uZXcgPSB7XG4gICAgICAgICAgICAvLyBjdXJyZW50bHkgc2VsZWN0ZWQgY29sb3IgaW4gdGhlICdjb21wdXRlIG5ldycgZm9ybVxuICAgICAgICAgICAgY29sb3I6ICcjMDAwMDAwJ1xuICAgICAgICB9O1xuXG4gICAgICAgIC8vIGN1cnJlbnRseSBhY3RpdmUgY29sb3IgZm9yIHNvcnRpbmdcbiAgICAgICAgJHNjb3BlLmFjdGl2ZUNvbG9yID0gJyc7XG5cbiAgICAgICAgdmFyIHBvbGwgPSBmdW5jdGlvbiAoY29sb3IpIHtcbiAgICAgICAgICAgIHZhciBwcm9taXNlO1xuICAgICAgICAgICAgdmFyIHN1Y2Nlc3MgPSBmdW5jdGlvbiAoc2VxdWVuY2UpIHtcbiAgICAgICAgICAgICAgICAvLyBUT0RPIHdoYXQgaWYgdGhlIHRyYW5zZWN0IF9pc18gZW1wdHk/XG4gICAgICAgICAgICAgICAgaWYgKHNlcXVlbmNlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgJGludGVydmFsLmNhbmNlbChwcm9taXNlKTtcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmlzQ29tcHV0aW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIHNlcXVlbmNlc0NhY2hlW2NvbG9yXSA9IHNlcXVlbmNlO1xuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuY29sb3JzLnB1c2goY29sb3IpO1xuICAgICAgICAgICAgICAgICAgICBtc2cuc3VjY2VzcygnVGhlIG5ldyBjb2xvciBpcyBub3cgYXZhaWxhYmxlIGZvciBzb3J0aW5nLicpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHZhciBlcnJvciA9IGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgICRpbnRlcnZhbC5jYW5jZWwocHJvbWlzZSk7XG4gICAgICAgICAgICAgICAgJHNjb3BlLmlzQ29tcHV0aW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlLnN0YXR1cyA9PT0gNDA0KSB7XG4gICAgICAgICAgICAgICAgICAgIG1zZy5kYW5nZXIoJ1RoZSBDT1BSSUEgcGlwZWxpbmUgZm9yIGNvbXB1dGluZyBhIG5ldyBjb2xvciBzb3J0IHNlcXVlbmNlIGZhaWxlZC4nKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBtc2cucmVzcG9uc2VFcnJvcihyZXNwb25zZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgdmFyIGNoZWNrID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIENvbG9yU29ydFNlcXVlbmNlLmdldCh7dHJhbnNlY3RfaWQ6ICRzY29wZS50cmFuc2VjdElkLCBjb2xvcjogY29sb3J9LCBzdWNjZXNzLCBlcnJvcik7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAvLyBwb2xsIGV2ZXJ5IDUgc2Vjb25kc1xuICAgICAgICAgICAgcHJvbWlzZSA9ICRpbnRlcnZhbChjaGVjaywgNTAwMCk7XG4gICAgICAgIH07XG5cbiAgICAgICAgJHNjb3BlLm9wZW5Qb3BvdmVyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcG9wb3Zlck9wZW4gPSAhcG9wb3Zlck9wZW47XG4gICAgICAgICAgICBpZiAocG9wb3Zlck9wZW4pIHtcbiAgICAgICAgICAgICAgICAvLyByZWZyZXNoIHRoZSBsaXN0IG9mIGF2YWlsYWJsZSBjb2xvcnMgZXZlcnkgdGltZSB0aGUgcG9wb3ZlciBpcyBvcGVuZWRcbiAgICAgICAgICAgICAgICBDb2xvclNvcnRTZXF1ZW5jZS5xdWVyeSh7dHJhbnNlY3RfaWQ6ICRzY29wZS50cmFuc2VjdElkfSwgZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5jb2xvcnMgPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICAkc2NvcGUucmVxdWVzdE5ld0NvbG9yID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgLy8gZG9uJ3QgYWNjZXB0IG5ldyByZXF1ZXN0IHdoaWxlIHRoZSBvbGQgb25lIGlzIHN0aWxsIGNvbXB1dGluZ1xuICAgICAgICAgICAgaWYgKCRzY29wZS5pc0NvbXB1dGluZykgcmV0dXJuO1xuXG4gICAgICAgICAgICAvLyBvbWl0IHRoZSAnIycgYXQgdGhlIGJlZ2lubmluZyBvZiB0aGUgaGV4IGNvbG9yXG4gICAgICAgICAgICB2YXIgY29sb3IgPSAkc2NvcGUubmV3LmNvbG9yLnN1YnN0cmluZygxKTtcblxuICAgICAgICAgICAgdmFyIHN1Y2Nlc3MgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgJHNjb3BlLmlzQ29tcHV0aW5nID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBwb2xsKGNvbG9yKTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHZhciBlcnJvciA9IGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZS5zdGF0dXMgPT09IDQwNSkge1xuICAgICAgICAgICAgICAgICAgICBtc2cud2FybmluZygnVGhpcyBjb2xvciBpcyBhbHJlYWR5IGF2YWlsYWJsZSAob3IgY29tcHV0aW5nKS4nKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBtc2cucmVzcG9uc2VFcnJvcihyZXNwb25zZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgQ29sb3JTb3J0U2VxdWVuY2UucmVxdWVzdCh7dHJhbnNlY3RfaWQ6ICRzY29wZS50cmFuc2VjdElkfSwge2NvbG9yOiBjb2xvcn0sIHN1Y2Nlc3MsIGVycm9yKTtcbiAgICAgICAgfTtcblxuICAgICAgICAkc2NvcGUuc29ydEJ5ID0gZnVuY3Rpb24gKGNvbG9yKSB7XG4gICAgICAgICAgICBpZiAoY29sb3IgPT09ICRzY29wZS5hY3RpdmVDb2xvcikge1xuICAgICAgICAgICAgICAgIC8vIGlmIGNvbG9yIHdhcyBjbGlja2VkIHR3aWNlLCByZXNldC91bnNlbGVjdFxuICAgICAgICAgICAgICAgICRzY29wZS5zZXRJbWFnZXNTZXF1ZW5jZSgpO1xuICAgICAgICAgICAgICAgICRzY29wZS5hY3RpdmVDb2xvciA9ICcnO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHNlcXVlbmNlc0NhY2hlW2NvbG9yXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgLy8gY2FsbCB0cmFuc2VjdCBjb250cm9sbGVyIGZ1bmN0aW9uXG4gICAgICAgICAgICAgICAgJHNjb3BlLnNldEltYWdlc1NlcXVlbmNlKHNlcXVlbmNlc0NhY2hlW2NvbG9yXSk7XG4gICAgICAgICAgICAgICAgJHNjb3BlLmFjdGl2ZUNvbG9yID0gY29sb3I7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHZhciBzdWNjZXNzID0gZnVuY3Rpb24gKHNlcXVlbmNlKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlcXVlbmNlc0NhY2hlW2NvbG9yXSA9IHNlcXVlbmNlO1xuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuc2V0SW1hZ2VzU2VxdWVuY2Uoc2VxdWVuY2UpO1xuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuYWN0aXZlQ29sb3IgPSBjb2xvcjtcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgQ29sb3JTb3J0U2VxdWVuY2UuZ2V0KHt0cmFuc2VjdF9pZDogJHNjb3BlLnRyYW5zZWN0SWQsIGNvbG9yOiBjb2xvcn0sIHN1Y2Nlc3MsIG1zZy5yZXNwb25zZUVycm9yKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9XG4pO1xuIiwiLyoqXG4gKiBAbmdkb2MgZmFjdG9yeVxuICogQG5hbWUgQ29sb3JTb3J0U2VxdWVuY2VcbiAqIEBtZW1iZXJPZiBkaWFzLnRyYW5zZWN0c1xuICogQGRlc2NyaXB0aW9uIFByb3ZpZGVzIHRoZSByZXNvdXJjZSBmb3IgY29sb3Igc29ydCBzZXF1ZW5jZXMuXG4gKiBAcmVxdWlyZXMgJHJlc291cmNlXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBBIG5ldyBbbmdSZXNvdXJjZV0oaHR0cHM6Ly9kb2NzLmFuZ3VsYXJqcy5vcmcvYXBpL25nUmVzb3VyY2Uvc2VydmljZS8kcmVzb3VyY2UpIG9iamVjdFxuICogQGV4YW1wbGVcbi8vIGdldCBhbGwgYXZhaWxhYmxlIGNvbG9yc1xudmFyIGNvbG9ycyA9IENvbG9yU29ydFNlcXVlbmNlLnF1ZXJ5KHt0cmFuc2VjdF9pZDogMX0sIGZ1bmN0aW9uICgpIHtcbiAgIGNvbnNvbGUubG9nKGNvbG9ycyk7IC8vIFtcImJhZGE1NVwiLCBcImMwZmZlZVwiLCAuLi5dXG59KTtcbi8vIGdldCB0aGUgc29ydCBvcmRlciAob2YgaW1hZ2UgSURzKSBmb3Igb25lIHNwZWNpZmljIGNvbG9yXG52YXIgc2VxdWVuY2UgPSBDb2xvclNvcnRTZXF1ZW5jZS5nZXQoe3RyYW5zZWN0X2lkOiAxLCBjb2xvcjogJ2JhZGE1NSd9LCBmdW5jdGlvbiAoKSB7XG4gICAgY29uc29sZS5sb2coc2VxdWVuY2UpIDsgLy8gWzIsIDMsIDEsIDRdXG59KTtcbi8vIHJlcXVlc3QgYSBuZXcgY29sb3Igc29ydCBzZXF1ZW5jZVxudmFyIHNlcXVlbmNlID0gQ29sb3JTb3J0U2VxdWVuY2UucmVxdWVzdCh7dHJhbnNlY3RfaWQ6ICRzY29wZS50cmFuc2VjdElkfSwge2NvbG9yOiAnYzBmZmVlJ30sIGZ1bmN0aW9uICgpIHtcbiAgICBjb25zb2xlLmxvZyhzZXF1ZW5jZSk7IC8vIHtjb2xvcjogJ2MwZmZlZSd9XG59KTtcbiAqXG4gKi9cbmFuZ3VsYXIubW9kdWxlKCdkaWFzLnRyYW5zZWN0cycpLmZhY3RvcnkoJ0NvbG9yU29ydFNlcXVlbmNlJywgZnVuY3Rpb24gKCRyZXNvdXJjZSwgVVJMKSB7XG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgICByZXR1cm4gJHJlc291cmNlKFVSTCArICcvYXBpL3YxL3RyYW5zZWN0cy86dHJhbnNlY3RfaWQvY29sb3Itc29ydC1zZXF1ZW5jZS86Y29sb3InLCB7fSwge1xuICAgICAgICBnZXQ6IHttZXRob2Q6ICdHRVQnLCBpc0FycmF5OiB0cnVlfSxcbiAgICAgICAgcmVxdWVzdDoge21ldGhvZDogJ1BPU1QnfVxuICAgIH0pO1xufSk7XG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=