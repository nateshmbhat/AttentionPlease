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


//returns a prom which resolves the right image link 
function HandleImage(image)
{
    image_id = uniqid() ; 
    return new Promise((resolve , reject)=>{
        image.mv(`data/${image_id}`)
        .then(()=>{

            options  = { 
                destination:`notification_images/${image_id}` ,
                metadata:{
                    contentType: image.mimetype 
                }
            }

            admin.storage().bucket().upload(`data/${image_id}`, options)
                .then(file=>{
                // console.log(file) ; 
                file["0"].getSignedUrl( { action: 'read', expires: '03-17-2025' } , (err, url)=>{
                        fs.unlink(`./data/${image_id}`) ; 
                        resolve(url) ; 
                    });
            })
            .catch(err=>{console.log(err) ; resolve("") ; } ) ; 
        })
        .catch(err=>{console.log(err) ;resolve("") ;  })
    }) ; 
}




app.post('/' ,urlencodedParser ,  (req , res)=>{
    console.log("Request body : " , req.body) ;
    utils.isAuthenticated(req , res)
    .then(uid=>{

    if(!utils.validatePostBody(req , res , ['topic' , 'title' ,'description']))
    {
        res.status('200').json({error : 'Make sure you have specified all the required details below ! '}) ;
        return ;
    }
    
    let image_file = "", image_link=""  ; 
    
    utils.get_userinfo({type_of_user :"admin" , uid : uid})
    .then(userinfo=>{
        
        let customid_var =  randomid(8 , "0") ;
        const msg = admin.messaging() ;
        console.log("request files : " , req.files ) ; 

        image =  req.files!='undefined' && req.files!=undefined ? req.files.image_file: undefined ;


        
        HandleImage(image).then(image_link=>{
            console.log("Image_link : " , image_link) ; 
            payload = {
                notification : {
                    title : req.body.title ,
                    body : req.body.description
                } ,
    
                data : {
                    customid : customid_var ,
                    ccode : userinfo.ccode ,
                    detail_desc : "",
                    image : image_link , 
                    links : "" ,
                    one_line_desc : req.body.description,
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
    
                admin.database().ref(`/Colleges/${userinfo.ccode}/notifications/${primary_msgid}`).update({
                    title : req.body.title , 
                    body : req.body.description ,
                    college : userinfo.college ,
                    state : userinfo.state , district:userinfo.district , topics : topics , ccode : utils.get_college_code(userinfo.state , userinfo.district , userinfo.college) , 
                    image : image_link
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

    })
    .catch(err=>{res.render('login.ejs' , {error : err}); return true; })
}) ; 


module.exports = app ; 