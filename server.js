

var fs = require("fs") ; 
var http = require("http") ;
var url = require("url") ; 
var qs = require("querystring") ; 

var server = http.createServer(function (req, res) {

    console.log(req.url) ; 
    if(req.url==="/")
    {

        console.log("Home page") ;
        res.writeHead(200 , {"Content-Type" : "text/html"}) ; 
        var stream = fs.createReadStream(__dirname+'/index.html') ;

        stream.on('data' , (data)=>{res.write(data.toString());res.end()} );
        res.write("<h1>Second line ! </h1>")  ;
        // var data = fs.readFileSync("./index.html","utf8");
        // res.write(data+"Hello") ;
        
    }

    // if(req.method=="GET")
    // {
        
    //     res.writeHead(200 , {"Content-Type" : "text/plain"})
    //     res.end("Get request received !") ; 
    // }

    });


server.listen(8000 , "127.0.0.1") ;
console.log("Listening to port 8000") ;