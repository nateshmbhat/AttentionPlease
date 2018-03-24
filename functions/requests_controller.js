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
const randomid = require("random-id") ;


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


//checks if the admin user is logged in 
function isAuthenticated(req , res)
{
    return new Promise((resolve ,reject)=>{
        console.log(req.cookies) ;

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



//Handles all POST requests
function Handle_POST(app){
    app.post("/createtimetable" , urlencodedParser ,  (req , res)=>{

        console.log(req.body) ;
        isAuthenticated(req , res)
        .then(uid =>{
            if(!validatePostBody(req , res , ['dataArray' , 'branch' , 'year' , 'section'])) throw Error("Invalid Request ! Make sure that the time fields are not empty !") ;

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



    app.post("/sendnotification" , urlencodedParser , (req , res)=>{
        console.log(req.body) ;
        isAuthenticated(req , res)
        .then(uid=>{
        if(!validatePostBody(req , res , ['topic' , 'title' ,'description']))
        {
            res.status('200').json({error : 'Make sure you have specified all the required details below ! '}) ;
            return ;
        }
        
        let image_file  , image_id = randomid() ; 
        

        admin.database().ref('/adminusers/'+uid).once('value' , snap=>{
            let userinfo = snap.val() ;
            let customid_var =  randomid(8 , "0") ;

            const msg = admin.messaging() ;
            console.log("request files : " , req.files ) ; 


            image =  req.files ? req.files.image_file: undefined ;

            if(image){
                options  = {
                    destination:`notification_images/${image_id}` ,
                    metadata:{
                        contentType: image.name.endsWith('.jpeg')?  'image/jpeg' : image.name.endsWith('.png') ? 'image/png' : "image/jpg" ,
                    }
                }
                image.mv(`data/${image_id}`)
                .then(file=>{
                    admin.storage().bucket().upload(`data/${image_id}`, options)
                        .then(file=>{
                        console.log(file) ; 
                        image_file = file ; 
                    })
                    .catch(err=>{console.log(err)})
                })
                .catch(err=>{console.log(err) ; })
            }
            else image_file = "" ; 


            payload = {
                notification : {
                    title : req.body.title ,
                    body : req.body.description
                } ,

                data : {
                    customid : customid_var , 
                    ccode : userinfo.ccode , 
                    detail_desc : "",
                    image : image_file ? image_file.mediaLink : "",
                    links : "" ,
                    one_line_desc : req.body.description,
                    title : req.body.title ,
                    topics : JSON.stringify(req.body.topic)
                } , 
            }

            options = {
                priority : 'high' ,
            }
            
            topics = req.body.topic.split(',') ;

            conditionString = `'${topics[0]}' in topics && '${userinfo.ccode}' in topics`
            console.log("condition string : " , conditionString) ; 

            //Save the topic array before responding to client  : important
            
            let primary_msgid  ; 
            msg.sendToCondition( conditionString , payload , options)
            .then(msgid=>{
                primary_msgid = msgid.messageId ; 
                console.log(msgid) ; 
                console.log("notification sent " , req.body.topic , " with title : " , req.body.title) ;

               
                res.status(200).json({success : "Notification sent successfully ! " })


                admin.database().ref(`/Colleges/${userinfo.ccode}/notifications/${msgid.messageId}`).update({
                    title : req.body.title , 
                    body : req.body.description ,
                    college : userinfo.college ,
                    state : userinfo.state , district:userinfo.district , topics : topics , ccode : get_college_code(userinfo.state , userinfo.district , userinfo.college) , 
                    image :image_file ?  image_file.mediaLink : ""
                }) ;

                


                for(let i =1 ; i<topics.length ;i++)
                {
                    conditionString = `'${topics[i]}' in topics && '${userinfo.ccode}' in topics` ; 
                    msg.sendToCondition(conditionString , payload , options)
                    .then(msgid=>console.log(msgid , topics[i])) 
                    .catch(err=>console.log(err)) ; 
                }

                
                
                })

            .catch(err=>{console.log(err)
                res.render('dashboard.ejs' , {error : err.message}  ) ;
            }) ;


            
        })

        })
        .catch(err=>{res.render('login.ejs' , {error : err}); return true; })
    })





    app.post("/getcolleges" , urlencodedParser , (req,res)=>{
       if(!validatePostBody(req , res , ['state' , 'district'])) return ;

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
        isAuthenticated(req , res)
        .then(uid=>{
            //TODO : check if "topics" is also present in the request
            //Right when use is not subbed to any topic , it results in invalid post request
            if(!validatePostBody(req , res , ['name' , 'email'  , 'state' , 'district' , 'college' ])) return ;

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
                    ccode : get_college_code(req.body.state , req.body.district , req.body.college) ,

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
        isAuthenticated(req , res)
        .then(uid=>{

            sampleFile = req.files.sampleFile ; 
            console.log(sampleFile) ; 
            let fileid = randomid(7) ; 

            sampleFile.mv(`./data/${fileid}`, err => {
            if (!err) {
                console.log("Successfully got the file ! ");
                admin.database().ref(`/adminusers/${uid}`).once('value', snap => {
                    userinfo = snap.val();

                    var obj = xlsx.readFile(`./data/client_data/${fileid}`);
                    var sh = obj.SheetNames;
                    var dat = xlsx.utils.sheet_to_json(obj.Sheets[sh[0]]);

                    var final = {};
                    var temp = {};
                    var subs;
                    for (i = 0; dat[i] != undefined; i++) {
                        temp.Name = dat[i].Name;
                        final[dat[i].USN] = temp;
                        subs = [];
                        for (j = 0; dat[i]['sub' + j] != undefined; j++) {
                            subs[0] = dat[i]['date' + j];
                            subs[1] = dat[i]['time' + j];
                            subs[2] = dat[i]['room' + j];
                            subs[3] = dat[i]['seatno' + j];
                            temp[dat[i]['sub' + j]] = subs;
                            subs = [];
                        }
                        temp = {};
                    }

                    res.status(200).render('/allotseats.ejs');
                    admin.database().ref(`/Colleges/${userinfo.ccode}/seats/`).update(final);
                });
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
    }); 


    app.post('/register' , urlencodedParser ,  (req , res)=>{
        flag_valid = 0 ;
        if(!validatePostBody(req , res , ['state' , 'district' , 'college' , 'email' , 'password' , 'name'  , 'phone'])) return ;

        if(Object.getOwnPropertyNames(state_dist_colleges).indexOf(req.body.state)>=0){
            if(Object.getOwnPropertyNames(state_dist_colleges[req.body.state]).indexOf(req.body.district)>=0)
            {
                if(state_dist_colleges[req.body.state][req.body.district].indexOf(req.body.college)>=0)
                {
                    flag_valid = 1 ;
                }
                else{
                    res.render('index.ejs' , {error : "Invalid College Entry . Please make sure that you have selected one of the colleges in the provided list itself."}) ;
                    return ;
                }

            }
        }

        if(!flag_valid)
            {
                //CANCEL registration by sending the error !
                res.render('index.ejs' , {error : "Invalid Location Details ! "})
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
                };
                //Set the collegeID for the user object corresponding to the selected college name

                userinfo.ccode = get_college_code(userinfo.state , userinfo.district , userinfo.college) ;

                //<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
                console.log(userinfo) ;
                ref_user = admin.database().ref("/adminusers/"+user.uid) ;
                ref_user.set(userinfo) ;

                res.render('index.ejs' , {success : "You have been registered successfully. Please proceed with Login :) "});

        })


        .catch((error)=>{
            /// TODO : Send the error alert to the client with the error
            res.status(400) ;
            res.render( "index.ejs" , {error : error.message}) ;
            console.log(error)
        }) ;
    })



    app.post('/createtopic'   , urlencodedParser , (req, res)=>{
        console.log(req.body) ;

        isAuthenticated(req,res)
        .then(uid=>{
            if(!validatePostBody(req , res ,['topic' , 'desc'])) return ;

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
        isAuthenticated(req , res).then(uid=>res.render('createtopic.ejs')).catch(err=>res.render('login.ejs')) ;
    })

    app.get('/profile' , (req , res)=>{
        isAuthenticated(req , res).then(uid=>{res.render('profile.ejs') ; }).catch(err=>res.render('login.ejs')) ;
    })

    app.get('/home' , (req,res)=>{
        res.redirect('/') ;
    })

    app.get('/index.html' , (req,res)=>{
        res.redirect('/') ;
    })

    app.get('/timetable' , (req , res)=>{
        isAuthenticated(req , res)
        .then(uid=>{res.render('timetable.ejs') ; })
        .catch(err=>{res.render('login.ejs') ; }) ;
    })


    app.get('/login' , (req , res)=>{
        isAuthenticated(req , res)
        .then(uid=>{console.log("UID logged in : " + uid) ; res.render('dashboard.ejs' );})
        .catch(error=>{console.log(error) ; res.render('login.ejs' ) ; })
    })

    app.get("/dashboard" , (req, res)=>{
        isAuthenticated(req, res)
        .then(uid=>{ res.render('dashboard.ejs')  ; 
            get_userinfo({uid : uid}) ; 
        } )
        .catch(error=>res.render('login.ejs'))  ;
    })

}
