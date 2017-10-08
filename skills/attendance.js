
var request = require('request');
var sendAnnouncement = require('./teacher')(-1);
module.exports = function(controller) {
    controller.hears(['^collect attendance for (.*)'], 'direct_message,direct_mention', function(bot, message) {
        //
        var string = message.match[0];
        var classregx = /collect attendance for (.*)/;
        var match = classregx.exec(string);
        var announcement = {title: match[1] + " is starting. ", body: "Please type: present " + match[1]};
        sendAnnouncement(announcement);
        //db.collectingAttendance(match[1]);
    }); 
  
    controller.hears(['^stop collecting attendance for (.*)'], 'direct_message,direct_mention', function(bot, message) {
        //db.stopcollectingAttendance(match[1]);
    }); 
  
    controller.hears(['^present (.*)'], 'direct_message,direct_mention', function(bot, message) {
        var string = message.match[0];
        var classregx = /collect attendance for (.*)/;
        var match = classregx.exec(string);
        //if(db.collectingAttendance(match[1])) {
              //db.markPresent(message.user, match[1]);
        //} 
    });
  
    controller.hears(['^Send quiz (.*)'], 'direct_message,direct_mention', function(bot, message) {
        bot.startConversation(message, function(err, convo) {
            var announcement = {}
            var classroom = ""; 
            var message = ""; 
            convo.ask("Please type the class that you would like to message", function(response, convo) {
                classroom = response.text;
                announcement.title = classroom; 
                convo.ask("Please type the question.", function(response, convo) {
                    message = response.text; 
                    announcement.body = message; 
                    convo.next()
                }); 
                convo.next()
            }); 
            sendAnnouncement(announcement); 
          
            
        }); 
        
    }); 
  
    
}





