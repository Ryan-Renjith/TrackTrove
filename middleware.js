const ExpressError = require('./utils/expressError.js');

//const Joi = require('joi'); Not needed here because when exporting the kartTrackSchema all functions come with it attached to the object and we have required Joi in the schemas file.
const {kartTrackSchema, reviewSchema} = require('./schemas.js'); //Destructuring because we might have multiple schemas in the future.
const kartingTrack = require('./models/kartingtrack.js');

const Review = require('./models/review.js');


module.exports.isLoggedIn = (req,res,next) => {
    if(!req.isAuthenticated())    //function from Passport.js to make sure a user is logged in
    {
        req.session.returnTo = req.originalUrl; //store the url that needed to be accessed before being asked to login in so that after loggin in, user can be redirected to that very url
        req.flash('error', 'Must be signed in first!');
        return res.redirect('/login');
    }

    next();
}

module.exports.storeReturnTo = (req,res,next) => {
    if(req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }

    next();
}

module.exports.validateKartTrack = (req,res,next) => {   //schema validation function middleware. Not using app.use since we do not want this middleware to run for every request.
    const {error} = kartTrackSchema.validate(req.body);   //server side validation if bypassed the client side validations via postman.
    if(error) {
        const msg = error.details.map(elem => elem.message).join(',');
        throw new ExpressError(msg, 400);
    }
    else {
        next();
    }
}

module.exports.isAuthorized = async (req,res,next) => {
    const {id} = req.params;
    const kartTrack = await kartingTrack.findById(id);
    if(!kartTrack.author.equals(req.user._id)) {
        req.flash('error', 'Unauthorized request!');
        return res.redirect(`/kartTracks/${id}`);
    }
    
    next();
}

module.exports.validateReview = (req,res,next) => {
    const {error} = reviewSchema.validate(req.body);
    if(error) {
        const msg = error.details.map(elem => elem.message).join(',');
        throw new ExpressError(msg, 400);
    }
    else {
        next();
    }
}

module.exports.isReviewAuthor = async (req,res,next) => {
    const {id, reviewId} = req.params;
    const review = await Review.findById(reviewId);
    if(!review.author.equals(req.user._id)) {
        req.flash('error', 'Unauthorized request!');
        return res.redirect(`/kartTracks/${id}`);
    }
    
    next();
}