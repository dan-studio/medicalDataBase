const mongoose = require('mongoose')

const UserSchema = mongoose.Schema({
  useremail: {
    type: String,
    required: true,
    unique: true //동일 메일주소 사용불가
  },
  username: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  CheckValue: {
    type: Boolean,
    required: true,
  },
  status:{
    type: Boolean,
    required: true,
    default: false
  }

}, {
  collection: 'users'
})

const Users = mongoose.model('users', UserSchema)

module.exports = Users


