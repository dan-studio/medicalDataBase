const express = require('express')
const router = express.Router()
const Post = require('../models/Posts')
const User = require('../models/Users')
const util = require('../util')

// Index 
router.get('/', function (req, res) {
  Post.find({})
    .populate('author') // 1
    .sort('-createdAt') // 1
    .exec(function (err, posts) { // 1
      if (err) return res.json(err);
      res.render('posts/index', {
        posts: posts
      });
    });
});

// New
router.get('/new', util.isLoggedin, function (req, res) {
  var post = req.flash('post')[0] || {};
  var errors = req.flash('errors')[0] || {};
  res.render('posts/new', {
    post: post,
    errors: errors
  });
});

// create
router.post('/', util.isLoggedin, function (req, res) {
  req.body.author = req.user._id;
  Post.create(req.body, function (err, post) {
    if (err) {
      req.flash('post', req.body);
      req.flash('errors', util.parseError(err));
      return res.redirect('/posts/new');
    }
    res.redirect('/posts');
  });
});

// destroy
router.delete('/:id', util.isLoggedin, function (req, res) {
  Post.deleteOne({
    _id: req.params.id
  }, function (err) {
    if (err) return res.json(err);
    res.redirect('/posts');
  });
});

module.exports = router;

//private functions 
function checkPermission(req, res, next){
  Post.findOne({_id:req.params.id}, function(err, post){
    if(err) return res.json(err);
    if(post.author != req.user.id) return util.noPermission(req, res);

    next();
  })
}