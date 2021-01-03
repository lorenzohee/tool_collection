//  https://www.iotforall.com 网站的爬取

var Crawler = require("crawler");
require('./model/mongoose')
const IotForAll = require('./model/iotforall')
const Url = require('./model/url')
let baseHost= 'https://www.iotforall.com',
    queryQueue = [`https://www.iotforall.com`],
    finishedQueue = [];

function saveContent(body) {
    if(body.title=='' && body.content==''){
        console.log(`${queryQueue[0]} 的数据请求不成功！`)
        return false;
    }
    let pet = {
        title: body.title,
        content: body.content,
        url: queryQueue[0],
        blogType: '',
        tags: []
    }
    new IotForAll(pet).save()
    console.log(`${queryQueue[0]} 的数据已保存！`)
}

async function handleHref(hrefs) {
    if(hrefs.length>0){
        hrefs.each(async (index,hrefTmp)=>{
            let href = hrefTmp.attribs.href
            if(href.indexOf('http')!=0){
                if(href.indexOf('/')==0){
                    href = baseHost + href
                }else if(href.indexOf('./')==0){
                    href = baseHost + str.substr(1)
                }else if(href.indexOf('../')==0){
                    let urlArray = queryQueue[0].split('/')
                    urlArray.length = urlArray.length-2
                    let temp = urlArray.join('/')
                    href = temp + href.substr(2)
                }else if(href.indexOf('//')==0){
                    href = 'https:' + href
                }else if(href.indexOf('#')==0){
                    href = baseHost
                }else if(href.indexOf('javascript:void(0)')>=0){
                    href = baseHost
                }else {
                    console.log('&&&&&&&&&&&&&&&&&&&&&&&&&&&&&'+href)
                    // let urlArray = queryQueue[0].split('/')
                    // urlArray.length = urlArray.length-1
                    // let temp = urlArray.join('/')
                    // href = temp + '/' + href
                }
            }

            //判断数据库（url和ofweek中都要查询）中是否存在，如果存在不继续查询，如果不存在放到队列并且放到数据库中
            //页面解析完毕以后如果url中存在置为已读，否则为未读
            // console.log(href + ' ```111'+href.indexOf(baseHost))
            
            if(href.indexOf(baseHost)===0 && href.indexOf('cdn') < 0){
                let url_paths = await Url.find({path: href})
                if(url_paths.length == 0){
                    let iotForAll_paths = await IotForAll.find({url: href})
                    if(iotForAll_paths.length == 0){
                        let saveUrl = {
                            path: href,
                            created_at: new Date(),
                            read: false
                        }
                        new Url(saveUrl).save()
                    }
                }
            }
        })
    }
}

var c = new Crawler({
    maxConnections : 10, //最大并发数
    rateLimit: 10, //慢速模式，间隔10毫秒
    forceUTF8: true,
    incomingEncoding: 'UTF-8',
    // 在每个请求处理完毕后将调用此回调函数
    callback : async function (error, res, done) {
        if(error){
            console.log(error);
        }else{
            var $ = res.$;
            console.log($("title").text())
            // $ 默认为 Cheerio 解析器
            // 它是核心jQuery的精简实现，可以按照jQuery选择器语法快速提取DOM元素
            if($('article').length>0){
                let blog = {
                    title: $("title").text().trim(),
                    content: $('article').first().html().trim()
                }
                saveContent(blog)
            }
            await handleHref($('a[href]'))
            finishedQueue.push(res.request.uri.href)
            //移除待选的
            Url.updateMany({path: queryQueue[0]},{read: true}).then(test=>{
                queryQueue.splice(0, 1)
                query();
                console.log('continue')
            })
        }
        done();
    }
});
function query() {
    if(queryQueue.length>0){
        console.log(`start quest data, and the url is ${queryQueue[0]}, 已请求 ${finishedQueue.length} 条数据，待完成 ${queryQueue.length} 条数据`)
        c.queue(queryQueue[0]);
    }else {
        Url.find({read: false}).limit(50).then(urlDb=>{
            if(urlDb.length>0){
                for(let ele of urlDb){
                    queryQueue.push(ele.path)
                }
                query()
            }
        })
        console.log(`已保存${finishedQueue.length}条数据`)
    }
}
// 将一个URL加入请求队列，并使用默认回调函数
query();
