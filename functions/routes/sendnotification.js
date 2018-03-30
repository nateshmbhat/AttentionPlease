const app = require("express")() ;
const bodyparser = require("body-parser") ;
const urlencodedParser = bodyparser.urlencoded({extended:true}) ;
const admin = require("firebase-admin") ;
const fs =  require("fs") ;
const express_fileupload = require("express-fileupload") ;
const gcs = require("@google-cloud/storage")() ;
const uniqid = require("uniqid" ) ; 
const utils = require("../utility_functions") ; 
const randomid = require("random-id") ; 
const multer = require("multer") ; 
const os = require('os') ; 


//returns a prom which resolves the right image link 
function HandleImage(image)
{
    return new Promise((resolve , reject)=>{
            if(!image) resolve("") ; 
            image_id = image.filename ; 
            options  = { 
                destination:`notification_images/${uniqid()}` ,
                metadata:{
                    contentType: image.mimetype 
                }
            }

            admin.storage().bucket().upload( image.path , options)
                .then(file=>{
                // console.log(file) ; 
                file["0"].getSignedUrl( { action: 'read', expires: Date.now()+24*3600 } , (err, url)=>{
                        fs.unlink(image.path) ; 
                        resolve(url) ; 
                    });
            })
            .catch(err=>{console.log(err) ; resolve("") ; } ) ; 
        })
        .catch(err=>{console.log(err) ;resolve("") ;  })
}




app.post('/' ,  multer({ dest: os.tmpdir() , limits : { fileSize : 5242880 } }).single('image_file'),  (req , res)=>{

    console.log("req.body : " , req.body) ;
    console.log("req.file  : " , req.file) ; 

    utils.isAuthenticated(req , res)
    .then(uid=>{

    if(!utils.validatePostBody(req , res , ['topic' , 'title' ,'short_desc' , 'long_desc']))
    {
        res.status('200').json({error : 'Make sure you have specified all the required details below ! '}) ;
        return ;
    }
    if(req.body.topic=='')
    {
        res.status('200').json({error : 'Make sure you have specified all the required details below ! '}) ;
        return ;
    }
    
    let image_file = "", image_link=""  ; 
    
    utils.get_userinfo({type_of_user :"admin" , uid : uid})
    .then(userinfo=>{
        
        let customid_var =  randomid(8 , "0") ;
        const msg = admin.messaging() ;

        image =  req.file ; 
        
        HandleImage(image).then(image_link=>{
            console.log("Image_link : " , image_link) ; 
            payload = {
                notification : {
                    title : req.body.title ,
                    body : req.body.short_desc
                } ,
    
                data : {
                    customid : customid_var ,
                    ccode : userinfo.ccode ,
                    detail_desc : req.body.long_desc ,
                    image : image_link , 
                    links : "" ,
                    one_line_desc : req.body.short_desc , 
                    title : req.body.title ,
                    topics : JSON.stringify(req.body.topic)
                } ,
            }
    
            //Save the topic array before responding to client  : important
            topics = req.body.topic.split(',') ;
    
            conditionString = `'${topics[0]}' in topics && '${userinfo.ccode}' in topics`
            console.log("condition string : " , conditionString) ; 
    
            
            let primary_msgid  ; 
            msg.sendToCondition( conditionString , payload , {priority:'high'})
            .then(msgid=>{
                primary_msgid = msgid.messageId ; 
                console.log(msgid) ; 
                console.log("notification sent " , req.body.topic , " with title : " , req.body.title) ;
    
                res.status(200).json({success : "Notification sent successfully ! " })
    
                admin.database().ref(`/Colleges/${userinfo.ccode}/notifications/${uniqid()}`).update({
                    title : req.body.title , 
                    one_line_desc : req.body.short_desc,
                    detail_desc : req.body.long_desc , 
                    ccode : userinfo.ccode,
                    messageid : primary_msgid , 
                    time : Date.now() , 
                    topics : topics , 
                    image : image_link , 
                    thumb_image : image_link 
                }) ;
    
                for(let i =1 ; i<topics.length ;i++)
                {
                    conditionString = `'${topics[i]}' in topics && '${userinfo.ccode}' in topics` ; 
                    msg.sendToCondition(conditionString , payload , {priority : 'high'})
                    .then(msgid=>console.log(msgid , topics[i]))
                    .catch(err=>console.log(err)) ;
                }
                
            })
    
            .catch(err=>{console.log(err)
                res.render('login.ejs' , {error : err.message}  ) ;
            }) ;
        })
    })

    })
    .catch(err=>{res.render('login.ejs' , {error : err}); return true; })
}) ; 

module.exports = app ; 