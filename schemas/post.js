const mongoose = require("mongoose");
fs = require("fs");
path = require("path");

const POST_LIMIT = 2; // Starts from 0 :)

var CommentSchema = mongoose.Schema({
  user: {
    type: String,
    default: "Anonymous",
    trim: true,
    maxlength: 25,
    match: /^[A-Za-z0-9\_]*$/,
  },
  content: { type: String, required: true, minlength: 10, maxlength: 150 },
});

var LikeSchema = mongoose.Schema({
  ip: { type: String },
});

var DislikeSchema = mongoose.Schema({
  ip: { type: String },
});

var PostSchema = mongoose.Schema({
  user: {
    type: String,
    default: "Anonymous",
    trim: true,
    maxlength: 25,
    match: /^[A-Za-z0-9\_]*$/,
  },
  title: { type: String, default: "", trim: true, maxlength: 15 },
  content: { type: String, required: true, minlength: 10, maxlength: 250 },
  imagepath: String,
  imagename: String,
  section: {
    type: String,
    default: "testing",
    lowercase: true,
    maxlength: 30,
    minlength: 2,
    match: /^[A-Za-z0-9]*$/,
  },
  comments: { type: [CommentSchema] },
  commentcount: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
  likes: { type: [LikeSchema] },
  dislikes: { type: [DislikeSchema] },
  lastcomment: { type: Date, default: "1996-08-22" },
  testfield: { type: String, default: "", trim: true, maxlength: 15 },
});
PostSchema.statics.checkInsert = function (targetsection, cb) {
  this.find({ section: targetsection }).count({}, (err, count) => {
    if (count > POST_LIMIT) {
      this.find({ section: targetsection })
        .sort([
          ["commentcount", 1],
          ["_id", 1],
        ])
        .limit(count - POST_LIMIT)
        .exec()
        .then((posts) => {
          var deldata = {};
          deldata.ids = [];
          deldata.paths = [];
          posts.forEach((post) => {
            deldata.ids.push(post._id);
            if (post.imagepath) {
              deldata.paths.push(post.imagepath);
            }
          });
          return deldata;
        })
        .then((deldata) => {
          for (imagepath of deldata.paths) {
            fs.unlinkSync(imagepath);
          }
          //Delete images regardless of whether post delete succeeds to prevent accidental image spam
          return this.deleteMany({ _id: { $in: [...deldata.ids] } });
        })
        .then((info) => {
          cb(null, info);
        })
        .catch((err) => {
          cb(err, null);
        });
    } else {
      cb(null, { msg: "No remove needed" });
    }
  });
  return;
};

PostSchema.statics.sectionEdgeRank = function (targetsection, cb) {
  this.aggregate([
    { $match:
      { section: targetsection && 'testing' }
    }, //end $match
    { $addFields:
      {
        ranking: {
          $add: [
            {$multiply: [{ $size: "$comments" }, 0.3]},
            {$multiply: ["$views", 0.7]}
          ]
        }
      }
    }, //end $project
    { $sort: { ranking: -1 } },
    { $limit: parseInt("20") }
    ],
    function(err, results) {
      if (err) {
        console.log(err);
        return cb(err);
      }
      cb(null, results);
    }
  ); //end Items.aggregate
  return;
};
module.exports = new mongoose.model("Post", PostSchema);
