

var fs = require("fs") ; 
var http = require("http") ;
var url = require("url") ; 
var qs = require("querystring") ; 

var express = require("express") ; 

app = express() ; 

app.get("/" , (req , res)=>{

    console.log(req.url) ;
    res.send("Hello , I m here :)") ;

}) ; 




server.listen(8000 , "127.0.0.1") ;
console.log("Listening to port 8000") ;