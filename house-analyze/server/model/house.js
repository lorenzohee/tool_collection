const mongoose = require('mongoose');

const HouseSchema = new mongoose.Schema({
  house_id: Number,
  title: String,
  price: Number,
  price_d: Number,
  url: String,
  source: {
    type: String,
    default: '贝壳'
  },
  yishou: {
    type: String,
    default: '未售出'
  },
  area: Number,  //面积
  area_in: Number, //套内面积
  louceng: String,
  room: String,  //户型
  zhuangxiu: String, //装修情况
  chaoxiang: String, //朝向
  dianti: String, //电梯
  communityName: String,
  domainName: Array,
  guapai: String,
  shuxing: String, //房屋属性
  yongtu: String, //房屋用途 (普通住宅)
  chanquan: String, //共有
  diyaxinxi: String, //抵押信息
  room_desc: Array, //户型介绍
  xiaoqujunjia: Number,
}, {
    versionKey: false
  });
  HouseSchema.index({ title: "text", room: "text", zhuangxiu: "text", communityName: "text" })

module.exports = mongoose.model('House', HouseSchema);
