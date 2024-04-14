const express = require('express');
const path = require('path');
const app = express();

const session = require('express-session');
const flash = require('connect-flash');

const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local'); //simple username and password passport strategy
const User = require('./models/user.js');

const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/expressError');

const kartTrackRoutes = require('./routes/kartTracks.js');
const reviewRoutes = require('./routes/reviews.js');
const userRoutes = require('./routes/users.js');

const mongoose = require('mongoose');

const engine = require('ejs-mate');

mongoose.connect('mongodb://localhost:27017/track-trove');

app.use(express.urlencoded({extended: true})); //For express to parse URL-encoded data in request body

app.use(methodOverride('_method')); //app.use() mounts middleware functions

app.use(express.static(path.join(__dirname, 'public'))); //serving static files in the public directory

const db = mongoose.connection;
db.on("error", () => console.error("Error connecting to the database"));
db.once("open", () => console.log("Connected to the database successfully"));

const sessionConfig = {
    secret: 'needabettersecret',
    resave: false,
    saveUnitialized: true,
    cookie: {
        httpOnly: true, //security measure
        expires: Date.now() + (1000 * 60 * 60 * 24 * 7), //session cookie expires in a week (Date.now() is in milliseconds)
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session()); //For persistent login sessions. Should come after calling session()
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());   //Generate a function used by passport to serialize users into the session
passport.deserializeUser(User.deserializeUser());   //Generate a function used by passport to deserialize users into the session
//Basically the above two functions deal with how data is to be stored and retrieved in sessions

app.set('view engine', 'ejs');
app.engine('ejs', engine);
app.set('views', path.join(__dirname, 'views'));

app.use((req,res,next) => {     //On every route, we will now have access to the flash message based on the key in the locals variable in the templates
    res.locals.currentUser = req.user;  //req.user coming from session thanks to Passport. Once a user is logged in, we need the details globally in every route/template. If user is not logged in then req.user results in undefined
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    //req.user will contain user id, username and user email
    next();
});

/*
app.get('/fakeUser', async(req, res) => {
    const user = new User({email: 'something@gmail.com', username: 'something'});
    const newUser = await User.register(user, 'chicken'); //chicken - password
    res.send(newUser);
});

{
  "email": "something@gmail.com",
  "_id": "6612c4cde50480fc910a86cc",
  "username": "something",
  "salt": "3811e08ee30756b9de3d5f8b1b0293dd2890667a38bfc9522fa06a3e7930dfbd",
  "hash": "571ee0cd39147665a1fb69e1a80b37e734ebbf29335e3ec1b8d69dcc2f9a4e69d76a0e26e1a87e5b9906c2916b7f93084a819a0981ef097cfbdce6c75cfae2978b65bbfaa9e85f20ddfe39abc88d6e220688576037cd6e783022eb9d8c5928a98c03cd68254448c9d0eba8cfa5dadf0fe59691887755cb423afa2cec8f229ccdbba5a6b7b191d43e83a4a34278d03b3cc76d9305875bdcd9288657b5aefc4c32a2ba836016e6138204eb539eef63caa24b1aa761c61b9dab17e6b1b26f4130301581aef78700b49242e632071638c81955056326ee0276f5a8804ae5aadbf81153b830df71447200ae2ba69a8d2ac756680aeccc7968d3fa940f0a51d878150611b33b199bebc99464e1d4f4b202bc7ffeca83260f8d35aee7154ab7d3d9b2af62523c9934e9bbac4f2561d60aa4a7f9f81d25c41ffbb17c3a082810965eb5e826e991a2abe6cd9e65f8b0d3a6dccc120be2295295bca599f994244aa7f034f9fb8fa6f3b0e96cbe071b3d8a4f51b810902b9975b04e010f3ff21c8df1f319a1de488e1310df383373d21cb0db2e67f2dd94169a8abc9f9634b1d6ccc888fc887449c7d0cb91287f483dc9c81b4ff6ea410f13b78d791d75854b0a5f0cd6608b11255cfa90f76ea7eaca5520c0a7769c095e525a02f22a157aaf01a91608059d3f029f83a854b355fed5b6d44569e6a32885b9efb34ad5f25f4c83b4ddd35397",
  "__v": 0
}
*/


app.get('/', (req,res) => {
    res.render('home');
});


app.use('/', userRoutes);
app.use('/kartTracks', kartTrackRoutes);
app.use('/kartTracks/:id/reviews', reviewRoutes); //mergeParams in Router is required to get access to :id for kartTracks


app.all('*', (req,res,next) => {
    next(new ExpressError('Page not found', 404)); //when next() is passed with an error object, it calls the next error handling middleware. It knows new ExpressError is an error object since the class is extended from the inbuild Error class. If no objects or arguments are passed, it takes control to any of the next middleware.
})

app.use((err,req,res,next) => {                 //error handling middleware
    const {statusCode = 500, message = 'Something went wrong'} = err;
    res.status(statusCode).render('error', {statusCode, message});
})

app.listen(3000, () => {
    console.log("Server listening on PORT 3000");
});