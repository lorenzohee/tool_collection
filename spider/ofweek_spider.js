//  http://www.weipet.cn/ 网站的爬取

var Crawler = require('crawler');
require('./model/mongoose');
const OfWeek = require('./model/ofweek');
const Url = require('./model/ofweekurl');
let baseHost = 'https://smarthome.ofweek.com',
  contentPath = '.artical-content',
  queryQueue = [`https://smarthome.ofweek.com/CAT-91002-wirelesscommunication.html`],
  finishedQueue = [],
  tagArray = ['金毛', '雪瑞纳', '哈士奇', '松狮', '萨摩耶', '比熊', '泰迪', '训练', '喂养', '护理', '生育', '疾病'];

function saveContent(body) {
  if (body.title == '' && body.content == '') {
    console.log(`${queryQueue[0]} 的数据请求不成功！`);
    return false;
  }
  let tags = ['DOG'];
  for (let tagTmp of tagArray) {
    if (body.content.indexOf(tagTmp) > 0) {
      tags.push(tagTmp);
    }
  }
  let pet = {
    title: body.title,
    content: body.content,
    url: queryQueue[0],
    blogType: '',
    tags: [],
  };
  new OfWeek(pet).save();
  console.log(`${queryQueue[0]} 的数据已保存！`);
}

async function handleHref(hrefs) {
  if (hrefs.length > 0) {
    hrefs.each((index, hrefTmp) => {
      let href = hrefTmp.attribs.href;
      if (href.indexOf('http') != 0) {
        if (href.indexOf('/') == 0) {
          href = baseHost + href;
        } else if (href.indexOf('./') == 0) {
          href = baseHost + str.substr(1);
        } else if (href.indexOf('../') == 0) {
          let urlArray = queryQueue[0].split('/');
          urlArray.length = urlArray.length - 2;
          let temp = urlArray.join('/');
          href = temp + href.substr(2);
        } else if (href.indexOf('//') == 0) {
          href = 'https:' + href;
        } else {
          console.log('&&&&&&&&&&&&&&&&&&&&&&&&&&&&&' + href);
          let urlArray = queryQueue[0].split('/');
          urlArray.length = urlArray.length - 1;
          let temp = urlArray.join('/');
          href = temp + '/' + href;
        }
      }

      //判断数据库（url和ofweek中都要查询）中是否存在，如果存在不继续查询，如果不存在放到队列并且放到数据库中

      //页面解析完毕以后如果url中存在置为已读，否则为未读

      let url_paths = await Url.find({ path: href });
      if (url_paths.length == 0) {
        let ofweek_paths = await OfWeek.find({ url: href });
        if (ofweek_paths.length == 0) {
          let saveUrl = {
            path: href,
            created_at: new Date(),
            read: false,
          };
          new Url(saveUrl).save();
        }
      }

      console.log('!!!!!!!!!!!!!!!!!!!!!!:' + href);
      if (href.indexOf(`ofweek.com/`) < 0) {
        // console.log(`${href} is not this site.`)
      } else if (finishedQueue.includes(href)) {
        // console.log(`${href} is finishied.`)
      } else if (queryQueue.includes(href)) {
        // console.log(`${href} is ready finishied.`)
      } else {
        if (href.indexOf('file:///') < 0 && href.indexOf('..') < 0) {
          queryQueue.push(href);
        }
      }
    });
  }
}

var c = new Crawler({
  maxConnections: 100, //最大并发数
  // rateLimit: 100, //慢速模式，间隔10毫秒
  // forceUTF8: true,
  incomingEncoding: 'gb2312',
  // 在每个请求处理完毕后将调用此回调函数
  callback: async function (error, res, done) {
    if (error) {
      console.log(error);
    } else {
      var $ = res.$;
      console.log($('title').text());
      // $ 默认为 Cheerio 解析器
      // 它是核心jQuery的精简实现，可以按照jQuery选择器语法快速提取DOM元素
      if ($('.artical-content').length > 0) {
        let blog = {
          title: $('title').text().trim(),
          content: $('.artical-content').first().html().trim(),
        };
        saveContent(blog);
      }
      handleHref($('a[href]'));
      //移除待选的
      Url.updateMany({ path: res.request.uri.href }, { read: true }).then(test => {
        queryQueue.splice(0, 1);
        query();
      });
    }
    done();
  },
});

function query() {
  if (queryQueue.length > 0) {
    console.log(
      `start quest data, and the url is ${queryQueue[0]}, 已请求 ${finishedQueue.length} 条数据，待完成 ${queryQueue.length} 条数据`
    );
    c.queue(queryQueue[0]);
  } else {
    Url.find({ read: false })
      .limit(20)
      .then(urlDb => {
        if (urlDb.length > 0) {
          console.log(`${houseUrl.path} is exist`);
        } else {
          let paths = [];
          for (let ele of urlDb) {
            paths.push(ele.path);
          }
          c.queue(paths);
        }
      });
    console.log(`已保存${finishedQueue.length}条数据`);
  }
}

// 将一个URL加入请求队列，并使用默认回调函数

query();
