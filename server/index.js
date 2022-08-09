import express from "express";
import  Jwt  from "jsonwebtoken";
const app=express();

 const PORT=5000;

 //for middleware
 app.use(express.json());

 const users=[
    {
    id:"1",
    userName:"pabina",
    password:"pabina1234",
    isAdmin:true
 },
 {
    id:"2",
    userName:"pabinauser",
    password:"pabinauser1234",
    isAdmin:false
 }

];
app.post("/api/login",(req,res)=>{
    const { userName,password }=req.body;
    const user=users.find((u)=>{
        return u.userName === userName && u.password === password;
    });
    if(user){
    //generate and access token
    // const accessToken=Jwt.sign({id:user.id,isAdmin:user.isAdmin})
    
    res.json(user);
    }else{
        res.status(400).json("userName and password incorrect");
    }
});


app.listen(PORT,()=>{
    console.log("backend server is working");
})