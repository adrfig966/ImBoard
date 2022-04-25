require("dotenv").config({path: __dirname + '/secrets.env'});
const Post = require("./schemas/post");
const mongoose = require("mongoose");
const path = require("path");
mongoose.connect(
  process.env.MONGO_STR,
  { useNewUrlParser: true },
  err => {
    if (err) console.log(err);
  }
);
var demodata = [
  {
    user: "40203abe6e81ed98cbc97cdd6ec4f144",
    section: "testing",
    commentcount: 2,
    views: 20,
    likescount: 30,
    dislikescount: 2,
    content:
      "Check out this photo of my dog, he's straight chillin' :)",
    comments: [
      {
        user: "92763ca59cb3dad8a927652d1813d615",
        content: "Dang what a good boy!"
      },
      {
        user: "964d72e72d053d501f2949969849b96c",
        content: "What kind of dog is he?"
      }
    ],
    imagepath:
      path.join(__dirname, "uploads", "testing-1647851464161.jpg"),
    imagename: "testing-1647851464161.jpg"
  },
  {
    user: "663dcf54a50a80f8f7cd7ace9a2673c5",
    section: "testing",
    commentcount: 4,
    views: 60,
    likescount: 70,
    dislikescount: 10,
    content:
      "Here's a picture I took on my vacation. The view was beautiful.",
    comments: [
      {
        user: "92763ca59cb3dad8a927652d1813d615",
        content: "You're so lucky!"
      },
      {
        user: "964d72e72d053d501f2949969849b96c",
        content: "Wow where is this located?"
      },
      {
        user: "46d0cb1bff872c6b47284a3de08cf04f",
        content: "I've been here before, it is quite nice."
      },
      {
        user: "0421008445828ceb46f496700a5fa65e",
        content: "I think I can see a shark in the water lol."
      }
    ],
    imagepath:
      path.join(__dirname, "uploads", "testing-1647942961848.jpg"),
    imagename: "testing-1647942961848.jpg"
  },
  {
    user: "1e98ec8857c226d4011b3b53a5ddd8a6",
    section: "testing",
    commentcount: 3,
    views: 120,
    likescount: 40,
    dislikescount: 15,
    content:
      "I made some pixel art of a sunset outside my window :)",
    comments: [
      {
        user: "92763ca59cb3dad8a927652d1813d615",
        content: "This has a chill vibe :-)"
      },
      {
        _id: "623aaaa1618287e0f8d34a62",
        user: "964d72e72d053d501f2949969849b96c",
        content: "Hey you stole this from my post."
      },
      {
        user: "1e98ec8857c226d4011b3b53a5ddd8a6",
        content: ">>623aaaa1618287e0f8d34a62 No I didn't."
      },
    ],
    imagepath:
      path.join(__dirname, "uploads", "testing-1647943630105.png"),
    imagename: "testing-1647943630105.png"
  },
  {
    user: "6175f9452c2084fe98555503",
    userref: '6175f9452c2084fe98555503',
    section: "testing",
    commentcount: 0,
    views: 5,
    likescount: 2,
    dislikescount: 1,
    content:
      "Does anyone know how I can create an effect like this in Blender?",
    imagepath:
      path.join(__dirname, "uploads", "testing-1648015354893.png"),
    imagename: "testing-1648015354893.png"
  }
];
console.log("Running script...");

function resetDemoDB() {
  Post.deleteMany({})
    .then(res => {
      console.log("Delete successful");
      return Post.insertMany(demodata);
    })
    .then(res => {
      console.log("Insertion successful");
    })
    .catch(err => {
      console.log("An error occured", err);
      process.exit(1);
    })
    .then(() => {
      console.log("Script done");
      process.exit(0);
    });
}
resetDemoDB();
