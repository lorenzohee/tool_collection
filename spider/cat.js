//  http://www.weipet.cn/ 网站的爬取

var Crawler = require("crawler");
require('./model/mongoose')
const Cat = require('./model/cat')
let queryQueue = [
                `http://www.ichong123.com/maomao/abxynm`,
                  'http://www.ichong123.com/maomao/aijimao',
                  'http://www.ichong123.com/maomao/aoximao',
                  'http://www.ichong123.com/maomao/bosimao',
                  'http://www.ichong123.com/maomao/bomanmao',
                  'http://www.ichong123.com/maomao/buoumao',
                  'http://www.ichong123.com/maomao/balimao',
                  'http://www.ichong123.com/maomao/dqnm',
                  'http://www.ichong123.com/maomao/dwjmm',
                  'http://www.ichong123.com/maomao/dtjm',
                  'http://www.ichong123.com/maomao/dfdmm',
                  'http://www.ichong123.com/maomao/hwnzm',
                  'http://www.ichong123.com/maomao/jinjilamao',
                  'http://www.ichong123.com/maomao/jndwmm',
                  'http://www.ichong123.com/maomao/knsjmm',
                  'http://www.ichong123.com/maomao/kesitemao',
                  'http://www.ichong123.com/maomao/lanlvmao',
                  'http://www.ichong123.com/maomao/mgdmm',
                  'http://www.ichong123.com/maomao/mgjem',
                  'http://www.ichong123.com/maomao/mgdwm',
                  'http://www.ichong123.com/maomao/zheermao',
                  'http://www.ichong123.com/maomao/zdsdmm',
                  'http://www.ichong123.com/maomao/yigdmm',
                  'http://www.ichong123.com/maomao/ygdmm',
                  'http://www.ichong123.com/maomao/xianluomao',
                  'http://www.ichong123.com/maomao/xjpm',
                  'http://www.ichong123.com/maomao/xiateermao',
                  'http://www.ichong123.com/maomao/xblym',
                  'http://www.ichong123.com/maomao/xmlym',
                  'http://www.ichong123.com/maomao/teqfm',
                  'http://www.ichong123.com/maomao/teqaglm',
                  'http://www.ichong123.com/maomao/sikekemao',
                  'http://www.ichong123.com/maomao/shdshzm',
                  'http://www.ichong123.com/maomao/suomalimao',
                  'http://www.ichong123.com/maomao/rbdwm',
                  'http://www.ichong123.com/maomao/nwslm',
                  'http://www.ichong123.com/maomao/mianyinmao',
                  'http://www.ichong123.com/maomao/mdwwm',
                  'http://www.ichong123.com/maomao/mgymm',
                  'http://www.ichong123.com/maomao/mengmaimao',
                  'http://www.ichong123.com/maomao/miandianmao'
                ]

function saveContent(body) {
    new Cat(body).save()
    console.log(`${queryQueue[0]} 的数据已保存！`)
}

var c = new Crawler({
    maxConnections : 10, //最大并发数
    // rateLimit: 100, //慢速模式，间隔10毫秒
    forceUTF8: true,
    // 在每个请求处理完毕后将调用此回调函数
    callback : function (error, res, done) {
        if(error){
            console.log(error);
        }else{
            var $ = res.$;
            // $ 默认为 Cheerio 解析器
            // 它是核心jQuery的精简实现，可以按照jQuery选择器语法快速提取DOM元素

            let body = res.body
            let obj = {
              name: /<span>全名：(.+?)<\/span>/g.exec(body) && /<span>全名：(.+?)<\/span>/g.exec(body)[1],
              desc: $('.sintro').text().trim(),
              url: res.request.uri.href,
              wool: /<span>毛长：(.+?)<\/span>/g.exec(body) && /<span>毛长：(.+?)<\/span>/g.exec(body)[1],
              othername: /<span>别名：(.+?)<\/span>/g.exec(body) && /<span>别名：(.+?)<\/span>/g.exec(body)[1],
              life: /<span>寿命：(.+?)<\/span>/g.exec(body) && /<span>寿命：(.+?)<\/span>/g.exec(body)[1],
              height: /<span>身高：(.+?)<\/span>/g.exec(body) && /<span>身高：(.+?)<\/span>/g.exec(body)[1],
              area: /<span>原产地：(.+?)<\/span>/g.exec(body) && /<span>原产地：(.+?)<\/span>/g.exec(body)[1],
              price: /<span>价格：(.+?)<\/span>/g.exec(body) && /<span>价格：(.+?)<\/span>/g.exec(body)[1],
              weight: /<span>体型：(.+?)<\/span>/g.exec(body) && /<span>体型：(.+?)<\/span>/g.exec(body)[1],
              stickiness: /<span>黏人排名：(.+?)<\/span>/g.exec(body) && /<span>黏人排名：(.+?)<\/span>/g.exec(body)[1],
              call: /<span>喜叫程度：<code class=\"star(.+?)\"><i><\/i><\/code><\/span>/g.exec(body) && /<span>喜叫程度：<code class=\"star(.+?)\"><i><\/i><\/code><\/span>/g.exec(body)[1],
              woolleft: /<span>掉毛程度：<code class=\"star(.+?)\"><i><\/i><\/code><\/span>/g.exec(body) && /<span>掉毛程度：<code class=\"star(.+?)\"><i><\/i><\/code><\/span>/g.exec(body)[1],
              traning: /<span>可训练度：<code class=\"star(.+?)\"><i><\/i><\/code><\/span>/g.exec(body) && /<span>可训练度：<code class=\"star(.+?)\"><i><\/i><\/code><\/span>/g.exec(body)[1],
              avatar: $('.specimg').find('img').attr('src')
            }
            saveContent(obj)
        }
        done();
    }
});

c.queue(queryQueue);