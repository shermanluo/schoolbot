var express = require('express');
var bodyParser = require('body-parser');
var querystring = require('querystring');
var request = require('request');
var debug = require('debug')('botkit:webserver');

module.exports = function(controller, bot) {


    var webserver = express();
    webserver.use(bodyParser.json());
    webserver.use(bodyParser.urlencoded({ extended: true }));

    // import express middlewares that are present in /components/express_middleware
    var normalizedPath = require("path").join(__dirname, "express_middleware");
    require("fs").readdirSync(normalizedPath).forEach(function(file) {
        require("./express_middleware/" + file)(webserver, controller);
    });

    webserver.use(express.static('public'));
    webserver.get('/auth', function (req, res) {
      request({ //sending messages to everyone
        url: "https://api.ciscospark.com/v1/access_token",
        method: "POST",
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
        },
        json: true,   // <--Very important!!!
        form: {
          grant_type: "authorization_code",
          client_id: "C1d18f3fcae99ad889793a17bbe18993feaee5546d21fe23385dbf4e133ec426c",
          client_secret: "b4fa61cb96160a648d26659e39f34e6530c3a25c8178e7cb8e28e003f93de856",
          code: req.query.code,
          redirect_uri: "https://diamond-pheasant.glitch.me/auth"
        },
        }, function (error, response, body){
          const access_token = body.access_token
          const refresh_token = body.refresh_token
          res.send(access_token)
        });
    })

    webserver.listen(process.env.PORT || 3000, null, function() {

        debug('Express webserver configured and listening at http://localhost:' + process.env.PORT || 3000);

    });

    // import all the pre-defined routes that are present in /components/routes
    var normalizedPath = require("path").join(__dirname, "routes");
    require("fs").readdirSync(normalizedPath).forEach(function(file) {
      require("./routes/" + file)(webserver, controller);
    });

    controller.webserver = webserver;
  
    return webserver;

}
