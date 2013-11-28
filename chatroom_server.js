var net = require('net');
var args = require('optimist').usage('Create nodejs chat server.\nUsage:$0').demand('p').alias('p','port').describe('p','specify port number').default({p:5566}).argv;

var PORT = args.port
var sockets = {};
var id = 0;

net.createServer(function(sock) {
    var ask_name = true;
    var ask_room = true;
    var name;
    var room;
    var buffer = "";
    var socket_data = {};
    socket_data['sock'] = sock;

    sock.write('Welcome, enter your username:');

    sock.on('data', function(data) {
            if (ask_name) {
                buffer += data;
                buffer = buffer.replace(/(\r\n|\n|\r)/gm,"");
                name = buffer;
                console.log(buffer + " has joined.(from: " + sock.remoteAddress + ")");
                buffer = "";
                ask_name = false;
                socket_data['name'] = name;
                sock.write('Please input your room:');
            } else if (ask_room) {
                buffer += data;
                buffer = buffer.replace(/(\r\n|\n|\r)/gm,"");
                room = buffer;
                buffer = "";
                ask_room = false;
                socket_data['room'] = room;
                sockets[id++] = socket_data;
                sock.write("==========\n");
                for (var i in sockets) {
                    if (sockets[i].sock == sock) {
                        continue;
                    } else {
                        if(sockets[i].room == room)
                            sockets[i].sock.write(name + " has joined.\n");
                    }
                }
            } else {
                buffer += data;
                buffer = buffer.replace(/(\r\n|\n|\r)/gm,"");
                for (var i in sockets) {
                    if (sockets[i].sock == sock) {
                        continue;
                    } else {
                        if (sockets[i].room == room)
                            sockets[i].sock.write(name + ": " + buffer +"\n");
                    }
                }
                buffer = "";
            }

    });

    sock.on('close', function(data) {
        console.log(name + " left the chat (room: " + room + ").");
        for (var i in sockets) {
            if (sockets[i].sock == sock) {
                var del = i;
                continue;
            } else {
                if(sockets[i].room == room)
                    sockets[i].sock.write(name + " has left\n");
            }
        }
        delete sockets[del];
    });

}).listen(PORT);
console.log('Chat server running at port ' + PORT);
