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
    db.getPredictedRevenues(req, res, next);
});

// get only the latest prediction for last month from order list
router.get('/latest', function(req, res, next) {
    db.getLatestPredictedRevenues(req, res, next);
});

// get only the current prediction for this month from order list
router.get('/current', function(req, res, next) {
    db.getCurrentPredictedRevenues(req, res, next);
});

module.exports = router;