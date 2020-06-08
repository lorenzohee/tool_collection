//  http://www.ichong123.com/ 网站的爬取

var Crawler = require("crawler");
require('./model/mongoose')
const Pet = require('./model/pet')
let baseHost= 'http://www.ichong123.com',
    contentPath = ".ac-content",
    queryQueue = [`http://www.ichong123.com/news/112904.html`],
    finishedQueue = [],
    tagArray = ['金毛', '雪瑞纳', '哈士奇', '松狮', '萨摩耶', '比熊', '泰迪', '训练', '喂养', '护理', '生育', '疾病']

function saveContent(body) {
    if(body.title=='' && body.content==''){
        console.log(`${queryQueue[0]} 的数据请求不成功！`)
        return false;
    }
    let tags = ['DOG'];
    for(let tagTmp of tagArray) {
        if(body.content.indexOf(tagTmp)>0){
            tags.push(tagTmp)
        }
    }
    let pet = {
        title: body.title,
        content: body.content,
        url: queryQueue[0],
        tags: tags
    }
    new Pet(pet).save()
    console.log(`${queryQueue[0]} 的数据已保存！`)
}

function handleHref(hrefs) {
    if(hrefs.length>0){
        hrefs.each((index,hrefTmp)=>{
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
                }else {
                    let urlArray = queryQueue[0].split('/')
                    urlArray.length = urlArray.length-1
                    let temp = urlArray.join('/')
                    href = temp + '/' + href
                }
            }
            if(href.indexOf(`${baseHost}/`)<0){
                // console.log(`${href} is not this site.`)
            }else if(finishedQueue.includes(href)){
                // console.log(`${href} is finishied.`)
            }else if(queryQueue.includes(href)){
                // console.log(`${href} is ready finishied.`)
            }else {
                if(href.indexOf('file:///')<0 && href.indexOf('..') < 0){
                    queryQueue.push(href)
                }
            }
        })
    }
}

var c = new Crawler({
    maxConnections : 10, //最大并发数
    // rateLimit: 100, //慢速模式，间隔10毫秒
    // 在每个请求处理完毕后将调用此回调函数
    callback : function (error, res, done) {
        if(error){
            console.log(error);
        }else{
            var $ = res.$;
            // $ 默认为 Cheerio 解析器
            // 它是核心jQuery的精简实现，可以按照jQuery选择器语法快速提取DOM元素
            if($(contentPath).length>0){
                let blog = {
                    title: $('title').text().trim(),
                    content: $(contentPath).text().trim()
                }
                saveContent(blog)
            }
            handleHref($('a[href]'))

            //移除待选的
            queryQueue.splice(0, 1)
            finishedQueue.push(res.request.uri.href)
            query();
        }
        done();
    }
});

function query() {
    if(queryQueue.length>0){
        console.log(`start quest data, and the url is ${queryQueue[0]}, 已请求 ${finishedQueue.length} 条数据，待完成 ${queryQueue.length} 条数据`)
        c.queue(queryQueue[0]);
    }else {
        console.log(`已保存${finishedQueue.length}条数据`)
    }
}

// 将一个URL加入请求队列，并使用默认回调函数

query();