const express = require('express')
const router = express.Router()
const Post = require('../models/Posts')
const User = require('../models/Users')
const util = require('../util')

// Index 
router.get('/', async function (req, res) {
  let page = Math.max(1, parseInt(req.query.page))
  let limit = Math.max(1, parseInt(req.query.limit))
  page = !isNaN(page) ? page : 1;
  limit = !isNaN(limit) ? limit : 20;

  let searchQuery = createSearchQuery(req.query);

  let skip = (page - 1) * limit;
  let count = await Post.countDocuments(searchQuery);
  let maxPage = Math.ceil(count / limit);
  let posts = await Post.find(searchQuery)
    .populate('author')
    .sort('-regDate')
    .skip(skip)
    .limit(limit)
    .exec();

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
router.post('/', util.isLoggedin, function (req, res) {
  req.body.author = req.user._id;
  Post.create(req.body, function (err, post) {
    if (err) {
      req.flash('post', req.body);
      req.flash('errors', util.parseError(err));
      return res.redirect('/posts/new'+res.locals.getPostQueryString());
    }
    res.redirect('/posts' + res.locals.getPostQueryString(false, {
      page: 1,
      searchText: ''
    })); //새 글을 작성하면 검색 결과를 query string에서 제거하여 전체 게시물이 보이도록 함.
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

function createSearchQuery(queries){
  var searchQuery = {};
  if(queries.searchType && queries.searchText && queries.searchText.length >= 3){ // query에 searchType, searchText가 존재하고 searchText가 2글자 이상인 경우에만 search query를 만들고, 이외의 경우에는 {}를 전달하여 모든 게시물이 검색되도록 함.
    var searchTypes = queries.searchType.toLowerCase().split(',');
    var postQueries = [];
    if(searchTypes.indexOf('compName')>=0){
      postQueries.push({ compName: { $regex: new RegExp(queries.searchText, 'i') } }); // 
    }
    if(searchTypes.indexOf('prodName')>=0){
      postQueries.push({ prodName: { $regex: new RegExp(queries.searchText, 'i') } });
    }
    if(postQueries.length > 0) searchQuery = {$or:postQueries}; // 3
  }
  return searchQuery;
}