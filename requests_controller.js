/// <reference path=".\node_modules\@types\express\index.d.ts" />import { urlencoded } from "body-parser";



var app = require("express")() ; 
var bodyparser = require("body-parser") ; 
var urlencodedParser = bodyparser.urlencoded({extended:false}) ; 

module.exports = function HandleRequests(app){
    console.log("Requests Handler running ! ") ;
    Handle_GET(app) ; 
    Handle_POST(app) ; 

}


function Handle_POST(app){

    app.post('/register', urlencodedParser  , (req , res)=>{
        console.log(req.body) ;
        res.send("Got the POST request ! ") ; 
    })
    
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