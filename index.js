var http = require('http');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var express = require('express'),
    app = module.exports.app = express();
var port = process.env.PORT || 3000;

app.use(express.static('./public'));
app.use(bodyParser.urlencoded({ 'extended': 'true' }));
app.use(bodyParser.json());
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
app.use(methodOverride('X-HTTP-Method-Override'));
app.all('/', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
});
var server = http.createServer(app);
var io = require('socket.io').listen(server);
server.listen(port);
require('./app/whiteboard.js')(server);


console.log("App listening on port " + port);