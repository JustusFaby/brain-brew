module.exports = (io) => {

 io.on("connection",(socket)=>{

   console.log(
     "User Connected",
     socket.id
   );

   socket.on(
     "join-room",
     (roomId)=>{

       socket.join(roomId);

     }
   );

   socket.on(
     "send-message",
     (data)=>{

       io.to(data.roomId)
       .emit(
         "receive-message",
         data
       );

     }
   );

   socket.on(
     "disconnect",
     ()=>{

       console.log(
         "User Disconnected"
       );

     }
   );

 });

};
