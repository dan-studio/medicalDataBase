const express = require('express')
const router = express.Router()
const Post = require('../models/Post')
const User = require('../models/User')
const util = require('../util')

// Index 
router.get('/', async function (req, res) {
  let page = Math.max(1, parseInt(req.query.page))
  let limit = Math.max(1, parseInt(req.query.limit))
  page = !isNaN(page) ? page : 1;
  limit = !isNaN(limit) ? limit : 20;

  let skip = (page - 1) * limit;
  let maxPage = 0;
  let searchQuery = createSearchQuery(req.query);
  let posts = []


  if(searchQuery){
    let count = await Post.countDocuments(searchQuery);
    maxPage = Math.ceil(count/limit)
    posts = await Post.find(searchQuery)
    .populate('author')
    .sort('-regDate')
    .skip(skip)
    .limit(limit)
    .exec();
  }

  res.render('posts/index', {
    posts: posts,
    currentPage: page,
    maxPage: maxPage,
    limit: limit,
    searchType: req.query.searchType, //view에서 검색 form에 현재 검색에 사용한 검색 타입과 검색어를 보여줄 수 있게 해당 데이터를 view에 보냄.
    searchText: req.query.searchText
  })
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
router.post('/', util.isLoggedin, function(req, res){
  req.body.author = req.user._id;
  Post.create(req.body, function(err, post){
    if (err) {
      req.flash('post', req.body);
      req.flash('errors', util.parseError(err));
      return res.redirect('/posts/new'+res.locals.getPostQueryString());
    }
    res.redirect('/posts'+res.locals.getPostQueryString(false, { page:1, searchText:'' })); //새 글을 작성하면 검색 결과를 query string에서 제거하여 전체 게시물이 보이도록 함.
  });
});

// destroy
router.delete('/:id', util.isLoggedin, function (req, res) {
  Post.deleteOne({
    _id: req.params.id
  }, function (err) {
    if (err) return res.json(err);
    res.redirect('/posts'+res.locals.getPostQueryString());
  });
});

module.exports = router;

//private functions 
function checkPermission(req, res, next) {
  Post.findOne({
    _id: req.params.id
  }, function (err, post) {
    if (err) return res.json(err);
    if (post.author != req.user.id) return util.noPermission(req, res);

    next();
  })
}

async function createSearchQuery(queries){
  var searchQuery = {};
  if(queries.searchType && queries.searchText && queries.searchText.length >= 3){
    var searchTypes = queries.searchType.toLowerCase().split(',');
    var postQueries = [];
    if(searchTypes.indexOf('compName')>=0){
      postQueries.push({ compName: { $regex: new RegExp(queries.searchText, 'i') } });
    }
    if(searchTypes.indexOf('prodNme')>=0){
      postQueries.push({ prodNme: { $regex: new RegExp(queries.searchText, 'i') } });
    }
    if(searchTypes.indexOf('author!')>=0){
      var user = await User.findOne({ username: queries.searchText }).exec();
      if(user) postQueries.push({author:user._id});
    }
    else if(searchTypes.indexOf('author')>=0){
      var users = await User.find({ username: { $regex: new RegExp(queries.searchText, 'i') } }).exec();
      var userIds = [];
      for(var user of users){
        userIds.push(user._id);
      }
      if(userIds.length>0) postQueries.push({author:{$in:userIds}});
    }
    if(postQueries.length>0) searchQuery = {$or:postQueries};
    else searchQuery = null;
  }
  return searchQuery;
}