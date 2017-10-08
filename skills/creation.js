var db = require('../db');
var request = require('request')
module.exports = function(controller) {
    controller.hears(['^create (class)?room (.*)'], 'direct_message,direct_mention', function(bot, message) {   
      bot.startConversation(message, function(err, convo) {
        var name = message.match[2];
        request({
          url: "https://api.ciscospark.com/v1/rooms",
          method: "POST",
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Authorization': 'Bearer YzdiMjZkMzktNzcwYy00ZmViLWE0ZWUtY2U1ODM3ZjNmMTJiM2I3Mzc2NzItZDBi'
          },
          json: true,   // <--Very important!!!
          body: {
            "title": name
          }
        }, function (error, response, body){
            convo.ask('Please paste the text shown after signing in using the following link: https://api.ciscospark.com/v1/authorize?client_id=C1d18f3fcae99ad889793a17bbe18993feaee5546d21fe23385dbf4e133ec426c&response_type=code&redirect_uri=https%3A%2F%2Fdiamond-pheasant.glitch.me%2Fauth&scope=spark%3Amessages_read%20spark%3Akms', function(response, convo) {
              var authID = response.text
              console.log(body)
              var roomId = body.id;
              request({
              url: "https://api.ciscospark.com/v1/memberships",
              method: "POST",
              headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Authorization': 'Bearer YzdiMjZkMzktNzcwYy00ZmViLWE0ZWUtY2U1ODM3ZjNmMTJiM2I3Mzc2NzItZDBi'
              },
              json: true,   // <--Very important!!!
              body: {
                  "roomId": body.id,
                  "personEmail": message.user
              },
              }, function (error, response, body){
                db.classrooms.create(roomId, message.data.personId, authID, name) 
                db.users.create(message.personId, message.user, 'teacher', [name]);
              });
              convo.next()
            })
          })
      })
      /*request({
    url: "https://api.ciscospark.com/v1/rooms",
    method: "POST",
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Authorization': 'Bearer YzdiMjZkMzktNzcwYy00ZmViLWE0ZWUtY2U1ODM3ZjNmMTJiM2I3Mzc2NzItZDBi'
    },
    json: true,   // <--Very important!!!
    body: {
          "title": name
    }
    }, function (error, response, body){
      var roomId = body.id;
      console.log(body.id);
      request({
      url: "https://api.ciscospark.com/v1/memberships",
      method: "POST",
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Authorization': 'Bearer YzdiMjZkMzktNzcwYy00ZmViLWE0ZWUtY2U1ODM3ZjNmMTJiM2I3Mzc2NzItZDBi'
      },
      json: true,   // <--Very important!!!
      body: {
          "roomId": body.id,
          "personEmail": message.user
      },
      }, function (error, response, body){
        db.classrooms.create(roomId, message.personId, authID, name) 
        db.users.create(message.personId, message.user, 'teacher', [name]);
      });
    });
    });*/
  
  })
};

