export class House {  
  _id: String;
  house_id: Number;
  title: String;
  price: Number;
  price_d: Number;
  url: String;
  source: String;
  yishou: String;
  area: Number;  //面积
  area_in: Number; //套内面积
  louceng: String;
  room: String;  //户型
  zhuangxiu: String; //装修情况
  chaoxiang: String; //朝向
  dianti: String; //电梯
  communityName: String;
  domainName: String[];
  guapai: String;
  shuxing: String; //房屋属性
  yongtu: String; //房屋用途 (普通住宅)
  chanquan: String; //共有
  diyaxinxi: String; //抵押信息
  room_desc: String[]; //户型介绍
  xiaoqujunjia: Number;
}
