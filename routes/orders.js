//require express modul
// and save the router object Router() in router variable
//var router and db are objects
var router = require('express').Router();
var db = require('../queries');

/* GET users listing. */
//router contents express module
//req: client request
//res: server response
//.get comes from router-object in express module

// get whole order list
router.get('/', function(req, res, next) {
    db.getOrders().then(function (data) {
        res.status(200)
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
});

// get only the latest order from order list
router.get('/latest', function(req, res, next) {
    db.getLatestOrders().then(function (data) {
        res.status(200)
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
});

// get only the current values for this month from order list
router.get('/current', function(req, res, next) {
    db.getCurrentOrders().then(function (data) {
        res.status(200)
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
});

module.exports = router;

