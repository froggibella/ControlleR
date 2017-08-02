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
    db.getRevenues(req, res, next).then(function (data) {
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
    db.getLatestRevenues().then(function (data) {
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
    db.getCurrentRevenues(req, res, next).then(function (data) {
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