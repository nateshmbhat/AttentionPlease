/// <reference path=".\node_modules\@types\express\index.d.ts" />

var fs = require("fs") ; 
var http = require("http") ;
var url = require("url") ; 
var qs = require("querystring") ; 
var app = require("express")() ; 
var express = require("express") ;


app.use('/views/css' , express.static('views/css' )  ) ;

app.get("/" , (req , res)=>{
    console.log(req.url) ;
    res.sendfile("./index.html") ; 
}) ; 


app.get("/login" , (req , res)=>{
    res.sendfile("./views/login.html") ;
})





app.listen(8000) ;