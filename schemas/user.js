const mongoose = require("mongoose");

const UserSchema = mongoose.Schema({
  username: {
    type: String,
    default: "Unnamed",
  },
  email: {
    type: String,
    default: "",
  },
  gmail: {
    type: String,
    default: "",
  },
});

UserSchema.virtual('posts', {
  ref: 'Post',
  localField: '_id',
  foreignField: 'userref'
});


module.exports = new mongoose.model("User", UserSchema);
