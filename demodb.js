const Post = require("./schemas/post");
const mongoose = require("mongoose");
const path = require("path");
mongoose.connect(
  "mongodb+srv://adrfig96:lolcat@captain-h8f64.mongodb.net/SMX?retryWrites=true&w=majority",
  { useNewUrlParser: true },
  err => {
    if (err) console.log(err);
  }
);
var demodata = [
  {
    _id: "5d8fb7fc2c96513594db3028",
    user: "Tester",
    section: "testing",
    commentcount: 1,
    content:
      "Check out some of this action sports photography I did. It's a picture of my friend doing a crooked grind. What do you guys think??",
    comments: [
      {
        user: "Anonymous",
        _id: "5d8fe3dd874efe4a24e76ed3",
        content: "Great flick!"
      }
    ],
    imagepath:
      path.join(__dirname, "uploads", "random-1569699836010.jpg"),
    imagename: "random-1569699836010.jpg"
  },
  {
    _id: "5d816ab49eaf3e1ae49930fc",
    user: "Anonymous",
    section: "testing",
    commentcount: 1,
    content: "This is a graphic I designed of the Coachella Valley outskirts. Let me know your thoughts.",
    comments: [
      {
        user: "Eric_Cartman",
        _id: "5d816bff9eaf3e1ae49930fe",
        content: "I think I recognize those mountains.."
      }
    ],
    imagepath:
      path.join(__dirname, "uploads", "random-1568762548532.png"),
    imagename: "random-1568762548532.png"
  },
  {
    _id: "5d97024e258be67278095a5f",
    user: "Kenny_McCormick",
    title: "",
    section: "testing",
    commentcount: 2,
    content: "Amazing photo of a sunset I took when I went camping during the summer in the desert. The spot was South of Twenty-Nine Palms in Southern California",
    comments: [
      {
        user: "Stan_Marsh",
        _id: "5d970adc258be67278095a60",
        content: "Where was this taken? I want to go there!"
      },
      {
        user: "Kenny_McCormick",
        _id: "5d970b14258be67278095a61",
        content:
          ">>5d970adc258be67278095a60 It's in Joshua Tree, you should check it out."
      }
    ],
    imagepath:
      path.join(__dirname, "uploads", "random-1570177614818.jpg"),
    imagename: "random-1570177614818.jpg",
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
    })
    .then(() => {
      console.log("Script done");
      process.exit(1);
    });
}
resetDemoDB();
