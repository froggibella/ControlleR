
// define angular module/app "ControlR". This module depends on the ui.router module
// the script of this module is mentioned in the index.js

angular.module('ControlR',['ui.router', 'chart.js', 'rzModule'])

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
    .controller('MainController', ['$scope','$state', '$http', '$q', function($scope,$state, $http, $q) {
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
            {borderColor:'black', fill:false/* this option hide background-color */},
            {borderColor:'#3109B2', fill:false/* this option hide background-color */},
            {borderColor:'#00BF3A', fill:false},
            {borderColor:'#00BF3A', fill:false},
            {borderColor:'#FF2300', fill:false},
            {borderColor:'#FF2300', fill:false}];
        $scope.meanChartOptions = {
            elements: { point: { radius: 0 } }
        };

        function fillSelectBox() {
            $scope.selectedMonths =[];

            for(var i= 0; i < allPredictedRevenues.length; i++) {
                // fill selectbox with unique values
                if (!$scope.selectedMonths.includes(allPredictedRevenues[i].previous_month + " " + allPredictedRevenues[i].previous_year)) {
                    $scope.selectedMonths.push(allPredictedRevenues[i].previous_month + " " + allPredictedRevenues[i].previous_year);
                }
            }
            // get first entry from list as first selected value
            $scope.selectedMonth = $scope.selectedMonths[0];
        }

        $scope.aggregateDataSet = function(selectedMonth) {
            // angular copy needed for call by value instead of call by reference
            $scope.filteredPredictedRevenues = angular.copy(allPredictedRevenues);
            $scope.filteredRevenues = angular.copy(allRevenues);


            var createdDate  = new Date(selectedMonth.split(" ")[1], selectedMonth.split(" ")[0]);
            var selectedRevenue = 0
            // filter for relevant revenue
            for(var i = $scope.filteredRevenues.length - 1; i >= 0; i--) {
                var tempDate =  new Date($scope.filteredRevenues[i].iso_year, $scope.filteredRevenues[i].iso_month_in_year)
                if(tempDate.getTime() <= createdDate.getTime()) {
                    //delete from array:
                    $scope.filteredRevenues.splice(i, 1);
                }
                if (createdDate.getTime() === tempDate.getTime()){
                    selectedRevenue = i;
                }
            }
            // filter for relevant prediction
            for(var i = $scope.filteredPredictedRevenues.length - 1; i >= 0; i--) {
                if($scope.filteredPredictedRevenues[i].previous_month + " " + $scope.filteredPredictedRevenues[i].previous_year !== selectedMonth) {
                    //delete from array:
                    $scope.filteredPredictedRevenues.splice(i, 1);
                }
            }
            // adding net_revenue to prediction if exists
            for(var i = 0;i < $scope.filteredPredictedRevenues.length; i++) {
                if ($scope.filteredRevenues[i] === undefined) {
                    $scope.filteredPredictedRevenues[i].netRevenue = undefined
                }
                else {
                    console.log($scope.filteredRevenues[i].net_revenue);
                    $scope.filteredPredictedRevenues[i].netRevenue = $scope.filteredRevenues[i].net_revenue;
                }
            }

            $scope.meanChartData = [[],[],[],[],[],[]];
            $scope.meanChartLabels =[];
              var l= 0;
              var k = 0;
            $scope.go_past =  10 ;
            $scope.go_future = 6 ;

            var vm = this;
            vm.lastSliderUpdated = '';

            vm.myChangeListener = function(sliderId) {
                //console.log(sliderId, 'has changed with ', vm.slider.value);
                vm.lastSliderUpdated = vm.slider.value;
                $scope.go_past = vm.slider.value;
            };

            vm.slider = {
                value: 36,
                options: {
                    floor: 0,
                    ceil: 36,
                    id: 'sliderA',
                    onChange: vm.myChangeListener
                }
            };

            /*
            $scope.slider = {
                value: 100,
                options: {
                    id: 'slider-id',
                    onChange: function(id) {
                        console.log('on change ' + id); // logs 'on change slider-id'
                    }
                }
            };
            */


              var j =  selectedRevenue - $scope.go_past +1;

            for(i=0; i < ($scope.go_past + $scope.go_future) ; i++){
                if($scope.go_past == 0 ) {
                    k = 2;
                }
                if(allRevenues[j] !== undefined){
                    $scope.meanChartData[0].push(allRevenues[j].net_revenue);
                    if($scope.filteredPredictedRevenues[0].previous_year == allRevenues[j].iso_year
                    & $scope.filteredPredictedRevenues[0].previous_month == allRevenues[j].iso_month_in_year) {
                        k= 1;
                    }
                }
                else   {
                    $scope.meanChartData[0].push(undefined);

                }
                if(k== 2){
                    if($scope.filteredPredictedRevenues[l] !== undefined) {
                        $scope.meanChartData[1].push($scope.filteredPredictedRevenues[l].mean);
                        $scope.meanChartData[2].push($scope.filteredPredictedRevenues[l].low_80);
                        $scope.meanChartData[3].push($scope.filteredPredictedRevenues[l].high_80);
                        $scope.meanChartData[4].push($scope.filteredPredictedRevenues[l].low_95);
                        $scope.meanChartData[5].push($scope.filteredPredictedRevenues[l].high_95);
                        $scope.meanChartLabels.push($scope.filteredPredictedRevenues[l].predicted_months + " ")
                    }
                    else{
                        $scope.meanChartData[1].push(undefined);
                        $scope.meanChartData[2].push(undefined);
                        $scope.meanChartData[3].push(undefined);
                        $scope.meanChartData[4].push(undefined);
                        $scope.meanChartData[5].push(undefined);
                    }
                    l++;
                }
                else {$scope.meanChartData[1].push(undefined);
                    $scope.meanChartData[2].push(undefined);
                    $scope.meanChartData[3].push(undefined);
                    $scope.meanChartData[4].push(undefined);
                    $scope.meanChartData[5].push(undefined);
                    if(allRevenues[j] !== undefined){$scope.meanChartLabels.push(allRevenues[j].yyyy_mm + " ")};
                    if (k == 1) {k=2} }
            j++;
            };
        };

        var allRevenues;
        var allPredictedRevenues;

        function getDataFromServer() {
            var dataPromises = [];

            // fill the promise array with promises
            dataPromises.push($http.get('api/predictedRevenues').then(function(response) {
                allPredictedRevenues = response.data.data;
            }));

            dataPromises.push(// ajax call -> gets data from node server via http (REST)
                $http.get('api/revenues').then(function(response) {
                    allRevenues = response.data.data;
                })
            );

            // $q is the promise library from angular. Provides a function that waits for all given promises (.all())
            return $q.all(dataPromises);
        }

        getDataFromServer().then(function () {
            fillSelectBox();
            $scope.aggregateDataSet($scope.selectedMonth);
        })

    }]);




