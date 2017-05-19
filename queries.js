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

obj.func1("Muschi Ochse");

console.log(typeof obj);


obj.inte = 1;


obj.func2();
var arr = [
    "str1",
    1,
    [1,2,3]
];
console.log(arr[2][1]);
var str = "str";


var options = {
    promiseLib: bluebird
};
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


function getAllData(request, response, next) {
    db.any("select * from bea_temp.test")
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
    getAllData: getAllData
};


