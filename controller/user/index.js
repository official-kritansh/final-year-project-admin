const User =require('../../models/user'),
      Admin =require('../../models/admin'),
      Placement =require('../../models/placement');
      const fs =require('fs'),
      path= require('path'),
multer = require('multer'),
{ google } = require("googleapis");

var storage1 = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

var upload1 = multer({ storage: storage1 });

// Firebase initialization
const keyFilename = "./real-art-266416-firebase-adminsdk-56l76-afb14bdef2.json"; //replace this with api key file
const projectId = "real-art-266416" //replace with your project id
const bucketName = `${projectId}.appspot.com`;


const { Storage } = require('@google-cloud/storage'),
  storage = new Storage({
    keyFilename
  });


const bucket = storage.bucket(bucketName);

function createPublicFileURL(storageName) {
  return `http://storage.googleapis.com/${bucketName}/${encodeURIComponent(
    storageName
  )}`;
}

async function uploadToFirebaseDesign(req, res, type, placement) {
  await upload1.single("file")(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading.
      req.flash("error", "Something Went Wrong!");
      res.redirect('back')
    } else if (err) {
      // An unknown error occurred when uploading.
      req.flash("error", "Something Went Wrong!");
      res.redirect('back')
    } else {
      // Everything went fine.
      // res.send(req.body.name)
      const fname = req.file.originalname + Date.now();
      const filePath = "./" + req.file.originalname;
      const uploadTo = type + "/" + fname;

      bucket.upload(
        filePath,
        {
          gzip: true,
          destination: uploadTo,
          public: true,
          metadata: { cacheControl: "public, max-age=300" },
        },
        async function (err, file) {
          if (err) {
            req.flash("error", "Something Went Wrong!");
            res.redirect('back')
          } else {
            placement.files.push({
                url:createPublicFileURL(uploadTo),
                name:fname
            })
            if(req.body.ctc&&req.body.min_cgpa&&req.body.branches&&req.body.branches.length){
                placement.ctc=req.body.ctc;
                placement.min_cgpa =req.body.min_cgpa;
                placement.name=req.body.name;
                placement.branches=req.body.branches;
            }
            await placement.save();
            fs.unlink(path.join('./',req.file.originalname),(err)=>{
              if(err){
                req.flash("error", "Something Went Wrong!");
                res.redirect('back');
              }else{
                res.redirect('back')              }
            });
          }
        }
      );
    }
  });
}




module.exports ={
    f1(req,res){
        Admin.findOne({},(err,admin)=>{
            if(err){
                req.flash("error","Something went wrong!")
                return res.redirect("/");
            }
            Placement.find({},(err,ps)=>{
                if(err){
                    req.flash("error","Something went wrong!")
                    return res.redirect("/");
                }
                return res.render('home',{pcode:admin.pcode,placements:ps});

            })
        })
    },

    f2(req,res){
        Admin.findOne({},async(err,admin)=>{
            if(err){
                req.flash("error","Something went wrong!")
                return res.redirect("/");
            }
            admin.pcode=req.body.pcode;
            await admin.save();
            return res.redirect('back')
        })
    },

    f3(req,res){
        res.render('new');
    },

    f4(req,res){
        let placement =new Placement();
        uploadToFirebaseDesign(req,res,'ffProject',placement)
    },

    f5(req,res){
        Placement.findOne({pid:req.query.pid,status:'OPEN'}).exec((err,program)=>{
            if(err){
                req.flash("error","Something went wrong!")
                return res.redirect("/"); 
            }
            if(!program){
                req.flash("error","Something went wrong!")
                return res.redirect("/");  
            }
            res.render('update',{program:program})
        })
    },

    f6(req,res){
        Placement.findOne({pid:req.query.pid,status:'OPEN'}).exec(async(err,program)=>{
            if(err){
                req.flash("error","Something went wrong!")
                return res.redirect("/"); 
            }
            if(!program){
                req.flash("error","Something went wrong!")
                return res.redirect("/");  
            }
            program.updates.push(req.body.message);
            await program.save();
            res.redirect('back')
        })
    },

    f7(req,res){
        Placement.findOne({pid:req.query.pid,status:'OPEN'}).exec(async(err,program)=>{
            if(err){
                req.flash("error","Something went wrong!")
                return res.redirect("/"); 
            }
            if(!program){
                req.flash("error","Something went wrong!")
                return res.redirect("/");  
            }
            uploadToFirebaseDesign(req,res,'ffProject',program)
        })
    },

    f8(req,res){
        Placement.findOne({pid:req.query.pid}).populate('users.user').exec(async(err,program)=>{
            if(err){
                req.flash("error","Something went wrong!")
                return res.redirect("/"); 
            }
            if(!program){
                req.flash("error","Something went wrong!")
                return res.redirect("/");  
            }
            program.users=program.users.filter((e)=>{
                return e.isSelected;
            })
           res.render('select_candidates',{program:program})
        })
    },

    f9(req,res){
        Placement.findOne({pid:req.query.pid,status:'OPEN'}).populate('users.user').exec(async(err,program)=>{
            if(err){
                req.flash("error","Something went wrong!")
                return res.redirect("/"); 
            }
            if(!program){
                req.flash("error","Something went wrong!")
                return res.redirect("/");  
            }
            console.log(req.body.not_selected);
            if(req.body.not_selected){
                program.users.forEach((u)=>{
                    if(req.body.not_selected.includes(u.user.uid)){
                        u.isSelected=false;
                    }
                })
            }
           
            program.round+=1;
            await program.save();
            res.redirect('/')
        })
    },

    f10(req,res){
        User.findOne({uid:req.query.uid}).exec(async(err,user)=>{
            if(err){
                req.flash("error","Something went wrong!")
                return res.redirect("/"); 
            }
            if(!user){
                req.flash("error","Something went wrong!")
                return res.redirect("/");  
            }
            res.render('user_profile',{user:user});
        })
    },

    f11(req,res){
        Placement.findOne({pid:req.query.pid,status:'OPEN'}).exec(async(err,program)=>{
            if(err){
                req.flash("error","Something went wrong!")
                return res.redirect("/"); 
            }
            if(!program){
                req.flash("error","Something went wrong!")
                return res.redirect("/");  
            }
            program.status='CLOSED'
            await program.save();
            res.redirect('/')
        })
    }
}