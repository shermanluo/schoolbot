var wordfilter = require('wordfilter');
var request = require('request');

function extractEmails(items) {
  var emails = [];
  for (var i = 0; i < items.length; i++) {
    emails.push(items[i].personEmail);
  }
  return emails
}

function sendAnnouncement(announcement) {
  request({ //Collecting team memberships
  url: "https://api.ciscospark.com/v1/memberships",
  method: "GET",
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Authorization': 'Bearer YzdiMjZkMzktNzcwYy00ZmViLWE0ZWUtY2U1ODM3ZjNmMTJiM2I3Mzc2NzItZDBi'
  },
  json: true,   // <--Very important!!!
  qs: {
      "roomId": "Y2lzY29zcGFyazovL3VzL1JPT00vOGFlYWExZDAtYWI5Yy0xMWU3LWEyOWItMmRlMTAyNTBkMjRm"
  },
  }, function (error, response, body){
    console.log(body);
    var items = body.items;
    for (var i = 0; i < items.length; i++) {
      request({ //sending messages to everyone
      url: "https://api.ciscospark.com/v1/messages",
      method: "POST",
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Authorization': 'Bearer YzdiMjZkMzktNzcwYy00ZmViLWE0ZWUtY2U1ODM3ZjNmMTJiM2I3Mzc2NzItZDBi'
      },
      json: true,   // <--Very important!!!
      body: {
          "toPersonEmail": items[i].personEmail,
          "text": "Announcement: " + announcement.title +"\n" + announcement.body
      },
      }, function (error, response, body){

      });
    }
  });
} 


module.exports = function(controller) {
  /* Collect some very simple runtime stats for use in the uptime/debug command */
  if (controller == -1){
    return sendAnnouncement;
  }
  var stats = {
      triggers: 0,
      convos: 0,
  }

  controller.on('heard_trigger', function() {
      stats.triggers++;
  });

  controller.on('conversationStarted', function() {
      stats.convos++;
  });


  controller.hears(['^uptime','^debug'], 'direct_message,direct_mention', function(bot, message) {

      bot.createConversation(message, function(err, convo) {
          if (!err) {
              convo.setVar('uptime', formatUptime(process.uptime()));
              convo.setVar('convos', stats.convos);
              convo.setVar('triggers', stats.triggers);

              convo.say('My main process has been online for {{vars.uptime}}. Since booting, I have heard {{vars.triggers}} triggers, and conducted {{vars.convos}} conversations.');
              convo.activate();
          }
      });

  });
  
  controller.hears(['assign (.*) to (.*)'], 'direct_message', function(bot, message) {
    bot.startConversation(message, function(err, convo) {
      if (message.match[2] == 'everyone' || message.match[2] == 'everybody') {
        //add assignment to every user in db
      }
      //add assignment to message.match[2] in db
    })
  })
  
  controller.hears(['(view )?(.*)\'s grade(s)|(book)'], 'direct_message', function(bot, message) {
    //lots of database stuff
    var student = message.match[1];
    
    bot.reply(message, student)
  })
  
  controller.hears(['(view )?grade(s)|(book)'], 'direct_message', function(bot, message) {
    //lots of database stuff
    var gradesString = "";
    
    bot.reply(message, gradesString)
  })
  
  controller.hears(['grade (.*) for (.*)'], 'direct_message', function(bot, message) {
    var assignmentTitle = message.match[1];
    var student = message.match[2];
    //lots of database stuff
    bot.reply(message, "here's your grades yo")
  })
  
  controller.hears(['((make)|(create))( new)? assignment'], 'direct_message', function(bot, message) {
    var assignment = {title: "", maxPoints: 0, duedate: "", description: ""};
    bot.startConversation(message, function(err, convo) {
      convo.ask('What is the title of the new assignment?', function(response, convo) {
        assignment.title = response.text;
        convo.ask('How many points is it worth? Just put 0 if the assignment is ungraded.', function(response, convo) {
          assignment.maxPoints = parseInt(response.text);
          convo.ask('When should it be due?', function(response, convo) {
            assignment.duedate = response.text;
            convo.addQuestion('Do you want to add a description?',[
              {
                pattern: bot.utterances.yes,
                callback: function(response,convo) {
                  convo.ask('Enter your description below.', function(response, convo) {
                    assignment.description = response.text
                  })
                  convo.next();
                }
              },
              {
                pattern: bot.utterances.no,
                callback: function(response,convo) {
                  convo.say('Okay');
                  // do something else...
                  convo.next();
                }
              },
              {
                default: true,
                callback: function(response,convo) {
                  // just repeat the question
                  convo.repeat();
                  convo.next();
                }
              }
            ],{},'default');
            convo.next();
          })
          convo.next()
        })
        convo.next()
      })
      convo.next()
    })
  })
  
  controller.hears(['^make( new)? announcement'], 'direct_message', function(bot, message) {
      var announcement = {title: "", body:""};
      bot.startConversation(message, function(err, convo) {
            convo.ask('What should the title of this announcement be?', function(response, convo) {
                convo.say('adding title to announcement');
                announcement.title = response.text;
                convo.ask('What should the body of this announcement be?', function(response, convo) {
                    convo.say('adding body to announcement');
                    announcement.body = response.text;
                    convo.addQuestion('Should I notify students of this announcement?',[
                      {
                        pattern: bot.utterances.yes,
                        callback: function(response,convo) {
                          convo.say('should call api here and store ' + announcement.title);
                          sendAnnouncement(announcement);
                          convo.next();

                        }
                      },
                      {
                        pattern: bot.utterances.no,
                        callback: function(response,convo) {
                          convo.say('Okay');
                          // do something else...
                          convo.next();
                        }
                      },
                      {
                        default: true,
                        callback: function(response,convo) {
                          // just repeat the question
                          convo.repeat();
                          convo.next();
                        }
                      }
                    ],{},'default');
                    convo.next();
                });
                convo.next();
            });
        });
  });


  /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
  /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
  /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
  /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
  /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
  /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
  /* Utility function to format uptime */
  function formatUptime(uptime) {
      var unit = 'second';
      if (uptime > 60) {
          uptime = uptime / 60;
          unit = 'minute';
      }
      if (uptime > 60) {
          uptime = uptime / 60;
          unit = 'hour';
      }
      if (uptime != 1) {
          unit = unit + 's';
      }

      uptime = parseInt(uptime) + ' ' + unit;
      return uptime;
    }
};