const express = require('express');
const path = require('path');
const app = express();

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

app.get('/', (req,res) => {
    res.render('home');
});

app.get('/kartTracks', async (req,res) => {         //The route for which this functionality
    const kartingTracks = await kartingTrack.find({});
    res.render('kartTracks/index', {kartingTracks});//The file that needs to be rendered when this route is accessed
});

app.get('/kartTracks/new', (req,res) => {
    res.render('kartTracks/new');
});

app.post('/kartTracks', async (req,res) => {
    const newTrack = new kartingTrack(req.body.kartingTrack);
    await newTrack.save();
    res.redirect(`/kartTracks/${newTrack._id}`);
})

app.get('/kartTracks/:id', async (req,res) => {
    const track = await kartingTrack.findById(req.params.id);
    res.render('kartTracks/details', {track});
});

app.get('/kartTracks/:id/edit', async (req,res) => {
    const track = await kartingTrack.findById(req.params.id);
    res.render('kartTracks/edit', {track});
})

app.put('/kartTracks/:id', async (req,res) => {
    const {id} = req.params;
    const track = await kartingTrack.findByIdAndUpdate(id, {...req.body.kartingTrack});
    res.redirect(`/kartTracks/${track._id}`);
})

app.delete('/kartTracks/:id', async (req,res) => {
    const {id} = req.params;
    await kartingTrack.findByIdAndDelete(id);
    res.redirect('/kartTracks');
})

app.listen(3000, () => {
    console.log("Server listening on PORT 3000");
});