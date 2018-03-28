const app = require("express")() ;
const bodyparser = require("body-parser") ;
const session = require("express-session") ;
const urlencodedParser = bodyparser.urlencoded({extended:true}) ;
const admin = require("firebase-admin") ;
const firebase_client = require("firebase")  ;
const fs =  require("fs") ;
const state_dist_colleges = require("./data/state_dist_colleges list (without college details).json") ;
const state_dist_collegewithCODE = require("./data/state_dist_collegeWITHCODE.json") ;
const serviceAccount = require("./service account key/AttentionPlease-d86a646ccc28(working notification).json") ;
const express_fileupload = require("express-fileupload") ;
const gcs = require("@google-cloud/storage")() ;
const randomid = require("random-id") ;
const uniqid = require("uniqid" ) ;


//checks if the admin user is logged in
function isAuthenticated(req , res)
{
    return new Promise((resolve ,reject)=>{

    if(req.cookies['__session'])
    {
        admin.auth().verifyIdToken(req.cookies['__session']).then(decodedtoken=>{
            if(decodedtoken.uid){
                admin.database().ref('/adminusers/'+decodedtoken.uid).once('value' , snap=>{
                    if(snap.exists())
                    {
                        resolve(decodedtoken.uid) ;
                    }

                    else{
                        reject("Only College administrators can sign in : ") ;
                    }
                }) ;
                console.log("User is signed in : " , decodedtoken.uid)  ;
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


//Returns the User info object which is 
function get_userinfo({type_of_user = "admin" , uid} )
{
    console.log(type_of_user , uid ) ; 
    return new Promise((resolve , reject)=>{
        if(type_of_user=="admin"){
            admin.database().ref('/adminusers/' + uid).once('value' , snap=>{
                resolve(snap.val()) ; 
            }).catch(err=>reject(err)) ; 
        }

        else if (type_of_user =="student")
        {
             admin.database().ref('/users/' + uid).once('value' , snap=>{
                resolve(snap.val()) ; 
            }).catch(err=>reject(err)) ; 
        }
    }) ;
}


function get_college_code(state , dist ,college)
{
    let myarr = state_dist_collegewithCODE[state][dist]
    for(let i = 0 ; i<myarr.length;  i++)
    {
        if(college==myarr[i][1]){
            return myarr[i][0] ;
        }
    }
}


function validatePostBody(req , res , keys ){
    console.log("\nExecuting PostBody validation : ") ;
    console.log("Got Requests : ") ;
    console.log(req.body) ;

    for(i in keys){
        if(!(keys[i] in req.body))
        {
            console.log("invalid post request returning ! ") ;
            return false ;
        }
    }
    return true ;
}

module.exports = {
    validatePostBody : validatePostBody , 
    get_college_code : get_college_code , 
    get_userinfo : get_userinfo , 
    isAuthenticated : isAuthenticated
}

