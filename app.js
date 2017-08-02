var express = require('express'); // router module
var path = require('path'); // serves static files
var favicon = require('serve-favicon'); // serves favicon
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser'); // reads body of http requests like PUT/POST/DELETE

var CronJob = require('cron').CronJob;
var R = require("r-script"); // r-script executor
var nodemailer = require('nodemailer');


var index = require('./routes/index'); // route to get angular application
var api = require('./routes/api'); // rest api (swagger)
var revenues = require('./routes/revenues');
var predictedRevenues = require('./routes/predictedRevenues');
var orders = require('./routes/orders');
var predictedOrders = require('./routes/predictedOrders');

var fs = require('fs');

var os = require('os');
var queryToCheck = require('./queries');



var transporter;
fs.readFile('Connections', 'utf8', function (err,data) {
  if (err) {
    return console.log(err);
  }
  data.split(os.EOL);

  // make db connection available as variable
  var eMailCredentials = {
    user: data.split(os.EOL)[1],
    pw: data.split(os.EOL)[2]
  };
  transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: eMailCredentials.user,
      pass: eMailCredentials.pw
    }
  });
});

// Execution on the 5th of the month
new CronJob('* * * 5 * *', function() {
  // load r script for new predictions
  var out = R("bin/ex-sync.R")
      .data("hello world", 10)
      .callSync();
  console.log(out);

  var result = queryToCheck.getRevenues();
  result.then(function (data) {
    //TODO: check data and send mail if necessary
    if(true){
      sendMail(data);
    }
  });


  function sendMail(data){
    var table = "";
    for(var i = 0; i < data.length; i++){
      table += '<table><tr><td>' + data[i].yyyy_mm + ' - </td><td>' + data[i].net_revenue + ' €</td></tr></table>'
    }

    var mailOptions = {
      to: 'beatrice.hildebrandt@gmail.com',
      subject: 'Prediction Alert',
      html: '<html>' +
              '<body>' +
                '<h1>Check your ControllR application!</h1><br>' +

                '<h4>Here are the Revenues - check it out</h4>' +
                table +
              '</body>' +
            '</html>'
    };

    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
  }


  //set this to true to activate mail function
}, null, true, 'Europe/Berlin');


var app = express(); //generiert ein expressmodul als Variable app

// view engine setup
app.set('views', path.join(__dirname, 'views')); //views ordner wird online verfügbar gemacht
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public'))); //public ordner wird online verfügbar gemacht

app.use('/', index);
app.use('/api', api);
app.use('/api/revenues', revenues);
app.use('/api/predictedRevenues', predictedRevenues);
app.use('/api/orders', orders);
app.use('/api/predictedOrders', predictedOrders);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace in browser & server console
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user only server console
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
