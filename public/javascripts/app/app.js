
// define angular module/app "ControlR". This module depends on the ui.router module
// the script of this module is mentioned in the index.js

angular.module('ControlR',['ui.router', 'chart.js'])

    // config block for the previous defined "ControlR" module
    .config(function($stateProvider) {

        // define states for the ui.router as variable
        var revenueState = {
            name: 'revenue',
            url: '/revenue',
            templateUrl: 'html/views/revenue.html'
        };

        var dashboardState = {
            name: 'dashboard',
            url: '/',
            templateUrl: 'html/views/dashboard.html'
        };

        // activate the previous defined states for the ui.router
        $stateProvider.state(revenueState);
        $stateProvider.state(dashboardState);
    })


    // one controller for the "ControlR" module
    // this controller is linked by the HTML attribute "ng-controller='MainController'"
    .controller('MainController', ['$scope','$state', '$http', function($scope,$state, $http) {
        $scope.product = {
            'name': 'ControlR'
        };

        $scope.user = {
            'foreName': "Beatrice",
            'lastName': "Hildobrandt",
            'username': "ladyHildo"
        };

        $scope.meanChartData = [];
        $scope.chartColors = [
            {borderColor:'#3109B2', fill:false/* this option hide background-color */},
            {borderColor:'#00BF3A', fill:false},
            {borderColor:'#00BF3A', fill:false},
            {borderColor:'#FF2300', fill:false},
            {borderColor:'#FF2300', fill:false}];
        $scope.meanChartOptions = {
            elements: { point: { radius: 0 } }
        };

        $scope.onClick = function (points, evt) {
            console.log(points, evt);
        };


        function fillSelectBox() {
            $scope.previousMonths =[];
            for(var i= 0; i < $scope.list.length; i++) {
                // fill selectbox with unique values
                if (!$scope.previousMonths.includes($scope.list[i].previous_month + " " + $scope.list[i].previous_year)) {
                    $scope.previousMonths.push($scope.list[i].previous_month + " " + $scope.list[i].previous_year);
                }
            }
            $scope.previousMonth = $scope.previousMonths[0];
        }

        $scope.filterList = function(previousMonth) {
            $scope.filteredList = angular.copy($scope.list);
            for(var i = $scope.filteredList.length - 1; i >= 0; i--) {
                if($scope.filteredList[i].previous_month + " " + $scope.filteredList[i].previous_year !== previousMonth) {
                    $scope.filteredList.splice(i, 1);
                }
            }
            setChartData();
        };

        function setChartData() {
            console.log($scope.filteredList);
            $scope.meanChartData = [[],[],[],[],[]];
            $scope.meanChartLabels =[];
            for(var i= 0; i < $scope.filteredList.length; i++){
                $scope.meanChartData[0].push($scope.filteredList[i].mean);
                $scope.meanChartData[1].push($scope.filteredList[i].low_80);
                $scope.meanChartData[2].push($scope.filteredList[i].high_80);
                $scope.meanChartData[3].push($scope.filteredList[i].low_95);
                $scope.meanChartData[4].push($scope.filteredList[i].high_95);
                $scope.meanChartLabels.push($scope.filteredList[i].predicted_months + " ")
            }
            console.log($scope.meanChartData)
        }


        $http.get('api/all').then(function(response) {
            console.log(response)
            $scope.list = response.data.data;
            $scope.meanChartData = [];
            $scope.previousMonths =[];
            $scope.meanChartLabels =[];

            fillSelectBox($scope.list);
            $scope.filterList($scope.previousMonth);
        });


    }]);




