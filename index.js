const mysql= require('mysql')
const express = require('express');
var app = express();
const bodyparser = require('body-parser');
var Promise = require('bluebird'); ////////

app.use(bodyparser.json());

var mysqlConnection= mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'ranisikdar',
    database: 'UseradminDB'
    //multipleStatements: true
});

var queryAsync = Promise.promisify(connection.query.bind(connection));
connection.connect();
app.use(bodyParser.urlencoded({ extended: true }));

mysqlConnection.connect((err)=> {
    if(!err)
        console.log('Server build succesfull....');
    else
    console.log('not succ'+ JSON.stringify(err,undefined,2));
});

app.listen(3000, () => console.log('Express server is runnig at port no : 3000'));

//Get all users without pagination
app.get('/userList', (req, res) => {
    mysqlConnection.query('SELECT * FROM useradmindb.tb_user;', (err, rows, fields) => {
        if (!err)
            res.send(rows);
        else
            console.log(err);
    })
});

//Get all admins
app.get('/adminInfo', (req, res) => {
    mysqlConnection.query('SELECT * FROM useradmindb.tb_admin;', (err, rows, fields) => {
        if (!err)
            res.send(rows);
        else
            console.log(err);
    })
});

//Get all users with pagination
app.get('/userList1', function (req, res) {
    var numRows;
    var queryPagination;
    var numPerPage = parseInt(req.query.npp, 10) || 1;
    var page = parseInt(req.query.page, 10) || 0;
    var numPages;
    var skip = page * numPerPage;
    // Here we compute the LIMIT parameter for MySQL query
    var limit = skip + ',' + numPerPage;
    queryAsync('SELECT count(*) as numRows FROM useradmindb.tb_user')
    .then(function(results) {
      numRows = results[0].numRows;
      numPages = Math.ceil(numRows / numPerPage);
      console.log('number of pages:', numPages);
    })
    .then(() => queryAsync('SELECT * FROM useradmindb.tb_user '+ limit))
    .then(function(results) {
      var responsePayload = {
        results: results
      };
      if (page < numPages) {
        responsePayload.pagination = {
          current: page,
          perPage: numPerPage,
          previous: page > 0 ? page - 1 : undefined,
          next: page < numPages - 1 ? page + 1 : undefined
        }
      }
      else responsePayload.pagination = {
        err: 'queried page ' + page + ' is >= to maximum page number ' + numPages
      }
      res.json(responsePayload);
    })
    .catch(function(err) {
      console.error(err);
      res.json({ err: err });
    });
});


//Get users who are having user_id either 1 or 5 or 7
app.get('/userList2', (req, res) => {
    mysqlConnection.query('SELECT * FROM useradmindb.tb_user where user_id=1 OR user_id=5 OR user_id=7;', (err, rows, fields) => {
        if (!err)
            res.send(rows);
        else
            console.log(err);
    })
});

//user whose admin has at least 3 users
app.get('/userList3', (req, res) => {
  var qu='SELECT tb_user.user_id, tb_user.admin_id, tb_user.user_name, tb_user.created_at FROM tb_user INNER JOIN tb_admin  ON tb_user.admin_id=tb_admin.admin_id HAVING count(user_id)>=3;';
    mysqlConnection.query(qu, (err, rows, fields) => {
        if (!err)
            res.send(rows);
        else
            console.log(err);
    })
});


