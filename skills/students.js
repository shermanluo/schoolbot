var db = require('../db');
var request = require('request');
module.exports = function(controller) {
  
    controller.hears(['^(?:list|view|show|display) announcement(s?)'], 'direct_message,direct_mention', function(bot, message) { 
        bot.startConversation(message, function(err, convo) {
            convo.ask("for what class?", function(response, convo) {
                var classname = response.text; 
                console.log(classname); 
                db.classrooms.findByName(classname).then(function(user) {
                    var classobj = user;
                    db.notifications.findAll(classobj.classID).then(function(user1) {
                        var announcementlist = user1; 
                        convo.say("Hey! Someone wants you to know something!");
                        for (var i = 0; i < announcementlist.length; i++) {
                            convo.say(announcementlist[i].notificationMessage);
                        }
                    }); 
                });
                convo.next();
            }); 
        });
    });
  
    controller.hears(['^(?:list|view|show|display) assignment(s?)'], 'direct_message,direct_mention', function(bot, message) {
        db.assignments.findByStudent(message.data.personId).then(function(user) { 
            console.log(message.data.personId);
            var gradeslist = user;  
            bot.startConversation(message, function(err, convo) {
                var assignmentname = ""; 
                convo.ask("for what assignment?", function(response, convo) {
                    assignmentname = response.text;
                    if (assignmentname == "all") {
                          for (var i = 0; i < gradeslist.length; i++) {
                              if (gradeslist[i].grade == -1) {
                                convo.say("Hmm. \"" + gradeslist[i].title + "\" seems to not have been graded yet.")
                            } else {
                                convo.say("For the assignment \"" + gradeslist[i].title + "\", you got " + gradeslist[i].grade + " points");
                            }
            
                          }
                    } else {
                        var assignment = null; 
                        for (var i = 0; i < gradeslist.length; i++) {
                            if (gradeslist[i].title == assignmentname) { 
                                assignment = gradeslist[i]; 
                            }
                        }
                        if (assignment != null) {
                            convo.say("Here is your assignment information!");
                            if (assignment.grade == -1) {
                                convo.say("Hmm. No assignments have been graded yet.")
                            } else {
                              convo.say("For the assignment \"" + assignment.title + "\" you got " + assignment.grade + " points.");
                            }
                        } else {
                            convo.say("Hmm. You do not seem to have an assignment called \"" + assignmentname + "\"."); 
                        }
                    }
                convo.next();
                }); 
            });
        });   
    });
  
};



      
      
      
      
      
      
     