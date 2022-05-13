const util = {}
util.parseError = function parseError(errors){
  const parsed = {}
  if(errors.name == 'ValidationError'){
    for(const name in errors.errors){
      const validationError = errors.errors[name]
      parsed[name] = { message:validationError.message}
    }
  }
  else if(errors.code == '11000' && errors.errmsg.indexOf('useremail')>0){
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


module.exports = util;
