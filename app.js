const express = require('express');
const path = require('path');
const app = express();

const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/expressError');

//const Joi = require('joi'); Not needed here because when exporting the kartTrackSchema all functions come with it attached to the object and we have required Joi in the schemas file.
const {kartTrackSchema} = require('./schemas.js'); //Destructuring because we might have multiple schemas in the future.

const methodOverride = require('method-override');

const kartingTrack = require('./models/kartingTrack');

const mongoose = require('mongoose');

const engine = require('ejs-mate');

mongoose.connect('mongodb://localhost:27017/track-trove');

app.use(express.urlencoded({extended: true})); //For express to parse URL-encoded data in request body

app.use(methodOverride('_method')); //app.use() mounts middleware functions

app.use('/images',express.static('images')); //serve static files(images) located in the images folder

const db = mongoose.connection;
db.on("error", () => console.error("Error connecting to the database"));
db.once("open", () => console.log("Connected to the database successfully"));


app.set('view engine', 'ejs');
app.engine('ejs', engine);
app.set('views', path.join(__dirname, 'views'));

const validateSchema = (req,res,next) => {   //schema validation function middleware. Not using app.use since we do not want this middleware to run for every request.
    const {error} = kartTrackSchema.validate(req.body);   //server side validation if bypassed the client side validations via postman.
    if(error) {
        const msg = error.details.map(elem => elem.message).join(',');
        throw new ExpressError(msg, 400);
    }
    else {
        next();
    }
}

app.get('/', (req,res) => {
    res.render('home');
});

app.get('/kartTracks', catchAsync(async (req,res) => {         //The route for which this functionality
    const kartingTracks = await kartingTrack.find({});
    res.render('kartTracks/index', {kartingTracks});//The file that needs to be rendered when this route is accessed
}));

app.get('/kartTracks/new', (req,res) => {
    res.render('kartTracks/new');
});

app.post('/kartTracks', validateSchema, catchAsync(async (req,res) => {
    const newTrack = new kartingTrack(req.body.kartingTrack);
    newTrack.image = `../images/kartTracks/${newTrack.image}.png`;
    await newTrack.save();
    res.redirect(`/kartTracks/${newTrack._id}`);
}));

app.get('/kartTracks/:id', catchAsync(async (req,res) => {
    const track = await kartingTrack.findById(req.params.id);
    res.render('kartTracks/details', {track});
}));

app.get('/kartTracks/:id/edit', catchAsync(async (req,res) => {
    const track = await kartingTrack.findById(req.params.id);
    res.render('kartTracks/edit', {track});
}));

app.put('/kartTracks/:id', validateSchema, catchAsync(async (req,res) => {
    const {id} = req.params;
    const track = await kartingTrack.findByIdAndUpdate(id, {...req.body.kartingTrack});
    res.redirect(`/kartTracks/${track._id}`);
}));

app.delete('/kartTracks/:id', catchAsync(async (req,res) => {
    const {id} = req.params;
    await kartingTrack.findByIdAndDelete(id);
    res.redirect('/kartTracks');
}));

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