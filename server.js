const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const User = require("./models/Users")
const Products = require("./models/Products")
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const session = require('express-session')
const MongoStore = require('connect-mongo')
const passport = require('./config/passport')
const methodOverride = require('method-override')
const app = express()

//.env 파일 불러오기
require('dotenv').config();
//DB 세팅
mongoose.connect(process.env.MONGO_URL, { //로컬
  useNewUrlParser: true,
  useUnifiedTopology: true,
  //useCreateIndex: true //몽구스 버전이 6.0이상이라면 몽구스는 항상 useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false, 로 기억하고 실행하기 때문에 더이상 지원하지 않는다
})
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
app.use(bodyParser.urlencoded({
  extended: true
}))
app.use(methodOverride('_method'))

//Routes
app.use('/', require('./routes/home'))
app.use('/posts', require('./routes/posts'))
app.use('/users', require('./routes/users'))

//포트 세팅
const port = 3000;
app.listen(port, () => {
  console.log('server up at : ' + port)
})

//패스포트 session
app.use(session({
  secret: process.env.COOKIE_SECRET,
  resave: true,
  saveUninitialized: true
}));
//passport // 2
app.use(passport.initialize())
app.use(passport.session())
//custom middlewares //3
app.use(function (req, res, next) {
  res.locals.isAuthenticated = req.isAuthenticated();
  res.locals.currentUser = req.user;
  next();
})
app.use('/static', express.static(path.join(__dirname, 'static'))) // static 폴더 파일 불러오기

// GET method route



app.get('/products', (req, res) => {

  Products.find({})
    .populate('author')
    .sort('-regDate')
    .exec(function (err, products) {
      if (err) return res.json(err);
      res.render('partials/prodLsit', {
        products: products
      })
    })
})
// POST method route
// 로그인
app.post('/api/login', async (req, res) => {
  const {
    useremail,
    password
  } = req.body
  const user = await User.findOne({
    useremail
  }).lean()
  if (useremail.length == 0 || password.length == 0) {
    return res.json({
      status: 'error',
      error: '이메일 또는 비밀번호를 입력해 주세요!'
    })
  }
  if (!user) {
    return res.json({
      status: 'error',
      error: '이메일 또는 비밀번호가 일치하지 않아요!'
    })
  }
  if (await bcrypt.compare(password, user.password)) {
    const token = jwt.sign({
      id: user._id,
      useremail: user.useremail
    }, process.env.JWT_PW)
    return res.json({
      status: 'ok',
      data: token //JWT_PW 가 일치하면 token 을 보냄
    })
  }
  res.json({
    status: 'error',
    error: '이메일 또는 비밀번호가 일치하지 않아요!'
  })
})
//회원가입
app.post('/api/register', async (req, res) => {
  const {
    useremail,
    username,
    password: plainTextPassword,
    cfpassword,
    CheckValue
  } = req.body

  if (!useremail || typeof useremail !== 'string') {
    return res.json({
      status: 'error',
      error: '이메일을 입력해 주세요'
    })
  }
  if (!useremail.includes('@daangnservice.com')) {
    return res.json({
      status: 'error',
      error: '당근서비스 메일 형식이 아닙니다'
    })
  }
  if (!username || typeof username !== 'string') {
    return res.json({
      status: 'error',
      error: '이름을 입력해 주세요'
    })
  }
  if (!plainTextPassword || typeof plainTextPassword !== 'string') {
    return res.json({
      status: 'error',
      error: '비밀번호를 입력해 주세요'
    })
  }
  if (!cfpassword || typeof cfpassword !== 'string') {
    return res.json({
      status: 'error',
      error: '비밀번호를 다시 입력해 주세요'
    })
  }
  if (plainTextPassword.length < 8) {
    return res.json({
      status: 'error',
      error: '비밀번호는 최소 8자리 이상으로 설정해 주세요'
    })
  }
  if (plainTextPassword !== cfpassword) {
    return res.json({
      status: 'error',
      error: "비밀번호가 일치하지 않아요"
    })
  }
  if (CheckValue == false) {
    return res.json({
      status: 'error',
      error: "회원가입 동의를 해주세요"
    })
  }
  const password = await bcrypt.hash(plainTextPassword, 10)
  try {
    const response = await User.create({
      useremail,
      username,
      password,
      CheckValue
    })
    console.log('User created successfully : ', response)
  } catch (error) {
    if (error.code === 11000) { //왜 11000?
      return res.json({
        status: 'error',
        error: '이미 사용중인 이메일 입니다'
      })
    }
    throw error
  }
  res.json({
    status: 'ok'
  })
})
//제품등록 기능
app.post('/api/prodReg', async (req, res) => {
  const {
    sort,
    compName,
    prodName,
    regDate
  } = req.body

  if (sort == null) {
    return res.json({
      status: 'error',
      error: '제품 유형을 선택해 주세요!'
    })
  }
  if (!compName || typeof compName !== 'string') {
    return res.json({
      status: 'error',
      error: '제조사를 입력하세요!'
    })
  }
  if (!prodName || typeof prodName !== 'string') {
    return res.json({
      status: 'error',
      error: '제품명을 입력하세요!'
    })
  }
  try {
    const response = await Products.create({
      sort,
      compName,
      prodName,
      regDate,
    })
    console.log('Product registered successfully : ', response)
  } catch (error) {
    if (error.code === 11000) { //왜 11000?
      return res.json({
        status: 'error',
        error: '이미 등록된 제품명 입니다'
      })
    }
    throw error
  }
  res.json({
    status: 'ok'
  })
})