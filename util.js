let util = {}
util.parseError = function parseError(errors){
  let parsed = {}
  if(errors.name == 'ValidationError'){
    for(let name in errors.errors){
      let validationError = errors.errors[name]
      parsed[name] = { message:validationError.message}
    }
  }
  else if(errors.code == '11000' && errors.errmsg.indexOf('useremail') > 0){
    parsed.useremail = {message:'존재하는 이메일 입니다!'}
  }
  else { 
    parsed.unhandled = JSON.stringify(errors);
  }
  return parsed
}
util.isLoggedin = function (req, res, next){
  if(req.isAuthenticated()){
    next();
  }
  else{
    req.flash('errors',{login:'로그인을 해주세요'})
    res.redirect('/login')
  }
}
util.noPermission = function(req, res){
  req.flash('errors' ,{login:'권한이 없습니다'})
  req.logout();
  res.redirect('/login');
}

util.getPostQueryString = function(req, res, next){
  res.locals.getPostQueryString = function(isAppended=false, overwrites={}){    
    var queryString = '';
    var queryArray = [];
    var page = overwrites.page?overwrites.page:(req.query.page?req.query.page:'');
    var limit = overwrites.limit?overwrites.limit:(req.query.limit?req.query.limit:'');
    var searchType = overwrites.searchType?overwrites.searchType:(req.query.searchType?req.query.searchType:''); // 1
    var searchText = overwrites.searchText?overwrites.searchText:(req.query.searchText?req.query.searchText:''); // 1

    if(page) queryArray.push('page='+page);
    if(limit) queryArray.push('limit='+limit);
    if(searchType) queryArray.push('searchType='+searchType); // 1
    if(searchText) queryArray.push('searchText='+searchText); // 1

    if(queryArray.length>0) queryString = (isAppended?'&':'?') + queryArray.join('&');

    return queryString;
  }
  next();
}

module.exports = util;