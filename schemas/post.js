const mongoose = require("mongoose");
fs = require("fs");
path = require("path");

const POST_LIMIT = 2; // Starts from 0
var CommentSchema = mongoose.Schema({
  user: { type: String, default: "Anonymous", trim: true, maxlength: 25, match: /^[A-Za-z0-9\_]*$/ },
  content: { type: String, required: true, minlength: 10, maxlength: 150 }
});
var PostSchema = mongoose.Schema({
  user: { type: String, default: "Anonymous", trim: true, maxlength: 25, match: /^[A-Za-z0-9\_]*$/ },
  title: { type: String, default: "", trim: true, maxlength: 15},
  content: { type: String, required: true, minlength: 10, maxlength: 250 },
  imagepath: String,
  imagename: String,
  section: { type: String, default: "testing", lowercase: true, maxlength: 30, minlength: 2, match: /^[A-Za-z0-9]*$/ },
  comments: { type: [CommentSchema] },
  commentcount: { type: Number, default: 0 }
});
PostSchema.statics.checkInsert = function(targetsection, cb) {
  this.find({ section: targetsection }).count({}, (err, count) => {
    if (count > POST_LIMIT) {
      this.find({ section: targetsection })
        .sort([["commentcount", 1], ["_id", 1]])
        .limit(count - POST_LIMIT)
        .exec()
        .then(posts => {
          var deldata = {};
          deldata.ids = [];
          deldata.paths = [];
          posts.forEach(post => {
            deldata.ids.push(post._id)
            if(post.imagepath){
              deldata.paths.push(post.imagepath);
            }
          })
          return deldata;
        })
        .then(deldata => {
          for(imagepath of deldata.paths){
            fs.unlinkSync(imagepath)
          }
          //Delete images regardless of whether post delete succeeds to prevent accidental image spam
          return this.deleteMany({ _id: { $in: [...deldata.ids] } });
        })
        .then(info => {
          cb(null, info);
        })
        .catch(err => {
          cb(err, null);
        });
    } else {
      cb(null, { msg: "No remove needed" });
    }
  });
  return;
};
module.exports = new mongoose.model("Post", PostSchema);
