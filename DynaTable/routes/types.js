var express = require('express');
var router  = express.Router();


router.get('/', function(req, res) {
  var mongoose = require('mongoose');
  var db = mongoose.connect('mongodb://localhost:27017/test');
  db.on('error', console.error.bind(console, 'connection error:'));

  db.once('open', function () {
    var typeSchema = mongoose.Schema({
      typeName: String,
      schema: String,
      parent: String
    });

    var types = mongoose.model('Types', typeSchema)

    types.find({ name: /^Root/ }, function (err, objs) {
      if (err) return console.error(err);
      console.log(objs);
    });
  });

});

module.exports = router;
