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

module.exports = util;
