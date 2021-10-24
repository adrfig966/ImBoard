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
    var ext = splitname[splitname.length - 1].toLowerCase();
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
  postdata.user = req.hashedIP;
  //Check file upload errors
  if (!req.file && req.body.expectfile == "true") {
    console.log("Error with upload");
  }
  var newpost = new Post(postdata);
  if (req.file) {
    newpost.imagepath = req.file.path;
    newpost.imagename = req.file.filename;
  }
  //Check whether posts for a gievn section have reached limit then delete the appropriate (lowest) post according to ranking algorithm
  Post.checkInsertEdgeRank(req.body.section || "testing", (checkerr, result) => {
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
Description: Adds a like/dislike to the given post using post id, vote type is specifed by the path parameters. Removes opposite vote if vote exists.
Method: POST
Body: ID (string)
Path: type (string)
Response: Updated post if successful (200), else error object (400)
***************/
router.post("/addvote/:type", (req, res) => {
  var ip = req.parsedIP;
  if (req.params.type != "likes" && req.params.type != "dislikes")
    return res.status(400).send("Ivalid vote type");

  var insert = req.params.type == "likes" ? "likes" : "dislikes";
  var remove = req.params.type == "likes" ? "dislikes" : "likes";

  Post.findOneAndUpdate(
    {
      _id: req.body.id,
      [insert + ".ip"]: { $ne: ip },
      [remove + ".ip"]: ip,
    },
    {
      $push: { [insert]: { ip: ip } },
      $pull: { [remove]: { ip: ip } },
      $inc: { [insert + "count"]: 1, [remove + "count"]: -1 },
    },
    { runValidators: true, new: true }
  )
    .then((post) => {
      if (!post)
        return Post.findOneAndUpdate(
          {
            _id: req.body.id,
            [insert + ".ip"]: { $ne: ip },
          },
          {
            $push: { [insert]: { ip: ip } },
            $inc: { [insert + "count"]: 1 },
          },
          { runValidators: true, new: true }
        );
      return post;
    })
    .then((post) => {
      if(!post) return res.status(200).send("You already voted on this post.");
      return res.status(200).send(post);
    })
    .catch((err) => {
      return res.status(400).send(err);
    });
});

/**************
Description: Removes a like/dislike from the given post using post id, vote type is specifed by the path parameters.
Method: POST
Body: ID (string)
Path: type (string)
Response: Updated post if successful (200), else error object (400)
***************/
router.post("/removevote/:type", (req, res) => {
  var ip = req.parsedIP;
  if (req.params.type != "likes" && req.params.type != "dislikes")
    return res.status(400).send("Ivalid vote type");

  var remove = req.params.type;

  Post.findOneAndUpdate(
    {
      _id: req.body.id,
      [remove + ".ip"]: ip,
    },
    {
      $pull: { [remove]: { ip: ip } },
      $inc: { [remove + "count"]: -1 },
    },
    { runValidators: true, new: true }
  )
    .then((post) => {
      if (!post) return res.status(200).send("Theres is no vote to remove.");
      return res.status(200).send(post);
    })
    .catch((err) => {
      return res.status(400).send(err);
    });
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
  var options = {
    section: req.query.section || "testing",
    ip: req.parsedIP,
    id: req.query.id,
  }

  Post.sectionEdgeRank(options, (rankerr, result) => {
    if (rankerr) return res.status(400).send(rankerr);
    res.status(200).send(result);
  });
});


/* Testing purposes */
router.get("/edgerankcheck", (req, res) => {
  Post.checkInsertEdgeRank(req.query.section || "testing", (rankerr, result) => {
    if (rankerr) return res.status(400).send(rankerr);
    if (!result.length) console.log("Nothing to delete");
    res.status(200).send(result);
  });
});

module.exports = router;
