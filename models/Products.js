const mongoose = require('mongoose')

const ProductsSchema = mongoose.Schema({
  sort: {
    type: String,
    required: true,
  },
  compName: {
    type: String,
    required: true

  },
  prodName: {
    type: String,
    required: true,
    unique: true //동일 제품명 사용불가
  },
  regDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'products',
    required: true
  }
}, {
  collection: 'products',
  versionKey: false
})

const Products = mongoose.model('products', ProductsSchema, 'products')

module.exports = Products