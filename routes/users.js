const express = require('express');
const router = express.Router();
const util = require('../util')
const User = require('../models/Users');

//index
router.get('/admin-users', function(req, res){
  User.find({})
    .sort({useremail:1})
    .exec(function(err, users){
      if(err) return res.json(err);
      res.render('users/index', {users:users});
    });
});
// New
router.get('/new', function(req, res){
  const user = req.flash('user')[0] || {}
  const errors = req.flash('errors')[0] || {}
  res.render('users/new', {user: user, errors: errors});
});
// create
router.post('/', function(req, res){
  User.create(req.body, function(err, user){
    if(err){
      req.flash('user', req.body)
      req.flash('errors', util.parseError(err))
      return res.redirect('/users/new')
    }
    res.write("<script>alert('Successfully registered to the Medical Database!')</script>");
    res.write("<script>window.location=\"/login\"</script>"); // 회원가입 성공 시 alert 이후 로그인 페이지로
    //res.redirect('/'); //alert 없이 로그인 페이지
  });
});
// show
router.get('/:username', function(req, res){
  User.findOne({username:req.params.username}, function(err, user){
    if(err) return res.json(err);
    res.render('users/show', {user:user});
  });
});

// destroy
router.delete('/:useremail', function(req, res){
  User.deleteOne({useremail:req.params.useremail}, function(err){
    if(err) return res.json(err);
    res.redirect('/users');
  });
});

module.exports = router;
