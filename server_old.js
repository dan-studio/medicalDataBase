//https://www.youtube.com/watch?v=b91XgdyX-SM
//JWT https://yusang.tistory.com/61 세션
const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const User = require("./server/model/user")
const Products = require("./server/model/products")
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const session = require('express-session')
const MongoStore = require('connect-mongo')


//.env 파일 불러오기
require('dotenv').config();

//DB 세팅
mongoose.connect('mongodb://localhost:27017/medicaldatabasenode', { //로컬
  // mongoose.connect('mongodb://test:test@localhost:27017', { //ubuntu
  useNewUrlParser: true,
  useUnifiedTopology: true,
  //useCreateIndex: true //몽구스 버전이 6.0이상이라면 몽구스는 항상 useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false, 로 기억하고 실행하기 때문에 더이상 지원하지 않는다
})
//연결된 DB 사용
var db = mongoose.connection
//연결 실패
db.on('error', function () {
  console.log('connection failed!')
})
//연결 성공
db.once('open', function () {
  console.log('connected!')
})

const app = express()
//HTML 불러오는 경로(로그인 페이지)
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/templates/login.html')
})
//HTML 불러오는 경로(회원가입 페이지)
app.get('/register', (req, res) => {
  res.sendFile(__dirname + '/templates/register.html')
})
//HTML 불러오는 경로(메인 페이지)
app.get('/main', (req, res) => {
  res.sendFile(__dirname + '/templates/main.html')
})
app.use('/static', express.static(path.join(__dirname, 'static'))) // static 폴더 파일 불러오기
app.use(bodyParser.json())
// 세션
app.use(session({
  secret: 'asdkjhd!@#$%!%^&$#kldash2543',
  resave: false,
  saveUninitialized: true, // 세션이 필요할 때 구동함
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URL
  }),
  cookie: {
    maxAge: (3.6e+6) * 24
  } // 24시간 유효
}))

//제품 리스트 가져오기
app.get('/api/main', (req, res) => {
  Products.find().then((result) => {
    res.send(result);
  }).catch((err) => {
    console.log(err)
  })
})
//로그인 기능
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
//회원가입 기능
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
app.post('/api/main', async (req, res) => {
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

app.listen(5000, () => {
  console.log('server up at 5000')
})