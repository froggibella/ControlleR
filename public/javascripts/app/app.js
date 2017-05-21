
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

        $scope.meanChartLabels = ["January", "February", "March", "April", "May", "June", "July"];
        $scope.series = ['Series A', 'Series B'];
        $scope.meanChartData = [
            [65, 59, 80, 81, 56, 55, 40],
            [28, 48, 40, 19, 86, 27, 90]
        ];
        $scope.onClick = function (points, evt) {
            console.log(points, evt);
        };
        $scope.datasetOverride = [{ yAxisID: 'y-axis-1' }, { yAxisID: 'y-axis-2' }];
        $scope.options = {
            scales: {
                yAxes: [
                    {
                        id: 'y-axis-1',
                        type: 'linear',
                        display: true,
                        position: 'left'
                    },
                    {
                        id: 'y-axis-2',
                        type: 'linear',
                        display: true,
                        position: 'right'
                    }
                ]
            }
        };



        function fillChartData(value, list) {

        }



        $http.get('api/all').then(function(response) {

            $scope.list = response.data.data;
            $scope.meanChartData = [];

            $scope.previousMonths =[];
            $scope.meanChartLabels =[];

            for(var i= 0; i < response.data.data.length; i++){


                // fill selectbox with unique values
                if(!$scope.previousMonths.includes(response.data.data[i].previous_month + " " + response.data.data[i].previous_year)){
                    $scope.previousMonths.push(response.data.data[i].previous_month + " " + response.data.data[i].previous_year);
                }

                // select first value from list as selected
                $scope.previousMonth = $scope.previousMonths[0];

                // filter server response
                if(response.data.data[i].previous_month + " " + response.data.data[i].previous_year === $scope.previousMonth){
                    $scope.meanChartData.push(response.data.data[i].mean);
                    $scope.meanChartLabels.push(response.data.data[i].predicted_months + " ")
                }

            }


            console.log($scope.meanChartLabels)

        });

    }]);




