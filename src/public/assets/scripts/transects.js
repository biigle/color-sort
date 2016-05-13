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

/**
 * @namespace dias.transects
 * @ngdoc controller
 * @name SortByColorController
 * @memberOf dias.transects
 * @description Controller for the color sort feature
 */
angular.module('dias.transects').controller('SortByColorController', ["$scope", "ColorSortSequence", "$interval", "msg", "TRANSECT_ID", "sort", function ($scope, ColorSortSequence, $interval, msg, TRANSECT_ID, sort) {
        "use strict";

        var id = 'color-';
        var colorsCacheKey = 'color-colors';
        var sequenceCacheKey = 'color-sequence-';
        var activeColorCacheKey = 'color-active';

        var fetchingColors = false;

        if (!$scope.hasCache(colorsCacheKey)) {
            fetchingColors = true;
            $scope.setCache(colorsCacheKey, ColorSortSequence.query({transect_id: TRANSECT_ID}, function () {
                fetchingColors = false;
            }));
        }

        var availableColors = $scope.getCache(colorsCacheKey);

        var colorSequenceLoaded = function () {
            $scope.setLoading(false);
        };

        $scope.toggle = function (color) {
            var sequenceId = id + color;
            if ($scope.active(sequenceId)) return;

            var key = sequenceCacheKey + color;
            if (!$scope.hasCache(key)) {
                $scope.setLoading(true);
                $scope.setCache(key, ColorSortSequence.get({transect_id: TRANSECT_ID, color: color}, colorSequenceLoaded, msg.responseError));
            }

            $scope.getCache(key).$promise.then(function (s) {
                $scope.activateSorter(sequenceId, s);
            });
        };

        $scope.active = function (color) {
            if (color) {
                return sort.isSorterActive(id + color);
            }

            for (var i = availableColors.length - 1; i >= 0; i--) {
                if (sort.isSorterActive(id + availableColors[i])) {
                    return true;
                }
            }

            return false;
        };

        $scope.hasColors = function () {
            return availableColors.length > 0;
        };

        $scope.getColors = function () {
            return availableColors;
        };

        $scope.catchClick = function (e) {
            e.preventDefault();
        };

        $scope.isFetchingColors = function () {
            return fetchingColors;
        };
    }]
);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZhY3Rvcmllcy9Db2xvclNvcnRTZXF1ZW5jZS5qcyIsImNvbnRyb2xsZXJzL0NvbG9yU29ydENvbnRyb2xsZXIuanMiLCJjb250cm9sbGVycy9Tb3J0QnlDb2xvckNvbnRyb2xsZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFzQkEsUUFBQSxPQUFBLGtCQUFBLFFBQUEsMENBQUEsVUFBQSxXQUFBLEtBQUE7SUFDQTs7SUFFQSxPQUFBLFVBQUEsTUFBQSw2REFBQSxJQUFBO1FBQ0EsS0FBQSxDQUFBLFFBQUEsT0FBQSxTQUFBO1FBQ0EsU0FBQSxDQUFBLFFBQUE7Ozs7Ozs7Ozs7O0FDcEJBLFFBQUEsT0FBQSxrQkFBQSxXQUFBLDBGQUFBLFVBQUEsUUFBQSxtQkFBQSxXQUFBLEtBQUEsYUFBQTtRQUNBOztRQUVBLElBQUEsY0FBQTs7UUFFQSxJQUFBLDZCQUFBLG9CQUFBLGNBQUE7OztRQUdBLElBQUEsaUJBQUE7O1FBRUEsT0FBQSxPQUFBO1lBQ0EsTUFBQTs7OztRQUlBLE9BQUEsU0FBQTs7UUFFQSxPQUFBLGNBQUE7O1FBRUEsT0FBQSxNQUFBOztZQUVBLE9BQUE7Ozs7UUFJQSxPQUFBLGNBQUE7OztRQUdBLElBQUEsT0FBQSxVQUFBLE9BQUE7WUFDQSxJQUFBO1lBQ0EsSUFBQSxVQUFBLFVBQUEsVUFBQTs7Z0JBRUEsSUFBQSxTQUFBLFNBQUEsR0FBQTtvQkFDQSxVQUFBLE9BQUE7b0JBQ0EsT0FBQSxjQUFBO29CQUNBLGVBQUEsU0FBQTtvQkFDQSxPQUFBLE9BQUEsS0FBQTtvQkFDQSxJQUFBLFFBQUE7Ozs7WUFJQSxJQUFBLFFBQUEsVUFBQSxVQUFBO2dCQUNBLFVBQUEsT0FBQTtnQkFDQSxPQUFBLGNBQUE7Z0JBQ0EsSUFBQSxTQUFBLFdBQUEsS0FBQTtvQkFDQSxJQUFBLE9BQUE7dUJBQ0E7b0JBQ0EsSUFBQSxjQUFBOzs7O1lBSUEsSUFBQSxRQUFBLFlBQUE7Z0JBQ0Esa0JBQUEsSUFB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QUFJQSIsImZpbGUiOiJ0cmFuc2VjdHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBuZ2RvYyBmYWN0b3J5XG4gKiBAbmFtZSBDb2xvclNvcnRTZXF1ZW5jZVxuICogQG1lbWJlck9mIGRpYXMudHJhbnNlY3RzXG4gKiBAZGVzY3JpcHRpb24gUHJvdmlkZXMgdGhlIHJlc291cmNlIGZvciBjb2xvciBzb3J0IHNlcXVlbmNlcy5cbiAqIEByZXF1aXJlcyAkcmVzb3VyY2VcbiAqIEByZXR1cm5zIHtPYmplY3R9IEEgbmV3IFtuZ1Jlc291cmNlXShodHRwczovL2RvY3MuYW5ndWxhcmpzLm9yZy9hcGkvbmdSZXNvdXJjZS9zZXJ2aWNlLyRyZXNvdXJjZSkgb2JqZWN0XG4gKiBAZXhhbXBsZVxuLy8gZ2V0IGFsbCBhdmFpbGFibGUgY29sb3JzXG52YXIgY29sb3JzID0gQ29sb3JTb3J0U2VxdWVuY2UucXVlcnkoe3RyYW5zZWN0X2lkOiAxfSwgZnVuY3Rpb24gKCkge1xuICAgY29uc29sZS5sb2coY29sb3JzKTsgLy8gW1wiYmFkYTU1XCIsIFwiYzBmZmVlXCIsIC4uLl1cbn0pO1xuLy8gZ2V0IHRoZSBzb3J0IG9yZGVyIChvZiBpbWFnZSBJRHMpIGZvciBvbmUgc3BlY2lmaWMgY29sb3JcbnZhciBzZXF1ZW5jZSA9IENvbG9yU29ydFNlcXVlbmNlLmdldCh7dHJhbnNlY3RfaWQ6IDEsIGNvbG9yOiAnYmFkYTU1J30sIGZ1bmN0aW9uICgpIHtcbiAgICBjb25zb2xlLmxvZyhzZXF1ZW5jZSkgOyAvLyBbMiwgMywgMSwgNF1cbn0pO1xuLy8gcmVxdWVzdCBhIG5ldyBjb2xvciBzb3J0IHNlcXVlbmNlXG52YXIgc2VxdWVuY2UgPSBDb2xvclNvcnRTZXF1ZW5jZS5yZXF1ZXN0KHt0cmFuc2VjdF9pZDogVFJBTlNFQ1RfSUR9LCB7Y29sb3I6ICdjMGZmZWUnfSwgZnVuY3Rpb24gKCkge1xuICAgIGNvbnNvbGUubG9nKHNlcXVlbmNlKTsgLy8ge2NvbG9yOiAnYzBmZmVlJ31cbn0pO1xuICpcbiAqL1xuYW5ndWxhci5tb2R1bGUoJ2RpYXMudHJhbnNlY3RzJykuZmFjdG9yeSgnQ29sb3JTb3J0U2VxdWVuY2UnLCBmdW5jdGlvbiAoJHJlc291cmNlLCBVUkwpIHtcbiAgICBcInVzZSBzdHJpY3RcIjtcblxuICAgIHJldHVybiAkcmVzb3VyY2UoVVJMICsgJy9hcGkvdjEvdHJhbnNlY3RzLzp0cmFuc2VjdF9pZC9jb2xvci1zb3J0LXNlcXVlbmNlLzpjb2xvcicsIHt9LCB7XG4gICAgICAgIGdldDoge21ldGhvZDogJ0dFVCcsIGlzQXJyYXk6IHRydWV9LFxuICAgICAgICByZXF1ZXN0OiB7bWV0aG9kOiAnUE9TVCd9XG4gICAgfSk7XG59KTtcbiIsIi8qKlxuICogQG5hbWVzcGFjZSBkaWFzLnRyYW5zZWN0c1xuICogQG5nZG9jIGNvbnRyb2xsZXJcbiAqIEBuYW1lIENvbG9yU29ydENvbnRyb2xsZXJcbiAqIEBtZW1iZXJPZiBkaWFzLnRyYW5zZWN0c1xuICogQGRlc2NyaXB0aW9uIEdsb2JhbCBjb250cm9sbGVyIGZvciB0aGUgY29sb3Igc29ydCBmZWF0dXJlXG4gKi9cbmFuZ3VsYXIubW9kdWxlKCdkaWFzLnRyYW5zZWN0cycpLmNvbnRyb2xsZXIoJ0NvbG9yU29ydENvbnRyb2xsZXInLCBmdW5jdGlvbiAoJHNjb3BlLCBDb2xvclNvcnRTZXF1ZW5jZSwgJGludGVydmFsLCBtc2csIFRSQU5TRUNUX0lEKSB7XG4gICAgICAgIFwidXNlIHN0cmljdFwiO1xuXG4gICAgICAgIHZhciBwb3BvdmVyT3BlbiA9IGZhbHNlO1xuXG4gICAgICAgIHZhciBsb2NhbFN0b3JhZ2VBY3RpdmVDb2xvcktleSA9ICdkaWFzLnRyYW5zZWN0cy4nICsgVFJBTlNFQ1RfSUQgKyAnLmNvbG9yLXNvcnQuYWN0aXZlLWNvbG9yJztcblxuICAgICAgICAvLyBzdG9yZXMgYWxsIHNvcnRpbmcgc2VxdWVuY2UgYXJyYXlzIHdpdGggdGhlIHJlbGF0ZWQgY29sb3JzIGFzIGtleXNcbiAgICAgICAgdmFyIHNlcXVlbmNlc0NhY2hlID0ge307XG5cbiAgICAgICAgJHNjb3BlLnNob3cgPSB7XG4gICAgICAgICAgICBoZWxwOiBmYWxzZVxuICAgICAgICB9O1xuXG4gICAgICAgIC8vIGFycmF5IG9mIGFsbCBhdmFpbGFibGUgY29sb3JzXG4gICAgICAgICRzY29wZS5jb2xvcnMgPSBbXTtcblxuICAgICAgICAkc2NvcGUuaXNDb21wdXRpbmcgPSBmYWxzZTtcblxuICAgICAgICAkc2NvcGUubmV3ID0ge1xuICAgICAgICAgICAgLy8gY3VycmVudGx5IHNlbGVjdGVkIGNvbG9yIGluIHRoZSAnY29tcHV0ZSBuZXcnIGZvcm1cbiAgICAgICAgICAgIGNvbG9yOiAnIzAwMDAwMCdcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBjdXJyZW50bHkgYWN0aXZlIGNvbG9yIGZvciBzb3J0aW5nXG4gICAgICAgICRzY29wZS5hY3RpdmVDb2xvciA9ICcnO1xuXG4gICAgICAgIC8vIHJlZ3VsYXJseSBjaGVjayBpZiBhIHJlcXVlc3RlZCBjb2xvciBpcyBub3cgYXZhaWxhYmxlXG4gICAgICAgIHZhciBwb2xsID0gZnVuY3Rpb24gKGNvbG9yKSB7XG4gICAgICAgICAgICB2YXIgcHJvbWlzZTtcbiAgICAgICAgICAgIHZhciBzdWNjZXNzID0gZnVuY3Rpb24gKHNlcXVlbmNlKSB7XG4gICAgICAgICAgICAgICAgLy8gVE9ETyB3aGF0IGlmIHRoZSB0cmFuc2VjdCBfaXNfIGVtcHR5P1xuICAgICAgICAgICAgICAgIGlmIChzZXF1ZW5jZS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICRpbnRlcnZhbC5jYW5jZWwocHJvbWlzZSk7XG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5pc0NvbXB1dGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICBzZXF1ZW5jZXNDYWNoZVtjb2xvcl0gPSBzZXF1ZW5jZTtcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmNvbG9ycy5wdXNoKGNvbG9yKTtcbiAgICAgICAgICAgICAgICAgICAgbXNnLnN1Y2Nlc3MoJ1RoZSBuZXcgY29sb3IgaXMgbm93IGF2YWlsYWJsZSBmb3Igc29ydGluZy4nKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB2YXIgZXJyb3IgPSBmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAkaW50ZXJ2YWwuY2FuY2VsKHByb21pc2UpO1xuICAgICAgICAgICAgICAgICRzY29wZS5pc0NvbXB1dGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZS5zdGF0dXMgPT09IDQwNCkge1xuICAgICAgICAgICAgICAgICAgICBtc2cuZGFuZ2VyKCdUaGUgQ09QUklBIHBpcGVsaW5lIGZvciBjb21wdXRpbmcgYSBuZXcgY29sb3Igc29ydCBzZXF1ZW5jZSBmYWlsZWQuJyk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgbXNnLnJlc3BvbnNlRXJyb3IocmVzcG9uc2UpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHZhciBjaGVjayA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBDb2xvclNvcnRTZXF1ZW5jZS5nZXQoe3RyYW5zZWN0X2lkOiBUUkFOU0VDVF9JRCwgY29sb3I6IGNvbG9yfSwgc3VjY2VzcywgZXJyb3IpO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgLy8gcG9sbCBldmVyeSA1IHNlY29uZHNcbiAgICAgICAgICAgIHByb21pc2UgPSAkaW50ZXJ2YWwoY2hlY2ssIDUwMDApO1xuICAgICAgICB9O1xuXG4gICAgICAgICRzY29wZS5vcGVuUG9wb3ZlciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHBvcG92ZXJPcGVuID0gIXBvcG92ZXJPcGVuO1xuICAgICAgICAgICAgaWYgKHBvcG92ZXJPcGVuKSB7XG4gICAgICAgICAgICAgICAgLy8gcmVmcmVzaCB0aGUgbGlzdCBvZiBhdmFpbGFibGUgY29sb3JzIGV2ZXJ5IHRpbWUgdGhlIHBvcG92ZXIgaXMgb3BlbmVkXG4gICAgICAgICAgICAgICAgQ29sb3JTb3J0U2VxdWVuY2UucXVlcnkoe3RyYW5zZWN0X2lkOiBUUkFOU0VDVF9JRH0sIGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuY29sb3JzID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gc3VibWl0IGEgbmV3IHJlcXVlc3QgdG8gY29tcHV0ZSBhIGNvbG9yIHNvcnQgc2VxdWVuY2VcbiAgICAgICAgJHNjb3BlLnJlcXVlc3ROZXdDb2xvciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIC8vIGRvbid0IGFjY2VwdCBuZXcgcmVxdWVzdCB3aGlsZSB0aGUgb2xkIG9uZSBpcyBzdGlsbCBjb21wdXRpbmdcbiAgICAgICAgICAgIGlmICgkc2NvcGUuaXNDb21wdXRpbmcpIHJldHVybjtcblxuICAgICAgICAgICAgLy8gb21pdCB0aGUgJyMnIGF0IHRoZSBiZWdpbm5pbmcgb2YgdGhlIGhleCBjb2xvclxuICAgICAgICAgICAgdmFyIGNvbG9yID0gJHNjb3BlLm5ldy5jb2xvci5zdWJzdHJpbmcoMSk7XG5cbiAgICAgICAgICAgIHZhciBzdWNjZXNzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICRzY29wZS5pc0NvbXB1dGluZyA9IHRydWU7XG4gICAgICAgICAgICAgICAgcG9sbChjb2xvcik7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB2YXIgZXJyb3IgPSBmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2Uuc3RhdHVzID09PSA0MDUpIHtcbiAgICAgICAgICAgICAgICAgICAgbXNnLndhcm5pbmcoJ1RoaXMgY29sb3IgaXMgYWxyZWFkeSBhdmFpbGFibGUgKG9yIHN0aWxsIGNvbXB1dGluZykuJyk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgbXNnLnJlc3BvbnNlRXJyb3IocmVzcG9uc2UpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIENvbG9yU29ydFNlcXVlbmNlLnJlcXVlc3Qoe3RyYW5zZWN0X2lkOiBUUkFOU0VDVF9JRH0sIHtjb2xvcjogY29sb3J9LCBzdWNjZXNzLCBlcnJvcik7XG4gICAgICAgIH07XG5cbiAgICAgICAgdmFyIGFjdGl2YXRlQ2FjaGVkQ29sb3IgPSBmdW5jdGlvbiAoY29sb3IpIHtcbiAgICAgICAgICAgIC8vIGNhbGwgdHJhbnNlY3QgY29udHJvbGxlciBmdW5jdGlvblxuICAgICAgICAgICAgJHNjb3BlLnNldEltYWdlc1NlcXVlbmNlKHNlcXVlbmNlc0NhY2hlW2NvbG9yXSk7XG4gICAgICAgICAgICAkc2NvcGUuYWN0aXZlQ29sb3IgPSBjb2xvcjtcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBzb3J0IHRoZSBpbWFnZXMgdXNpbmcgYW4gYXZhaWxhYmxlIGNvbG9yIHNvcnQgc2VxdWVuY2VcbiAgICAgICAgJHNjb3BlLnNvcnRCeSA9IGZ1bmN0aW9uIChjb2xvcikge1xuICAgICAgICAgICAgaWYgKGNvbG9yID09PSAkc2NvcGUuYWN0aXZlQ29sb3IpIHtcbiAgICAgICAgICAgICAgICAvLyBpZiBjb2xvciB3YXMgY2xpY2tlZCB0d2ljZSwgcmVzZXQvdW5zZWxlY3RcbiAgICAgICAgICAgICAgICAkc2NvcGUuc2V0SW1hZ2VzU2VxdWVuY2UoKTtcbiAgICAgICAgICAgICAgICAkc2NvcGUuYWN0aXZlQ29sb3IgPSAnJztcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChzZXF1ZW5jZXNDYWNoZVtjb2xvcl0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIGFjdGl2YXRlQ2FjaGVkQ29sb3IoY29sb3IpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB2YXIgc3VjY2VzcyA9IGZ1bmN0aW9uIChzZXF1ZW5jZSkge1xuICAgICAgICAgICAgICAgICAgICBzZXF1ZW5jZXNDYWNoZVtjb2xvcl0gPSBzZXF1ZW5jZTtcbiAgICAgICAgICAgICAgICAgICAgYWN0aXZhdGVDYWNoZWRDb2xvcihjb2xvcik7XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIENvbG9yU29ydFNlcXVlbmNlLmdldCh7dHJhbnNlY3RfaWQ6IFRSQU5TRUNUX0lELCBjb2xvcjogY29sb3J9LCBzdWNjZXNzLCBtc2cucmVzcG9uc2VFcnJvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gc3RvcmUgdGhlIGN1cnJlbnRseSBhY3RpdmUgY29sb3IgcGVyc2lzdGVudGx5XG4gICAgICAgICRzY29wZS4kd2F0Y2goJ2FjdGl2ZUNvbG9yJywgZnVuY3Rpb24gKGNvbG9yKSB7XG4gICAgICAgICAgICB3aW5kb3cubG9jYWxTdG9yYWdlW2xvY2FsU3RvcmFnZUFjdGl2ZUNvbG9yS2V5XSA9IGNvbG9yO1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyBpbml0aWFsbHkgc2V0IHRoZSBzdG9yZWQgY29sb3IgYXMgYWN0aXZlLlxuICAgICAgICAvLyB3ZSBkb24ndCBuZWVkIHRvIGZldGNoIHRoZSBhY3R1YWwgaW1hZ2VzIHNlcXVlbmNlIGhlcmUgYmVjYXVzZSB0aGF0IGlzIHN0b3JlZCBieVxuICAgICAgICAvLyB0aGUgdHJhbnNlY3QgY29udHJvbGxlci5cbiAgICAgICAgaWYgKHdpbmRvdy5sb2NhbFN0b3JhZ2VbbG9jYWxTdG9yYWdlQWN0aXZlQ29sb3JLZXldKSB7XG4gICAgICAgICAgICAkc2NvcGUuYWN0aXZlQ29sb3IgPSB3aW5kb3cubG9jYWxTdG9yYWdlW2xvY2FsU3RvcmFnZUFjdGl2ZUNvbG9yS2V5XTtcbiAgICAgICAgfVxuICAgIH1cbik7XG4iLCIvKipcbiAqIEBuYW1lc3BhY2UgZGlhcy50cmFuc2VjdHNcbiAqIEBuZ2RvYyBjb250cm9sbGVyXG4gKiBAbmFtZSBTb3J0QnlDb2xvckNvbnRyb2xsZXJcbiAqIEBtZW1iZXJPZiBkaWFzLnRyYW5zZWN0c1xuICogQGRlc2NyaXB0aW9uIENvbnRyb2xsZXIgZm9yIHRoZSBjb2xvciBzb3J0IGZlYXR1cmVcbiAqL1xuYW5ndWxhci5tb2R1bGUoJ2RpYXMudHJhbnNlY3RzJykuY29udHJvbGxlcignU29ydEJ5Q29sb3JDb250cm9sbGVyJywgZnVuY3Rpb24gKCRzY29wZSwgQ29sb3JTb3J0U2VxdWVuY2UsICRpbnRlcnZhbCwgbXNnLCBUUkFOU0VDVF9JRCwgc29ydCkge1xuICAgICAgICBcInVzZSBzdHJpY3RcIjtcblxuICAgICAgICB2YXIgaWQgPSAnY29sb3ItJztcbiAgICAgICAgdmFyIGNvbG9yc0NhY2hlS2V5ID0gJ2NvbG9yLWNvbG9ycyc7XG4gICAgICAgIHZhciBzZXF1ZW5jZUNhY2hlS2V5ID0gJ2NvbG9yLXNlcXVlbmNlLSc7XG4gICAgICAgIHZhciBhY3RpdmVDb2xvckNhY2hlS2V5ID0gJ2NvbG9yLWFjdGl2ZSc7XG5cbiAgICAgICAgdmFyIGZldGNoaW5nQ29sb3JzID0gZmFsc2U7XG5cbiAgICAgICAgaWYgKCEkc2NvcGUuaGFzQ2FjaGUoY29sb3JzQ2FjaGVLZXkpKSB7XG4gICAgICAgICAgICBmZXRjaGluZ0NvbG9ycyA9IHRydWU7XG4gICAgICAgICAgICAkc2NvcGUuc2V0Q2FjaGUoY29sb3JzQ2FjaGVLZXksIENvbG9yU29ydFNlcXVlbmNlLnF1ZXJ5KHt0cmFuc2VjdF9pZDogVFJBTlNFQ1RfSUR9LCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgZmV0Y2hpbmdDb2xvcnMgPSBmYWxzZTtcbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBhdmFpbGFibGVDb2xvcnMgPSAkc2NvcGUuZ2V0Q2FjaGUoY29sb3JzQ2FjaGVLZXkpO1xuXG4gICAgICAgIHZhciBjb2xvclNlcXVlbmNlTG9hZGVkID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgJHNjb3BlLnNldExvYWRpbmcoZmFsc2UpO1xuICAgICAgICB9O1xuXG4gICAgICAgICRzY29wZS50b2dnbGUgPSBmdW5jdGlvbiAoY29sb3IpIHtcbiAgICAgICAgICAgIHZhciBzZXF1ZW5jZUlkID0gaWQgKyBjb2xvcjtcbiAgICAgICAgICAgIGlmICgkc2NvcGUuYWN0aXZlKHNlcXVlbmNlSWQpKSByZXR1cm47XG5cbiAgICAgICAgICAgIHZhciBrZXkgPSBzZXF1ZW5jZUNhY2hlS2V5ICsgY29sb3I7XG4gICAgICAgICAgICBpZiAoISRzY29wZS5oYXNDYWNoZShrZXkpKSB7XG4gICAgICAgICAgICAgICAgJHNjb3BlLnNldExvYWRpbmcodHJ1ZSk7XG4gICAgICAgICAgICAgICAgJHNjb3BlLnNldENhY2hlKGtleSwgQ29sb3JTb3J0U2VxdWVuY2UuZ2V0KHt0cmFuc2VjdF9pZDogVFJBTlNFQ1RfSUQsIGNvbG9yOiBjb2xvcn0sIGNvbG9yU2VxdWVuY2VMb2FkZWQsIG1zZy5yZXNwb25zZUVycm9yKSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICRzY29wZS5nZXRDYWNoZShrZXkpLiRwcm9taXNlLnRoZW4oZnVuY3Rpb24gKHMpIHtcbiAgICAgICAgICAgICAgICAkc2NvcGUuYWN0aXZhdGVTb3J0ZXIoc2VxdWVuY2VJZCwgcyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcblxuICAgICAgICAkc2NvcGUuYWN0aXZlID0gZnVuY3Rpb24gKGNvbG9yKSB7XG4gICAgICAgICAgICBpZiAoY29sb3IpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gc29ydC5pc1NvcnRlckFjdGl2ZShpZCArIGNvbG9yKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IGF2YWlsYWJsZUNvbG9ycy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICAgICAgICAgIGlmIChzb3J0LmlzU29ydGVyQWN0aXZlKGlkICsgYXZhaWxhYmxlQ29sb3JzW2ldKSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfTtcblxuICAgICAgICAkc2NvcGUuaGFzQ29sb3JzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIGF2YWlsYWJsZUNvbG9ycy5sZW5ndGggPiAwO1xuICAgICAgICB9O1xuXG4gICAgICAgICRzY29wZS5nZXRDb2xvcnMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gYXZhaWxhYmxlQ29sb3JzO1xuICAgICAgICB9O1xuXG4gICAgICAgICRzY29wZS5jYXRjaENsaWNrID0gZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgfTtcblxuICAgICAgICAkc2NvcGUuaXNGZXRjaGluZ0NvbG9ycyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBmZXRjaGluZ0NvbG9ycztcbiAgICAgICAgfTtcbiAgICB9XG4pO1xuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
