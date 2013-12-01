var net = require('net');
var args = require('optimist').usage('Create nodejs chat server.\nUsage:$0').demand('p').alias('p','port').describe('p','specify port number').default({p:5566}).argv;

var PORT = args.port
var rooms = {};
var id = 0;

net.createServer(function(sock) {
    var ask_name = true;
    var ask_room = true;
    var name;
    var room;
    var buffer = "";

    sock.write('Welcome, enter your username:');

    sock.on('data', function(data) {
            if (ask_name) {
                buffer += data;
                buffer = buffer.replace(/(\r\n|\n|\r)/gm,"");
                name = buffer;
                console.log(buffer + " has joined.(from: " + sock.remoteAddress + ")");
                buffer = "";
                ask_name = false;
                sock.write('Please input your room:');
            } else if (ask_room) {
                buffer += data;
                buffer = buffer.replace(/(\r\n|\n|\r)/gm,"");
                room = buffer;
                buffer = "";
                ask_room = false;
                if(room in rooms){
                    rooms[room][name] = sock;
                }
                else{
                    rooms[room] = {};
                    rooms[room][name] = sock;
                }
                sock.write("==========\n");
                for (var user in rooms[room]) {
                    if(user != name)
                        rooms[room][user].write(name + " has joined.\n");
                }
            } else {
                buffer += data;
                //buffer = buffer.replace(/(\r\n|\n|\r)/gm,"");
                for (var user in rooms[room]) {
                        rooms[room][user].write(user+' says '+buffer);
                    }
                buffer = "";
            }

    });

    sock.on('close', function(data) {
        console.log(name + " left the chat (room: " + room + ").");
        for (var user in rooms[room]) {
            if (user != name) {
                rooms[room][user].write(name + " has left\n");
            }
        }
        delete rooms[room][user];
    });

}).listen(PORT);
console.log('Chat server running at port ' + PORT);
