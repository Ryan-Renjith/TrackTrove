const express = require('express');
const path = require('path');
const app = express();

const kartingTrack = require('./models/kartingTrack');

const mongoose = require('mongoose')

mongoose.connect('mongodb://localhost:27017/track-trove');


const db = mongoose.connection;
db.on("error", () => console.error("Error connecting to the database"));
db.once("open", () => console.log("Connected to the database successfully"));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/', (req,res) => {
    res.render('home');
})

app.get('/listkartingtrack', async (req,res) => {
    const track = new kartingTrack({name: 'Backyard', location: 'Home', price: 499});
    await track.save();
    res.send(track);
})

app.listen(3000, () => {
    console.log("Server listening on PORT 3000");
})