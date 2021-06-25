// https://global.innovationroad.site`s site push to google search site

// eslint-disable-next-line import/no-unresolved
import request from 'request';

const BASE_HOST = 'https://global.innovationroad.site'
const pushUrl = [BASE_HOST,
  'https://global.innovationroad.site/covid/',
  'https://global.innovationroad.site/smarthome/',
  'https://global.innovationroad.site/5g/',
  'https://global.innovationroad.site/iot/',
  'https://global.innovationroad.site/iov/',
  'https://global.innovationroad.site/wisehealthy/',
  'https://global.innovationroad.site/article/',
  'https://global.innovationroad.site/article?tags=IOT',
  'https://global.innovationroad.site/article?tags=SMART%20HOME',
  'https://global.innovationroad.site/article?tags=IOV',
  'https://global.innovationroad.site/article?tags=NEWS',
  'https://global.innovationroad.site/article?tags=WISE%20HEALTHCARE',
  'https://global.innovationroad.site/article?tags=COVID-19',
]

function pushToGoogle(urls) {
  console.log('submitted url is: !!!!!!!!!!!!')
  urls.forEach((element) => {
    console.log(`request start and the site is:${element}`)
    // get 请求外网
    request(element, (error, response, body) => {
      // success!!
      if (!error && response.statusCode == 200) {
        console.log(`${element} : request end`)
      }
    });
  });
}

function getGlobalSiteId(page = 1) {
  if (page < 10) {
    console.log(page)
    request(`${BASE_HOST}/api/blogs?page=${page}`, (error, response, body) => {
      // success!!
      if (!error && response.statusCode == 200) {
        console.log(`${page} : request end and site is : ` + `${BASE_HOST}/api/blogs?page=${page}`)
        const { data } = JSON.parse(body)
        const urls = []
        data.forEach((element) => {
          urls.push(`${BASE_HOST}/article/${element._id}`)
        });
        pushToGoogle(urls)
      }
      page++;
      getGlobalSiteId(page)
    });
  }
}

getGlobalSiteId(1)

pushToGoogle(pushUrl)
