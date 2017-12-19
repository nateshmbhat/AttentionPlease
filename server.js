/// <reference path=".\node_modules\@types\express\index.d.ts" />


var app = require("express")() ; 
var express = require("express") ;


app.use('/views/css' , express.static('views/css' )  ) ;

app.get("/" , (req , res)=>{
    console.log(req.url) ;
    res.sendFile(__dirname+"/index.html") ; 
}) ; 

app.get('/home' , (req, res)=>{
    res.sendFile(__dirname+'/index.html')
})


app.get("/login" , (req , res)=>{
    res.sendFile(__dirname+"/views/login.html") ;
})


app.listen(8000) ;