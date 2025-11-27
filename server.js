const express=require("express");
const app=express();

const session=require("express-session");

app.use(session({secret:"mysupersecretstring"}));

app.get("/tests",(req,res)=>{
    res.send("test successful");
})


app.listen(3000,()=>{
    console.log("server is liting to 3000 ");
})