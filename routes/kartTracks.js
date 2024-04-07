const express = require('express');
const router = express.Router();

const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/expressError');

//const Joi = require('joi'); Not needed here because when exporting the kartTrackSchema all functions come with it attached to the object and we have required Joi in the schemas file.
const {kartTrackSchema} = require('../schemas.js'); //Destructuring because we might have multiple schemas in the future.

const kartingTrack = require('../models/kartingtrack.js');

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



router.get('/', catchAsync(async (req,res) => {         //The route for which this functionality
    const kartingTracks = await kartingTrack.find({});
    res.render('kartTracks/index', {kartingTracks});//The file that needs to be rendered when this route is accessed
}));

router.get('/new', (req,res) => {
    res.render('kartTracks/new');
});

router.post('/', validateSchema, catchAsync(async (req,res) => {
    const newTrack = new kartingTrack(req.body.kartingTrack);
    newTrack.image = `../images/kartTracks/${newTrack.image}.png`;
    await newTrack.save();
    req.flash('success', 'Successfully created a new karting track!');  //req.flash(key, message)
    res.redirect(`/kartTracks/${newTrack._id}`);
}));

router.get('/:id', catchAsync(async (req,res) => {
    const track = await kartingTrack.findById(req.params.id).populate('reviews'); //populate the reviews field in each kartingtrack in place of the review object ids from the reviews collection in the database
    if(!track)
    {
        req.flash('error', 'Cannot find that karting track!');
        return res.redirect('/kartTracks');
    }
    res.render('kartTracks/details', {track});
}));

router.get('/:id/edit', catchAsync(async (req,res) => {
    const track = await kartingTrack.findById(req.params.id);
    if(!track)
    {
        req.flash('error', 'Cannot find that karting track!');
        return res.redirect('/kartTracks');
    }
    res.render('kartTracks/edit', {track});
}));

router.put('/:id', validateSchema, catchAsync(async (req,res) => {
    const {id} = req.params;
    const track = await kartingTrack.findByIdAndUpdate(id, {...req.body.kartingTrack});
    req.flash('success', `Successfully updated ${track.name}!`);
    res.redirect(`/kartTracks/${track._id}`);
}));

router.delete('/:id', catchAsync(async (req,res) => {
    const {id} = req.params;
    const track = await kartingTrack.findByIdAndDelete(id);
    req.flash('success', `Successfully deleted ${track.name}!`);
    res.redirect('/kartTracks');
}));


module.exports = router;