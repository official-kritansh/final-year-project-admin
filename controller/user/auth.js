var mongoose = require("mongoose"),
    bodyParser = require("body-parser"),
    passport = require("passport"),
    otpGenerator = require('otp-generator'),
    localStrategy = require("passport-local"),
    Admin = require('../../models/admin'),
    async = require("async"),
    nodemailer = require("nodemailer"),
    fs = require('fs'),
    path = require('path'),
    jwt = require("jsonwebtoken"),
    crypto = require("crypto"),
    dotenv = require('dotenv'),
    { google } = require("googleapis"),
    // {nodemailerSendEmail}=require("../../nodemailer/nodemailer");
    OAuth2 = google.auth.OAuth2,
    passportLocalMongoose = require("passport-local-mongoose");
dotenv.config();

// const oauth2Client = new OAuth2(
//     process.env.clientId, // ClientID
//     process.env.clientSecret, // Client Secret
//     "https://developers.google.com/oauthplayground" // Redirect URL
// );
// oauth2Client.setCredentials({
//     refresh_token: process.env.refreshToken
// });
// const accessToken = oauth2Client.getAccessToken()



module.exports = {
    f1Auth(req, res, next) {
        passport.authenticate('admin', (err, user, info) => {
            if (err) {
                console.log(err);
                res.redirect("/login")
            } else if (!user) {
                if (!req.body.email || !req.body.password) {
                    req.flash("error","Please enter credentials")
                    res.redirect("/login")
                } else {
                    // console.log("inside")
                    req.flash("error","Wrong username or password")
                    res.redirect("/login");
                }
            }
            else {
                // console.log("hello");
                req.logIn(user, function (err) {
                    if (err) {
                        req.flash("error","Something went wrong!")
                        res.redirect("/login");
                    }
                    // console.log(req.user)
                    req.flash("success","Sucessfully logged in!")
                    return res.redirect("/");
                });
            }

        })(req, res, next);
    },

    f2Auth(req,res){
        req.logOut();
        res.redirect('/');
    },

}