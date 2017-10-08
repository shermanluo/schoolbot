var db = require('../db');
var wordfilter = require('wordfilter');
var request = require('request');

function extractEmails(items) {
    var emails = [];
    for (var i = 0; i < items.length; i++) {
        emails.push(items[i].personEmail);
    }
    return emails
}

function sendAnnouncement(announcement, classID) {
    //classID = "Y2lzY29zcGFyazovL3VzL1JPT00vOGFlYWExZDAtYWI5Yy0xMWU3LWEyOWItMmRlMTAyNTBkMjRm"
    db.notifications.create(classID, announcement.title + ": " + announcement.body).then(function(user) {
    }); 
    request({ //Collecting team memberships
        url: "https://api.ciscospark.com/v1/memberships",
        method: "GET",
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Authorization': 'Bearer YzdiMjZkMzktNzcwYy00ZmViLWE0ZWUtY2U1ODM3ZjNmMTJiM2I3Mzc2NzItZDBi'
        },
        json: true,   // <--Very important!!!
        qs: {
            "roomId": classID
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
                       "markdown": "##Announcement:  " + announcement.title +"<br> <p>" + announcement.body + "</p>"
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
    /*
    controller.hears(['(view )?grade(s)|(book)'], 'direct_message', function(bot, message) {
          console.log('regex is eveb being invokes3');

      db.users.findOne(message.data.personId).then((user) => {
        if (user.type != 'teacher') return
        var classID = user.classrooms[0]
        var gradebook = {}
        db.users.findByClassroom(classID).then((userArray) => {
          for (var i = 0; i < userArray.length; i++) {
            var student = userArray[i]
            db.assignments.findByStudent(student.userID).then((assignmentArray) => {
              var sum = 0
              var total = 0
              for (var j = 0; j < assignmentArray; j++) {
                var assign = assignmentArray[j]
                sum += assign.grade
                total += assign.maxPoints
              }
              gradebook[student.userID] = sum / total
            })
          }
        }).then(() => {
          bot.reply(message, JSON.stringify(gradebook))
        })
    })})
    */
  controller.hears(['(view )?(.*)\'s grade(s)|(book)'], 'direct_message', function(bot, message) {
      db.users.findOne(message.data.personId).then((user) => {
      if (user.type != 'teacher' && user.personEmail != message.match[2]) return
          var classID = user.classrooms[0]
          var gradebook = {}
          let promises = [];
          console.log(classID);
          db.users.findByClassroom(classID).then((userArray) => {
              console.log(userArray);
              for (var i = 0; i < userArray.length; i++) {
                  /* Let's add these promises to the promises array */
                  var student = userArray[i]
                  console.log(student.email);
                  console.log(message.match[2]);
                  if (student.email == message.match[2]) {
                      promises.push(db.assignments.findByStudent(student.userID));
                      console.log(student.userID)
                  }
              }
              Promise.all(promises).then(function(list){
                  list.forEach(function(assignmentArray){
                      console.log(assignmentArray);
                      for (var j = 0; j < assignmentArray.length; j++) {
                          var assign = assignmentArray[j]
                          gradebook[assign.title] = "" + assign.grade + " / " + assign.maxPoints
                      }
                      bot.reply(message, JSON.stringify(gradebook))
                  });
              });
          })
      })
  })

  controller.hears(['grade (.*) for (.*)'], 'direct_message', function(bot, message) {
    db.users.findOne(message.data.personId).then((user) => {
      if (user.type != 'teacher') return
    var assignmentTitle = message.match[1];
    var target = message.match[2];
    var classID = user.classrooms[0]
    db.users.findByClassroom(classID).then((studentArray)=> {
      for(var i = 0; i < studentArray.length; i++) {
        var student = studentArray[i]
          if (target == student.email) {
            db.assignments.findByStudent(student.userID).then((assignmentArray) => {
              console.log(assignmentArray)
              for (var j = 0; j < assignmentArray.length; j++) {
                var assign = assignmentArray[j]
                console.log(assign.title, assignmentTitle)
                if (assign.title == assignmentTitle) {
                  bot.startConversation(message, function(err, convo) {
                    convo.ask("How many points did " + target + " get out of " + assign.maxPoints + "?", function(response, convo) {
                      db.assignments.updateGrade(student.userID, assign.title, response.text)
                      convo.next()
                    })
                  })
                }
              }
            })
          }
        }
      })
  })})
  
  controller.hears(['((make)|(create))( new)? assignment'], 'direct_message', function(bot, message) {
    db.users.findOne(message.data.personId).then((user) => {
      if (user.type != 'teacher') return
    var assignment = {title: "", maxPoints: 0, duedate: "", description: ""};
    bot.startConversation(message, function(err, convo) {
      convo.ask('What is the title of the new assignment?', function(response, convo) {
        assignment.title = response.text;
        convo.ask('How many points is it worth? Just put 0 if the assignment is ungraded.', function(response, convo) {
          assignment.maxPoints = parseInt(response.text);
          var classID = user.classrooms[0]
            assignment.description = response.text
            db.users.findByClassroom(classID).then((studentArray)=> {
              for(var i = 0; i < studentArray.length; i++) {
                var student = studentArray[i]
                db.assignments.create(student.userID, assignment.title, classID, 0, assignment.maxPoints)
              }
            })
          })
          convo.next()
        })
        convo.next()
      })
    })
  })
  
  controller.hears(['^make( new)? announcement'], 'direct_message', function(bot, message) {
    db.users.findOne(message.data.personId).then((user) => {
      if (user.type != 'teacher') return
      var announcement = {title: "", body:""};
      bot.startConversation(message, function(err, convo) {
            convo.ask('What should the title of this announcement be?', function(response, convo) {
                announcement.title = response.text;
                convo.ask('What should the body say?', function(response, convo) {
                    announcement.body = response.text;
                    convo.addQuestion('Should I notify students of this announcement?',[
                      {
                        pattern: bot.utterances.yes,
                        callback: function(response,convo) {
                          convo.ask("Please type the class that this announcement should go to", function(response, convo){
                              var classname = response.text;
                              var classID = user.classrooms[0]
                              sendAnnouncement(announcement, classID);
                              var notificationMessage = announcement.title + ": " + announcement.body
                              db.notifications.create(classID, notificationMessage).then(function(user) {
                              });
                              convo.next();
                          })
                          convo.next();

                        }
                      },
                      {
                        pattern: bot.utterances.no,
                        callback: function(response,convo) {
                          convo.say('Not a problem. Message created. You can view all your announcements by asking to view announcements');
                          convo.next();
                        }
                      },
                      {
                        default: true,
                        callback: function(response,convo) {
                          convo.say('Sorry, didn\'t catch that. Yes or no?')
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
    })
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