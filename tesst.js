const express = require("express");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const nunjucks = require("nunjucks");

//Express and Mongoose
const app = express();
const mongoose = require("mongoose");
const Post = require("./schemas/post");

//Routes
const templateroutes = require("./routes/templateroutes");
const apiroutes = require("./routes/apiroutes");

//Custom Middleware
const middleware = require("./util/middleware");

/**************
Server & DB configuration
***************/

//Mongoose connection set up
mongoose.connect(
   require("./connectionstr"),
  { useNewUrlParser: true },
  (err) => {
    if (err) console.log(err);
  }
);
mongoose.set("useFindAndModify", false);

//Setting nunjucks as view engine
nunjucks.configure("views", {
  autoescape: true, //Escape HTML automatically
  express: app,
});

//Allows omitting of .njk extension for view rendering
app.set("view engine", "njk");

// Allow forwarded-for headers - Make sure to set proper NGINX configuration see below:
/*
proxy_set_header  X-Real-IP  $remote_addr;
*/
app.set('trust proxy', true)
/**************
Middleware
***************/
app.use(cookieParser());
app.use(bodyParser());
app.use(middleware.grabIP);
app.use(express.static("public"));

//Router middleware
app.use(templateroutes);
app.use(apiroutes);

/**************
Testing, in progress
***************/
app.get("/", (req, res) => {
  res.redirect("/testing/posts");
});
app.post("/test", (req, res) => {
  console.log(req.body);
  res.send("Received");
});

/**************
 ***************/
app.listen(3000, () => {
  console.log("Listenin on port 3k boss");
});