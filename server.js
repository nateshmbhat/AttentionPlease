var fs = require("fs") ; 
var http = require("http") ;
var url = require("url") ; 
var qs = require("querystring") ; 

var server = http.createServer(function (req, res) {

    if(req.method=="GET")
    {
        
        res.writeHead(200 , {"Content-Type" : "text/plain"})
        res.end("Get request received !") ; 
    }

    });


server.listen(8000 , "127.0.0.1") ;
console.log("Listening to port 8000") ;