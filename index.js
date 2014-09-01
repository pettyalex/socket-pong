var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res) {
    res.sendfile('index.html');
});

io.on('connection', function(socket) {
    console.log('a user connected'); // Connect

    socket.on('disconnect', function() {   // DC
        console.log('user disconnected');
    });

    socket.on('chat message', function(msg) {    // Send chat message
        console.log('message: ' + msg);
        io.emit('chat message', msg);
    });
});


http.listen(3000, function() {
    console.log('listening on *:3000');
});
