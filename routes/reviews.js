const express = require('express');
const router = express.Router({mergeParams: true}); //To get access to kartTracks id param in the URL. By default express router likes to sepearate the params

const catchAsync = require('../utils/catchAsync');

const {validateReview, isLoggedIn, isReviewAuthor} = require('../middleware.js');
const reviews = require('../controllers/reviews.js');


router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview));


router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview));


module.exports = router;