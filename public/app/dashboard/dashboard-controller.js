angular.module('ControlR').controller('DashboardController', ['$scope','$state', '$http', '$q', function($scope,$state, $http, $q) {

    function getDataFromServer() {
        var dataPromises = [];
        dataPromises.push($http.get('api/predictedOrders/latest').then(function(response) {
            $scope.latestPredictedOrders = response.data.data[0];
        }));
        // ajax call -> gets data from node server via http (REST)
        dataPromises.push($http.get('api/orders/latest').then(function(response) {
                $scope.latestOrders = response.data.data[0];
        }));
        dataPromises.push($http.get('api/predictedRevenues/latest').then(function(response) {
            $scope.latestPredictedRevenues = response.data.data[0];
        }));
        dataPromises.push($http.get('api/revenues/latest').then(function(response) {
            $scope.latestRevenues = response.data.data[0];
        }));

        dataPromises.push($http.get('api/predictedOrders/current').then(function(response) {
            $scope.currentPredictedOrders = response.data.data[0];
        }));
        dataPromises.push($http.get('api/orders/current').then(function(response) {
            $scope.currentOrders = response.data.data[0];
        }));
        dataPromises.push($http.get('api/predictedRevenues/current').then(function(response) {
            $scope.currentPredictedRevenues = response.data.data[0];
        }));
        dataPromises.push($http.get('api/revenues/current').then(function(response) {
            $scope.currentRevenues = response.data.data[0];
        }));
        // $q is the promise library from angular. Provides a function that waits for all given promises (.all())
        return $q.all(dataPromises);
    }

    getDataFromServer();

    }]);