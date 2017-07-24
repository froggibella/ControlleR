//require express modul
// and save the router object Router() in router variable
//var router and db are objects
var router = require('express').Router();
var db = require('../queries');

/* GET users listing. */
//router  enthält express modul
//req: client request
//res: server response
//.get comes from Router- object in express modul

// get whole order list
router.get('/', function(req, res, next) {
    db.getOrders(req, res, next);
});

// get only the latest order from order list
router.get('/latest', function(req, res, next) {
    db.getLatestOrders(req, res, next);
});

// get only the current values for this month from order list
router.get('/current', function(req, res, next) {
    db.getCurrentOrders(req, res, next);
});

module.exports = router;

