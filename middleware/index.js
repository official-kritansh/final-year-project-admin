
module.exports ={
    isAdmin(req,res,next){
        if(req.isAuthenticated()&&req.user.typeof=='admin'){
            return next();
        }else{
            res.redirect("/");
        }
    }
}