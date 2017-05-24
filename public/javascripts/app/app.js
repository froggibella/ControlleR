
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
            for(var i= 0; i < $scope.predictedRevenues.length; i++) {
                // fill selectbox with unique values
                if (!$scope.previousMonths.includes($scope.predictedRevenues[i].previous_month + " " + $scope.predictedRevenues[i].previous_year)) {
                    $scope.previousMonths.push($scope.predictedRevenues[i].previous_month + " " + $scope.predictedRevenues[i].previous_year);
                }
            }
            $scope.previousMonth = $scope.previousMonths[0];
        }

        $scope.filterList = function(previousMonth) {
            $scope.filteredPredictedRevenues = angular.copy($scope.predictedRevenues);
            for(var i = $scope.filteredPredictedRevenues.length - 1; i >= 0; i--) {
                if($scope.filteredPredictedRevenues[i].previous_month + " " + $scope.filteredPredictedRevenues[i].previous_year !== previousMonth) {
                    $scope.filteredPredictedRevenues.splice(i, 1);
                }
            }
            for(var i = $scope.filteredPredictedRevenues.length - 1; i >= 0; i--) {
                if($scope.filteredPredictedRevenues[i].previous_month + " " + $scope.filteredPredictedRevenues[i].previous_year !== previousMonth) {
                    $scope.filteredPredictedRevenues.splice(i, 1);
                }
            }
            setChartData();
        };

        function setChartData() {
            console.log($scope.filteredPredictedRevenues);
            $scope.meanChartData = [[],[],[],[],[]];
            $scope.meanChartLabels =[];
            for(var i= 0; i < $scope.filteredPredictedRevenues.length; i++){
                $scope.meanChartData[0].push($scope.filteredPredictedRevenues[i].mean);
                $scope.meanChartData[1].push($scope.filteredPredictedRevenues[i].low_80);
                $scope.meanChartData[2].push($scope.filteredPredictedRevenues[i].high_80);
                $scope.meanChartData[3].push($scope.filteredPredictedRevenues[i].low_95);
                $scope.meanChartData[4].push($scope.filteredPredictedRevenues[i].high_95);
                $scope.meanChartLabels.push($scope.filteredPredictedRevenues[i].predicted_months + " ")
            }
        }


        $http.get('api/predictedRevenues').then(function(response) {
            console.log(response);
            $scope.predictedRevenues = response.data.data;
            $scope.meanChartData = [];
            $scope.previousMonths =[];
            $scope.meanChartLabels =[];

            fillSelectBox($scope.predictedRevenues);
            $scope.filterList($scope.previousMonth);
        });



        $http.get('api/revenues').then(function(response) {
            console.log(response.data.data);
            console.log($scope.previousMonth);
            $scope.revenues = response.data.data;

            for(var i= 0; i < $scope.revenues.length; i++){
                var date = $scope.revenues[i].yyyy_mm.split('-');
                var year= date[0];
                var month = date[1];
                if(month.charAt(0) === "0"){
                    month = month.substr(1)
                }
                console.log(month + " " + year);
            }


            //$scope.meanChartData[4].push($scope.filteredPredictedRevenues[i].high_95);
        });


    }]);




