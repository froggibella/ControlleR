//require express modul
// and save the router object Router() in router variable
//var router and db are objects
var router = require('express').Router();
var db = require('../queries');

/* GET users listing. */
//router  enthält express modul
//req: client request
//res: server response
//.get comes from Router- objekt in express modul
router.get('/', function(req, res, next) {
    db.getPredictedRevenues().then(function (data) {
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

// get only the latest prediction for last month from order list
router.get('/latest', function(req, res, next) {
    db.getLatestPredictedRevenues().then(function (data) {
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

// get only the current prediction for this month from order list
router.get('/current', function(req, res, next) {
    db.getCurrentPredictedRevenues().then(function (data) {
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