const {Adduser,Login,acceptRejectRequest,displayFriendList,incomingFriendRequestList,sendFriendRequest,Getuser,Deleteuser,Updateuser,GetuserById} = require ('./controller')
const express = require('express');

const authMiddleware = require('./authmiddleware');

const route = express.Router()

route.post('/adduser', Adduser);
route.post('/logincheck', Login);
route.get('/getalluser',Getuser);
route.get('/getoneuser/:_id', GetuserById);
route.delete('/deleteuser/:_id', Deleteuser);
route.put('/updateuser/:_id', Updateuser);
route.post("/requestsend",authMiddleware,sendFriendRequest);
route.put("/acceptrejectrequest/:id",authMiddleware,acceptRejectRequest)
route.get("/friendslist",authMiddleware,displayFriendList)
route.get("/incomingfriendslist",authMiddleware,incomingFriendRequestList)

module.exports= route