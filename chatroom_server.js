var net = require('net');

var HOST = '127.0.0.1';
var PORT = process.argv[2]
var socket_array = Array();

// Create a server instance, and chain the listen function to it
// The function passed to net.createServer() becomes the event handler for the 'connection' event
// The sock object the callback function receives UNIQUE for each connection
net.createServer(function(sock) {
    // We have a connection - a socket object is assigned to the connection automatically
    var ask_name = true;
    var ask_room = true;
    var name;
    var room;
    var buffer = "";
    var socket_data = Array();
    socket_data['socket'] = sock;
    sock.write('Welcome, enter your username:');
    //console.log('CONNECTED: ' + sock.remoteAddress +':'+ sock.remotePort);

    // Add a 'data' event handler to this instance of socket
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
                //console.log(name + "'s room is: " + room);
                buffer = "";
                ask_room = false;
                socket_data['room'] = room;
                socket_array.push(socket_data);
                sock.write("==========\n");
                for (var i = 0; i < socket_array.length; i++) {
                    if (socket_array[i].socket == sock) {
                        continue;
                    } else {
                        socket_array[i].socket.write(name + " has joined.\n");
                    }
                }
            } else {
                buffer += data;
                buffer = buffer.replace(/(\r\n|\n|\r)/gm,"");
                //console.log(name + " says: " + buffer);
                for (var i = 0; i < socket_array.length; i++) {
                    if (socket_array[i].socket == sock) {
                        continue;
                    } else {
                        if (socket_array[i].room == room)
                        socket_array[i].socket.write(name + ": " + buffer +"\n");
                    }
                }
                buffer = "";
            }


        //console.log('DATA ' + sock.remoteAddress + ': ' + data);
        // Write the data back to the socket, the client will receive it as data from the server
        //sock.write('You said "' + data + '"');

    });

    // Add a 'close' event handler to this instance of socket
    sock.on('close', function(data) {
        console.log(name + " left the chat (room: " + room + ").");
        for (var i = 0; i < socket_array.length; i++) {
            if (socket_array[i].socket == sock) {
                socket_array.splice(i,1);
                i--;
            } else {
                socket_array[i].socket.write(name + " has left\n");
            }
        }
        //console.log('CLOSED: ' + sock.remoteAddress +' '+ sock.remotePort);
    });

}).listen(PORT);
console.log('Chat server running at port ' + PORT);
//console.log('Server listening on ' + HOST +':'+ PORT);
