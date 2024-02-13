const kartingTrack = require('../models/kartingTrack');
const seedData = require('./seedData');

const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/track-trove');

const db = mongoose.connection;

db.on('error', () => console.log('Error connecting to the database'));
db.once('open', () => console.log('Connected to the database successfully'));

const seedDb = async () => {
    await kartingTrack.deleteMany({});

    for(let element of seedData)
    {
        const track = new kartingTrack({
            name: element.name,
            location: element.location,
            description : element.description,
            price: element.price
        });

        await track.save();
    }
}

seedDb().then(() => {
    db.close();
})

