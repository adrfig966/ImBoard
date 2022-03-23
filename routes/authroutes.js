const router = require('express').Router();
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../schemas/user');

passport.serializeUser(function(user, done) {
    done(null, user);
  });

passport.deserializeUser(function(user, done) {
    done(null, user);
});

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.CALLBACK_URL
  },
  function(accessToken, refreshToken, profile, done) {
    User.findOneAndUpdate({gmail: profile._json.email}, {}, {upsert: true}, (err, doc) => {
      if(err) return done(err);
      profile.mongo_id = doc._id;
      return done(null, profile);
    });
  }
));

/* Testing purposes */
router.get("/checkenv", (req, res) => {
  res.status(200).send("Ping");
});

router.get('/failed', (req, res) => {
  res.send('<h1>Could not log in(</h1>')
});

// Middleware - Check user is Logged in
const checkUserLoggedIn = (req, res, next) => {
  req.user ? next(): res.sendStatus(401);
}

//Protected Route.
router.get('/profile', checkUserLoggedIn, (req, res) => {;
  res.send(`<h1>${req.user.displayName}'s Dashboard</h1>`)
});

//Auth and callback routes
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/failed' }),
  function(req, res) {
    res.redirect('/');
  }
);

//Logout
router.get('/logout', (req, res) => {
    req.session = null;
    req.logout();
    res.redirect('/');
})

/* Middleware to attach the user object from Google auth to every response, this is used on the front end to display certain sections */
router.use((req, res, next) => {
  if(req.user){
    res.locals.user = req.user;
  }
  next();
})

module.exports = router;
