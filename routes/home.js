const express = require('express')
const router = express.Router()
const passport = require('../config/passport')

//Home
router.get('/', function (req, res) {
  res.render('home/login')
})
router.get('/register', function (req, res) {
  res.render('home/register')
})
router.get('/login', function (req, res) {
  res.render('home/main');
});

//login //2
router.get('/login', function (req, res) {
  const useremail = req.flash('useremail')[0]
  const errors = req.flash('errors')[0] || {}
  res.render('home/login', {
    useremail: useremail,
    errors: errors
  })
})
router.post('/login',
  function (req, res, next) {
    const errors = {}
    const isValid = true
    if (!req.body.useremail) {
      isValid = false
      errors.useremail = "이메일을 입력해 주세요!"
    }
    if (!req.body.password) {
      isValid = false
      errors.password = '비밀번호를 입력해 주세요!'
    }
    if (isValid) {
      next()
    } else {
      req.flash('errors', errors)
      res.redirect('/login')
    }
  },
  passport.authenticate('local-login', {
    successRedirect: '/main',
    failureRedirect: '/login'
  }))
  //logout
router.get('/logout', function (req, res) {
  req.logout();
  req.session.save(function(){
    res.redirect('/');
  })
})
module.exports = router;