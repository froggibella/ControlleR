angular.module('ControlR').controller('OrdersController', ['$scope','$state', '$http', '$q', function($scope,$state, $http, $q) {


    $scope.chartColors = [
        {borderColor:'black', fill:false, pointBackgroundColor: 'black'/* this option hide background-color */},
        {borderColor:'#3109B2', fill:false, pointBackgroundColor: '#3109B2'},
        {borderColor:'#00BF3A', fill:false, pointBackgroundColor: '#00BF3A'},
        {borderColor:'#00BF3A', fill:false, pointBackgroundColor: '#00BF3A'},
        {borderColor:'#FF2300', fill:false, pointBackgroundColor: '#FF2300'},
        {borderColor:'#FF2300', fill:false, pointBackgroundColor: '#FF2300'}];
    $scope.chartOptions = {
        elements: {
            point: { radius: 2 }
        },
        legend: {
            display: true,
            position: "bottom",
            labels: {
                usePointStyle: true
            }
        },
        tooltips: {
            callbacks: {
                label: function(tooltipItem, data) {
                    return data.datasets[tooltipItem.datasetIndex].label +': ' +Math.round(tooltipItem.yLabel * 100) / 100 + " €"
                }
            }
        },
        scales: {
            yAxes: [{
                ticks: {
                    userCallback: function (value, index, values) {
                        value = value.toString();
                        value = value.split(/(?=(?:...)*$)/);
                        value = value.join('.');
                        return value + " €";
                    }
                }
            }]
        }
    };
    $scope.chartSeries = ['Revenue', 'Prediction', 'LO 80%', 'HI 80%', 'LO 95%', 'HI 95%'];

    $scope.chartData = [];

    function fillSelectBox() {
        $scope.selectedMonths =[];
        for(var i= 0; i < allPredictedOrders.length; i++) {
            // fill selectbox with unique values
            if (!$scope.selectedMonths.includes(allPredictedOrders[i].previous_month + " " + allPredictedOrders[i].previous_year)) {
                $scope.selectedMonths.push(allPredictedOrders[i].previous_month + " " + allPredictedOrders[i].previous_year);
            }
        }
        // get first entry from list as first selected value
        $scope.selectedMonth = $scope.selectedMonths[0];
    }

    $scope.showPreviousMonths = 1;
    $scope.showNextMonths = 3;

    $scope.aggregateDataSet = function(selectedMonth, go_past, go_future) {

        $scope.filteredPredictedOrders = angular.copy(allPredictedOrders);
        $scope.filteredOrders = angular.copy(allOrders);
        var createdDate  = new Date(selectedMonth.split(" ")[1], selectedMonth.split(" ")[0]);
        var selectedOrder = 0;
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
            if($scope.filteredPredictedOrders[i].previous_month + " " + $scope.filteredPredictedOrders[i].previous_year !== selectedMonth) {
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

        $scope.chartData = [[],[],[],[],[],[]];
        $scope.chartLabels =[];
        var l= 0;
        var k = 0;
        var j =  selectedOrder - go_past +1;
        for(i=0; i < (go_past + go_future) ; i++){
            if(go_past == 0 ) {
                k = 2;
            }
            if(allOrders[j] !== undefined){
                $scope.chartData[0].push(allOrders[j].number_of_orders);
                if($scope.filteredPredictedOrders[0].previous_year == allOrders[j].iso_year
                    & $scope.filteredPredictedOrders[0].previous_month == allOrders[j].iso_month_in_year) {
                    k= 1;
                }
            }
            else   {
                $scope.chartData[0].push(undefined);

            }
            if(k== 2){
                if($scope.filteredPredictedOrders[l] !== undefined) {
                    $scope.chartData[1].push($scope.filteredPredictedOrders[l].mean);
                    $scope.chartData[2].push($scope.filteredPredictedOrders[l].low_80);
                    $scope.chartData[3].push($scope.filteredPredictedOrders[l].high_80);
                    $scope.chartData[4].push($scope.filteredPredictedOrders[l].low_95);
                    $scope.chartData[5].push($scope.filteredPredictedOrders[l].high_95);
                    $scope.chartLabels.push($scope.filteredPredictedOrders[l].predicted_months + " ")
                }
                else{
                    $scope.chartData[1].push(undefined);
                    $scope.chartData[2].push(undefined);
                    $scope.chartData[3].push(undefined);
                    $scope.chartData[4].push(undefined);
                    $scope.chartData[5].push(undefined);
                }
                l++;
            }
            else {$scope.chartData[1].push(undefined);
                $scope.chartData[2].push(undefined);
                $scope.chartData[3].push(undefined);
                $scope.chartData[4].push(undefined);
                $scope.chartData[5].push(undefined);
                if(allOrders[j] !== undefined){$scope.chartLabels.push(allOrders[j].yyyy_mm + " ")};
                if (k == 1) {k=2} }
            j++;
        }
    };

    var allPredictedOrders;
    var allOrders;

    function getDataFromServer() {
        var dataPromises = [];
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
        $scope.aggregateDataSet($scope.selectedMonth, $scope.showPreviousMonths, $scope.showNextMonths);
    })
}]);