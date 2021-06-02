const express = require("express");
var router = express.Router({ mergeParams: true }),
    passport = require("passport"),
    Admin = require("../../models/admin"),
    { f1,f2 ,f3,f4,f5,f6,f7,f8,f9,f10,f11} = require("../../controller/user/index"),
    { isAdmin } = require("../../middleware/index");


router.get('/',isAdmin,f1);

router.post('/reset-code',isAdmin,f2);

router.get('/new',isAdmin,f3);

router.post('/new',isAdmin,f4);

router.get('/update',isAdmin,f5);

router.post('/publish',isAdmin,f6);

router.post('/add-content',isAdmin,f7);

router.get('/candidates',isAdmin,f8);

router.post('/select-candidates',isAdmin,f9);

router.get('/candidate-profile',isAdmin,f10);

router.get('/close',isAdmin,f11);

module.exports =router;