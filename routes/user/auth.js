const express = require("express");
var router = express.Router({ mergeParams: true }),
    passport = require("passport"),
    Admin = require("../../models/admin"),
    { f1Auth,f2Auth,f3Auth,f4Auth,f5Auth,f6Auth } = require("../../controller/user/auth"),
    { isAdmin } = require("../../middleware/index");

// @route to register page
// Admin.register(new Admin({email:'kintu2676@gmail.com',pcode:'dsce-1155-77552-777'}), '1234', (err, admin) => {
//     if (err) {
//         console.log(err)
//     }else{
//         console.log('created a new admin');
//     }
// });

// @route to login page
router.get('/login',(req,res)=>{
    if(req.user){
        if(req.isAuthenticated()&&req.user.typeof=="admin"){
            res.redirect("/home");
        }else{
            res.render("login");
        }
    }else{
        res.render("login");
    }
});

// @post route to login
router.post('/login',f1Auth);

// @ route to logout
router.get('/logout',isAdmin,f2Auth);

// @route to get reset page
router.get("/reset/:token",f4Auth);

// @route to send confirmation after email reset
router.post("/reset/:token",f5Auth);

// @route to get recovery page
router.get("/recoverypage",f6Auth);

// @route to send forgot password mail
router.post("/forget",f3Auth);



module.exports = router;