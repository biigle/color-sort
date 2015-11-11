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

            ColorSortSequence.request({transect_id: $scope.transectId}, {color: color}, success, error);
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

                ColorSortSequence.get({transect_id: $scope.transectId, color: color}, success, msg.responseError);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNvbnRyb2xsZXJzL0NvbG9yU29ydENvbnRyb2xsZXIuanMiLCJmYWN0b3JpZXMvQ29sb3JTb3J0U2VxdWVuY2UuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7QUFPQSxRQUFBLE9BQUEsa0JBQUEsV0FBQSwyRUFBQSxVQUFBLFFBQUEsbUJBQUEsV0FBQSxLQUFBO1FBQ0E7O1FBRUEsSUFBQSxjQUFBOztRQUVBLElBQUEsNkJBQUEsb0JBQUEsT0FBQSxhQUFBOzs7UUFHQSxJQUFBLGlCQUFBOztRQUVBLE9BQUEsT0FBQTtZQUNBLE1BQUE7Ozs7UUFJQSxPQUFBLFNBQUE7O1FBRUEsT0FBQSxjQUFBOztRQUVBLE9BQUEsTUFBQTs7WUFFQSxPQUFBOzs7O1FBSUEsT0FBQSxjQUFBOzs7UUFHQSxJQUFBLE9BQUEsVUFBQSxPQUFBO1lBQ0EsSUFBQTtZQUNBLElBQUEsVUFBQSxVQUFBLFVBQUE7O2dCQUVBLElBQUEsU0FBQSxTQUFBLEdBQUE7b0JBQ0EsVUFBQSxPQUFBO29CQUNBLE9BQUEsY0FBQTtvQkFDQSxlQUFBLFNBQUE7b0JBQ0EsT0FBQSxPQUFBLEtBQUE7b0JBQ0EsSUFBQSxRQUFBOzs7O1lBSUEsSUFBQSxRQUFBLFVBQUEsVUFBQTtnQkFDQSxVQUFBLE9BQUE7Z0JBQ0EsT0FBQSxjQUFBO2dCQUNBLElBQUEsU0FBQSxXQUFBLEtBQUE7b0JBQ0EsSUFBQSxPQUFBO3VCQUNBO29CQUNBLElBQUEsY0FBQTs7OztZQUlBLElBQUEsUUFBQSxZQUFBO2dCQUNBLGtCQUFBLElBQUEsQ0FBQSxhQUFBLE9BQUEsWUFBQSxPQUFBLFFBQUEsU0FBQTs7OztZQUlBLFVBQUEsVUFBQSxPQUFBOzs7UUFHQSxPQUFBLGNBQUEsWUFBQTtZQUNBLGNBQUEsQ0FBQTtZQUNBLElBQUEsYUFBQTs7Z0JBRUEsa0JBQUEsTUFBQSxDQUFBLGFBQUEsT0FBQSxhQUFBLFVBQUEsT0FBQTtvQkFDQSxPQUFBLFNBQUE7Ozs7OztRQU1BLE9BQUEsa0JBQUEsWUFBQTs7WUFFQSxJQUFBLE9BQUEsYUFBQTs7O1lBR0EsSUFBQSxRQUFBLE9BQUEsSUFBQSxNQUFBLFVBQUE7O1lBRUEsSUFBQSxVQUFBLFlBQUE7Z0JBQ0EsT0FBQSxjQUFBO2dCQUNBLEtBQUE7OztZQUdBLElBQUEsUUFBQSxVQUFBLFVBQUE7Z0JBQ0EsSUFBQSxTQUFBLFdBQUEsS0FBQTtvQkFDQSxJQUFBLFFBQUE7dUJBQ0E7b0JBQ0EsSUFBQSxjQUFBOzs7O1lBSUEsa0JBQUEsUUFBQSxDQUFBLGFBQUEsT0FBQSxhQUFBLENBQUEsT0FBQSxRQUFBLFNBQUE7OztRQUdBLElBQUEsc0JBQUEsVUFBQSxPQUFBOztZQUVBLE9BQUEsa0JBQUEsZUFBQTtZQUNBLE9BQUEsY0FBQTs7OztRQUlBLE9BQUEsU0FBQSxVQUFBLE9BQUE7WUFDQSxJQUFBLFVBQUEsT0FBQSxhQUFBOztnQkFFQSxPQUFBO2dCQUNBLE9BQUEsY0FBQTtnQkFDQTs7O1lBR0EsSUFBQSxlQUFBLFdBQUEsV0FBQTtnQkFDQSxvQkFBQTttQkFDQTtnQkFDQSxJQUFBLFVBQUEsVUFBQSxVQUFBO29CQUNBLGVBQUEsU0FBQTtvQkFDQSxvQkFBQTs7O2dCQUdBLGtCQUFBLElBQUEsQ0FBQSxhQUFBLE9BQUEsWUFBQSxPQUFBLFFBQUEsU0FBQSxJQUFBOzs7OztRQUtBLE9BQUEsT0FBQSxlQUFBLFVBQUEsT0FBQTtZQUNBLE9BQUEsYUFBQSw4QkFBQTs7Ozs7O1FBTUEsSUFBQSxPQUFBLGFBQUEsNkJBQUE7WUFDQSxPQUFBLGNBQUEsT0FBQSxhQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNsSEEsUUFBQSxPQUFBLGtCQUFBLFFBQUEsMENBQUEsVUFBQSxXQUFBLEtBQUE7SUFDQTs7SUFFQSxPQUFBLFVBQUEsTUFBQSw2REFBQSxJQUFBO1FBQ0EsS0FBQSxDQUFBLFFBQUEsT0FBQSxTQUFBO1FBQ0EsU0FBQSxDQUFBLFFBQUE7OztBQUdBIiwiZmlsZSI6InRyYW5zZWN0cy5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQG5hbWVzcGFjZSBkaWFzLnRyYW5zZWN0c1xuICogQG5nZG9jIGNvbnRyb2xsZXJcbiAqIEBuYW1lIENvbG9yU29ydENvbnRyb2xsZXJcbiAqIEBtZW1iZXJPZiBkaWFzLnRyYW5zZWN0c1xuICogQGRlc2NyaXB0aW9uIEdsb2JhbCBjb250cm9sbGVyIGZvciB0aGUgY29sb3Igc29ydCBmZWF0dXJlXG4gKi9cbmFuZ3VsYXIubW9kdWxlKCdkaWFzLnRyYW5zZWN0cycpLmNvbnRyb2xsZXIoJ0NvbG9yU29ydENvbnRyb2xsZXInLCBmdW5jdGlvbiAoJHNjb3BlLCBDb2xvclNvcnRTZXF1ZW5jZSwgJGludGVydmFsLCBtc2cpIHtcbiAgICAgICAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgICAgICAgdmFyIHBvcG92ZXJPcGVuID0gZmFsc2U7XG5cbiAgICAgICAgdmFyIGxvY2FsU3RvcmFnZUFjdGl2ZUNvbG9yS2V5ID0gJ2RpYXMudHJhbnNlY3RzLicgKyAkc2NvcGUudHJhbnNlY3RJZCArICcuY29sb3Itc29ydC5hY3RpdmUtY29sb3InO1xuXG4gICAgICAgIC8vIHN0b3JlcyBhbGwgc29ydGluZyBzZXF1ZW5jZSBhcnJheXMgd2l0aCB0aGUgcmVsYXRlZCBjb2xvcnMgYXMga2V5c1xuICAgICAgICB2YXIgc2VxdWVuY2VzQ2FjaGUgPSB7fTtcblxuICAgICAgICAkc2NvcGUuc2hvdyA9IHtcbiAgICAgICAgICAgIGhlbHA6IGZhbHNlXG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gYXJyYXkgb2YgYWxsIGF2YWlsYWJsZSBjb2xvcnNcbiAgICAgICAgJHNjb3BlLmNvbG9ycyA9IFtdO1xuXG4gICAgICAgICRzY29wZS5pc0NvbXB1dGluZyA9IGZhbHNlO1xuXG4gICAgICAgICRzY29wZS5uZXcgPSB7XG4gICAgICAgICAgICAvLyBjdXJyZW50bHkgc2VsZWN0ZWQgY29sb3IgaW4gdGhlICdjb21wdXRlIG5ldycgZm9ybVxuICAgICAgICAgICAgY29sb3I6ICcjMDAwMDAwJ1xuICAgICAgICB9O1xuXG4gICAgICAgIC8vIGN1cnJlbnRseSBhY3RpdmUgY29sb3IgZm9yIHNvcnRpbmdcbiAgICAgICAgJHNjb3BlLmFjdGl2ZUNvbG9yID0gJyc7XG5cbiAgICAgICAgLy8gcmVndWxhcmx5IGNoZWNrIGlmIGEgcmVxdWVzdGVkIGNvbG9yIGlzIG5vdyBhdmFpbGFibGVcbiAgICAgICAgdmFyIHBvbGwgPSBmdW5jdGlvbiAoY29sb3IpIHtcbiAgICAgICAgICAgIHZhciBwcm9taXNlO1xuICAgICAgICAgICAgdmFyIHN1Y2Nlc3MgPSBmdW5jdGlvbiAoc2VxdWVuY2UpIHtcbiAgICAgICAgICAgICAgICAvLyBUT0RPIHdoYXQgaWYgdGhlIHRyYW5zZWN0IF9pc18gZW1wdHk/XG4gICAgICAgICAgICAgICAgaWYgKHNlcXVlbmNlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgJGludGVydmFsLmNhbmNlbChwcm9taXNlKTtcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmlzQ29tcHV0aW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIHNlcXVlbmNlc0NhY2hlW2NvbG9yXSA9IHNlcXVlbmNlO1xuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuY29sb3JzLnB1c2goY29sb3IpO1xuICAgICAgICAgICAgICAgICAgICBtc2cuc3VjY2VzcygnVGhlIG5ldyBjb2xvciBpcyBub3cgYXZhaWxhYmxlIGZvciBzb3J0aW5nLicpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHZhciBlcnJvciA9IGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgICRpbnRlcnZhbC5jYW5jZWwocHJvbWlzZSk7XG4gICAgICAgICAgICAgICAgJHNjb3BlLmlzQ29tcHV0aW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlLnN0YXR1cyA9PT0gNDA0KSB7XG4gICAgICAgICAgICAgICAgICAgIG1zZy5kYW5nZXIoJ1RoZSBDT1BSSUEgcGlwZWxpbmUgZm9yIGNvbXB1dGluZyBhIG5ldyBjb2xvciBzb3J0IHNlcXVlbmNlIGZhaWxlZC4nKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBtc2cucmVzcG9uc2VFcnJvcihyZXNwb25zZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgdmFyIGNoZWNrID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIENvbG9yU29ydFNlcXVlbmNlLmdldCh7dHJhbnNlY3RfaWQ6ICRzY29wZS50cmFuc2VjdElkLCBjb2xvcjogY29sb3J9LCBzdWNjZXNzLCBlcnJvcik7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAvLyBwb2xsIGV2ZXJ5IDUgc2Vjb25kc1xuICAgICAgICAgICAgcHJvbWlzZSA9ICRpbnRlcnZhbChjaGVjaywgNTAwMCk7XG4gICAgICAgIH07XG5cbiAgICAgICAgJHNjb3BlLm9wZW5Qb3BvdmVyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcG9wb3Zlck9wZW4gPSAhcG9wb3Zlck9wZW47XG4gICAgICAgICAgICBpZiAocG9wb3Zlck9wZW4pIHtcbiAgICAgICAgICAgICAgICAvLyByZWZyZXNoIHRoZSBsaXN0IG9mIGF2YWlsYWJsZSBjb2xvcnMgZXZlcnkgdGltZSB0aGUgcG9wb3ZlciBpcyBvcGVuZWRcbiAgICAgICAgICAgICAgICBDb2xvclNvcnRTZXF1ZW5jZS5xdWVyeSh7dHJhbnNlY3RfaWQ6ICRzY29wZS50cmFuc2VjdElkfSwgZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5jb2xvcnMgPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICAvLyBzdWJtaXQgYSBuZXcgcmVxdWVzdCB0byBjb21wdXRlIGEgY29sb3Igc29ydCBzZXF1ZW5jZVxuICAgICAgICAkc2NvcGUucmVxdWVzdE5ld0NvbG9yID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgLy8gZG9uJ3QgYWNjZXB0IG5ldyByZXF1ZXN0IHdoaWxlIHRoZSBvbGQgb25lIGlzIHN0aWxsIGNvbXB1dGluZ1xuICAgICAgICAgICAgaWYgKCRzY29wZS5pc0NvbXB1dGluZykgcmV0dXJuO1xuXG4gICAgICAgICAgICAvLyBvbWl0IHRoZSAnIycgYXQgdGhlIGJlZ2lubmluZyBvZiB0aGUgaGV4IGNvbG9yXG4gICAgICAgICAgICB2YXIgY29sb3IgPSAkc2NvcGUubmV3LmNvbG9yLnN1YnN0cmluZygxKTtcblxuICAgICAgICAgICAgdmFyIHN1Y2Nlc3MgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgJHNjb3BlLmlzQ29tcHV0aW5nID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBwb2xsKGNvbG9yKTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHZhciBlcnJvciA9IGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZS5zdGF0dXMgPT09IDQwNSkge1xuICAgICAgICAgICAgICAgICAgICBtc2cud2FybmluZygnVGhpcyBjb2xvciBpcyBhbHJlYWR5IGF2YWlsYWJsZSAob3Igc3RpbGwgY29tcHV0aW5nKS4nKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBtc2cucmVzcG9uc2VFcnJvcihyZXNwb25zZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgQ29sb3JTb3J0U2VxdWVuY2UucmVxdWVzdCh7dHJhbnNlY3RfaWQ6ICRzY29wZS50cmFuc2VjdElkfSwge2NvbG9yOiBjb2xvcn0sIHN1Y2Nlc3MsIGVycm9yKTtcbiAgICAgICAgfTtcblxuICAgICAgICB2YXIgYWN0aXZhdGVDYWNoZWRDb2xvciA9IGZ1bmN0aW9uIChjb2xvcikge1xuICAgICAgICAgICAgLy8gY2FsbCB0cmFuc2VjdCBjb250cm9sbGVyIGZ1bmN0aW9uXG4gICAgICAgICAgICAkc2NvcGUuc2V0SW1hZ2VzU2VxdWVuY2Uoc2VxdWVuY2VzQ2FjaGVbY29sb3JdKTtcbiAgICAgICAgICAgICRzY29wZS5hY3RpdmVDb2xvciA9IGNvbG9yO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8vIHNvcnQgdGhlIGltYWdlcyB1c2luZyBhbiBhdmFpbGFibGUgY29sb3Igc29ydCBzZXF1ZW5jZVxuICAgICAgICAkc2NvcGUuc29ydEJ5ID0gZnVuY3Rpb24gKGNvbG9yKSB7XG4gICAgICAgICAgICBpZiAoY29sb3IgPT09ICRzY29wZS5hY3RpdmVDb2xvcikge1xuICAgICAgICAgICAgICAgIC8vIGlmIGNvbG9yIHdhcyBjbGlja2VkIHR3aWNlLCByZXNldC91bnNlbGVjdFxuICAgICAgICAgICAgICAgICRzY29wZS5zZXRJbWFnZXNTZXF1ZW5jZSgpO1xuICAgICAgICAgICAgICAgICRzY29wZS5hY3RpdmVDb2xvciA9ICcnO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHNlcXVlbmNlc0NhY2hlW2NvbG9yXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgYWN0aXZhdGVDYWNoZWRDb2xvcihjb2xvcik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHZhciBzdWNjZXNzID0gZnVuY3Rpb24gKHNlcXVlbmNlKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlcXVlbmNlc0NhY2hlW2NvbG9yXSA9IHNlcXVlbmNlO1xuICAgICAgICAgICAgICAgICAgICBhY3RpdmF0ZUNhY2hlZENvbG9yKGNvbG9yKTtcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgQ29sb3JTb3J0U2VxdWVuY2UuZ2V0KHt0cmFuc2VjdF9pZDogJHNjb3BlLnRyYW5zZWN0SWQsIGNvbG9yOiBjb2xvcn0sIHN1Y2Nlc3MsIG1zZy5yZXNwb25zZUVycm9yKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICAvLyBzdG9yZSB0aGUgY3VycmVudGx5IGFjdGl2ZSBjb2xvciBwZXJzaXN0ZW50bHlcbiAgICAgICAgJHNjb3BlLiR3YXRjaCgnYWN0aXZlQ29sb3InLCBmdW5jdGlvbiAoY29sb3IpIHtcbiAgICAgICAgICAgIHdpbmRvdy5sb2NhbFN0b3JhZ2VbbG9jYWxTdG9yYWdlQWN0aXZlQ29sb3JLZXldID0gY29sb3I7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIGluaXRpYWxseSBzZXQgdGhlIHN0b3JlZCBjb2xvciBhcyBhY3RpdmUuXG4gICAgICAgIC8vIHdlIGRvbid0IG5lZWQgdG8gZmV0Y2ggdGhlIGFjdHVhbCBpbWFnZXMgc2VxdWVuY2UgaGVyZSBiZWNhdXNlIHRoYXQgaXMgc3RvcmVkIGJ5XG4gICAgICAgIC8vIHRoZSB0cmFuc2VjdCBjb250cm9sbGVyLlxuICAgICAgICBpZiAod2luZG93LmxvY2FsU3RvcmFnZVtsb2NhbFN0b3JhZ2VBY3RpdmVDb2xvcktleV0pIHtcbiAgICAgICAgICAgICRzY29wZS5hY3RpdmVDb2xvciA9IHdpbmRvdy5sb2NhbFN0b3JhZ2VbbG9jYWxTdG9yYWdlQWN0aXZlQ29sb3JLZXldO1xuICAgICAgICB9XG4gICAgfVxuKTtcbiIsIi8qKlxuICogQG5nZG9jIGZhY3RvcnlcbiAqIEBuYW1lIENvbG9yU29ydFNlcXVlbmNlXG4gKiBAbWVtYmVyT2YgZGlhcy50cmFuc2VjdHNcbiAqIEBkZXNjcmlwdGlvbiBQcm92aWRlcyB0aGUgcmVzb3VyY2UgZm9yIGNvbG9yIHNvcnQgc2VxdWVuY2VzLlxuICogQHJlcXVpcmVzICRyZXNvdXJjZVxuICogQHJldHVybnMge09iamVjdH0gQSBuZXcgW25nUmVzb3VyY2VdKGh0dHBzOi8vZG9jcy5hbmd1bGFyanMub3JnL2FwaS9uZ1Jlc291cmNlL3NlcnZpY2UvJHJlc291cmNlKSBvYmplY3RcbiAqIEBleGFtcGxlXG4vLyBnZXQgYWxsIGF2YWlsYWJsZSBjb2xvcnNcbnZhciBjb2xvcnMgPSBDb2xvclNvcnRTZXF1ZW5jZS5xdWVyeSh7dHJhbnNlY3RfaWQ6IDF9LCBmdW5jdGlvbiAoKSB7XG4gICBjb25zb2xlLmxvZyhjb2xvcnMpOyAvLyBbXCJiYWRhNTVcIiwgXCJjMGZmZWVcIiwgLi4uXVxufSk7XG4vLyBnZXQgdGhlIHNvcnQgb3JkZXIgKG9mIGltYWdlIElEcykgZm9yIG9uZSBzcGVjaWZpYyBjb2xvclxudmFyIHNlcXVlbmNlID0gQ29sb3JTb3J0U2VxdWVuY2UuZ2V0KHt0cmFuc2VjdF9pZDogMSwgY29sb3I6ICdiYWRhNTUnfSwgZnVuY3Rpb24gKCkge1xuICAgIGNvbnNvbGUubG9nKHNlcXVlbmNlKSA7IC8vIFsyLCAzLCAxLCA0XVxufSk7XG4vLyByZXF1ZXN0IGEgbmV3IGNvbG9yIHNvcnQgc2VxdWVuY2VcbnZhciBzZXF1ZW5jZSA9IENvbG9yU29ydFNlcXVlbmNlLnJlcXVlc3Qoe3RyYW5zZWN0X2lkOiAkc2NvcGUudHJhbnNlY3RJZH0sIHtjb2xvcjogJ2MwZmZlZSd9LCBmdW5jdGlvbiAoKSB7XG4gICAgY29uc29sZS5sb2coc2VxdWVuY2UpOyAvLyB7Y29sb3I6ICdjMGZmZWUnfVxufSk7XG4gKlxuICovXG5hbmd1bGFyLm1vZHVsZSgnZGlhcy50cmFuc2VjdHMnKS5mYWN0b3J5KCdDb2xvclNvcnRTZXF1ZW5jZScsIGZ1bmN0aW9uICgkcmVzb3VyY2UsIFVSTCkge1xuICAgIFwidXNlIHN0cmljdFwiO1xuXG4gICAgcmV0dXJuICRyZXNvdXJjZShVUkwgKyAnL2FwaS92MS90cmFuc2VjdHMvOnRyYW5zZWN0X2lkL2NvbG9yLXNvcnQtc2VxdWVuY2UvOmNvbG9yJywge30sIHtcbiAgICAgICAgZ2V0OiB7bWV0aG9kOiAnR0VUJywgaXNBcnJheTogdHJ1ZX0sXG4gICAgICAgIHJlcXVlc3Q6IHttZXRob2Q6ICdQT1NUJ31cbiAgICB9KTtcbn0pO1xuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9