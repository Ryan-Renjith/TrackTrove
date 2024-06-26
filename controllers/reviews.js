const Review = require('../models/review.js');
const kartingTrack = require('../models/kartingtrack.js');

module.exports.createReview = async (req,res) => {
    const track = await kartingTrack.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    track.reviews.push(review);
    await review.save();
    await track.save();

    req.flash('success', 'Successfully created new review!');

    res.redirect(`/kartTracks/${track._id}`);
}

module.exports.deleteReview = async (req,res) => { 
    const {id, reviewId} = req.params;
    await kartingTrack.findByIdAndUpdate(id, { $pull: { reviews: reviewId}});  //The $pull operator removes from an existing array all instances of a value or values that match a specified condition.
    await Review.findByIdAndDelete(reviewId);

    req.flash('success', 'Successfully deleted review!');
    res.redirect(`/kartTracks/${id}`);
} 