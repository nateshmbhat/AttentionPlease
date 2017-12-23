/// <reference path=".\node_modules\@types\express\index.d.ts" />

//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>   ALL IMPORTS 


var app = require("express")() ; 
var express = require("express") ;
var firebase = require("./firebase_handle") ; 
var bodyparser = require("body-parser") ; 
var handle_requests = require("./requests_controller") ;


//<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<   END OF IMPORTS 



app.use(express.static('./public' )  ) ;

handle_requests(app) ;


app.listen(8000) ;