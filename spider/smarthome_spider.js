//  https://www.smarthome.com 网站的爬取

const Crawler = require('crawler')
require('./model/mongoose')
const SmartHome = require('./model/smarthome')
const Url = require('./model/smarthomeurl')

const baseUrl = 'https://www.smarthome.com'
const type = {
  news: 3,
  'buyers-guides': 8,
  'tips-tricks': 6,
  'product-reviews': 4,
}

function saveContent(body) {
  if (body.title === '' && body.content == '') {
    console.log(`数据请求不成功！`)
    return false
  }
  const pet = {
    title: body.title,
    content: body.content,
    url: body.url,
    blogType: 'SMARTHOME',
    bannerUrl: body.bannerUrl,
    tags: [],
  }
  new SmartHome(pet).save()
  console.log(`${body.url}数据已保存！`)
}

async function handleHref(hrefs) {
  hrefs.each(async (index, hrefTmp) => {
    console.log(hrefTmp.attribs.href, '已保存')
    const saveUrl = {
      path: `${baseUrl}${hrefTmp.attribs.href}`,
      created_at: new Date(),
      read: false,
    }
    new Url(saveUrl).save()
  })
}

const c = new Crawler({
  maxConnections: 10, // 最大并发数
  rateLimit: 10, // 慢速模式，间隔10毫秒
  forceUTF8: true,
  incomingEncoding: 'UTF-8',
  // 在每个请求处理完毕后将调用此回调函数
  async callback(error, res, done) {
    if (error) {
      console.log(error)
    } else {
      const { $ } = res
      // $ 默认为 Cheerio 解析器
      // 它是核心jQuery的精简实现，可以按照jQuery选择器语法快速提取DOM元素
      if ($('.article__content').length > 0) {
        const blog = {
          title: $('h1.page__title').text().trim(),
          content: $('.article__content.rte').first().html().trim(),
          bannerUrl: $('.aspect-ratio img').attr('src'),
          url: res.options.uri,
        }
        saveContent(blog)
        // // 移除待选的
        Url.updateMany({ path: res.options.uri }, { read: true }).then((test) => {
          console.log(`${res.options.uri} 已更新`)
        })
      } else {
        // save url
        await handleHref($('.article-item__title a[href]'))
      }
    }
    done()
  },
})
let queryData = []
function getUrls() {
  for (key in type) {
    let i = 0
    while (i < type[key]) {
      queryData.push(`${baseUrl}/blogs/${key}?page=${++i}`)
    }
  }
  return queryData
}

let getDetail = true

if (getDetail) {
  Url.find({ read: false }).then((urlDb) => {
    if (urlDb.length > 0) {
      let queryQueue = []
      for (const ele of urlDb) {
        queryQueue.push(ele.path)
      }
      c.queue(queryQueue)
    }
  })
} else {
  c.queue(getUrls())
}
