const mongoose = require('mongoose');

const CatSchema = new mongoose.Schema({
  name: {
    type: String
  },
  desc: {
    type: String
  },
  url: {
    type: String
  },
  life: String,     //寿命
  wool: String,     //毛长
  othername: String,//别名
  height: String,   //身高
  area: String,     //产地
  price: String,    //价格
  weight: String,   //体型
  stickiness: String, //粘人排名
  call: String,     //喜叫程度
  woolleft: String, //掉毛程度
  traning: String,  //可训练程度
  avatar: String,
}, {
    versionKey: false
  });


module.exports = mongoose.model('Dog', CatSchema);
