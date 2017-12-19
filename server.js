/// <reference path=".\node_modules\@types\express\index.d.ts" />

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



app.listen(8000) ;