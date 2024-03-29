//  https://www.iotforall.com 网站的爬取

const Crawler = require('crawler');
require('./model/mongoose')
const IotForAll = require('./model/iotforall')
const Url = require('./model/url')

const finishedQueue = [];

function saveContent(body) {
  if (body.title === '' && body.content === '') {
    console.log('fail 数据请求不成功！')
    return false;
  }
  const pet = {
    title: body.title,
    content: body.content,
    url: body.url,
  }
  new IotForAll(pet).save()
  console.log('success 数据已保存！')
}

const c = new Crawler({
  maxConnections: 10, // 最大并发数
  rateLimit: 10, // 慢速模式，间隔10毫秒
  forceUTF8: true,
  incomingEncoding: 'UTF-8',
  // 在每个请求处理完毕后将调用此回调函数
  async callback(error, res, done) {
    if (error) {
      console.log(error);
    } else {
      const { $ } = res;
      console.log((new Date()) + $('title').text())
      // $ 默认为 Cheerio 解析器
      // 它是核心jQuery的精简实现，可以按照jQuery选择器语法快速提取DOM元素
      if ($('article').length > 0) {
        const blog = {
          title: $('title').text().trim(),
          url: res.request.uri.href,
        }
        let content = ''
        $('.td-post-content p').each((index, pDom) => {
          content += `<p>${$(pDom).html()}</p>`
        })
        blog.content = content
        saveContent(blog)
      }
      finishedQueue.push(res.request.uri.href)
    }
    done();
  },
});
let index = 0
async function query() {
  if (index - finishedQueue.length < 100) {
    console.log(`start quest data, 已请求 ${finishedQueue.length} 条数据, ${index}条数据待拉取`)
    Url.find({ read: false }).limit(50).then(async (urlDb) => {
      if (urlDb.length > 0) {
        const queryArray = []
        for (const ele of urlDb) {
          await Url.updateMany({ path: ele.path }, { read: true }).then(() => {
            index++
            queryArray.push(ele.path)
          })
        }
        console.log(queryArray.length)
        c.queue(queryArray)
      }
    })
  }
}
// 将一个URL加入请求队列，并使用默认回调函数
query();

setInterval(query, 10000)
