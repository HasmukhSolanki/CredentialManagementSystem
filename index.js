var express = require("express"),
    app = express(),
    bodyParser = require("body-parser"),
    mongoose = require("mongoose"),
    validator = require("email-validator"),
    jwt = require("jsonwebtoken"),
    bcrypt = require("bcryptjs")

mongoose.connect("mongodb://localhost/CredentialManagementSystem");
var dbuser = new mongoose.Schema({
    username: String,
    password: String,
    firstname: String,
    lastname: String
});

var ProjectModel = new mongoose.Schema({
    username: String,
    projectname: String,
    description: String,
    shared: String
})

var SecretCode = "This_is_secret_message_for_login";

var ProjectModel = mongoose.model("ProjectData", ProjectModel)
var UserModel = mongoose.model("UserData", dbuser)

app.use(bodyParser.urlencoded({ extended: true }));


//-------------Login------------------//
app.post("/login", function (req, res) {
    var username = req.body.username;
    var password = req.body.password;

    UserModel.findOne({ username: username }, function (err, modelResponse) {
        if (password == modelResponse.password) {

            var token = jwt.sign({ id: modelResponse._id }, SecretCode, {
                expiresIn: 86400 // expires in 24 hours
            })
            res.json({
                username : "Welcome " + modelResponse.username,
                token: token,                 
            });
        }
        else {
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

    if (validator.validate(username)) {

        UserModel.findOne({ username: username }, function (err, output) {
            if (output) {
                res.send("old user go to login page");
            }
            else {
                var userdata = { username: username, password: password, firstname: firstname, lastname: lastname }
                UserModel.create(userdata, function (err, modelResponse) {
                    if (err) {
                        res.send(err);
                    }
                    else {
                        var token = jwt.sign({ id: modelResponse._id }, SecretCode, {
                            expiresIn: 86400 // expires in 24 hours
                        });
                        res.json({ 
                            auth: true, token: token , modelResponse
                            });
                    }
                })
            }

        })

    }
    else {
        res.send(username + "is not a valid username enter valid username")
    }
})
//-----------------AddProject-----------------//

app.post("/addProject", function (req, res) {
    var username = req.body.username;
    var projectname = req.body.projectname;
    var description = req.body.description;
    var shared = req.body.shared;
    console.log(projectdesc);
    var allprojectdata = { username: username, projectname: projectname, description: description, shared: shared }
 ProjectModel.create(allprojectdata, function (err, modelResponse) {
        res.send(modelResponse);
    })

});

//-----------------Update-------------------------//
app.patch("/edit", verifyToken ,function (req, res) {
    var updateuserdata = req.body;
    var username = req.body.username;

    UserModel.findOneAndUpdate({ username: username },
        { "$set": updateuserdata }).exec(function (err, modelResponse) {
            if (err) {
                console.log(err);
                res.status(500).send(err);

            }
            if (modelResponse) {
                UserModel.find({ username: username }, function (err, findResponse) {
                    if (err) {
                        res.send(err);
                    }
                    else {
                        res.send(findResponse)
                    }
                })
            }
        })
})
//-----------------searchDetails---------------------//
app.get("/find", verifyToken ,function (req, res) {
    
    var username = req.query.username;
    UserModel.find({ username: username }, function (err, findResponse) {
        if (err) {
            res.send(err);
        }
        else {
            res.send(findResponse)
        }
    })

})


//-------------------VarifyingTokens----------------------//
function verifyToken(req, res, next) {
    var token = req.headers['x-access-token'];
    if (!token)
        return res.status(403).send({ auth: false, message: 'No token provided.' });
        jwt.verify(token, SecretCode, function (err, decoded) {
        if (err)
            return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
        // if everything good, save to request for use in other routes
        req.userId = decoded.id;
        console.log("passed from varifing function");
        next();
    });
}


var port = 3006;
app.listen(port, function (req, res) {
    console.log("port  " + port + "   in use");
});