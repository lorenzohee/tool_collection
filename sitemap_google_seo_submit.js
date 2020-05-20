/**
 * @description 主动向谷歌收录推送网址，加快谷歌收录速度
 * @todo xml提取文件，然后读取文件
 * @step 1. 设置代理
 *          export http_proxy="http://localhost:port"
 *          export https_proxy="http://localhost:port"
 *       2. 安装必备库
 *          npm install request xml2js
 *       3. 更改sitemap的xml
 *          把你生成的sitemap的xml内容复制到xml变量中
 *       4. 执行 node app.js
 */

var request=require('request');
var i = 0;
var sites = []
function init(){
    let site = `http://www.google.com/ping?sitemap=${sites[i]}`
    console.log('request start and the site is:'+site)
    //get 请求外网
    request(site,function(error, response, body){
        //success!!
        if (!error && response.statusCode == 200) {
            console.log(i+' : request end and site is : '+sites[i])
            i++;
            if(i<site.length){
                init()
            }else{
                console.log('request end')
            }
        }
    });
}

var parseString = require('xml2js').parseString;
var xml = ``
parseString(xml, function (err, result) {
    
    result.urlset.url.forEach(element => {
        if(!sites.includes(element.loc[0])){
            sites.push(element.loc[0])
        }
    });
    console.log('request number is: '+sites.length)
});

init();
