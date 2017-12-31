/// <reference path=".\node_modules\@types\express\index.d.ts" />import { urlencoded } from "body-parser";import { FirebaseDatabase } from "@firebase/database-types";import { registerDatabase } from "@firebase/database";import { urlencoded } from "express";import { request } from "https";import { json } from "body-parser";import { request } from "https";import { config } from "firebase-functions";import { decode } from "punycode";import { firebase } from "@firebase/app";import { decode } from "punycode";


//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>   ALL IMPORTS 


var app = require("express")() ; 
var bodyparser = require("body-parser") ; 
var session = require("express-session") ;
var urlencodedParser = bodyparser.urlencoded({extended:false}) ; 
var admin = require("firebase-admin") ;
var firebase_client = require("firebase")  ;
var fs =  require("fs") ; 
var state_dist_colleges = require("./data/state_dist_colleges list (without college details).json") ;
var state_dist_collegewithCODE = require("./data/state_dist_collegeWITHCODE.json") ;
var serviceAccount = require("C:/Users/Natesh/Documents/Attention Please-42b163f729f1(admin Server key).json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://attention-please-21fbf.firebaseio.com"
});

//<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<  End of IMPORTS 


app.set('view engine' , 'ejs') ; 
        

module.exports = function HandleRequests(app){
    console.log("Requests Handler running ! ") ;
    Handle_GET(app) ; 
    Handle_POST(app) ; 

}


//Checks if there is a token in the cookie and verfies it and returns true if the requested client is authenticated or not
function isAuthenticated(req , res)
{
    return new Promise((resolve ,reject)=>{
 
    if(req.cookies['firebase-token'])
    {
        admin.auth().verifyIdToken(req.cookies['firebase-token']).then(decodedtoken=>{
            if(decodedtoken.uid){
                console.log(decodedtoken.sub) ;
                console.log("User is signed in :) ")  ;
                resolve(decodedtoken.uid) ;
            }
            // TODO ROUTE User with the required user details on the page 
        })
        .catch(error=>{
            console.log("User not signed in yet ! ")
            reject(error) ;
            // res.render('login.ejs')
        })

    }
    else
        reject('not signed in ') ;
    
    }) ; 

}


//Handles all POST requests 
function Handle_POST(app){

    app.post("/getcolleges" , urlencodedParser , (req,res)=>{

        try{
            console.log("Got college request !") ;
            res.send(state_dist_colleges[req.body.state][req.body.district] ) ;
        }
        catch(error){

           res.status(400) ;
           res.send(error) ;  

        }
    })



    app.post('/register', urlencodedParser  , (req , res)=>{
        flag_valid = 0 ; 
        if(Object.getOwnPropertyNames(state_dist_colleges).indexOf(req.body.state)>=0){
            if(Object.getOwnPropertyNames(state_dist_colleges[req.body.state]).indexOf(req.body.district)>=0)
            {
                if(state_dist_colleges[req.body.state][req.body.district].indexOf(req.body.college)>=0)
                {
                    flag_valid = 1 ; 
                }
                else{
                    res.render('register.ejs' , {error : "Invalid College Entry . Please make sure that you have selected one of the colleges in the provided list itself."}) ; 
                    return ; 
                }

            }
        }

        if(!flag_valid)
            {
                //CANCEL registration by sending the error ! 
                res.render('register.ejs' , {error : "Invalid Location Details ! "})
                return ; 
            }

        console.log(req.body) ; 
        console.log("started registration handler") ;
       

        admin.auth().createUser({

            email: req.body.email,
            emailVerified: false,
            phoneNumber : "+91"+req.body.phone , 
            password: req.body.password,
            displayName: req.body.name,
            disabled: false
        })
        .then((user)=>{
                console.log("\nUser created with ID : " + user.uid) ; 
    
                //>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
                // Populate the USERINFO object with the user's details contained in admin.auth.User and the POST request 
                userinfo = {
                    name : req.body.name , 
                    state : req.body.state , 
                    password : req.body.password , 
                    district : req.body.district , 
                    college : req.body.college ,
                } ;
                //Set the collegeID for the user object corresponding to the selected college name 

                let myarr = state_dist_collegewithCODE[userinfo.state][userinfo.district]
                for(let i = 0 ; i<myarr.length;  i++)
                {
                    if(userinfo.college==myarr[i][1]){
                        userinfo.ccode = myarr[i][0] ;
                        break ; 
                    }
                }

                //<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
                console.log(userinfo) ;
                ref_user = admin.database().ref("/users/"+user.uid) ;
                ref_user.set(userinfo) ;
                
                res.render('register.ejs', {success: 'You have been registered successfully. Please proceed with Login :) '})

        })

        .catch((error)=>{
            /// TODO : Send the error alert to the client with the error 
            res.status(400) ; 
            res.render( "register.ejs" , {error : error.message}) ;   
            console.log(error)

        }) ; 
    })



    app.post('/login' , urlencodedParser, (req , res)=>{
        console.log(req.body) ;
        console.log(req.cookies) ;

       
    })
    
}




//Handles all the GET request routes 
function Handle_GET(app){

    app.get('/' , (req ,res)=>{
        res.redirect('/index.html') ;
    })

    app.get('/home' , (req,res)=>{
        res.redirect('/index.html') ; 
    })
  
    app.get('/register' , (req , res)=>{
        res.render("register.ejs" ) ; 
    })


    app.get('/login' , (req , res)=>{

        isAuthenticated(req , res)
        .then(uid=>{console.log("UID logged in : " + uid) ; res.render('dashboard.ejs' );})
        .catch(error=>{console.log(error) ; res.render('login.ejs' ) ; })
    })

    app.get("/dashboard" , (req, res)=>{
        isAuthenticated(req, res)
        .then(uid=>res.render('dashboard.ejs') )  
        .catch(error=>res.render('login.ejs'))  ; 
    })

}