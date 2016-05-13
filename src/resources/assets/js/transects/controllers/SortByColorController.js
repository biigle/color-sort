/**
 * @namespace dias.transects
 * @ngdoc controller
 * @name SortByColorController
 * @memberOf dias.transects
 * @description Controller for the color sort feature
 */
angular.module('dias.transects').controller('SortByColorController', function ($scope, ColorSortSequence, $interval, msg, TRANSECT_ID, sort) {
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
    }
);
