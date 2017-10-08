var request = require('request')
var db = require('../db');
function extractEmails(items) {
  var emails2 = items.map((x) => x.personalEmail);
  var emails = [];
  for (var i = 0; i < items.length; i++) {
    emails.push(items[i].personEmail);
  }
  return emails
}

module.exports = function(controller) {
    
    controller.hears(['meeting'], 'direct_message,direct_mention', function(bot, message) {
        var emails
        bot.startConversation(message, function(err, convo) {
            convo.say('Okay I will create a meeting for you right away!');

            convo.ask('What is the name of the meeting?', function(response, convo) {

                convo.say('Great, I will invite all the students to the meeting');
                db.users.findOne(message.personId).then(function(user) {
                    var classroom = user.classrooms[0]; 
                    request({ //Collecting team memberships
                        url: "https://api.ciscospark.com/v1/memberships",
                        method: "GET",
                        headers: {
                        'Content-Type': 'application/json; charset=utf-8',
                        'Authorization': 'Bearer YzdiMjZkMzktNzcwYy00ZmViLWE0ZWUtY2U1ODM3ZjNmMTJiM2I3Mzc2NzItZDBi',

                    },
                    qs: {
                        'roomId': 'Y2lzY29zcGFyazovL3VzL1JPT00vOGFlYWExZDAtYWI5Yy0xMWU3LWEyOWItMmRlMTAyNTBkMjRm'
                    },
                    json: true,   // <--Very important!!!

                    }, function (error, response, body){
                        emails = extractEmails(body.items);
                        for (var i = 0; i < emails.length; i++) {
                            request({ //sending messages to everyone
                                url: "https://api.ciscospark.com/v1/messages",
                                method: "POST",
                                headers: {
                                    'Content-Type': 'application/json; charset=utf-8',
                                    'Authorization': 'Bearer YzdiMjZkMzktNzcwYy00ZmViLWE0ZWUtY2U1ODM3ZjNmMTJiM2I3Mzc2NzItZDBi'
                                },
                                json: true,   // <--Very important!!!
                                body: {
                                    "toPersonEmail": emails[i],
                                    "text": "A ghetto meeting is starting"
                                },
                            }, function (error, response, body){
                      
                                   request({ //Collecting team memberships
                                       url: "https://api.tropo.com/1.0/sessions?action=create&token=4e464a467046517a6a515772576a70774b5a7961614d664d6e6f7249577a505147725472484b57525966676e&numbertodial=<sipID>",
                                       method: "GET",
                                  json: true,   // <--Very important!!!
                
                                }, function (error, response, body){})
                              });
                    }
                  });
                  }); 
                
                
                  convo.next();
              
                
            });
        });

    });
};
