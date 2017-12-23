/// <reference path=".\node_modules\@types\express\index.d.ts" />

var app = require("express")() ; 
var express = require("express") ; 


module.exports = function HandleRequests(app){
    console.log("Requests Handler running ! ") ;
    Handle_GET(app) ; 
    Handle_POST(app) ; 

}



function Handle_POST(app){

    

}





function Handle_GET(app){

    app.get('/' , (req ,res)=>{
        res.sendFile(__dirname+'/index.html') ;
    })

    app.get('/home' , (req,res)=>{
        res.sendFile(__dirname+'/index.html') ; 
    })
    

    app.get('/register' , (req , res)=>{
        res.sendFile( __dirname+ "/views/register.html") ; 
    })

    app.get('/login' , (req , res)=>{
        res.sendFile(__dirname+'/views/login.html') ;
    })
}