var db = require('../db')
var request = require('request')
module.exports = function(controller) {
    controller.hears(['^invite (.*)'], 'direct_message,direct_mention', function(bot, message) {
    
    var email = message.match[1];   //INVITES SOMEONE
    db.users.findOne(message.data.personId).then(function(user) {
      var room = user.classrooms[0];
      request({
      url: "https://api.ciscospark.com/v1/memberships",
      method: "POST",
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Authorization': 'Bearer YzdiMjZkMzktNzcwYy00ZmViLWE0ZWUtY2U1ODM3ZjNmMTJiM2I3Mzc2NzItZDBi'
      },
      json: true,   // <--Very important!!!
      body: {
          "roomId": room, 
          "personEmail": email
      },
      }, function (error, response, body){ 
          db.users.findOne(message.data.personId).then(function(res) {
            
            request({
              url: "https://api.ciscospark.com/v1/people",
              method: "GET",
              headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Authorization': 'Bearer YzdiMjZkMzktNzcwYy00ZmViLWE0ZWUtY2U1ODM3ZjNmMTJiM2I3Mzc2NzItZDBi'
              },
              json: true,   // <--Very important!!!
              qs: {
                  "email": email
              },
              }, function (error, response, body){ 
            console.log(response);
            db.users.create(body.items[0].id, email, 'student', [res.classrooms[0]]);
            })
            
          
          
          })
      
          bot.reply(message, '**'+email + "** was added to the room and notified!");
          request({//SENDS A MESSAGE
          url: "https://api.ciscospark.com/v1/messages",
          method: "POST",
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Authorization': 'Bearer YzdiMjZkMzktNzcwYy00ZmViLWE0ZWUtY2U1ODM3ZjNmMTJiM2I3Mzc2NzItZDBi',
          },
          json: true,   // <--Very important!!!
          body: {
              "toPersonEmail": email,
              'markdown': 'You were added to a class!'
          },
          }, function (error, response, body){
              
          });
      });
    })
    
  
});
}