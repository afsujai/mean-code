var express = require('express');
var path = require('path');


var routes = require('./routes/index');
var types = require('./routes/types');

var app = express();
app.use(express.static(__dirname + '/views'));
app.use('/', routes);
app.use('/types', types);


var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Dyna Table App listening at http://localhost:%s', port);

});
