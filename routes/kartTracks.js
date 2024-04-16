const express = require('express');
const router = express.Router();

const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/expressError');

const {isLoggedIn, validateKartTrack, isAuthorized} = require('../middleware.js');
const kartingTrack = require('../models/kartingtrack.js');


router.get('/', catchAsync(async (req,res) => {         //The route for which this functionality
    const kartingTracks = await kartingTrack.find({});
    res.render('kartTracks/index', {kartingTracks});//The file that needs to be rendered when this route is accessed
}));

router.get('/new', isLoggedIn, (req,res) => {
    res.render('kartTracks/new');
});

router.post('/', isLoggedIn, validateKartTrack, catchAsync(async (req,res) => {
    const newTrack = new kartingTrack(req.body.kartingTrack);
    newTrack.image = `../images/kartTracks/${newTrack.image}.png`;
    newTrack.author = req.user._id;
    await newTrack.save();
    req.flash('success', 'Successfully created a new karting track!');  //req.flash(key, message)
    res.redirect(`/kartTracks/${newTrack._id}`);
}));

router.get('/:id', catchAsync(async (req,res) => {
    const track = await kartingTrack.findById(req.params.id).populate({
        path: 'reviews',    //populate the reviews field for each track
        populate: {
            path: 'author'  //populate author field of each review in a particular track
        }
    }).populate('author');  //populate author field of the karting track
    if(!track)
    {
        req.flash('error', 'Cannot find that karting track!');
        return res.redirect('/kartTracks');
    }
    res.render('kartTracks/details', {track});
}));

router.get('/:id/edit', isLoggedIn, isAuthorized, catchAsync(async (req,res) => {
    const track = await kartingTrack.findById(req.params.id);
    if(!track)
    {
        req.flash('error', 'Cannot find that karting track!');
        return res.redirect('/kartTracks');
    }
    res.render('kartTracks/edit', {track});
}));

router.put('/:id', isLoggedIn, isAuthorized, validateKartTrack, catchAsync(async (req,res) => {
    const {id} = req.params;
    const track = await kartingTrack.findByIdAndUpdate(id, {...req.body.kartingTrack});
    req.flash('success', `Successfully updated ${track.name}!`);
    res.redirect(`/kartTracks/${track._id}`);
}));

router.delete('/:id', isLoggedIn, isAuthorized, catchAsync(async (req,res) => {
    const {id} = req.params;
    const track = await kartingTrack.findByIdAndDelete(id);
    req.flash('success', `Successfully deleted ${track.name}!`);
    res.redirect('/kartTracks');
}));


module.exports = router;