const express = require('express');
const router = express.Router({mergeParams: true}); //To get access to kartTracks id param in the URL. By default express router likes to sepearate the params

const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/expressError');

const {reviewSchema} = require('../schemas.js');

const Review = require('../models/review.js');
const kartingTrack = require('../models/kartingtrack.js');

const validateReview = (req,res,next) => {
    const {error} = reviewSchema.validate(req.body);
    if(error) {
        const msg = error.details.map(elem => elem.message).join(',');
        throw new ExpressError(msg, 400);
    }
    else {
        next();
    }
}


router.post('/', validateReview, catchAsync(async (req,res) => {
    const track = await kartingTrack.findById(req.params.id);
    const review = new Review(req.body.review);
    track.reviews.push(review);
    
    await review.save();
    await track.save();

    req.flash('success', 'Successfully created new review!');

    res.redirect(`/kartTracks/${track._id}`);
}));


router.delete('/:reviewId', catchAsync(async (req,res) => { 
    const {id, reviewId} = req.params;
    await kartingTrack.findByIdAndUpdate(id, { $pull: { reviews: reviewId}});  //The $pull operator removes from an existing array all instances of a value or values that match a specified condition.
    await Review.findByIdAndDelete(reviewId);

    req.flash('success', 'Successfully deleted review!');
    res.redirect(`/kartTracks/${id}`);
}));


module.exports = router;