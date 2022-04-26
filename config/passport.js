const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy //1
const User = require("../models/Users")

//serialize & deserialize User //2
passport.serializeUser(function (user, done) {
  done(null, user.id)
})
passport.deserializeUser(function (id, done) {
  User.findOne({
    _id: id
  }, function (err, user) {
    done(err, user)
  })
})

//local strategy //3
passport.use('local-login',
  new LocalStrategy({
      usernameField: 'useremail', //3-1
      passwordField: 'password', //3-1
      passReqToCallback: true
    },
    function (req, useremail, password, done) { //3-2
      User.findOne({
          useremail: useremail
        })
        .select({
          password: 1
        })
        .exec(function (err, user) {
          if (err) return done(err)
          if (user && user.authenticate(password)) { //3-3
            return done(null, user)
          } else {
            req.flash('useremail', useremail)
            req.flash('errors', {
              login: 'The username or password is incorrect.'
            })
            return done(null, false)
          }
        })
    }
  )
)
module.exports = passport;