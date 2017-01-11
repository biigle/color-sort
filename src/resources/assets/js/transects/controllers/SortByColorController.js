/**
 * @namespace biigle.transects
 * @ngdoc controller
 * @name SortByColorController
 * @memberOf biigle.transects
 * @description Controller for the color sort feature
 */
angular.module('biigle.transects').controller('SortByColorController', function ($scope, ColorSortSequence, $interval, msg, TRANSECT_ID, sort) {
        "use strict";

        var id = 'color-';
        var colorsCacheKey = 'color-colors';
        var sequenceCacheKey = 'color-sequence-';
        var activeColorCacheKey = 'color-active';
        var isComputingCacheKey = 'color-is-computing';

        // interval in ms to poll for a newly requested color
        var pollInterval = 5000;

        var fetchingColors = false;

        if (!$scope.hasCache(colorsCacheKey)) {
            fetchingColors = true;
            $scope.setCache(colorsCacheKey, ColorSortSequence.query({transect_id: TRANSECT_ID}, function () {
                fetchingColors = false;
            }));
        }

        var availableColors = $scope.getCache(colorsCacheKey);

        if (!$scope.hasCache(isComputingCacheKey)) {
            $scope.setCache(isComputingCacheKey, false);
        }

        var setIsComputingNewColor = function (value) {
            $scope.setCache(isComputingCacheKey, value);
        };

        var colorSequenceLoaded = function () {
            $scope.setLoading(false);
        };

        // regularly check if a requested color is now available
        var poll = function (color) {
            var promise;
            var key = sequenceCacheKey + color;

            var success = function (sequence) {
                // TODO what if the transect _is_ empty?
                if (sequence.length > 0) {
                    $interval.cancel(promise);
                    setIsComputingNewColor(false);
                    $scope.setCache(key, sequence);
                    availableColors.push(color);
                    msg.success('The new color is now available for sorting.');
                }
            };

            var error = function (response) {
                $interval.cancel(promise);
                setIsComputingNewColor(false);
                if (response.status === 404) {
                    msg.danger('The COPRIA pipeline for computing a new color sort sequence failed.');
                } else {
                    msg.responseError(response);
                }
            };

            var check = function () {
                ColorSortSequence.get({transect_id: TRANSECT_ID, color: color}, success, error);
            };

            promise = $interval(check, pollInterval);
        };

        $scope.new = {
            color: '#000000'
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

        $scope.isFetchingColors = function () {
            return fetchingColors;
        };

        $scope.isComputingNewColor = function () {
            return $scope.getCache(isComputingCacheKey);
        };

        $scope.canRequestNewColor = function () {
            return !$scope.isFetchingColors() && !$scope.isComputingNewColor();
        };

        $scope.requestNewColor = function () {
            if (!$scope.canRequestNewColor()) return;

            // omit the '#' at the beginning of the hex color
            var color = $scope.new.color.substring(1);

            var success = function () {
                setIsComputingNewColor(true);
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
    }
);
