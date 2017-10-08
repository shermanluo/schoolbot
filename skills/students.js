//let db = require('db');
var request = require('request');
module.exports = function(controller) {
  
    controller.hears(['^view announcements(.*)'], 'direct_message,direct_mention', function(bot, message) {
        var announcementlist = [
            {classID: 'Ymksfdafdajfkj...', notificationMessage: 'Hey class CS HW due tomorrow', timestamp: 128399812}
        ];
        //var announcementlist = db.notifications.findAll(match[1]); 
        for (var i = 0; i < announcementlist.length; i++) {
            bot.reply(message, announcementlist[i].notificationMessage);
        }
    });
  
    controller.hears(['^(?:list|view|show|display) assignments(.*)'], 'direct_message,direct_mention', function(bot, message) {
        //var user = db.GETIDFROMUSER(message.user)
        //var gradeslist = db.assignments.findByStudent(user); 
        //dummy gradeslist
        var gradeslist = [
            {classID: 'Ymksfdafdajfkj...', studentID: 'Ymkjfkjabkb', title: '61a midterm', grade: .82734, timestamp: 128399812}
        ];
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
                        convo.say("would you like to see your statistics? Use the command: view statistics for statistics.");

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
                        convo.say("would you like to see your statistics? Use the command: view statistics for statistics.");
                    } else {
                        convo.say("You do not seem to have an assignment called " + assignmentname); 
                    }
                }
            convo.next();
            }); 
            
        });
    });
  
    /*controller.hears(['^view statistics(.*)'], 'direct_message,direct_mention', function(bot, message) {
        //var statistics = db.getStatistics(message.user);
        //for (var i = 0; i < statistics.length; i++) {
            //bot.reply(message, statistics[i]);
        //}
          bot.reply(message, "statistics");
      });*/
  
};



      
      
      
      
      
      
     