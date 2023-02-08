const express=require('express');
const bodyParser=require('body-parser')
const {Server}=require('socket.io');

const io= new Server(
    {cors:true}
);

const app=express();

app.use(bodyParser.json())

const emailtosocketmapping=new Map();
const sockettoemailmapping=new Map();


  io.on("connection",(socket)=>{
    socket.on('join-room',(data)=>{
        console.log("New Connection")
        const {roomId,emailId}=data;
        console.log(emailId,"Joined room ",roomId);
        emailtosocketmapping.set(emailId,socket.id);
        sockettoemailmapping.set(socket.id,emailId);
        socket.join(roomId);
        socket.emit("joined-room",roomId);
        socket.broadcast.to(roomId).emit("user-joined",{emailId});

    })
    
    socket.on('call-user',(data)=>{
        const {emailId,offer}=data;
        const fromEmail=sockettoemailmapping.get(socket.id);
        const socketId=emailtosocketmapping.get(emailId);
        socket.to(socketId).emit('incomming-call',{from:fromEmail,offer})
    })

    socket .on('call-accepted',(data)=>{
        const {emailId,ans}=data;
        const socketId=emailtosocketmapping.get(emailId);
        socket.to(socketId).emit('call-accepted',{ans});
    })

  })



app.listen(8000,()=>{
    console.log("Running at server 8000")
})

io.listen(8001);