const app = require("express")() ;
const bodyparser = require("body-parser") ;
const urlencodedParser = bodyparser.urlencoded({extended:true}) ;
const admin = require("firebase-admin") ;
const fs =  require("fs") ;
const express_fileupload = require("express-fileupload") ;
const gcs = require("@google-cloud/storage")() ;
const uniqid = require("uniqid" ) ; 


app.post('/' , (req , res)=>{

})