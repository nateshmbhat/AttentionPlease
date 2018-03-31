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

        .catch(error=>{console.log(error.message) ;
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


    app.post("/acceptAdminRequest" , urlencodedParser , (req, res)=>{
        if(!utils.validatePostBody(req,  res, ['uid' , 'name' , 'usn']))
            {res.send('Invalid Post request ! Required Fields not provided .') ; }

        utils.isAuthenticated(req ,res).then(uid=>{
            utils.get_userinfo({type_of_user:'admin' , uid:uid}).then(userinfo=>{

                admin.database().ref(`/Colleges/${userinfo.ccode}/adminrequests`).orderByChild('uid').equalTo(req.body.uid).limitToFirst(1).once('value' , getpushiddata=>{
                    let pushid = Object.getOwnPropertyNames(getpushiddata.val())[0]

                admin.database().ref(`/Colleges/${userinfo.ccode}/adminrequests/${pushid}`).set({}) ;

                } ) ;

                admin.database().ref(`/Colleges/${userinfo.ccode}/subadmins/${req.body.uid}/usn`).set(req.body.usn) ;
            })
        })
    }) ;



    app.post("/rejectAdminRequest" , urlencodedParser , (req, res)=>{
        if(!utils.validatePostBody(req,  res, ['uid' , 'name' , 'usn']))
            {res.send('Invalid Post request ! Required Fields not provided .') ; }
            utils.isAuthenticated(req ,res).then(uid=>{
                utils.get_userinfo({type_of_user:'admin' , uid:uid}).then(userinfo=>{

                admin.database().ref(`/Colleges/${userinfo.ccode}/adminrequests`).orderByChild('uid').equalTo(req.body.uid).limitToFirst(1).once('value' , getpushiddata=>{
                    let pushid = Object.getOwnPropertyNames(getpushiddata.val())[0]

                admin.database().ref(`/Colleges/${userinfo.ccode}/adminrequests/${pushid}`).set({}) ;

                } ) ;
            }) ;
        });
    }) ;




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




    app.post('/putseats' , multer({dest : os.tmpdir() } ).single('seat_file') , (req , res)=>{
        console.log('req.body' , req.body) ;
        console.log('req.file' , req.file) ;
        if(!req.file){
          res.render('allotseats.ejs',{nofile : true});
          return;
        }
        if(req.file.mimetype!='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'){
          res.render('allotseats.ejs',{error : true});
          return;
        }
        var xlsx=require('xlsx');
        file_path = req.file.path ;
        file_name = req.file.name ;

        //res.status(200).render('allotseats.ejs' , {success : "Successfully got the file for furthur processing "}) ;
        utils.isAuthenticated(req,res)
        .then(uid=>{
          admin.database().ref(`/adminusers/${uid}`).once('value' , snap=>{
              userinfo = snap.val() ;

              var obj=xlsx.readFile(file_path);
              var sh=obj.SheetNames;
              var dat=xlsx.utils.sheet_to_json(obj.Sheets[sh[0]]);

              // console.log(dat);

              var final={};
              var temp=new Array();

              for(i=0;dat[i]!=undefined;i++){
                temp = [] ;
                for(j=0;dat[i]['sub'+j]!=undefined;j++){
                  subs = new Object() ;
                  subs['name']=dat[i]['Name'];
                  subs['subject']=dat[i]['sub'+j];
                  subs['block']=dat[i]['block'+j];
                  subs['date']=dat[i]['date'+j];
                  subs['time']=dat[i]['time'+j];
                  subs['room']=dat[i]['room'+j];
                  subs['seat']=dat[i]['seatno'+j];
                  temp.push(subs) ;
                }
                final[dat[i]['USN']]=temp;
              }
              admin.database().ref(`/Colleges/${userinfo.ccode}/seats/`).update(final)  ;
          }) ;
          res.render('allotseats.ejs',{success : true});
    });
  })




    app.post('/register' , urlencodedParser ,  (req , res)=>{
        flag_valid = 0 ;
    try{
        if(!utils.validatePostBody(req , res , ['state' , 'district' , 'college' , 'email' , 'password' , 'name'  , 'phone']))
        {res.render('index.ejs' , {error : "Invalid Post request ! " }) ;}

        if(Object.getOwnPropertyNames(state_dist_colleges).indexOf(req.body.state)>=0){
            if(Object.getOwnPropertyNames(state_dist_colleges[req.body.state]).indexOf(req.body.district)>=0)
            {
                if(state_dist_colleges[req.body.state][req.body.district].indexOf(req.body.college)>=0)
                {
                    flag_valid = 1 ;
                }
                else{
                    res.render('index.ejs' , {error : "Invalid College Entry . Please make sure that you have selected one of the colleges in the provided list itself." }) ;
                }
            }
        }

        if(!flag_valid)
        {
            //CANCEL registration by sending the error !
            res.render('index.ejs' , {error : "Invalid Location Details ! " }) ;
        }


        //check if an admin user is already registered under a particular college
        let state = req.body.state,
        district = req.body.district,
        college = req.body.college;

        admin.database().ref(`/Colleges/${utils.get_college_code(state , district , college)}/admin/`).once('value', snap => {
            admininfo = snap.val();
            try{
                if (admininfo) {
                        throw Error('Warning ! An admin already exists for the specified college. This incident will be reported.'
                    );
                }
            }
            catch(error){
                res.render('index.ejs' ,{error : error.message } ) ;
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
    }
    catch(error)
    { /// TODO : Send the error alert to the client with the error
        res.status(400) ;
        res.render( "index.ejs" , {error : error.message}) ;
        console.log(error)
    }
})




app.post('/putresults' , multer({dest : os.tmpdir()}).single('result_file') , (req , res)=>{
    console.log("req.body" , req.body);
    console.log("req.file" , req.file) ;
    branch = req.body.branch ;
    semester = req.body.sem ;
    headings = req.body.headings.split(',') ;
    result_file = req.file ;
    result_file_path  = req.file.path ;
    start = req.file.startrow ;

    utils.isAuthenticated(req,res)
    .then(uid=>{
      admin.database().ref(`/adminusers/${uid}`).once('value' , snap=>{
          userinfo = snap.val() ;

          //KARAN REST OF YOUR CODE : TODO
          var xlsx=require('xlsx');
          console.log(headings);
          var obj=xlsx.readFile(result_file_path);
          var sh=obj.SheetNames;
          var dat=xlsx.utils.sheet_to_json(obj.Sheets[sh[0]]);
          var dt=new Date();
          var cur_year=dt.getYear()+1900;
          console.log(cur_year);

          var final={};
          var temp=new Array();

          for(i=0;dat[i]!=undefined;i++){
              for(j=0;j<headings.length;j++){
                  temp[j]=dat[i][headings[j]];
              }
              final[dat[i][headings[0]]]=temp;
              temp=new Array();
          }



          console.log(final);
          let ref=admin.database().ref('/Colleges/'+userinfo.ccode+'/results/'+cur_year+'/'+semester+'/'+branch+'/data');
          ref.update(final);
          admin.database().ref(`/Colleges/${userinfo.ccode}/results/result_years`).push(`${cur_year}-${semester}-${branch}`) ;
          ref=admin.database().ref('/Colleges/'+userinfo.ccode+'/results/'+cur_year+'/'+semester+'/'+branch+'/headings');
          ref.update(headings);
        })  ;
      })
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
    .catch(err=>{console.log(err) ;res.render('index.ejs' , {error : err.message})}) ;
})
}




//Handles all the GET request routes
function Handle_GET(app){

    app.get('/allotseats' , (req ,res)=>{
        utils.isAuthenticated(req , res).then(uid=>res.render('allotseats.ejs' ) ).catch(err=>res.render('login.ejs')) ;
    }) ;

    app.get('/results' , (req,res)=>{
        utils.isAuthenticated(req ,res).then(uid=>{res.render('results.ejs') ; }).catch(err=>res.render('login.ejs' ) );
    }) ;

    app.get('/' , (req , res)=>{
        res.render('index.ejs') ;
    })

    app.get('/createtopic' , (req , res)=>{
        utils.isAuthenticated(req , res).then(uid=>res.render('createtopic.ejs' ) ).catch(err=>res.render('login.ejs')) ;
    })

    app.get('/profile' , (req , res)=>{
        utils.isAuthenticated(req , res).then(uid=>{res.render('profile.ejs') ; }).catch(err=>res.render('login.ejs')) ;
    })

    app.get('/home' , (req,res)=>{
        //Todo add authentication
        res.redirect('/') ;
    })

    app.get('/library' , (req,res)=>{
      res.render('library.ejs');
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
        .then(uid=>{
            console.log("authenticated : ", uid) ;   res.render('dashboard.ejs')  ;
            utils.get_userinfo({uid : uid}).then(userinfo=>console.log(userinfo) ) ;
        })
        .catch(error=>res.render('login.ejs'))  ;
    })

    app.get('/displayprofile' , (req ,res)=>{
        utils.isAuthenticated(req , res)
        .then(uid=>{console.log("authenticated : " , uid) ; res.render('displayprofile.ejs') ; })
        .catch(error=>{res.render('login.ejs') ; })

    })


    app.get('/notifier' , (req ,res)=>{
        utils.isAuthenticated(req, res)
        .then(uid=>{console.log("authenticated : " , uid) ; res.render('notifier.ejs') ; })
        .catch(error=>{
            if(error.uid){
                //he is a subadmin
                console.log("Subadmin logged in : ") ;
            }
            console.log("isAuthentic catch : " , error) ;  res.render('login.ejs')
        }) ;
    })

    app.get('/assignrole' , (req ,res)=>{
        utils.isAuthenticated(req , res)
        .then(uid => {console.log("authenticated : " , uid) ; res.render('assignrole.ejs') ;})
        .catch(error=>{res.render('login.ejs') ; })
    })

    app.get('/forum' , (req ,res)=>{
        utils.isAuthenticated(req , res)
        .then(uid => {console.log("authenticated : " , uid) ; res.render('forum.ejs') ;})
        .catch(error=>{res.render('login.ejs') ; })
    })
}
