const mongoose = require('mongoose')

const PostsSchema = mongoose.Schema({
  sort: {
    type: String,
    required: [true, '제품 유형을 선택해 주세요']
  },
  compName: {
    type: String,
    required: [true, '제조사를 입력해 주세요']

  },
  prodName: {
    type: String,
    required: [true, '제품명을 입력해 주세요'],
    unique: true //동일 제품명 사용불가
  },
  regDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  }
}, {
  collection: 'posts',
  versionKey: false
})

const Posts = mongoose.model('posts', PostsSchema)

module.exports = Posts