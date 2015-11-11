/**
 * @namespace dias.transects
 * @ngdoc controller
 * @name ColorSortController
 * @memberOf dias.transects
 * @description Global controller for the color sort feature
 */
angular.module('dias.transects').controller('ColorSortController', function ($scope, ColorSortSequence, $interval, msg) {
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
    }
);
