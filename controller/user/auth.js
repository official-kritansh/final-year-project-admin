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
    OAuth2 = google.auth.OAuth2,
    passportLocalMongoose = require("passport-local-mongoose");
dotenv.config();

const oauth2Client = new OAuth2(
    process.env.clientId, // ClientID
    process.env.clientSecret, // Client Secret
    "https://developers.google.com/oauthplayground" // Redirect URL
);
oauth2Client.setCredentials({
    refresh_token: process.env.refreshToken
});
const accessToken = oauth2Client.getAccessToken()



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

    f3Auth(req, res) {
        async.waterfall([
            function (done) {
                crypto.randomBytes(20, function (err, buf) {
                    var token = buf.toString('hex');
                    done(err, token);
                });
            },
            function (token, done) {
                Admin.findOne({ email: req.body.email }, function (err, user) {
                    if (!user) {
                        req.flash('error', 'No account with that email address exists.');
                        return res.redirect('/');
                    }

                    user.resetPasswordToken = token;
                    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

                    user.save(function (err) {
                        done(err, token, user);
                    });
                });
            },
            function (token, user, done) {
                const smtpTransport = nodemailer.createTransport({
                    service: "gmail",
                    auth: {
                        type: "OAuth2",
                        user: "kritansh82@gmail.com",
                        clientId: process.env.clientId,
                        clientSecret: process.env.clientSecret,
                        refreshToken: process.env.refreshToken,
                        accessToken: accessToken
                    }
                });
                var mailOptions = {
                    to: user.email,
                    from: 'kritansh82@gmail.com',
                    subject: 'Educational portalcdcd Admin web Panel Password Reset',
                    text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                        'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                        'http://' + req.headers.host + '/reset/' + token + '\n\n' +
                        'If you did not request this, please ignore this email and your password will remain unchanged.\n'
                };
                smtpTransport.sendMail(mailOptions, function (err) {
                    //   console.log('mail sent');
                    req.flash('success', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
                    done(err, 'done');
                });
            }
        ], function (err) {
            if (err) return next(err);
            res.redirect('/');
        });
    },

    f4Auth(req, res) {
        Admin.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function (err, user) {
            if (!user) {
                req.flash('error', 'Password reset token is invalid or has expired.');
                return res.redirect('/');
            }
            res.render('reset', { token: req.params.token });
        });
    },

    f5Auth(req, res) {
        async.waterfall([
            function (done) {
                Admin.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function (err, user) {
                    if (!user) {
                        req.flash('error', 'Password reset token is invalid or has expired.');
                        return res.redirect('back');
                    }
                    if (req.body.password === req.body.confirm) {
                        user.setPassword(req.body.password, function (err) {
                            user.resetPasswordToken = undefined;
                            user.resetPasswordExpires = undefined;

                            user.save(function (err) {
                                req.logIn(user, function (err) {
                                    done(err, user);
                                });
                            });
                        })
                    } else {
                        req.flash("error", "Passwords do not match.");
                        return res.redirect('back');
                    }
                });
            },
            function (user, done) {
                const smtpTransport = nodemailer.createTransport({
                    service: "gmail",
                    auth: {
                        type: "OAuth2",
                        user: "kritansh82@gmail.com",
                        clientId: process.env.clientId,
                        clientSecret: process.env.clientSecret,
                        refreshToken: process.env.refreshToken,
                        accessToken: accessToken
                    }
                });
                var mailOptions = {
                    to: user.email,
                    from: 'kritansh82@gmail.com',
                    subject: 'Your password has been changed',
                    text: 'Hello,\n\n' +
                        'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
                };
                smtpTransport.sendMail(mailOptions, function (err) {
                    req.flash('success', 'Success! Your password has been changed.');
                    done(err);
                });
            }
        ], function (err) {
            res.redirect('/');
        });
    },

    f6Auth(req, res) {
        res.render("auth_pass_recovery");
    },

}