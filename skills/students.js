var db = require('../db');
var request = require('request');
module.exports = function(controller) {
  
    controller.hears(['^view announcements(.*)'], 'direct_message,direct_mention', function(bot, message) {
        var classname = ""; 
        bot.startConversation(message, function(err, convo) {
            convo.ask("what class?", function(response, convo) {
                classname = response.text; 
                convo.next();
            }); 
        });
        var announcementlist = null; 
        var classobj = null;
        db.classrooms.findByName(classname).then(function(user) {
          classobj = user;
          db.notifications.findAll(classobj.classID).then(function(user) {
            announcementlist = user; 
            console.log("fuckdslfjsdk")
            console.log(announcementlist.length)
            for (var i = 0; i < announcementlist.length; i++) {
                bot.reply(message, announcementlist[i].notificationMessage);
            }
          }); 
        });
    });
  
    controller.hears(['^(?:list|view|show|display) assignments(.*)'], 'direct_message,direct_mention', function(bot, message) {
        var gradeslist = null; 
        db.assignments.findByStudent(message.personId).then(function(user) { 
            gradeslist = user; 
            bot.startConversation(message, function(err, convo) {
                var assignmentname = ""; 
                convo.ask("what assignment?", function(response, convo) {
                    //
                    assignmentname = response.text
                    if (assignmentname == "all") {
                          bot.reply(message, "Here are your grades");
                          for (var i = 0; i < gradeslist.length; i++) {
                              bot.reply(message, gradeslist[i].title + ": " + gradeslist[i].grade);
                          }
                    } else {
                        var namematched = false; 
                        var assignment = ""; 
                        for (var i = 0; i < gradeslist.length; i++) {
                            if (gradeslist[i].title == assignmentname) {
                                namematched = true; 
                                assignment = gradeslist[i]; 
                            }
                        }
                        if (namematched) {
                            convo.say(assignment.title + ": " + assignment.grade);
                        } else {
                            convo.say("You do not seem to have an assignment called " + assignmentname); 
                        }
                    }
                convo.next();
                }); 
            });
        }); 
        
    });
  
};



      
      
      
      
      
      
     