var express = require('express'); // router module
var path = require('path'); // serves static files
var favicon = require('serve-favicon'); // serves favicon
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser'); // reads body of http requests like PUT/POST/DELETE

var R = require("r-script"); // r-script executor

var index = require('./routes/index'); // route to get angular application
var api = require('./routes/api'); // rest api (swagger)
var revenues = require('./routes/revenues');
var predictedRevenues = require('./routes/predictedRevenues');
var orders = require('./routes/orders');
var predictedOrders = require('./routes/predictedOrders');
/*TEST USING r-script
var R = require("r-script"); // r-script executor
var out = R("bin/ex-sync.R")
    .data("hello world", 10)
    .callSync();
console.log(out);
*/

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
