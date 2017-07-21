angular.module('ControlR').controller('RevenueController', ['$scope','$state', '$http', '$q', function($scope,$state, $http, $q) {
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
        for(var i= 0; i < allPredictedRevenues.length; i++) {
            // fill selectbox with unique values
            if (!$scope.selectedMonths.includes(allPredictedRevenues[i].previous_month + " " + allPredictedRevenues[i].previous_year)) {
                $scope.selectedMonths.push(allPredictedRevenues[i].previous_month + " " + allPredictedRevenues[i].previous_year);
            }
        }
        // get first entry from list as first selected value
        $scope.selectedMonth = $scope.selectedMonths[0];
    }

    $scope.showPreviousMonts = 1;
    $scope.showNextMonths = 5;

    $scope.aggregateDataSet = function(selectedMonth, go_past, go_future) {
        // angular copy needed for call by value instead of call by reference
        $scope.filteredPredictedRevenues = angular.copy(allPredictedRevenues);
        $scope.filteredRevenues = angular.copy(allRevenues);

        var createdDate  = new Date(selectedMonth.split(" ")[1], selectedMonth.split(" ")[0]);
        var selectedRevenue = 0;
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

        $scope.chartData = [[],[],[],[],[],[]];
        $scope.chartLabels =[];
        var l= 0;
        var k = 0;
        var j =  selectedRevenue - go_past +1;
        for(i=0; i < (go_past + go_future) ; i++){
            if(go_past == 0 ) {
                k = 2;
            }
            if(allRevenues[j] !== undefined){
                $scope.chartData[0].push(allRevenues[j].net_revenue);
                if($scope.filteredPredictedRevenues[0].previous_year == allRevenues[j].iso_year
                    & $scope.filteredPredictedRevenues[0].previous_month == allRevenues[j].iso_month_in_year) {
                    k= 1;
                }
            }
            else   {
                $scope.chartData[0].push(undefined);

            }
            if(k== 2){
                if($scope.filteredPredictedRevenues[l] !== undefined) {
                    $scope.chartData[1].push($scope.filteredPredictedRevenues[l].mean);
                    $scope.chartData[2].push($scope.filteredPredictedRevenues[l].low_80);
                    $scope.chartData[3].push($scope.filteredPredictedRevenues[l].high_80);
                    $scope.chartData[4].push($scope.filteredPredictedRevenues[l].low_95);
                    $scope.chartData[5].push($scope.filteredPredictedRevenues[l].high_95);
                    $scope.chartLabels.push($scope.filteredPredictedRevenues[l].predicted_months + " ")
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
                if(allRevenues[j] !== undefined){$scope.chartLabels.push(allRevenues[j].yyyy_mm + " ")};
                if (k == 1) {k=2} }
            j++;
        }
    };

    var allRevenues;
    var allPredictedRevenues;

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
        // $q is the promise library from angular. Provides a function that waits for all given promises (.all())
        return $q.all(dataPromises);
    }

    getDataFromServer().then(function () {
        fillSelectBox();
        $scope.aggregateDataSet($scope.selectedMonth, $scope.showPreviousMonts, $scope.showNextMonths);
    })
}]);