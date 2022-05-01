const mongoose = require('mongoose')
const moment = require('moment')
const PostsSchema = mongoose.Schema({
  sort: {type: String, required: [true, '제품 유형을 선택해 주세요!']},
  compName: { type: String, required: [true, '제조사를 입력해 주세요!'], trim: true},
  prodName: {type: String, required: [true, '제품명을 입력해 주세요!'], unique: true },
  regDate: {type: Date, default: moment().format("YYYY-MM-DD hh:mm:ss")},
  author: {type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true}
}, {
  collection: 'posts',
})

const Posts = mongoose.model('post', PostsSchema)

module.exports = Posts