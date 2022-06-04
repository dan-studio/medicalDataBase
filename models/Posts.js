const mongoose = require('mongoose')

const PostsSchema = mongoose.Schema({

  sort: {type: String, required: [true, '제품 유형을 선택해 주세요!']},
  compName: { type: String, required: [true, '제조사를 입력해 주세요!'], trim: true},
  prodName: {type: String, required: [true, '제품명을 입력해 주세요!'], unique: true },
  regDate: { type: String, required: true, default: Date.now },
  author: {type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true}
}, {
  collection: 'posts',
})
PostsSchema.post('save', function(error, doc, next) {
  if (error.name === 'MongoError' && error.code === 11000) {
    next(new Error('There was a duplicate key error'));
  } else {
    next();
  }
});
const Posts = mongoose.model('post', PostsSchema)

module.exports = Posts