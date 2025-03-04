const express=require('express');
const app=express();

const cors=require('cors');
const mongoose=require('mongoose');
const route = require('./route');
app.use(cors());

mongoose.connect("mongodb://localhost:27017/matlabtask");

app.use(express.json());
app.use('/',route)

app.get("/",(req,res)=>{
    res.send("Welcome To the facebook page");
});

const PORT=8000;

app.listen(PORT,()=>{
    console.log(`port is running on ${PORT}`);
})
