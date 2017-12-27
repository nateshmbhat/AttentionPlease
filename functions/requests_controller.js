/// <reference path=".\node_modules\@types\express\index.d.ts" />import { urlencoded } from "body-parser";import { FirebaseDatabase } from "@firebase/database-types";import { registerDatabase } from "@firebase/database";import { urlencoded } from "express";import { request } from "https";import { json } from "body-parser";


//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>   ALL IMPORTS 


var app = require("express")() ; 
var bodyparser = require("body-parser") ; 
var urlencodedParser = bodyparser.urlencoded({extended:false}) ; 
var firebase  =  require("firebase") ; 
var admin = require("firebase-admin") ;
var fs =  require("fs") ; 
var state_dist_colleges = require("../data/state_dist_colleges list (without college details).json") ;


//<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<  End of IMPORTS 


app.set('view engine' , 'ejs') ; 

module.exports = function HandleRequests(app){
    console.log("Requests Handler running ! ") ;
    Handle_GET(app) ; 
    Handle_POST(app) ; 

}



//Handles all POST requests 
function Handle_POST(app){

    app.post("/getcolleges" , urlencodedParser , (req,res)=>{

        try{
            //TODO : Read from the json file having all colleges of the district and state received from req.body from client.
            console.log("Get colleges request from client ") ; 

            collegelist = state_dist_colleges[req.body.state][req.body.district] ;

            res.send(collegelist) ;

        }
        catch(error){

           res.status(400) ;
           res.send(error) ;  

        }
    })


    app.post('/register', urlencodedParser  , (req , res)=>{
        console.log(req.body) ; 
        console.log("started registration handler") ;

        firebase.auth().createUserWithEmailAndPassword(req.body.email , req.body.password)
        .then((user)=>{
            if(!user){
                console.log("User object is null . Returning from registration "); 
                return ;
            }
            else{
                console.log("\nUser created with ID : " + user.uid) ; 
    
                //>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
                // Populate the USERINFO object with the user's details contained in firebase.User and the POST request 
                userinfo = {} ;
                userinfo.name = req.body.name ; 
                userinfo.state = req.body.state ; 
                userinfo.district = req.body.district ; 
                userinfo.college = req.body.college ;
                userinfo.email = user.email ;
                userinfo.uid = user.uid ;
                userinfo.emailverified = user.emailVerified ;
                userinfo.phoneNumber = user.phoneNumber ; 
                userinfo.photoURL = user.photoURL ; 
                userinfo.providerId = user.providerId ;
                //<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

                console.log(userinfo) ;
                ref_user = firebase.database().ref("/users/"+user.uid) ;
                ref_user.set(userinfo) ;
                res.status(200) ; 
                res.send("You have been registered Successfully ! ") ;

            }
        })

        .catch((error)=>{
            /// TODO : Send the error alert to the client with the error 
            res.status(400) ; 
            res.send(error.message) ;   
            console.log(error)

        }) ; 

    })
    
    app.post('/login' , urlencodedParser, (req , res)=>{
        console.log(req.body) ;
        res.render('login.ejs'  ) ;
        
    })
    
}




//Handles all the GET request routes 
function Handle_GET(app){

    app.get('/' , (req ,res)=>{
        res.redirect('/index.html') ;
    })

    app.get('/home' , (req,res)=>{
        console.log("\n\n"+__dirname+"/index.html\n\n" ) ;
        res.redirect('/index.html') ; 
    })
    
    app.get('/register' , (req , res)=>{
        res.render("register.ejs") ; 
    })

    app.get('/login' , (req , res)=>{
        res.render('login.ejs') ;
    })

    app.get("/messenger" , (req, res)=>{
        res.render("messenger.ejs");
    })

}