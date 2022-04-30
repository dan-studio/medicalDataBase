const express = require('express')
const router = express.Router()
const passport = require('../config/passport')

//Home
router.get('/', function (req, res) {
  res.render('home/about')
})

// Login // 2
router.get('/login', function (req,res) {
  var useremail = req.flash('useremail')[0];
  var errors = req.flash('errors')[0] || {};
  res.render('home/login', {
    useremail:useremail,
    errors:errors
  });
});
//Post Login //3

  router.post('/login',
  function(req,res,next){
    var errors = {};
    var isValid = true;

    if(!req.body.useremail){
      isValid = false;
      errors.useremail = "이메일을 입력해 주세요!"
    }
    if(!req.body.password){
      isValid = false;
      errors.password = '비밀번호를 입력해 주세요!'
    }
    if(isValid){
      next();
    }
    else {
      req.flash('errors',errors);
      res.redirect('/login');
    }
  },
  passport.authenticate('local-login', {
    successRedirect : '/posts',
    failureRedirect : '/login'
  }
));
// Logout // 4
router.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});




module.exports = router;