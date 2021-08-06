const multer = require("multer");
const express = require("express");
const Post = require("../schemas/post");
const path = require("path");
const router = express.Router();

/**************
Fileupload set up, uses Multer
***************/
//Disk storage configuration
var dstorage = multer.diskStorage({
  destination: path.join(__dirname, "../uploads"),
  //Generate file name based on post section, format is: {section}-{ms since epoch}.{original extension}
  filename: function (req, file, cb) {
    var splitname = file.originalname.split(".");
    cb(
      null,
      req.body.section +
        "-" +
        Date.now() +
        "." +
        splitname[splitname.length - 1]
    );
  },
});

//Generating middleware for handling 'postpicture' file input field
var uploadmw = multer({
  storage: dstorage,
  limits: { fileSize: 1048576, files: 1 },
  fileFilter: function (req, file, cb) {
    var allowtypes = ["jpg", "png", "gif", "bmp"];
    var splitname = file.originalname.split(".");
    var ext = splitname[splitname.length - 1];
    if (allowtypes.includes(ext)) {
      return cb(null, true);
    }
    return cb(null, false);
  },
}).single("postpicture");

/**************
Router-specific middleware to remove POST data with missing values to avoid unexpected behavior
***************/
router.use((req, res, next) => {
  var keys = Object.keys(req.body);
  var newbody = {};
  for (key of keys) {
    if (req.body[key] != "") {
      newbody[key] = req.body[key];
    }
  }
  req.body = newbody;
  next();
});

/************** API routes ***************/

/**************
Description: Adds new post to a given section
Method: POST
Body: User (string), Content (string), Section (string), File (object, file meta-data from Multer)
Response: New post if successful (200), else error object (400)
***************/
router.post("/newpost", uploadmw, (req, res) => {
  var postdata = {
    content: req.body.content,
    section: req.body.section,
  };
  //Using FormData objects on front end prevents middleware fix from working, this is a quickfix for empty values.
  if (req.body.user) {
    postdata.user = req.body.user;
  }
  //Check file upload errors
  if (!req.file && req.body.expectfile == "true") {
    console.log("Error with upload");
  }
  var newpost = new Post(postdata);
  if (req.file) {
    newpost.imagepath = req.file.path;
    newpost.imagename = req.file.filename;
  }
  Post.checkInsert(req.body.section || "testing", (checkerr, result) => {
    if (checkerr) return res.status(400).send(checkerr);
    newpost.save((saverr, doc) => {
      if (saverr) return res.status(400).send(saverr);
      res.status(200).send(doc);
    });
  });
});

/**************
Description: Adds new comment to given post using post id
Method: POST
Body: ID (string), User (string), Content (string)
Response: Updated post if successful (200), else error object (400)
***************/
router.post("/addcomment", (req, res) => {
  Post.findOneAndUpdate(
    { _id: req.body.id },
    {
      $push: {
        comments: { user: req.body.user, content: req.body.content },
      },
      $inc: { commentcount: 1 },
      $set: {
        lastcomment: Date.now(),
      },
    },
    { runValidators: true, new: true },
    (err, post) => {
      if (err) return res.status(400).send(err);
      res.status(200).send(post);
    }
  );
});

/**************
Description: Adds a like to the given post using post id
Method: POST
Body: ID (string)
Response: Updated post if successful (200), else error object (400)
***************/
router.post("/addvote", (req, res) => {
  var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  console.log("User IP: " + ip);
  Post.findOneAndUpdate(
    {
      _id: req.body.id,
      likes: {
        "$not": {
          "$elemMatch": {
            ip: ip
          }
        }
      },
      dislikes: {
        "$not": {
          "$elemMatch": {
            ip: ip
          }
        }
      }
    },
    {
      $addToSet: {
        likes: { ip: ip },
      },
    },
    { runValidators: true, new: true },
    (err, post) => {
      if (err) return res.status(400).send(err);
      console.log(post);
      if(!post) return res.status(200).send("You already liked this post.");
      res.status(200).send(post);
    }
  );
});

/**************
Description: Sends image with given file name from post uploads directory
Method: GET
Path Params: Filename (string)
Response: Image file if successful
***************/
router.get("/getimage/:filename", (req, res) => {
  res.sendFile(req.params.filename, {
    root: path.join(__dirname, "../uploads"),
    dotfiles: "deny",
  });
});

/**************
Description: Returns posts for given section
Method: GET
Query Params: Section (string)
Response: Posts for section as JSON if success (200), else error object (400)
***************/
router.get("/getposts", (req, res) => {
  Post.find({ section: req.query.section })
    .sort([
      ["commentcount", -1],
      ["_id", -1],
    ])
    .exec((err, posts) => {
      if (err) return res.status(400).send(err);
      res.status(200).send(posts);
    });
});

/**************
Description: Returns post with given ID
Method: GET
Query Params: ID (string)
Response: Single post for given ID as JSON if success (200), else error object (400)
***************/
router.get("/getpost", (req, res) => {
  Post.find({ _id: req.query.id }, (err, posts) => {
    if (err) return res.status(400).send(err);
    res.status(200).send(posts);
  });
});

/**************
Description: Gets edgerank score for a given section
Method: GET
Query Params: Section (string)
Response: Single post for given ID as JSON if success (200), else error object (400)
***************/
router.get("/edgerank", (req, res) => {
  Post.sectionEdgeRank(req.query.section || "testing", (rankerr, result) => {
    if (rankerr) return res.status(400).send(rankerr);
    res.header("Content-Type",'application/json');
    res.status(200).send(result);
  });
});

module.exports = router;
