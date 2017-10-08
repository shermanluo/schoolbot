var request = require('request')
module.exports = function(controller) {
    controller.hears(['^invite (.*)'], 'direct_message,direct_mention', function(bot, message) {
    
    var email = message.match[1];   //INVITES SOMEONE
    request({
      url: "https://api.ciscospark.com/v1/memberships",
      method: "POST",
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Authorization': 'Bearer YzdiMjZkMzktNzcwYy00ZmViLWE0ZWUtY2U1ODM3ZjNmMTJiM2I3Mzc2NzItZDBi'
      },
      json: true,   // <--Very important!!!
      body: {
          "roomId": "Y2lzY29zcGFyazovL3VzL1JPT00vOGFlYWExZDAtYWI5Yy0xMWU3LWEyOWItMmRlMTAyNTBkMjRm", 
          "personEmail": email
      },
      }, function (error, response, body){ //SENDS A MESSAGE
          bot.reply(message, email + " was added to the room and notified!");
              request({
          url: "https://api.ciscospark.com/v1/messages",
          method: "POST",
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Authorization': 'Bearer YzdiMjZkMzktNzcwYy00ZmViLWE0ZWUtY2U1ODM3ZjNmMTJiM2I3Mzc2NzItZDBi',
          },
          json: true,   // <--Very important!!!
          body: {
              "toPersonEmail": email,
              'text': 'You have been added to a new classroom!'
          },
          }, function (error, response, body){
              
          });
      });
  
});
}