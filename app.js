var express = require('express');
var bodyParser = require('body-parser');
var fs = require('fs');
var path = require('path');
var mongoose = require('mongoose');




var app = express();

app.use(express.static('public'));
app.use(bodyParser.urlencoded({
  extended: true,
  keepExtensions:true,
  uploadDir:'./uploads'
}));


var mkdirp = require('mkdirp');
    
mkdirp('./uploads', function (err) {
    if (err) console.error(err)
    else console.log('Folder Available!')
});

var db = mongoose.connection;

db.on('error', console.error);
db.once('open', function() {
  // Create your schemas and models here.
  console.log("db open");
});

mongoose.connect('mongodb://neloydutta:laddu1993@ds042379.mlab.com:42379/hydhackdb');

var listOfUrls = mongoose.model('listOfUrl', {
    imgurl: String,
    location: String,
    lat: String,
    lon: String
});

var multer  = require('multer')
//var upload = multer({ dest: 'uploads/' })
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname+new Date().getTime()+'.jpg')
  }
});
 
var upload = multer({ storage: storage });

var cloudinary = require('cloudinary');
var port = process.env.PORT || 8000;

cloudinary.config({ 
  cloud_name: 'neloydutta', 
  api_key: '242449926999148', 
  api_secret: 'xsEGd26tTE5PMDuio7KIMa2Ode8' 
});

app.get('/dumb', function (req, res) {
    cloudinary.uploader.upload("my_picture.jpg", function(result) { 
        console.log(result);
        res.send("Y O L O");
    });
});

app.get('/',function(req, res){
    res.sendFile(__dirname + '/files.html');
});


app.post('/', upload.single('file'),function (req, res) {
    console.log(req.file);
    cloudinary.uploader.upload('./uploads/'+req.file.filename, function(result) { 
        console.log(result);
        fs.unlink(path.resolve('./uploads/'+req.file.filename));
        var doc = new listOfUrls({
            imgurl:result.secure_url,
            location: req.body.location,
            lat: req.body.lattitude,
            lon: req.body.longitude
        });

        doc.save(function (err, data) {
            if(err){
                console.log(err);
                res.json({'status':'notuploaded'});
            }
            else{
              console.log(data);
              res.json({'status':'uploaded'});
            }
        });
        //res.send("Y O L O");
    });
});

app.get('/getallofthem', function(req, res){
  listOfUrls.find({}).exec(function(err, data){
    res.json(data);
  });
});

app.get('/listall', function(req, res){
  res.sendFile(__dirname + '/list.html');
});


app.listen(port, function () {
    console.log("listening to port: " + port);
});
