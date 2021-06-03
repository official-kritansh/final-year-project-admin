const express = require("express"),
    app = express(),
    mongoose = require("mongoose"),
    bodyParser = require("body-parser"),
    passport = require("passport"),
    localStrategy = require("passport-local"),
    flash = require('connect-flash'),
    Admin = require("./models/admin"),
    session = require('express-session'),
    cookieParser = require('cookie-parser'),
    methodOverride = require('method-override'),
    port = process.env.PORT || 4000,
    dotenv = require('dotenv'),
    sslRedirect = require("heroku-ssl-redirect"),
    passportLocalMongoose = require("passport-local-mongoose");
dotenv.config();


// app config-----
app.use(cookieParser('secret'));
app.use(require("express-session")({
    secret: "This is a marketing panel",
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365
    }

}));
app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(methodOverride("_method"));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(function(req, res, next) {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

// add admin ROUTES
const adminAuthRoutes =require('./routes/user/auth');
const adminRoutes =require('./routes/user/index');

// mongoose config
// const mongoURI = "mongodb+srv://muku:"+process.env.mongo_pass+"@cluster0.cxuqe.mongodb.net/stickman?retryWrites=true&w=majority"
// mongoose.connect("mongodb://localhost/stickman_real_art");
// const mongoURI = "mongodb://localhost/final_year_project_v1";
// const mongoURI = "mongodb+srv://ankit:"+process.env.MLAB_PASS+"@cluster0-gyowo.mongodb.net/real_art?retryWrites=true&w=majority";
// const mongoURI = "mongodb+srv://ankit:" + process.env.mongo_pass + "@cluster0.f8aql.mongodb.net/mravans_admin_v4?retryWrites=true&w=majority";
const mongoURI ="mongodb+srv://kintu2676:"+process.env.mongo_pass+"@cluster0.kw5s2.mongodb.net/major_project?retryWrites=true&w=majority"
//Mongo connection
mongoose.connect(mongoURI);

//PASSPORT config

// passport.use('user', new localStrategy(User.authenticate()));
passport.use('admin', new localStrategy({
    usernameField: 'email',
    passwordField: 'password'
}, Admin.authenticate()));
// passport.use('employee', new localStrategy(Employee.authenticate()));
passport.serializeUser(function(user, done) {
    var key = {
        id: user.id,
        type: user.typeof
    }
    done(null, key);
})
passport.deserializeUser(function(key, done) {
    if (key.type === 'admin') {
        Admin.findOne({
            _id: key.id
        }, function(err, user) {
            done(err, user);
        })
    }

})

app.get('/',(req,res)=>{
    if(req.user){
        if(req.isAuthenticated()&&req.user.typeof=="admin"){
            res.redirect("/home");
        }else{
            res.redirect('/login');
        }
    }else{
        res.redirect('/login');
    }
})

// Use Admin Routes
app.use('/',adminAuthRoutes)
app.use('/home',adminRoutes);




app.listen(port, () => {
    console.log("Server Started on " + port);
})