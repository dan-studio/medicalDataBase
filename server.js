const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
//const jwt = require('jsonwebtoken')
const session = require('express-session')
const passport = require('./config/passport')
const methodOverride = require('method-override')
const flash = require('connect-flash')
const app = express()
const util = require('./util')

//.env 파일 불러오기
require('dotenv').config();

//DB 세팅
mongoose.connect(process.env.MONGO_URL)
// mongoose.connect(process.env.MONGO_URL_OFFICE)//aws서버용

const db = mongoose.connection;
db.once('open', function () {
  console.log('DB Connected')
})
db.on('error', function (err) {
  console.log("DB ERROR : ", err)
})

//Other settings
app.set('view engine', 'ejs')
app.use('/public', express.static(__dirname + '/public'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(methodOverride('_method'))
app.use(flash())
app.use(session({secret: process.env.COOKIE_SECRET, resave: true, saveUninitialized: true}));
app.use('/static', express.static(path.join(__dirname, 'static'))) // static 폴더 파일 불러오기

//passport // 2
app.use(passport.initialize());
app.use(passport.session());

// Custom Middlewares // 3
app.use(function(req,res,next){
  res.locals.isAuthenticated = req.isAuthenticated();
  res.locals.currentUser = req.user;
  next();
});

//Routes
app.use('/', require('./routes/home'));
app.use('/posts', require('./routes/posts'));
app.use('/users', require('./routes/users'));

//포트 세팅
const port = process.env.PORT;
app.listen(port, function(){
  console.log('server on! http://localhost:'+port);
});
