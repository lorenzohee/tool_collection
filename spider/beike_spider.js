//  http://www.ichong123.com/ 网站的爬取

var Crawler = require("crawler");
require('./model/mongoose')
const House = require('./model/house');
const Url = require('./model/url')
let baseHost= 'https://qd.ke.com/ershoufang/',
    queryQueue = [`https://qd.ke.com/ershoufang/`],
    qingdaoAreaList = [{title: '市南', code: 'shinan'},{title: '市北', code: 'shibei'},{title: '李沧', code: 'licang'}],
    subAreaList = [],
    i=0;

var detailCrawler = new Crawler({
    maxConnections : 10, //最大并发数
    rateLimit: 200, //慢速模式，间隔100毫秒
    // 在每个请求处理完毕后将调用此回调函数
    callback : function (error, res, done) {
        if(error){
            console.log(error);
        }else{
            console.log(`finished ${res.request.uri.href} request, and parse data`)
            var $ = res.$;
            function parseBaseAttr(baseAttrList, name) {
                let attr = '0'
                for(let i=0; i<baseAttrList.length; i++){
                    if($(baseAttrList[i]).text() && $(baseAttrList[i]).text().indexOf(name)==0){
                        attr = $(baseAttrList[i]).text().substring(4).trim()
                        if(attr=='暂无数据'){
                            attr = '0'
                        }
                    }
                }
                return attr;
            }
            // $ 默认为 Cheerio 解析器
            // 它是核心jQuery的精简实现，可以按照jQuery选择器语法快速提取DOM元素
            let houseId = /https:\/\/qd.ke.com\/ershoufang\/(.+?).html/g.exec(res.request.uri.href)[1]
            let house = {
                source: '贝壳',
                url: res.request.uri.href,
                house_id: houseId
            }
            if($('.sellDetailPage').length>0){
                house.title = $('h1.main').text().trim()
                house.price = $('.price .total').text() && Number.parseInt($('.price .total').text())
                house.price_d = $('.price .unitPriceValue').text() && Number.parseInt($('.price .unitPriceValue').text())
                house.area = Number.parseFloat(parseBaseAttr($('.introContent .content li'), '建筑面积'))
                house.area_in = Number.parseFloat(parseBaseAttr($('.introContent .content li'), '套内面积'))
                house.louceng = parseBaseAttr($('.introContent .content li'), '所在楼层')
                house.room = parseBaseAttr($('.introContent .content li'), '户型结构')
                house.zhuangxiu = parseBaseAttr($('.introContent .content li'), '装修情况')
                house.chaoxiang = parseBaseAttr($('.introContent .content li'), '房屋户型')
                house.dianti = parseBaseAttr($('.introContent .content li'), '配备电梯')
                house.communityName = $('.communityName .info').text()
                house.domainName = $('.areaName .info').text().trim().split(' ').filter(res=>res.trim() != "")
                house.guapai = parseBaseAttr($('.introContent .transaction li'), '挂牌时间')
                house.shuxing = parseBaseAttr($('.introContent .transaction li'), '交易权属')
                house.yongtu = parseBaseAttr($('.introContent .transaction li'), '房屋用途')
                house.chanquan = parseBaseAttr($('.introContent .transaction li'), '产权所属')
                house.diyaxinxi = parseBaseAttr($('.introContent .transaction li'), '抵押信息')
                house.room_desc = $('#infoList').text()
                house.xiaoqujunjia = Number.parseFloat($($('.xiaoqu_info')[0]).find('.xiaoqu_main_info').text().trim())
            
                House.find({url: res.request.uri.href}).then(urlDb=>{
                if(urlDb.length>0){
                    console.log(`${house.title} is exist in mongo`)
                }else {
                    console.log('save data to mongo success')
                    new House(house).save()
                }
                Url.updateMany({path: res.request.uri.href},{read: true}).then(test=>{
                    console.log(` update success, + ${i++}`)
                })
                done()
                })
            }
        }
        done();
    }
    });
var updateCrawler = new Crawler({
  maxConnections : 10, //最大并发数
  rateLimit: 200, //慢速模式，间隔100毫秒
  // 在每个请求处理完毕后将调用此回调函数
  callback : function (error, res, done) {
      if(error){
          console.log(error);
      }else{
          console.log(`finished ${res.request.uri.href} request, and parse data`)
          var $ = res.$;
          function parseBaseAttr(baseAttrList, name) {
              let attr = '0'
              for(let i=0; i<baseAttrList.length; i++){
                  if($(baseAttrList[i]).text() && $(baseAttrList[i]).text().indexOf(name)==0){
                      attr = $(baseAttrList[i]).text().substring(4).trim()
                      if(attr=='暂无数据'){
                          attr = '0'
                      }
                  }
              }
              return attr;
          }
          if($('.sellDetailPage').length>0){
            let room = parseBaseAttr($('.introContent .content li'), '房屋户型')
          
            House.updateMany({url: res.request.uri.href},{room: room}).then(test=>{
                console.log(` update data success`)
                Url.updateMany({path: res.request.uri.href},{read: true}).then(test=>{
                    console.log(` update success, + ${i++}`)
                })
                done()
            })
          }
      }
      done();
  }
});

var listCrawler = new Crawler({
    maxConnections : 10, //最大并发数
    rateLimit: 100, //慢速模式，间隔10毫秒
    // 在每个请求处理完毕后将调用此回调函数
    callback : function (error, res, done) {
        if(error){
            console.log(error);
        }else{
            var $ = res.$;
            console.log(`finished ${res.request.uri.href} request, and start analyze the house detail`)
            // $ 默认为 Cheerio 解析器
            // 它是核心jQuery的精简实现，可以按照jQuery选择器语法快速提取DOM元素
            //获取列表
            let houseList = $('.sellListContent li > a')
            let houses = []
            if(houseList.length>0){
                houseList.each((index, element) => {
                    if(element.attribs.href.indexOf('goodhouse')<0){
                        // houses.push(element.attribs.href)
                        let houseUrl = {
                            path: element.attribs.href,
                            created_at: new Date(),
                            read: false
                        }
                        Url.find({path: element.attribs.href}).then(urlDb=>{
                            if(urlDb.length>0){
                                console.log(`${houseUrl.path} is exist`)
                            }else {
                                new Url(houseUrl).save()
                                console.log(`@@@@@@@@@@@@@@@@@save ${houseUrl.path}`)
                            }
                        })
                    }
                });
                // detailCrawler.queue(houses)
            }
        }
        done();
    }
});

var paginateCrawler = new Crawler({
    rateLimit: 100, //慢速模式，间隔10毫秒
    // 在每个请求处理完毕后将调用此回调函数
    callback : function (error, res, done) {
        if(error){
            console.log(error);
        }else{
            var $ = res.$;
            console.log(`finished ${res.request.uri.href} request, and start analyze the pagination`)
            //获取列表
            let pageDom = $($('.page-box')[1]).attr('page-data')
            let pageNum = pageDom && JSON.parse(pageDom) && JSON.parse(pageDom).totalPage
            let urlList = []
            for(let i=0; i<pageNum; i++){
                urlList.push(res.request.uri.href+'pg'+i)
            }
            listCrawler.queue(urlList)
            console.log(`get ${pageNum} pages`)
        }
        done();
    }
})

var subAreaCrawler = new Crawler({
    rateLimit: 100, //慢速模式，间隔10毫秒
    // 在每个请求处理完毕后将调用此回调函数
    callback : function (error, res, done) {
        if(error){
            console.log(error);
        }else{
            var $ = res.$;
            console.log(`finished ${res.request.uri.href} request, and start get sub area`)
            // $ 默认为 Cheerio 解析器
            // 它是核心jQuery的精简实现，可以按照jQuery选择器语法快速提取DOM元素
            //获取列表
            let subAreaDom = $($('[data-role="ershoufang"] div')[1]).find('a')
            let subArea = []
            if(subAreaDom.length>0){
                subAreaDom.each((index, element) => {
                    subArea.push('https://qd.ke.com'+element.attribs.href)
                    console.log('https://qd.ke.com'+element.attribs.href)
                });
                paginateCrawler.queue(subArea)
            }
            console.log(`get ${subArea.length} sub area`)
        }
        done();
    }

})

function query() {
    let listArray = []
    for(let arr of qingdaoAreaList){
        listArray.push(`https://qd.ke.com/ershoufang/${arr.code}/`)
    }
    subAreaCrawler.queue(listArray);
}


async function getHouseUrls() {
    let urls = await Url.find({read: false})
    let paths = []
    for(let ele of urls){
        paths.push(ele.path)
    }
    detailCrawler.queue(paths)
}
async function updateHouseAttrs() {
    // Url.updateMany({},{read: false}).then(test=>{
    //     console.log(` update url to false success`)
    // })
    let urls = await Url.find({read: false})
    let paths = []
    for(let ele of urls){
        paths.push(ele.path)
    }
    updateCrawler.queue(paths)
}

// 将一个URL加入请求队列，并使用默认回调函数
//为防止封禁IP，请按照以下步骤执行
//1. 获取所需房屋的详情页并保存到mongodb中

// query();

//2. 获取mongodb中的数据并发起请求
// getHouseUrls();

//3. update house

updateHouseAttrs()