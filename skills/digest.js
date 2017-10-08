var db = require('../db');
var request = require('request');
module.exports = function(controller) {
    controller.hears(['^summarize'], 'direct_message,direct_mention', function(bot, message) {
      var room;
      db.users.findOne(message.data.personId).then(function(user) {
        room = user.classrooms[0];
        bot.reply(message, "I think its working");
      request({ //gets messages
      url: "https://api.ciscospark.com/v1/messages",
      method: "GET",
        headers: {
                  'Content-Type': 'application/json; charset=utf-8',
                  'Authorization': 'Bearer NTZhZjJlNmUtMjQxYS00ZWU3LWJmMWItNmNkMDg4NDVjMTczNTAyMjU5ZDctYzhl',
                  
      },
      json: true,   
      qs: {
       'roomId': room
      }
      }, function (error, response, body){
        var s = "";
        var d = new Date();
        for (var i = 0; i < body.items.length; i++) {
          if (body.items[i].personId !== "Y2lzY29zcGFyazovL3VzL1BFT1BMRS80MmNiMjIzNy0zZDg4LTQwZmUtOWQyZi0yZjE2YTk5YmM0YmM" 
              && (d.toISOString().split('T')[0] == body.items[i].created.split('T')[0])) {
            s = s + " " + body.items[i].text;
          } 
        }
         request({
            url: "https://api.aylien.com/api/v1/summarize",
            method: "GET",
            headers: {
              'Content-Type': 'application/json; charset=utf-8',
              'X-AYLIEN-TextAPI-Application-Key': '8253b56adec167745a2c3d0fdef73d80',
              'X-AYLIEN-TextAPI-Application-ID': '7eade414'
            },
            json: true,   
            qs: {
                  "text": s,
                  "title": "lol",
                  "sentences-number": 3
            }
            }, function (error, response, body){
              var sentences = " ";
              for (var i = 0; i < body.sentences.length; i++) {
                sentences = sentences + " " + body.sentences[i];
              }
              bot.reply(message, "Summary:" + "\n" + sentences);
          request({
            url: "https://api.aylien.com/api/v1/concepts",
            method: "GET",
            headers: {
              'Content-Type': 'application/json; charset=utf-8',
              'X-AYLIEN-TextAPI-Application-Key': '8253b56adec167745a2c3d0fdef73d80',
              'X-AYLIEN-TextAPI-Application-ID': '7eade414'
            },
            json: true,   
            qs: {
                  "text": s
            }
            }, function (error, response, body){
              var parent = body.concepts;
              var concepts = "Concepts:\n";
              for (var i = 0; i < Object.keys(parent).length; i++) {
                var url = Object.keys(parent)[i];
                concepts += parent[url].surfaceForms[0].string + " " + Object.keys(parent)[i] + "\n";
              }
              bot.reply(message, concepts);
          })
    })
    })
      });
      
      
     
                                                                                                
    });
  
    
};