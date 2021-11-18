const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

const POST_LIMIT = 3; // Starts from 0 :)

var CommentSchema = mongoose.Schema({
  user: {
    type: String,
    default: "Anonymous",
  },
  userref: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  content: { type: String, required: true, minlength: 10, maxlength: 150 },
});

var LikeSchema = mongoose.Schema({
  ip: { type: String },
  gmail: { type: String }
});

var DislikeSchema = mongoose.Schema({
  ip: { type: String },
  gmail: { type: String }
});

var PostSchema = mongoose.Schema({
  /*Used for anonymous posts*/
  user: {
    type: String,
    default: "Anonymous",
  },
  userref: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
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
  likescount: { type: Number, default: 0 },
  dislikescount  : { type: Number, default: 0 },
  lastcomment: { type: Date, default: Date.now },
  testfield: { type: String, default: "", trim: true, maxlength: 15 },
}, { timestamps: true });

/* Rank algorithm score computed from existing post fields */
const rankfield = {
  $divide: [
    {
      $add: [
        { $multiply: ["$commentcount", 0.5] },
        { $multiply: ["$likescount", 0.3] },
        { $multiply: ["$views", 0.2] },
      ],
    },
    {
      $add: [
        1,
        { $multiply: [{ $subtract: [new Date(), "$lastcomment"] }, 0.2] },
        { $multiply: [{ $subtract: [new Date(), "$createdAt"] }, 0.8] },
      ],
    },
  ],
};

const iplike = function(ip) {
  if(!ip) return {};

  return {
    canlike: {
      $not: {
        $in : [ ip, "$likes.ip" ],
      }
    },
    candislike: {
      $not: {
        $in : [ ip, "$dislikes.ip" ],
      }
    }
  }
}

const gmaillike = function(gmail) {
  if(!gmail) return {};

  return {
    canlike: {
      $not: {
        $in : [ gmail, "$likes.gmail" ],
      }
    },
    candislike: {
      $not: {
        $in : [ gmail, "$dislikes.gmail" ],
      }
    }
  }
}


PostSchema.statics.checkInsertEdgeRank = function (section, cb) {
  this.aggregate([
    { $match:
      { section: section || 'testing' }
    }, //end $match
    { $addFields:
      // Ranking algorithm defined above
      { ranking: rankfield }
    }, //end $addFields
    { $sort: { ranking: -1, "_id": -1 } },
    { $skip: POST_LIMIT-1 }
    ]
  ).then((posts) => { //end Items.aggregate
    //Grab all post IDs and image paths to be deleted, order does not matter since they all have to be deleted.
    var deldata = {};
    deldata.ids = [];
    deldata.paths = [];
    posts.forEach((post) => {
      deldata.ids.push(post._id);
      if (post.imagepath) {
        deldata.paths.push(post.imagepath);
      }
    });

    //Delete images regardless of whether post delete succeeds.
    for (imagepath of deldata.paths) {
      fs.unlinkSync(imagepath);
    }
    //Delete posts
    return this.deleteMany({ _id: { $in: [...deldata.ids] } });
  }).then((info) => {
    cb(null, info);
  })
  .catch((err) => {
    cb(err);
  });

  return;
};

PostSchema.statics.sectionEdgeRank = function (opts, cb) {
  var optionalfields = {};
  var optionalfilters = {};
  if(opts.gmail) Object.assign(optionalfields, gmaillike(opts.gmail));
  if(opts.id) optionalfilters._id = mongoose.Types.ObjectId(opts.id);

  this.aggregate([
    { $match:
      {
        section: opts.section || 'testing',
        ...optionalfilters,
      }
    }, //end $match
    { $addFields:
      {
        ranking: rankfield,
        ...optionalfields,
      }
    }, //end $addFields
    { $sort: { ranking: -1, "_id": -1 } },
    { $limit: parseInt("20") }
    ],
    function(err, results) {
      if (err) {
        return cb(err);
      }
      cb(null, results);
    }
  ); //end Items.aggregate
  return;
};

module.exports = new mongoose.model("Post", PostSchema);
