//  https://www.iotforall.com 网站的爬取
require('./model/mongoose')
const axios = require('axios')
const http = require('http')
const IotForAll = require('./model/iotforall')
let titleArray = []
let queryListNum = 0

function getIOTData() {
  IotForAll.find({"read": false}).limit(500).then(res=>{
    queryListNum += res.length
    postToGlobal(res)
    // axios.get('https://notes.innovationroad.site/api/blogs').then(res=>{
    //   console.log(res)
    // })
    // IotForAll.findOne({title: "The 2020 IoT Gift Guide from IoT For All"}).then(red=>{
    //   console.log(red.title)
    //   IotForAll.updateMany({title: red.title}, {$set: {"read": true}}, {multi: true},function(ss){
    //     console.log(ss)
    //     if(queryListNum < 3) {
    //       // getIOTData()
    //     }
    //   }).exec()
    // })
    // IotForAll.updateMany({title: "The 2020 IoT Gift Guide from IoT For All"}, {$set: {read: true}}).then(ss=>{
    //   console.log(ss)
    //   if(queryListNum < 3) {
    //     // getIOTData()
    //   }
    // })
  })
}

function postToGlobal(objArray) {
  objArray.forEach(obj=>{
    console.log(new Date(), ": push title is: ", obj.title)
    if(titleArray.includes(obj.title)) {
      queryListNum--
      return false
    }
    titleArray.push(obj.title)
    const postData = {
      "title": obj.title,
      "content": obj.content+"<p>From iotforall</p>",
      "code":"16220620-ee32-4213-ab0b-c32c5e204c5a",
      "blogType":"IOT",
      "createdAt": "2021-05-31T12:12:26.315Z",
      "blogAccess":"public",
      "tags":["IOT"]};
    console.log(new Date(), ': start post')
    axios.post('https://notes.innovationroad.site/api/blogs/insertArticle', postData).then((resData)=>{
      // change read
      console.log(new Date(), ': post success2:')
      queryListNum--
      IotForAll.updateMany({title: obj.title}, {
        $set: {read: true}
      }).then(ss=>{
        console.log(ss)
        console.log(new Date(), ': after query number', queryListNum)
        if(queryListNum < 3) {
          // getIOTData()
        }
      }).catch(error=>{
        console.log("error!!", error)
      })
    })
  })
}


function post(postData,callback) {
	var options = {
	  hostname: 'notes.innovationroad.site',
	  path: '/api/blogs/insertArticle',
	  method: 'POST',
	  headers: {
		'Content-Type': 'application/json;'
	  }
	};
	var req = http.request(options, function (res) {
		// console.log('STATUS: ' + res.statusCode);  
		// console.log('HEADERS: ' + JSON.stringify(res.headers));  
    // 定义了一个post变量，用于暂存请求体的信息
		var body="";
		res.setEncoding('utf8');
    // 通过res的data事件监听函数，每当接受到请求体的数据，就累加到post变量中
		res.on('data', function (chunk) {
			// console.log('BODY: ' + chunk);
      body += chunk;
		});
    // 在res的end事件触发后，通过JSON.parse将post解析为真正的POST请求格式，然后调用传递过来的回调函数处理数据
		res.on('end', function(){
      console.log(new Date(), ': post success!, ', body)
			// var json = JSON.parse(body);
			callback(body);
		});
	});
	req.on('error', function (e) {
	  console.log('problem with request: ' + e.message);
	});
	req.write(JSON.stringify(postData));
	req.end();
}

getIOTData()