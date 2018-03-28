/// <reference path=".\node_modules\@types\express\index.d.ts" />import { urlencoded } from "body-parser";import { FirebaseDatabase } from "@firebase/database-types";import { registerDatabase } from "@firebase/database";import { urlencoded } from "express";import { request } from "https";import { json } from "body-parser";import { request } from "https";import { config } from "firebase-functions";import { decode } from "punycode";import { firebase } from "@firebase/app";import { decode } from "punycode";import { urlencoded } from "body-parser";import { isValidFormat } from "@firebase/util";import { firebase } from "@firebase/app";import { database } from "firebase-admin";import { database } from "firebase-admin";import { firebase } from "@firebase/app";import { firebase } from "@firebase/app";import { urlencoded } from "body-parser";import { userInfo } from "os";import { userInfo } from "os";import { contains } from "@firebase/util";

//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>   ALL IMPORTS


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
const uniqid = require("uniqid" ) ;
const route_sendnotification = require("./routes/sendnotification") ; 
const utils = require("./utility_functions") ; 
const os= require("os") ; 
const multer = require("multer") ; 


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://attentionplease-24589.firebaseio.com/" ,
  storageBucket : "attentionplease-24589.appspot.com"
});


//<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<  End of IMPORTS


app.set('view engine' , 'ejs') ;

module.exports = function HandleRequests(app){
    console.log("Requests Handler running ! ") ;
    Handle_GET(app) ;
    Handle_POST(app) ;
}



//Handles all POST requests
function Handle_POST(app){

    app.use('/sendnotification', route_sendnotification) ; 

    app.post("/createtimetable" , urlencodedParser ,  (req , res)=>{

        console.log(req.body) ;
        utils.isAuthenticated(req , res)
        .then(uid =>{
            if(!utils.validatePostBody(req , res , ['dataArray' , 'branch' , 'year' , 'section'])) throw Error("Invalid Request ! Make sure that the time fields are not empty !") ;

            //check if each 1d array in data array has 9 elements : first 2 being the time
            postdata = req.body.dataArray ;
            for(let i =0 ; i<postdata.length ; i++)
            {
                time_regex = /^\d{1,2}\:\d{1,2}(AM|PM)$/ ;
                if(!(time_regex.test(postdata[i][0]) && time_regex.test(postdata[i][1])))
                        throw Error("Invalid Time format . Please choose the time from the clock.") ;
                if(postdata[i].length!=9)  throw Error("Invalid Post request ! ") ;
            }

            res.status(200) ;
            res.send('Time Table successfully Updated ! ') ;

            //All checked . Now safe to add to the database
            admin.database().ref(`/adminusers/${uid}`).once('value' , snap=>{
                let userinfo = snap.val() ;
                path = `/Colleges/${userinfo.ccode}/timetables/${req.body.year}/${req.body.branch}/${req.body.section}/` ;
                console.log(path) ;
                admin.database().ref(path).update(postdata) ;

            })
        })

        .catch(error=>{console.log(error.message ) ;
            res.status(400) ;
            res.send(error.message) ;
    }) ;
});


    app.post("/getcolleges" , urlencodedParser , (req,res)=>{
       if(!utils.validatePostBody(req , res , ['state' , 'district'])) return ;
        try{
            console.log("Got college request !") ;
            res.send(state_dist_colleges[req.body.state][req.body.district] ) ;
        }
        catch(error){
           res.status(400) ;
           res.send(error) ;
        }
    })


    app.post('/updateprofile', urlencodedParser ,(req , res)=>{
        console.log(req.body) ;
        utils.isAuthenticated(req , res)
        .then(uid=>{
            //TODO : check if "topics" is also present in the request
            //Right when use is not subbed to any topic , it results in invalid post request
            if(!utils.validatePostBody(req , res , ['name' , 'email'  , 'state' , 'district' , 'college' ])) return ;

            admin.auth().updateUser(uid , {
                displayName : req.body.name ,
                email : req.body.email ,
            })
            .then(user=>{
                console.log('request body is ') ; console.log(req.body) ;

                let ref = admin.database().ref('/adminusers/' + user.uid) ;

                ref.update({
                    college : req.body.college ,
                    district : req.body.district ,
                    state : req.body.state ,
                    name : req.body.name ,
                    ccode : utils.get_college_code(req.body.state , req.body.district , req.body.college) ,
                })
                .then(user=>{console.log("Updated successfully !") ; })
                .catch(err=>{consolge.log("ERROR OCCURED ! ") ; console.log(err)}) ;

            })
            .catch(err=>console.log("Error Occured !" , err)) ;
        })
        .catch(err=>{
            console.log(err) ;
        }) ;
    })



    app.post('/putseats' ,urlencodedParser , (req , res)=>{
        console.log("\nGOT FILE POST REQUEST !!!\n\n") ;
        console.log(req.files) ;

        let sampleFile = req.files.sampleFile ;

        fileid = uniqid() ;
        sampleFile.mv(`./data/${fileid}` , err=>{
            if(!err){
                console.log("Successfully got the file ! ") ;
                admin.database().ref(`/adminusers/${uid}`).once('value' , snap=>{
                    userinfo = snap.val() ;

                    var obj=xlsx.readFile(`./data/client_data/${fileid}`);
                    var sh=obj.SheetNames;
                    var dat=xlsx.utils.sheet_to_json(obj.Sheets[sh[0]]);

                    var final={};
                    var temp=[];
                    var subs;
                    for(i=0;dat[i]!=undefined;i++){
                      final[dat[i].USN]=temp;
                      subs={};
                      for(j=0;dat[i]['sub'+j]!=undefined;j++){
                        subs['subname']=dat[i]['sub'+j];
                        subs['date']=dat[i]['date'+j];
                        subs['time']=dat[i]['time'+j];
                        subs['room']=dat[i]['room'+j];
                        subs['seat']=dat[i]['seatno'+j];
                        temp[j]=subs
                        subs={};
                      }
                      temp=[];
                    }
                    res.status(200).render('/allotseats.ejs') ;
                    admin.database().ref(`/Colleges/${userinfo.ccode}/seats/`).update(final)  ;
                }) ;
                // let bucket = admin.storage().bucket() ;

                bucket.upload('./../data/mytestfile.jpg' , (err, file , response)=>{
                    console.log(err , file, response) ;
                }) ;
            } else {
                console.log(err);
                res.status(403).send(err.message);
            }
            });

    }); 


    app.post('/register' , urlencodedParser ,  (req , res)=>{
        flag_valid = 0 ;
    try{
        if(!utils.validatePostBody(req , res , ['state' , 'district' , 'college' , 'email' , 'password' , 'name'  , 'phone'])) 
        {throw Error("Invalid Post request ! ") ;}

        if(Object.getOwnPropertyNames(state_dist_colleges).indexOf(req.body.state)>=0){
            if(Object.getOwnPropertyNames(state_dist_colleges[req.body.state]).indexOf(req.body.district)>=0)
            {
                if(state_dist_colleges[req.body.state][req.body.district].indexOf(req.body.college)>=0)
                {
                    flag_valid = 1 ;
                }
                else{
                    throw Error("Invalid College Entry . Please make sure that you have selected one of the colleges in the provided list itself.") ; 
                }
            }
        }

        if(!flag_valid)
        {
            //CANCEL registration by sending the error !
            throw Error("Invalid Location Details ! ") ; 
        }


        //check if an admin user is already registered under a particular college 
        let state = req.body.state,
        district = req.body.district,
        college = req.body.college;

        admin.database().ref(`/Colleges/${get_college_code(state , district , college)}/admin/`).once('value', snap => {
            admininfo = snap.val();
            if (!admininfo) {
                    throw Error('Warning ! An admin already exists for the specified college. This incident will be reported.'
                );
            }
        }) ; 


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
                };

                //Set the collegeID for the user object corresponding to the selected college name


                userinfo.ccode = utils.get_college_code(userinfo.state , userinfo.district , userinfo.college) ;

                console.log(userinfo) ;
           

                // Put this admin inside the colleges/ccode so that during registration , we can prevent users from registering.
                admin.database().ref(`/Colleges/${userinfo.ccode}/admin/${user.uid}`).set(userinfo) ;

                ref_user = admin.database().ref("/adminusers/"+user.uid).set(userinfo) ; 

                res.render('index.ejs' , {success : "You have been registered successfully. Please proceed with Login :) "});

        })
        .catch((error)=>{
            /// TODO : Send the error alert to the client with the error
            res.status(400) ;
            res.render( "index.ejs" , {error : error.message}) ;
            console.log(error)
        }) ;
    }
    catch(error)
    {
        /// TODO : Send the error alert to the client with the error
        res.status(400) ;
        res.render( "index.ejs" , {error : error.message}) ;
        console.log(error)
    }

})



    app.post('/createtopic'   , urlencodedParser , (req, res)=>{
        console.log(req.body) ;

        utils.isAuthenticated(req,res)
        .then(uid=>{
            if(!utils.validatePostBody(req , res ,['topic' , 'desc'])) return ;

            console.log("user id is " , uid) ;
            admin.database().ref('/adminusers/'+uid).once('value',snap=>{

                userinfo = snap.val() ;
                let ref = admin.database().ref('/Colleges/' + userinfo.ccode + '/topics') ;
                topicobject = {title : req.body.topic , desc : req.body.desc} ;

                ref.once('value' , snap=>{
                    topicids = snap.val()  ;
                    arr = [] ;
                    // fill the present topic names in arr
                    Object.getOwnPropertyNames(topicids).forEach(id=>arr.push(topicids[id].title))

                    if(arr.indexOf(req.body.topic)<0) //Insert only if topic doesnt already exists !
                    {
                        ref.push(topicobject) ;
                        res.render('createtopic.ejs' , {success : true}) ;
                    }
                    else{
                        //Topic already exists
                        res.render('createtopic.ejs' , {topicexists : true}) ;
                    }
                })
            })

        })
        .catch(err=>{console.log(err) ;res.render('index.ejs')}) ;
    })
}



//Handles all the GET request routes
function Handle_GET(app){

    app.get('/allotseats' , (req ,res)=>{res.render('allotseats.ejs') ; }) ; 

    
    app.get('/' , (req , res)=>{
        res.render('index.ejs') ;
    })

    //this code is experimental by KPS
    app.get('/expr',(req,res)=>{
        res.render('expr.ejs');
    })
    //end of experimental code


    app.get('/createtopic' , (req , res)=>{
        utils.isAuthenticated(req , res).then(uid=>res.render('createtopic.ejs')).catch(err=>res.render('login.ejs')) ;
    })

    app.get('/profile' , (req , res)=>{
        utils.isAuthenticated(req , res).then(uid=>{res.render('profile.ejs') ; }).catch(err=>res.render('login.ejs')) ;
    })

    app.get('/home' , (req,res)=>{
        res.redirect('/') ;
    })

    app.get('/index.html' , (req,res)=>{
        res.redirect('/') ;
    })

    app.get('/timetable' , (req , res)=>{
        utils.isAuthenticated(req , res)
        .then(uid=>{res.render('timetable.ejs') ; })
        .catch(err=>{res.render('login.ejs') ; }) ;
    })


    app.get('/login' , (req , res)=>{
        utils.isAuthenticated(req , res)
        .then(uid=>{console.log("UID logged in : " + uid) ; res.render('dashboard.ejs' );})
        .catch(error=>{console.log(error) ; res.render('login.ejs' ) ; })
    })

    app.get("/dashboard" , (req, res)=>{
        console.log("handling dashboard get ...") ; 
        utils.isAuthenticated(req, res)
        .then(uid=>{ console.log("authenticated : ", uid) ;   res.render('dashboard.ejs')  ; 
            utils.get_userinfo({uid : uid}) ; 
        } )
        .catch(error=>res.render('login.ejs'))  ;
    })

    app.get('/displayprofile' , (req ,res)=>{
	res.render('displayprofile.ejs') ; 
    }) 
    
     app.get('/dashboard2' , (req ,res)=>{
    res.render('dashboard2.ejs') ; 
    }) 

}
