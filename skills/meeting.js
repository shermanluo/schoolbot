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

    controller.hears(['(.)* start class'], 'direct_message,direct_mention', function(bot, message) {
        var emails
        bot.startConversation(message, function(err, convo) {
            convo.say('Sure! 😁 I will organize a class session for you right away!');

            convo.ask("What do you want to call this class session? Make sure to be descriptive so students won't get lost!", function(response, convo) {

                convo.say('Great! I will invite all the students to the meeting now. Have a great class!');
                db.users.findOne(message.data.personId).then(function(user) {
                    var classroom = user.classrooms[0]; 
                    request({ //Collecting team memberships
                        url: "https://api.ciscospark.com/v1/memberships",
                        method: "GET",
                        headers: {
                        'Content-Type': 'application/json; charset=utf-8',
                        'Authorization': 'Bearer YzdiMjZkMzktNzcwYy00ZmViLWE0ZWUtY2U1ODM3ZjNmMTJiM2I3Mzc2NzItZDBi',

                        },
                        qs: {
                            'roomId': classroom
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
                                        "text": "Class is starting right now! See you there and don't forget to mark yourself present :)"
                                    },
                                }, function (error, response, body){
                                       request({
                                           url: "https://api.ciscospark.com/v1/rooms/" + classroom,
                                         headers: {
                                        'Content-Type': 'application/json; charset=utf-8',
                                        'Authorization': 'Bearer YzdiMjZkMzktNzcwYy00ZmViLWE0ZWUtY2U1ODM3ZjNmMTJiM2I3Mzc2NzItZDBi'
                                        }, 
  
                                           method: "GET",
                                           json: true
                                       }, function (error, response, body) {
                                           var sipnum = body.sipAddress;
                                           request({ //Collecting team memberships
                                               url: "https://api.tropo.com/1.0/sessions?action=create&token=4e464a467046517a6a515772576a70774b5a7961614d664d6e6f7249577a505147725472484b57525966676e&numbertodial=" + sipnum,
                                               method: "GET",
                                               json: true,   // <--Very important!!!

                                           }, function (error, response, body){});
                                       });
                                   });
                            }
                      });
                  }); 
                  convo.next();
            });
        });
    });
}
