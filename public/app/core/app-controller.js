angular.module('ControlR').controller('MainController', ['$scope', function($scope) {
    $scope.product = {
        'name': 'ControlR'
    };

    $scope.user = {
        'foreName': "Beatrice",
        'lastName': "Hildobrandt",
        'username': "ladyHildo"
    };
}]);