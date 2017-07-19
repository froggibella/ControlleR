
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

        var orderState = {
            name: 'orders',
            url: '/orders',
            templateUrl: 'html/views/orders.html'
        };
        // activate the previous defined states for the ui.router
        $stateProvider.state(revenueState);
        $stateProvider.state(orderState);
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

        $scope.meanChartDataOrders = [];

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

        function fillSelectBoxOrders() {
            $scope.selectedMonthsOrders =[];
            for(var i= 0; i < allPredictedOrders.length; i++) {
                // fill selectbox with unique values
                if (!$scope.selectedMonthsOrders.includes(allPredictedOrders[i].previous_month + " " + allPredictedOrders[i].previous_year)) {
                    $scope.selectedMonthsOrders.push(allPredictedOrders[i].previous_month + " " + allPredictedOrders[i].previous_year);
                }
            }
            // get first entry from list as first selected value
            $scope.selectedMonthsOrder = $scope.selectedMonthsOrders[0];
        }

        $scope.aggregateDataSet = function(selectedMonth, go_past, go_future) {
            // angular copy needed for call by value instead of call by reference
            if(go_past ==  undefined){
                go_past =  5

            };
            if(go_future ==  undefined){
                go_future =  8
            };
            console.log(allPredictedOrders)

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
                    $scope.filteredPredictedRevenues[i].netRevenue = $scope.filteredRevenues[i].net_revenue;
                }
            }

            $scope.meanChartData = [[],[],[],[],[],[]];
            $scope.meanChartLabels =[];
              var l= 0;
              var k = 0;
              var j =  selectedRevenue - go_past +1;
            for(i=0; i < (go_past + go_future) ; i++){
                if(go_past == 0 ) {
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


        $scope.aggregateDataSetOrders = function(selectedMonthsOrder, go_past, go_future) {
            // angular copy needed for call by value instead of call by reference
            if(go_past ==  undefined){
                go_past =  5
            };
            if(go_future ==  undefined){
                go_future =  5
            };

            $scope.filteredPredictedOrders = angular.copy(allPredictedOrders);
            $scope.filteredOrders = angular.copy(allOrders);

            var createdDate  = new Date(selectedMonthsOrder.split(" ")[1], selectedMonthsOrder.split(" ")[0]);
            var selectedOrder = 0
            // filter for relevant orders
            for(var i = $scope.filteredOrders.length - 1; i >= 0; i--) {
                var tempDate =  new Date($scope.filteredOrders[i].iso_year, $scope.filteredOrders[i].iso_month_in_year)
                if(tempDate.getTime() <= createdDate.getTime()) {
                    //delete from array:
                    $scope.filteredOrders.splice(i, 1);
                }
                if (createdDate.getTime() === tempDate.getTime()){
                    selectedOrder = i;
                }
            }
            // filter for relevant prediction
            for(var i = $scope.filteredPredictedOrders.length - 1; i >= 0; i--) {
                if($scope.filteredPredictedOrders[i].previous_month + " " + $scope.filteredPredictedOrders[i].previous_year !== selectedMonthsOrder) {
                    //delete from array:
                    $scope.filteredPredictedOrders.splice(i, 1);
                }
            }
            // adding orders to prediction if exists
            for(var i = 0;i < $scope.filteredPredictedOrders.length; i++) {
                if ($scope.filteredOrders[i] === undefined) {
                    $scope.filteredPredictedOrders[i].number_of_orders = undefined
                }
                else {
                    $scope.filteredPredictedOrders[i].number_of_orders = $scope.filteredOrders[i].number_of_orders;
                }
            }

            $scope.meanChartDataOrders = [[],[],[],[],[],[]];
            $scope.meanChartLabelsOrders =[];
            var l= 0;
            var k = 0;
            var j =  selectedOrder - go_past +1;
            for(i=0; i < (go_past + go_future) ; i++){
                if(go_past == 0 ) {
                    k = 2;
                }
                if(allOrders[j] !== undefined){
                    $scope.meanChartDataOrders[0].push(allOrders[j].number_of_orders);
                    if($scope.filteredPredictedOrders[0].previous_year == allOrders[j].iso_year
                        & $scope.filteredPredictedOrders[0].previous_month == allOrders[j].iso_month_in_year) {
                        k= 1;
                    }
                }
                else   {
                    $scope.meanChartDataOrders[0].push(undefined);

                }
                if(k== 2){
                    if($scope.filteredPredictedOrders[l] !== undefined) {
                        $scope.meanChartDataOrders[1].push($scope.filteredPredictedOrders[l].mean);
                        $scope.meanChartDataOrders[2].push($scope.filteredPredictedOrders[l].low_80);
                        $scope.meanChartDataOrders[3].push($scope.filteredPredictedOrders[l].high_80);
                        $scope.meanChartDataOrders[4].push($scope.filteredPredictedOrders[l].low_95);
                        $scope.meanChartDataOrders[5].push($scope.filteredPredictedOrders[l].high_95);
                        $scope.meanChartLabelsOrders.push($scope.filteredPredictedOrders[l].predicted_months + " ")
                    }
                    else{
                        $scope.meanChartDataOrders[1].push(undefined);
                        $scope.meanChartDataOrders[2].push(undefined);
                        $scope.meanChartDataOrders[3].push(undefined);
                        $scope.meanChartDataOrders[4].push(undefined);
                        $scope.meanChartDataOrders[5].push(undefined);
                    }
                    l++;
                }
                else {$scope.meanChartDataOrders[1].push(undefined);
                    $scope.meanChartDataOrders[2].push(undefined);
                    $scope.meanChartDataOrders[3].push(undefined);
                    $scope.meanChartDataOrders[4].push(undefined);
                    $scope.meanChartDataOrders[5].push(undefined);
                    if(allOrders[j] !== undefined){$scope.meanChartLabelsOrders.push(allOrders[j].yyyy_mm + " ")};
                    if (k == 1) {k=2} }
                j++;
            };
        };


        var allRevenues;
        var allPredictedRevenues;
        var allPredictedOrders;
        var allOrders;

        function getDataFromServer() {
            var dataPromises = [];

            // fill the promise array with promises
            dataPromises.push($http.get('api/predictedRevenues').then(function(response) {
                allPredictedRevenues = response.data.data;
            }));
            // ajax call -> gets data from node server via http (REST)
            dataPromises.push(
                $http.get('api/revenues').then(function(response) {
                    allRevenues = response.data.data;
                })
            );

            dataPromises.push($http.get('api/predictedOrders').then(function(response) {
                allPredictedOrders = response.data.data;
            }));
            // ajax call -> gets data from node server via http (REST)
            dataPromises.push(
                $http.get('api/orders').then(function(response) {
                    allOrders = response.data.data;
                })
            );

            // $q is the promise library from angular. Provides a function that waits for all given promises (.all())
            return $q.all(dataPromises);
        }

        getDataFromServer().then(function () {
            fillSelectBox();
            fillSelectBoxOrders();
            $scope.aggregateDataSet($scope.selectedMonth);
        })

    }]);




