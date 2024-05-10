//Controller file in MVC approach

const kartingTrack = require('../models/kartingtrack.js');
const {cloudinary} = require('../cloudinary');
const axios = require('axios');

module.exports.index = async (req,res) => {         //The route for which this functionality
    const kartingTracks = await kartingTrack.find({});
    res.render('kartTracks/index', {kartingTracks});//The file that needs to be rendered when this route is accessed
}

module.exports.renderNewForm = (req,res) => {
    res.render('kartTracks/new');
}

module.exports.createKartTrack = async (req,res) => {
    const newTrack = new kartingTrack(req.body.kartingTrack);
    const mapBoxURL = `https://api.mapbox.com/search/geocode/v6/forward?q=${newTrack.location}&limit=1&access_token=${process.env.MAPBOX_TOKEN}`;
    const response = await axios.get(mapBoxURL);
    newTrack.geometry = response.data.features[0].geometry;
    newTrack.images = req.files.map(f => ({url: f.path, filename: f.filename})); //create an array of objects with each object having properties url and filename. req.files coming from multer
    newTrack.author = req.user._id;
    await newTrack.save();
    req.flash('success', 'Successfully created a new karting track!');  //req.flash(key, message)
    res.redirect(`/kartTracks/${newTrack._id}`);
}

module.exports.showKartTrack = async (req,res) => {
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
}

module.exports.renderEditForm = async (req,res) => {
    const track = await kartingTrack.findById(req.params.id);
    if(!track)
    {
        req.flash('error', 'Cannot find that karting track!');
        return res.redirect('/kartTracks');
    }
    res.render('kartTracks/edit', {track});
}

module.exports.updateKartTrack = async (req,res) => {
    const {id} = req.params;
    const track = await kartingTrack.findByIdAndUpdate(id, {...req.body.kartingTrack});
    const mapBoxURL = `https://api.mapbox.com/search/geocode/v6/forward?q=${track.location}&limit=1&access_token=${process.env.MAPBOX_TOKEN}`;
    const response = await axios.get(mapBoxURL);
    track.geometry = response.data.features[0].geometry;
    const imgs = req.files.map(f => ({url: f.path, filename: f.filename}));
    track.images.push(...imgs);
    await track.save();
    if(req.body.deleteImages) {
        for(let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await track.updateOne({$pull: {images: {filename: {$in: req.body.deleteImages}}}}); //pull from the images array where filename in deleteImages array
    }
    req.flash('success', `Successfully updated ${track.name}!`);
    res.redirect(`/kartTracks/${track._id}`);
}

module.exports.deleteKartTrack = async (req,res) => {
    const {id} = req.params;
    const track = await kartingTrack.findByIdAndDelete(id);
    req.flash('success', `Successfully deleted ${track.name}!`);
    res.redirect('/kartTracks');
}