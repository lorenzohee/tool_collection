const express = require('express');
const router = express.Router();
const House = require('../model/house')

router.get('/houses/count', count);
router.get('/houses', index);

async function index (req, res) {
  let obj = req.query;
  obj.where = obj.where || {}
  obj.page = obj.page || 1
  obj.pageNum = obj.pageNum || 10
  if(obj.pageNum>100){obj.pageNum=100}
  //sort
  let sort = {}
  if(!obj.direction || !obj.active || obj.direction == '' || obj.active == ''){
    sort = {_id: -1}
  }else {
    if(obj.direction=='asc'){
      sort[obj.active] = 1
    }else {
      sort[obj.active] = -1
    }
  }
  let house = await House.find(obj.where).sort(sort).skip((obj.page - 1) * obj.pageNum).limit(+obj.pageNum);
  res.json(house);
}

async function count (req, res) {
  let obj = req.query;
  obj.where = obj.where || {}
  let count = await House.find(obj.where).count();
  res.json({count: count});
}

module.exports = router;