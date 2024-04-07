const express = require('express');
const path = require('path');
const app = express();

const session = require('express-session');
const flash = require('connect-flash');

const methodOverride = require('method-override');

const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/expressError');

const kartTracks = require('./routes/kartTracks.js');
const reviews = require('./routes/reviews.js');

const mongoose = require('mongoose');

const engine = require('ejs-mate');

mongoose.connect('mongodb://localhost:27017/track-trove');

app.use(express.urlencoded({extended: true})); //For express to parse URL-encoded data in request body

app.use(methodOverride('_method')); //app.use() mounts middleware functions

app.use(express.static(path.join(__dirname, 'public'))); //serving static files in the public directory

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

const db = mongoose.connection;
db.on("error", () => console.error("Error connecting to the database"));
db.once("open", () => console.log("Connected to the database successfully"));


app.set('view engine', 'ejs');
app.engine('ejs', engine);
app.set('views', path.join(__dirname, 'views'));

app.use((req,res,next) => {     //On every route, we will now have access to the flash message based on the key in the locals variable in the templates
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');

    next();
})


app.get('/', (req,res) => {
    res.render('home');
});

app.use('/kartTracks', kartTracks);
app.use('/kartTracks/:id/reviews', reviews); //mergeParams in Router is required to get access to :id for kartTracks


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