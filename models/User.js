const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

//schema
const UserSchema = mongoose.Schema({
  useremail: {type: String, required: [true, '이메일을 입력해 주세요!'], match:[/^[a-zA-Z0-9._%+-]+@daangnservice.com/,'당근서비스 이메일 형식이 아닙니다!'], unique: true, trim:true //동일 메일주소 사용불가
  },
  username: {type: String, required: [true, '이름을 입력해 주세요!'], trim:true},
  password: {type: String, required: [true, '비밀번호를 입력해 주세요!'], select: false},
  status:{type: Boolean, required: true, default: false}
}, {
  collection: 'users',
  toObject:{virtuals: true}
})
//virtuals
UserSchema.virtual('passwordConfirmation')
  .get(function(){ return this._passwordConfirmation; })
  .set(function(value){ this._passwordConfirmation=value; });

// password validation // 3
UserSchema.path('password').validate(function(v) {
  const user = this; // 3-1
// create user // 3-3
    if(user.isNew){ // 3-2
      if(!user.passwordConfirmation){
        user.invalidate('passwordConfirmation', '비밀번호 확인이 필요해요!');
      }
      if(user.password !== user.passwordConfirmation) {
        user.invalidate('passwordConfirmation', '비밀번호가 일치하지 않아요!');
      }
    }
  })


// hash password // 3
UserSchema.pre('save', function (next){
  var user = this;
  if(!user.isModified('password')){ // 3-1
    return next();
  }
  else {
    user.password = bcrypt.hashSync(user.password); //3-2
    return next();
  }
});
// model methods // 4
UserSchema.methods.authenticate = function (password) {
  var user = this;
  return bcrypt.compareSync(password,user.password);
};
    
const User = mongoose.model('users', UserSchema)

module.exports = User


