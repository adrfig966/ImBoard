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
  Post.find({ section: req.params.section })
    .sort([["commentcount", -1], ["_id", -1]])
    .exec((err, postarr) => {
      if (err) return res.status(400).send(err);
      //section is propagated into the template to allow highlighting of active page
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
    Post.find({ _id: req.params.id }, (err, posts) => {
      if (err) return res.status(400).send(err);
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
