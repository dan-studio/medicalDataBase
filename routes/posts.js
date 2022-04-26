const express = require('express')
const router = express.Router()
const Products = require('../models/Products')

//Index
router.get('/', function(req, res){
  Products.find({}, function(err, products){
    if(err) return res.json(err)
    res.render('partials/table',{products:products})
  })
  // .sort('-regDate')
  // .exec(function(err, data){
  //   if(err) return res.json(err)
  //   res.render('partials/table', {products: products})
  // })
})


//delete
router.delete('/:id', function(req, res){
  Products.deleteOne({_id:req.params.id}, function(err){
    if(err) return res.json(err)
    res.redirect('/products')
  })
})

module.exports = router;