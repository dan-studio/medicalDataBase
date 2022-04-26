var express = require('express');
var router = express.Router();
var User = require('../models/Users');

//index
router.get('/', function(req, res){
  User.find({})
    .sort({username:1})
    .exec(function(err, users){
      if(err) return res.json(err);
      res.render('users/index', {users:users});
    });
});

module.exports = router;