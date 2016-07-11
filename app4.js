var superagent = require('superagent');
var cheerio = require('cheerio');
var eventproxy = require('eventproxy');
var url = require('url');
var fs = require('fs');
var ep = new eventproxy();


var codeUrl = 'https://cnodejs.org';

superagent.get(codeUrl)
  .end(function (err,res) {
     if(err){
      return console.error(err);
     }

  var topicUrls = [];
  var $ = cheerio.load(res.text);

  $('#topic_list .topic_title').each(function (index,element) {
     var $element = $(element);
     var href = url.resolve(codeUrl,$element.attr('href'));
     topicUrls.push(href);
  });

 // console.log(topicUrls);

 ep.after('topic_html',topicUrls.length,function(topics){
  topics = topics.map(function (topicPair) {

    var topicUrl = topicPair[0];
    var topicHtml = topicPair[1];
    var $ = cheerio.load(topicHtml);

    var title = $('.topic_full_title').text().trim();

    fs.appendFile('topicOutput.txt',title+"\r\n",function(err
    ){
    if(err) throw err;
    console.log("saved.");
  });

    return ({
      title: $('.topic_full_title').text().trim(),
      href: topicUrl,
      comment1: $('.reply_content').eq(0).text().trim(),
    });
  });

  console.log("fianl:");
  console.log(topics);


 });

 topicUrls.forEach(function (topicUrl) {
    superagent.get(topicUrl)
    .end(function (err,res) {
       console.log('fetch' + topicUrl + 'successful');
      ep.emit('topic_html',[topicUrl, res.text]);
    });
 });


  });


