var express = require("express"),
    app = express(),
    bodyParser = require("body-parser"),
    mongoose = require("mongoose");

mongoose.connect("mongodb://localhost/Project_sa");
var dbuser = new mongoose.Schema({
    username: String,
    password: String,
    firstname: String,
    lastname: String
});

var dbproject = new mongoose.Schema({
    username: String,
    projectname : String,
    description : String,
    shared : String
})
var dbproject = mongoose.model("ProjectData",dbproject)
var dbuserobject = mongoose.model("UserData", dbuser)

app.use(bodyParser.urlencoded({ extended: true }));

//-------------Login------------------//
app.post("/login", function (req, res) {
    var username = req.body.username;
    var password = req.body.password;

    dbuserobject.findOne({username : username},function(err , dbresponse){
        if(dbresponse){
            res.send("Welcome to Homepage " + dbresponse.firstname+dbresponse.lastname);
        }
        else{
            res.send("Invalid Details pls try again");
        }
    })

})

//-------------Signup------------------//

app.post("/signup", function (req, res) {
    var username = req.body.username;
    var password = req.body.password;
    var firstname = req.body.firstname;
    var lastname = req.body.lastname;

    dbuserobject.findOne({ username: username }, function (err, output) {
        if (output) {
            console.log("old user go to login page")
            res.send(output + "old user go to login page");
        }
        else {
            console.log("new user");

            var userdata = { username: username, password: password, firstname: firstname, lastname: lastname }
            dbuserobject.create(userdata, function (err, dbresponse) {
                if (err) {
                    res.send(err);
                }
                else {
                    res.send(dbresponse);
                }
            })
        }

    })

})
//-----------------AddProject-----------------//

app.post("/addProject",function(req,res){
    var username = req.body.username;
    var projectname = req.body.projectname;
    var description = req.body.description;
    var shared = req.body.shared;
    console.log(projectdesc);
    var allprojectdata = {username : username,projectname : projectname ,description : description,shared : shared}
    dbproject.create(allprojectdata,function(err,dbresponse){
            res.send(dbresponse);
    })
    
});

var port = 3005;
app.listen(port, function (req, res) {
    console.log("port  " + port + "   in use");
});