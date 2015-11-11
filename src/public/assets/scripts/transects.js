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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNvbnRyb2xsZXJzL0NvbG9yU29ydENvbnRyb2xsZXIuanMiLCJmYWN0b3JpZXMvQ29sb3JTb3J0U2VxdWVuY2UuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7QUFPQSxRQUFBLE9BQUEsa0JBQUEsV0FBQSwyRUFBQSxVQUFBLFFBQUEsbUJBQUEsV0FBQSxLQUFBO1FBQ0E7O1FBRUEsSUFBQSxjQUFBOzs7UUFHQSxJQUFBLGlCQUFBOztRQUVBLE9BQUEsT0FBQTtZQUNBLE1BQUE7Ozs7UUFJQSxPQUFBLFNBQUE7O1FBRUEsT0FBQSxjQUFBOztRQUVBLE9BQUEsTUFBQTs7WUFFQSxPQUFBOzs7O1FBSUEsT0FBQSxjQUFBOztRQUVBLElBQUEsT0FBQSxVQUFBLE9BQUE7WUFDQSxJQUFBO1lBQ0EsSUFBQSxVQUFBLFVBQUEsVUFBQTs7Z0JBRUEsSUFBQSxTQUFBLFNBQUEsR0FBQTtvQkFDQSxVQUFBLE9BQUE7b0JBQ0EsT0FBQSxjQUFBO29CQUNBLGVBQUEsU0FBQTtvQkFDQSxPQUFBLE9BQUEsS0FBQTtvQkFDQSxJQUFBLFFBQUE7Ozs7WUFJQSxJQUFBLFFBQUEsVUFBQSxVQUFBO2dCQUNBLFVBQUEsT0FBQTtnQkFDQSxPQUFBLGNBQUE7Z0JBQ0EsSUFBQSxTQUFBLFdBQUEsS0FBQTtvQkFDQSxJQUFBLE9BQUE7dUJBQ0E7b0JBQ0EsSUFBQSxjQUFBOzs7O1lBSUEsSUFBQSxRQUFBLFlBQUE7Z0JBQ0Esa0JBQUEsSUFBQSxDQUFBLGFBQUEsT0FBQSxZQUFBLE9BQUEsUUFBQSxTQUFBOzs7O1lBSUEsVUFBQSxVQUFBLE9BQUE7OztRQUdBLE9BQUEsY0FBQSxZQUFBO1lBQ0EsY0FBQSxDQUFBO1lBQ0EsSUFBQSxhQUFBOztnQkFFQSxrQkFBQSxNQUFBLENBQUEsYUFBQSxPQUFBLGFBQUEsVUFBQSxPQUFBO29CQUNBLE9BQUEsU0FBQTs7Ozs7UUFLQSxPQUFBLGtCQUFBLFlBQUE7O1lBRUEsSUFBQSxPQUFBLGFBQUE7OztZQUdBLElBQUEsUUFBQSxPQUFBLElBQUEsTUFBQSxVQUFBOztZQUVBLElBQUEsVUFBQSxZQUFBO2dCQUNBLE9BQUEsY0FBQTtnQkFDQSxLQUFBOzs7WUFHQSxJQUFBLFFBQUEsVUFBQSxVQUFBO2dCQUNBLElBQUEsU0FBQSxXQUFBLEtBQUE7b0JBQ0EsSUFBQSxRQUFBO3VCQUNBO29CQUNBLElBQUEsY0FBQTs7OztZQUlBLGtCQUFBLFFBQUEsQ0FBQSxhQUFBLE9BQUEsYUFBQSxDQUFBLE9BQUEsUUFBQSxTQUFBOzs7UUFHQSxPQUFBLFNBQUEsVUFBQSxPQUFBO1lBQ0EsSUFBQSxVQUFBLE9BQUEsYUFBQTs7Z0JBRUEsT0FBQTtnQkFDQSxPQUFBLGNBQUE7Z0JBQ0E7OztZQUdBLElBQUEsZUFBQSxXQUFBLFdBQUE7O2dCQUVBLE9BQUEsa0JBQUEsZUFBQTtnQkFDQSxPQUFBLGNBQUE7bUJBQ0E7Z0JBQ0EsSUFBQSxVQUFBLFVBQUEsVUFBQTtvQkFDQSxlQUFBLFNBQUE7b0JBQ0EsT0FBQSxrQkFBQTtvQkFDQSxPQUFBLGNBQUE7OztnQkFHQSxrQkFBQSxJQUFBLENBQUEsYUFBQSxPQUFBLFlBQUEsT0FBQSxRQUFBLFNBQUEsSUFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQzdGQSxRQUFBLE9BQUEsa0JBQUEsUUFBQSwwQ0FBQSxVQUFBLFdBQUEsS0FBQTtJQUNBOztJQUVBLE9BQUEsVUFBQSxNQUFBLDZEQUFBLElBQUE7UUFDQSxLQUFBLENBQUEsUUFBQSxPQUFBLFNBQUE7UUFDQSxTQUFBLENBQUEsUUFBQTs7O0FBR0EiLCJmaWxlIjoidHJhbnNlY3RzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbmFtZXNwYWNlIGRpYXMudHJhbnNlY3RzXG4gKiBAbmdkb2MgY29udHJvbGxlclxuICogQG5hbWUgQ29sb3JTb3J0Q29udHJvbGxlclxuICogQG1lbWJlck9mIGRpYXMudHJhbnNlY3RzXG4gKiBAZGVzY3JpcHRpb24gR2xvYmFsIGNvbnRyb2xsZXIgZm9yIHRoZSBjb2xvciBzb3J0IGZlYXR1cmVcbiAqL1xuYW5ndWxhci5tb2R1bGUoJ2RpYXMudHJhbnNlY3RzJykuY29udHJvbGxlcignQ29sb3JTb3J0Q29udHJvbGxlcicsIGZ1bmN0aW9uICgkc2NvcGUsIENvbG9yU29ydFNlcXVlbmNlLCAkaW50ZXJ2YWwsIG1zZykge1xuICAgICAgICBcInVzZSBzdHJpY3RcIjtcblxuICAgICAgICB2YXIgcG9wb3Zlck9wZW4gPSBmYWxzZTtcblxuICAgICAgICAvLyBzdG9yZXMgYWxsIHNvcnRpbmcgc2VxdWVuY2UgYXJyYXlzIHdpdGggdGhlIHJlbGF0ZWQgY29sb3JzIGFzIGtleXNcbiAgICAgICAgdmFyIHNlcXVlbmNlc0NhY2hlID0ge307XG5cbiAgICAgICAgJHNjb3BlLnNob3cgPSB7XG4gICAgICAgICAgICBoZWxwOiBmYWxzZVxuICAgICAgICB9O1xuXG4gICAgICAgIC8vIGFycmF5IG9mIGFsbCBhdmFpbGFibGUgY29sb3JzXG4gICAgICAgICRzY29wZS5jb2xvcnMgPSBbXTtcblxuICAgICAgICAkc2NvcGUuaXNDb21wdXRpbmcgPSBmYWxzZTtcblxuICAgICAgICAkc2NvcGUubmV3ID0ge1xuICAgICAgICAgICAgLy8gY3VycmVudGx5IHNlbGVjdGVkIGNvbG9yIGluIHRoZSAnY29tcHV0ZSBuZXcnIGZvcm1cbiAgICAgICAgICAgIGNvbG9yOiAnIzAwMDAwMCdcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBjdXJyZW50bHkgYWN0aXZlIGNvbG9yIGZvciBzb3J0aW5nXG4gICAgICAgICRzY29wZS5hY3RpdmVDb2xvciA9ICcnO1xuXG4gICAgICAgIHZhciBwb2xsID0gZnVuY3Rpb24gKGNvbG9yKSB7XG4gICAgICAgICAgICB2YXIgcHJvbWlzZTtcbiAgICAgICAgICAgIHZhciBzdWNjZXNzID0gZnVuY3Rpb24gKHNlcXVlbmNlKSB7XG4gICAgICAgICAgICAgICAgLy8gVE9ETyB3aGF0IGlmIHRoZSB0cmFuc2VjdCBfaXNfIGVtcHR5P1xuICAgICAgICAgICAgICAgIGlmIChzZXF1ZW5jZS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICRpbnRlcnZhbC5jYW5jZWwocHJvbWlzZSk7XG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5pc0NvbXB1dGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICBzZXF1ZW5jZXNDYWNoZVtjb2xvcl0gPSBzZXF1ZW5jZTtcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmNvbG9ycy5wdXNoKGNvbG9yKTtcbiAgICAgICAgICAgICAgICAgICAgbXNnLnN1Y2Nlc3MoJ1RoZSBuZXcgY29sb3IgaXMgbm93IGF2YWlsYWJsZSBmb3Igc29ydGluZy4nKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB2YXIgZXJyb3IgPSBmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAkaW50ZXJ2YWwuY2FuY2VsKHByb21pc2UpO1xuICAgICAgICAgICAgICAgICRzY29wZS5pc0NvbXB1dGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZS5zdGF0dXMgPT09IDQwNCkge1xuICAgICAgICAgICAgICAgICAgICBtc2cuZGFuZ2VyKCdUaGUgQ09QUklBIHBpcGVsaW5lIGZvciBjb21wdXRpbmcgYSBuZXcgY29sb3Igc29ydCBzZXF1ZW5jZSBmYWlsZWQuJyk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgbXNnLnJlc3BvbnNlRXJyb3IocmVzcG9uc2UpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHZhciBjaGVjayA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBDb2xvclNvcnRTZXF1ZW5jZS5nZXQoe3RyYW5zZWN0X2lkOiAkc2NvcGUudHJhbnNlY3RJZCwgY29sb3I6IGNvbG9yfSwgc3VjY2VzcywgZXJyb3IpO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgLy8gcG9sbCBldmVyeSA1IHNlY29uZHNcbiAgICAgICAgICAgIHByb21pc2UgPSAkaW50ZXJ2YWwoY2hlY2ssIDUwMDApO1xuICAgICAgICB9O1xuXG4gICAgICAgICRzY29wZS5vcGVuUG9wb3ZlciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHBvcG92ZXJPcGVuID0gIXBvcG92ZXJPcGVuO1xuICAgICAgICAgICAgaWYgKHBvcG92ZXJPcGVuKSB7XG4gICAgICAgICAgICAgICAgLy8gcmVmcmVzaCB0aGUgbGlzdCBvZiBhdmFpbGFibGUgY29sb3JzIGV2ZXJ5IHRpbWUgdGhlIHBvcG92ZXIgaXMgb3BlbmVkXG4gICAgICAgICAgICAgICAgQ29sb3JTb3J0U2VxdWVuY2UucXVlcnkoe3RyYW5zZWN0X2lkOiAkc2NvcGUudHJhbnNlY3RJZH0sIGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuY29sb3JzID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgJHNjb3BlLnJlcXVlc3ROZXdDb2xvciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIC8vIGRvbid0IGFjY2VwdCBuZXcgcmVxdWVzdCB3aGlsZSB0aGUgb2xkIG9uZSBpcyBzdGlsbCBjb21wdXRpbmdcbiAgICAgICAgICAgIGlmICgkc2NvcGUuaXNDb21wdXRpbmcpIHJldHVybjtcblxuICAgICAgICAgICAgLy8gb21pdCB0aGUgJyMnIGF0IHRoZSBiZWdpbm5pbmcgb2YgdGhlIGhleCBjb2xvclxuICAgICAgICAgICAgdmFyIGNvbG9yID0gJHNjb3BlLm5ldy5jb2xvci5zdWJzdHJpbmcoMSk7XG5cbiAgICAgICAgICAgIHZhciBzdWNjZXNzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICRzY29wZS5pc0NvbXB1dGluZyA9IHRydWU7XG4gICAgICAgICAgICAgICAgcG9sbChjb2xvcik7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB2YXIgZXJyb3IgPSBmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2Uuc3RhdHVzID09PSA0MDUpIHtcbiAgICAgICAgICAgICAgICAgICAgbXNnLndhcm5pbmcoJ1RoaXMgY29sb3IgaXMgYWxyZWFkeSBhdmFpbGFibGUgKG9yIHN0aWxsIGNvbXB1dGluZykuJyk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgbXNnLnJlc3BvbnNlRXJyb3IocmVzcG9uc2UpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIENvbG9yU29ydFNlcXVlbmNlLnJlcXVlc3Qoe3RyYW5zZWN0X2lkOiAkc2NvcGUudHJhbnNlY3RJZH0sIHtjb2xvcjogY29sb3J9LCBzdWNjZXNzLCBlcnJvcik7XG4gICAgICAgIH07XG5cbiAgICAgICAgJHNjb3BlLnNvcnRCeSA9IGZ1bmN0aW9uIChjb2xvcikge1xuICAgICAgICAgICAgaWYgKGNvbG9yID09PSAkc2NvcGUuYWN0aXZlQ29sb3IpIHtcbiAgICAgICAgICAgICAgICAvLyBpZiBjb2xvciB3YXMgY2xpY2tlZCB0d2ljZSwgcmVzZXQvdW5zZWxlY3RcbiAgICAgICAgICAgICAgICAkc2NvcGUuc2V0SW1hZ2VzU2VxdWVuY2UoKTtcbiAgICAgICAgICAgICAgICAkc2NvcGUuYWN0aXZlQ29sb3IgPSAnJztcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChzZXF1ZW5jZXNDYWNoZVtjb2xvcl0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIC8vIGNhbGwgdHJhbnNlY3QgY29udHJvbGxlciBmdW5jdGlvblxuICAgICAgICAgICAgICAgICRzY29wZS5zZXRJbWFnZXNTZXF1ZW5jZShzZXF1ZW5jZXNDYWNoZVtjb2xvcl0pO1xuICAgICAgICAgICAgICAgICRzY29wZS5hY3RpdmVDb2xvciA9IGNvbG9yO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB2YXIgc3VjY2VzcyA9IGZ1bmN0aW9uIChzZXF1ZW5jZSkge1xuICAgICAgICAgICAgICAgICAgICBzZXF1ZW5jZXNDYWNoZVtjb2xvcl0gPSBzZXF1ZW5jZTtcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLnNldEltYWdlc1NlcXVlbmNlKHNlcXVlbmNlKTtcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmFjdGl2ZUNvbG9yID0gY29sb3I7XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIENvbG9yU29ydFNlcXVlbmNlLmdldCh7dHJhbnNlY3RfaWQ6ICRzY29wZS50cmFuc2VjdElkLCBjb2xvcjogY29sb3J9LCBzdWNjZXNzLCBtc2cucmVzcG9uc2VFcnJvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfVxuKTtcbiIsIi8qKlxuICogQG5nZG9jIGZhY3RvcnlcbiAqIEBuYW1lIENvbG9yU29ydFNlcXVlbmNlXG4gKiBAbWVtYmVyT2YgZGlhcy50cmFuc2VjdHNcbiAqIEBkZXNjcmlwdGlvbiBQcm92aWRlcyB0aGUgcmVzb3VyY2UgZm9yIGNvbG9yIHNvcnQgc2VxdWVuY2VzLlxuICogQHJlcXVpcmVzICRyZXNvdXJjZVxuICogQHJldHVybnMge09iamVjdH0gQSBuZXcgW25nUmVzb3VyY2VdKGh0dHBzOi8vZG9jcy5hbmd1bGFyanMub3JnL2FwaS9uZ1Jlc291cmNlL3NlcnZpY2UvJHJlc291cmNlKSBvYmplY3RcbiAqIEBleGFtcGxlXG4vLyBnZXQgYWxsIGF2YWlsYWJsZSBjb2xvcnNcbnZhciBjb2xvcnMgPSBDb2xvclNvcnRTZXF1ZW5jZS5xdWVyeSh7dHJhbnNlY3RfaWQ6IDF9LCBmdW5jdGlvbiAoKSB7XG4gICBjb25zb2xlLmxvZyhjb2xvcnMpOyAvLyBbXCJiYWRhNTVcIiwgXCJjMGZmZWVcIiwgLi4uXVxufSk7XG4vLyBnZXQgdGhlIHNvcnQgb3JkZXIgKG9mIGltYWdlIElEcykgZm9yIG9uZSBzcGVjaWZpYyBjb2xvclxudmFyIHNlcXVlbmNlID0gQ29sb3JTb3J0U2VxdWVuY2UuZ2V0KHt0cmFuc2VjdF9pZDogMSwgY29sb3I6ICdiYWRhNTUnfSwgZnVuY3Rpb24gKCkge1xuICAgIGNvbnNvbGUubG9nKHNlcXVlbmNlKSA7IC8vIFsyLCAzLCAxLCA0XVxufSk7XG4vLyByZXF1ZXN0IGEgbmV3IGNvbG9yIHNvcnQgc2VxdWVuY2VcbnZhciBzZXF1ZW5jZSA9IENvbG9yU29ydFNlcXVlbmNlLnJlcXVlc3Qoe3RyYW5zZWN0X2lkOiAkc2NvcGUudHJhbnNlY3RJZH0sIHtjb2xvcjogJ2MwZmZlZSd9LCBmdW5jdGlvbiAoKSB7XG4gICAgY29uc29sZS5sb2coc2VxdWVuY2UpOyAvLyB7Y29sb3I6ICdjMGZmZWUnfVxufSk7XG4gKlxuICovXG5hbmd1bGFyLm1vZHVsZSgnZGlhcy50cmFuc2VjdHMnKS5mYWN0b3J5KCdDb2xvclNvcnRTZXF1ZW5jZScsIGZ1bmN0aW9uICgkcmVzb3VyY2UsIFVSTCkge1xuICAgIFwidXNlIHN0cmljdFwiO1xuXG4gICAgcmV0dXJuICRyZXNvdXJjZShVUkwgKyAnL2FwaS92MS90cmFuc2VjdHMvOnRyYW5zZWN0X2lkL2NvbG9yLXNvcnQtc2VxdWVuY2UvOmNvbG9yJywge30sIHtcbiAgICAgICAgZ2V0OiB7bWV0aG9kOiAnR0VUJywgaXNBcnJheTogdHJ1ZX0sXG4gICAgICAgIHJlcXVlc3Q6IHttZXRob2Q6ICdQT1NUJ31cbiAgICB9KTtcbn0pO1xuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9