const express = require("express");
const Post = require("../schemas/post");
const router = express.Router();

router.get("/home", (req, res) => {
  //page property is created to allow highlighting of active page
  res.status(200).render("home", {page: "home"});
});

/**************
Description: Renders main layout (main.njk) with posts content (posts.njk) for given section
Method: GET
Path Params: Section (string)
Response: An HTML page with section posts
***************/
router.get("/:section([0-9a-zA-Z]{2,30})/posts", (req, res) => {
  var options = {
    section: req.params.section || "testing",
    ip: req.parsedIP,
  }

  if(req.user)options.gmail = req.user._json.email;

  //Grab post using ranking algorithm, posts are automatically sorted by best
  Post.sectionEdgeRank(options, (rankerr, postarr) => {
    if (rankerr) return res.status(400).send(rankerr);
    //Section is propagated into the template to allow highlighting of active page
    res
      .status(200)
      .render("posts", { postarr: postarr, section: req.params.section });
  });
});

/**************
Description: Renders main layout (main.njk) with single post content (post.njk) for given post ID
Method: GET
Path Params: ID (string), Section(string)
Query Params:  CommentID(string, optional)
Response: An HTML page with given post content
***************/
router.get(
  "/:section([0-9a-zA-Z]{0,30})/posts/:id([0-9a-fA-F]{24})",
  (req, res) => {
    var options = {
      section: req.params.section || "testing",
      id: req.params.id,
      ip: req.parsedIP,
    }
    
    if(req.user)options.gmail = req.user._json.email;

    Post.sectionEdgeRank(options, (err, posts) => {
      if (err) return res.status(400).send(err);

      // We don't have to wait for the view incremement to finish to send the post back to the user.
      Post.findOneAndUpdate(
        { _id: posts[0]._id },
        {
          $inc: { views: 1 },
        },
        { runValidators: true, new: true },
        (err, post) => {
          if (err) return console.log(err);
        }
      );

      //comid is propagated to allow highlighting of comments
      res.status(200).render("post", {
        post: posts[0],
        section: req.params.section,
        comid: req.query.comid
      });
    });
  }
);
module.exports = router;
