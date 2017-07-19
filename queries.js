// bluebird erstellt js- Promises für asynchrone Serveranfragen
var bluebird = require('bluebird'); // or any other Promise/A+ compatible library;


var obj = {
    prop1: "prop1",
    func1: function (prams) {
        console.log(prams)
    },
    func2: function (prams) {
        console.log("func2");
        console.log(obj.prop1);
    }
};

var options = {
    promiseLib: bluebird
};

//pgp= Pretty Good Privacy-Verschlüsselung
var pgp = require('pg-promise')(options);

// db connection
var fs = require('fs');
var db;
// read login credentials
fs.readFile('pgConnection', 'utf8', function (err,data) {
    if (err) {
        return console.log(err);
    }
    // make db connection available as variable
    db = pgp(data);
});


function getPredictedRevenues(request, response, next) {
    db.any("select * from ap_financial_forecast.forecast_monthly_revenue")
        // PROMISE - waits for server response
        .then(function (data) {
            response.status(200)
                .json({
                    status: 'success',
                    data: data,
                    message: 'Retrieved all data'
                });

        })
        //fehlerbehandlung
        .catch(function (err) {
            return next(err);
        });
}


function getRevenues(request, response, next) {
    db.any("SELECT yyyy_mm, iso_month_in_year, iso_year, net_revenue FROM ap_financial_forecast.t_monthly_data")
    // PROMISE - waits for server response
        .then(function (data) {
            response.status(200)
                .json({
                    status: 'success',
                    data: data,
                    message: 'Retrieved all data'
                });
        })
        //fehlerbehandlung
        .catch(function (err) {
            return next(err);
        });
}



function getPredictedOrders(request, response, next) {
    db.any("select * from ap_financial_forecast.forecast_monthly_orders")
    // PROMISE - waits for server response
        .then(function (data) {
            response.status(200)
                .json({
                    status: 'success',
                    data: data,
                    message: 'Retrieved all data'
                });

        })
        //fehlerbehandlung
        .catch(function (err) {
            return next(err);
        });
}


function getOrders(request, response, next) {
    db.any("SELECT yyyy_mm, iso_month_in_year, iso_year, number_of_orders FROM ap_financial_forecast.t_monthly_data")
    // PROMISE - waits for server response
        .then(function (data) {
            response.status(200)
                .json({
                    status: 'success',
                    data: data,
                    message: 'Retrieved all data'
                });
        })
        //fehlerbehandlung
        .catch(function (err) {
            return next(err);
        });
}

// make functions available in other js modules
module.exports = {
    getPredictedRevenues: getPredictedRevenues,
    getRevenues: getRevenues,
    getOrders: getOrders,
    getPredictedOrders: getPredictedOrders
};


