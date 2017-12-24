/// <reference path=".\node_modules\@types\express\index.d.ts" />import { urlencoded } from "body-parser";import { FirebaseDatabase } from "@firebase/database-types";import { registerDatabase } from "@firebase/database";



//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>   ALL IMPORTS 


var app = require("express")() ; 
var bodyparser = require("body-parser") ; 
var urlencodedParser = bodyparser.urlencoded({extended:false}) ; 
var firebase  =  require("firebase") ; 
var fiebase_Handler = require("./firebase_handle") ; 

//<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<  End of IMPORTS 


app.set('view engine' , 'ejs') ; 



module.exports = function HandleRequests(app){
    console.log("Requests Handler running ! ") ;
    Handle_GET(app) ; 
    Handle_POST(app) ; 

}


//Handles all POST requests 
function Handle_POST(app){

    app.post('/register', urlencodedParser  , (req , res)=>{
        console.log(req.body) ;
        register_promise = firebase.auth().createUserWithEmailAndPassword(req.body.email , req.body.password)
        register_promise.then((sucess)=>console.log(sucess) , console.log("Sucesss !")) ;
        register_promise.catch((error)=>console.log("Error occured ! : " + error)) ;

    })


    app.post('/login' , urlencodedParser, (req , res)=>{
        
        ;
    })
    
}




//Handles all the GET request routes 
function Handle_GET(app){

    app.get('/' , (req ,res)=>{
        res.sendFile(__dirname+'/index.html') ;
    })

    app.get('/home' , (req,res)=>{
        res.sendFile(__dirname+'/index.html') ; 
    })
    

    app.get('/register' , (req , res)=>{
        res.render("register.ejs") ; 
    })

    app.get('/login' , (req , res)=>{
        res.render('login.ejs') ;
    })
}