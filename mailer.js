var fs = require('fs');
var os = require('os');
var nodeMailer = require('nodemailer');
var queries = require('./queries');

// Values from the server used for dynamic HTML
var latestRevenues;
var latestPredictedRevenues;
var currentRevenues;
var currentPredictedRevenues;

var latestOrders;
var latestPredictedOrders;
var currentOrders;
var currentPredictedOrders;

function round(value) {
    return Math.round(value * 100) / 100
}

function currency (value){
    return round(value) + " €";
}

function generateHtml() {
    var bootstrap = fs.readFileSync('public/stylesheets/bootstrap.css', 'utf8');
    var sbAdmin = fs.readFileSync('public/stylesheets/sb-admin.css', 'utf8');
    var html =
        '<!DOCTYPE html>' +
        '<html lang="de" ng-app="ControlR">' +
        '<head>' +
        '<meta charset="utf-8">' +
        '<style>' + bootstrap + ' ' + sbAdmin +'</style>' +
        '</head>' +
        '<body style="background-color: white; padding: 0 30px 0 30px;">' +
        '<nav class="navbar navbar-inverse navbar-fixed-top" role="navigation">' +
        '<div class="navbar-header"><a class="navbar-brand">ControllR</a></div>' +
        '</nav>' +
        '<div class="row">' +
        '<div class="col-lg-12">' +
        '<h1> ' +
        'New prediction available  <small><a href="http://localhost:3000/#!/">Click here to get to the ControllR app</a></small> ' +
        '</h1>' +
        '</div>' +
        '</div>' +
        '<div class="row">' +
        '<div class="col-md-6">' +
        '<div class="panel panel-info">' +
        '<div class="panel-heading">' +
        '<h3 class="panel-title">Revenue before Returns</h3>' +
        '</div> ' +
        '<div class="panel-body">' +
        '<div class="row">' +
        '<div class="col-xs-12">' +
        '<div class="panel panel-primary">' +
        '<div class="panel-heading">' +
        '<div class="container-fluid">' +
        '<p>Information for ' + currentRevenues.yyyy_mm + '</p>' +
        '<div class="row">' +
        '<div class="col-sm-8" >' +
        '<p>Current Revenue:</p>' +
        '</div>' +
        '<div class="col-sm-4" align="right">' +
        '<p>' + currency(currentRevenues.current_revenue) + '</p>' +
        '</div>' +
        '</div>' +
        '<div class="row">' +
        '<div class="col-sm-8" >' +
        '<p><small>Reachable Revenue:</small></p>' +
        '</div>' +
        '<div class="col-sm-4" align="right">' +
        '<p>' + currency(currentRevenues.current_reachable_revenue) + '</p> ' +
        '</div>' +
        '</div>' +
        '<div class="row">' +
        '<div class="col-sm-8" >' +
        '<p>Prediction from ' + currentPredictedRevenues.yyyy_mm+ ':</p>' +
        '</div>' +
        '<div class="col-sm-4" align="right"> ' +
        '<p>' + currency(currentPredictedRevenues.mean) +'</p>' +
        '</div>' +
        '</div>' +
        '<hr>' +
        '<div class="row">' +
        '<div class="col-sm-8" >' +
        '<p>Current Difference:</p> ' +
        '</div> ' +
        '<div class="col-sm-4" align="right">' +
        '<p>' + currency(currentRevenues.current_reachable_revenue - currentPredictedRevenues.mean) + '</p>' +
        '<p>' + round((currentRevenues.current_reachable_revenue - currentPredictedRevenues.mean) / currentRevenues.current_reachable_revenue * 100) + ' %</p>' +
        '</div> ' +
        '</div> ' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '<div class="col-xs-12">' +
        '<div class="panel panel-primary">' +
        '<div class="panel-heading">' +
        '<div class="container-fluid">' +
        '<p>Information for ' + latestRevenues.yyyy_mm + '</p>' +
        '<div class="row">' +
        '<div class="col-sm-8" >' +
        '<p>Revenue:</p>' +
        '</div>' +
        '<div class="col-sm-4" align="right">' +
        '<p>' + currency(latestRevenues.net_revenue) + '</p>' +
        '</div>' +
        '</div>' +
        '<div class="row">' +
        '<div class="col-sm-8" >' +
        '<p>Prediction from ' + latestPredictedRevenues.yyyy_mm + ':</p>' +
        '</div>' +
        '<div class="col-sm-4" align="right">' +
        '<p>' + currency(latestPredictedRevenues.mean) + '</p>' +
        '</div>' +
        '</div>' +
        '<hr>' +
        '<div class="row">' +
        '<div class="col-sm-8" >' +
        '<p>Difference:</p>' +
        '</div>' +
        '<div class="col-sm-4" align="right">' +
        '<p>' + currency(latestRevenues.net_revenue - latestPredictedRevenues.mean) + '</p>' +
        '<p>' + round((latestRevenues.net_revenue - latestPredictedRevenues.mean) / latestRevenues.net_revenue * 100) +' %</p>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>' +

        '<div class="col-md-6">' +
        '<div class="panel panel-success">' +
        '<div class="panel-heading">' +
        '<h3 class="panel-title">Number of Orders before Returns</h3>' +
        '</div> ' +
        '<div class="panel-body">' +
        '<div class="row">' +
        '<div class="col-xs-12">' +
        '<div class="panel panel-green">' +
        '<div class="panel-heading">' +
        '<div class="container-fluid">' +
        '<p>Information for ' +currentOrders.yyyy_mm + '</p>' +
        '<div class="row">' +
        '<div class="col-sm-8" >' +
        '<p>Current Orders:</p>' +
        '</div>' +
        '<div class="col-sm-4" align="right">' +
        '<p>' + round(currentOrders.number_of_orders) + '</p>' +
        '</div>' +
        '</div>' +
        '<div class="row">' +
        '<div class="col-sm-8" >' +
        '<p><small>Reachable Orders:</small></p>' +
        '</div>' +
        '<div class="col-sm-4" align="right">' +
        '<p>' + round(currentOrders.current_reachable_orders) + '</p>' +
        '</div>' +
        '</div>' +
        '<div class="row">' +
        '<div class="col-sm-8" >' +
        '<p>Prediction from ' +currentPredictedRevenues.yyyy_mm + ':</p>' +
        '</div>' +
        '<div class="col-sm-4" align="right">' +
        '<p>' + round(currentPredictedOrders.mean) + '</p>' +
        '</div>' +
        '</div>' +
        '<hr>' +
        '<div class="row">' +
        '<div class="col-sm-8" >' +
        '<p>Current Difference:</p>' +
        '</div>' +
        '<div class="col-sm-4" align="right">' +
        '<p>' + round(currentOrders.current_reachable_orders - currentPredictedOrders.mean) + '</p>' +
        '<p>' + round((currentOrders.current_reachable_orders - currentPredictedOrders.mean) / currentOrders.current_reachable_orders *100) + ' %</p>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '<div class="col-xs-12">' +
        '<div class="panel panel-green">' +
        '<div class="panel-heading">' +
        '<div class="container-fluid">' +
        '<p>Information for ' + latestOrders.yyyy_mm + '</p>' +
        '<div class="row"> ' +
        '<div class="col-sm-8" >' +
        '<p>Orders:</p>' +
        '</div>' +
        '<div class="col-sm-4" align="right">' +
        '<p>' + round(latestOrders.number_of_orders) + '</p>' +
        '</div>' +
        '</div>' +
        '<div class="row">' +
        '<div class="col-sm-8" >' +
        '<p>Prediction from ' + latestPredictedOrders.yyyy_mm + ':</p>' +
        '</div>' +
        '<div class="col-sm-4" align="right"> ' +
        '<p>' + round(latestPredictedOrders.mean) + '</p> ' +
        '</div>' +
        '</div>' +
        '<hr>' +
        '<div class="row">' +
        '<div class="col-sm-8" >' +
        '<p>Difference:</p>' +
        '</div>' +
        '<div class="col-sm-4" align="right">' +
        '<p>' + round(latestOrders.number_of_orders - latestPredictedOrders.mean) + '</p>' +
        '<p>' + round((latestOrders.number_of_orders - latestPredictedOrders.mean) / latestOrders.number_of_orders * 100) + ' %</p>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</body>' +
        '</html>';
    return html;
}

function setMailOptionsAndSend() {

    var fileStringCredentials = fs.readFileSync('Connections', 'utf8');

    // make db connection available as variable
    var eMailCredentials = {
        user: fileStringCredentials.split(os.EOL)[1],
        pw: fileStringCredentials.split(os.EOL)[2]
    };

    // create transporter object
    var transporter = nodeMailer.createTransport({
        service: "Gmail",
        auth: {
            user: eMailCredentials.user,
            pass: eMailCredentials.pw
        }
    });

    // get subscribers from config file
    var subscribers = fs.readFileSync('mailSubscribers').toString().split(os.EOL);

    var mailOptions = {
        to: subscribers,
        subject: 'A new prediction is waiting for you!',
        html: generateHtml()
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}

function sendMail() {

    // collection of all requests
    var queriesPromises = [];

    //get the dynamic data for the mail
    queriesPromises.push(
        queries.getLatestRevenues().then(function (response) {
            latestRevenues = response[0];
        })
    );
    queriesPromises.push(
        queries.getLatestPredictedRevenues().then(function (response) {
            latestPredictedRevenues = response[0];
        })
    );
    queriesPromises.push(
        queries.getCurrentRevenues().then(function (response) {
            currentRevenues = response[0];
        })
    );
    queriesPromises.push(
        queries.getCurrentPredictedRevenues().then(function (response) {
            currentPredictedRevenues = response[0];
        })
    );

    queriesPromises.push(
        queries.getLatestOrders().then(function (response) {
            latestOrders = response[0];
        })
    );
    queriesPromises.push(
        queries.getLatestPredictedOrders().then(function (response) {
            latestPredictedOrders = response[0];
        })
    );
    queriesPromises.push(
        queries.getCurrentOrders().then(function (response) {
            currentOrders = response[0];
        })
    );
    queriesPromises.push(
        queries.getCurrentPredictedOrders().then(function (response) {
            currentPredictedOrders = response[0];
        })
    );

    Promise.all(queriesPromises).then(function (data) {
        setMailOptionsAndSend(data);
    });
}

module.exports = {
    sendMail: sendMail
};