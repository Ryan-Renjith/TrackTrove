//Controller file in MVC approach

const kartingTrack = require('../models/kartingtrack.js');

module.exports.index = async (req,res) => {         //The route for which this functionality
    const kartingTracks = await kartingTrack.find({});
    res.render('kartTracks/index', {kartingTracks});//The file that needs to be rendered when this route is accessed
}

module.exports.renderNewForm = (req,res) => {
    res.render('kartTracks/new');
}

module.exports.createKartTrack = async (req,res) => {
    const newTrack = new kartingTrack(req.body.kartingTrack);
    newTrack.image = `../images/kartTracks/${newTrack.image}.png`;
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
    req.flash('success', `Successfully updated ${track.name}!`);
    res.redirect(`/kartTracks/${track._id}`);
}

module.exports.deleteKartTrack = async (req,res) => {
    const {id} = req.params;
    const track = await kartingTrack.findByIdAndDelete(id);
    req.flash('success', `Successfully deleted ${track.name}!`);
    res.redirect('/kartTracks');
}