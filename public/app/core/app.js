
// define angular module/app "ControlR". This module depends on the ui.router module
// the script of this module is mentioned in the index.js

angular.module('ControlR',[
    'ui.router',
    'chart.js',
    'vr.directives.slider'
])
// config block for the previous defined "ControlR" module
.config(function($stateProvider) {
    // define states for the ui.router as variable
    var revenueState = {
        name: 'revenue',
        url: '/revenue',
        templateUrl: 'app/revenue/revenue.html'
    };

    var dashboardState = {
        name: 'dashboard',
        url: '/',
        templateUrl: 'app/dashboard/dashboard.html'
    };

    var orderState = {
        name: 'orders',
        url: '/orders',
        templateUrl: 'app/orders/orders.html'
    };

    // activate the previous defined states for the ui.router
    $stateProvider.state(revenueState);
    $stateProvider.state(orderState);
    $stateProvider.state(dashboardState);
});


    // one controller for the "ControlR" module
    // this controller is linked by the HTML attribute "ng-controller='MainController'"






