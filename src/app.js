const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const _ = require("lodash")
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});
rooms=[
  
]

function join_room(room_name, socket_id, display_name) {
  let room = rooms.find(o => o.room_name === room_name)
  if(socket_id !== room.room_owner){
    io.to(room.room_owner).emit("room_joined_event", `${display_name} just entered in your room ${room.room_name}`)
  }
  if(room == undefined){
    io.to(socket_id).emit("room_not_exist_event", `${room_name} doesn't exists`)
  }else{
    room.room_mates.push({
      room_mate_name: display_name,
      room_mate_id: socket_id
    })
  }
}



//TODO
//Handle room owner disconnection





function leave_room() {
  // body...
}
//remove user from room on disconnection
function leave_room_disconnection(socket_id) {
  let exists = _.find(rooms, (element)=>{
    //locate room name by checking every room's room_mates with room_mate_id
    t = _.find(element.room_mates, {room_mate_id: socket_id})
    //t will not be undefined if user existed in room
    if(t){
      //console.log(`${t.room_mate_name} with socket_id ${t.room_mate_id} will be remove from ${element.room_name}`)
      let room = rooms.find(o => o.room_name === element.room_name)
      //remove user from room_mates
      room.room_mates = room.room_mates.filter((el)=>{return el.room_mate_id != t.room_mate_id})
      console.log(room)
      //inform room owner about user disconnection
      io.to(room.room_owner).emit("user_disconnected_event", `${t.room_mate_name} with socket_id ${t.room_mate_id} left your room ${element.room_name}`)
    }
  })
}
function create_room(data) {
  room_metadata = {
    room_name: data.room_name,
    room_owner: data.socket_id,
    room_mates: []
  }
  rooms.push(room_metadata)
}
io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on("disconnect",()=>{
  	console.log("a user disconnected")
    leave_room_disconnection(socket.id)
  });
  socket.on("join_room_event",(data)=>{
    join_room(data.room_name, data.socket_id, data.display_name)
    console.log(rooms)
  })
  socket.on("create_room_event", (data)=>{
    create_room(data)
    io.to(socket.id).emit("room_created_event",{status:"created",room_name:data.room_name})
    console.log(rooms)
  })
});

http.listen(3000, () => {
  console.log('listening on *:3000');
});