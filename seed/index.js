const kartingTrack = require('../models/kartingtrack');
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
            price: element.price,
            images: [
                {
                    url: 'https://res.cloudinary.com/delrzmfou/image/upload/v1714051384/TrackTrove/BrahmaputraKartSpeedway_dsfurp.png',
                    filename: 'TrackTrove/BrahmaputraKartSpeedway_dsfurp'
                },
                {
                    url: 'https://res.cloudinary.com/delrzmfou/image/upload/v1714052462/TrackTrove/FastLaneCircuit_djsoqq.png',
                    filename: 'TrackTrove/FastLaneCircuit_djsoqq'
                }
            ]
        });

        await track.save();
    }
}

seedDb().then(() => {
    db.close();
})

