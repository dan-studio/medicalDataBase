const mongoose = require('mongoose')

const postSchema = mongoose.Schema({

  sort: {type: String, required: [true, '제품 유형을 선택해 주세요!']},
  compname: { type: String, required: [true, '제조사를 입력해 주세요!'], trim: true},
  prodname: {type: String, required: [true, '제품명을 입력해 주세요!'], unique: true },
  regdate: { type: Date, required: true, default: Date.now },
  author: {type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true}
}, {
  collection: 'posts',
})
postSchema.post('save', function(error, doc, next) {
  if (error.name === 'MongoError' && error.code === 11000) {
    next(new Error('There was a duplicate key error'));
  } else {
    next();
  }
});
const Post = mongoose.model('post', postSchema)

module.exports = Post;
