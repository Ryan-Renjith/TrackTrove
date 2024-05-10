const kartingTrack = require('../models/kartingtrack');
const seedData = require('./seedData');
const axios = require('axios');
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/track-trove');

const db = mongoose.connection;

db.on('error', () => console.log('Error connecting to the database'));
db.once('open', () => console.log('Connected to the database successfully'));

// const seedDb = async () => {
//     await kartingTrack.deleteMany({});

//     for(let element of seedData)
//     {
//         const track = new kartingTrack({
//             name: element.name,
//             location: element.location,
//             description : element.description,
//             price: element.price,
//             images: [
//                 {
//                     url: 'https://res.cloudinary.com/delrzmfou/image/upload/v1714051384/TrackTrove/BrahmaputraKartSpeedway_dsfurp.png',
//                     filename: 'TrackTrove/BrahmaputraKartSpeedway_dsfurp'
//                 },
//                 {
//                     url: 'https://res.cloudinary.com/delrzmfou/image/upload/v1714052462/TrackTrove/FastLaneCircuit_djsoqq.png',
//                     filename: 'TrackTrove/FastLaneCircuit_djsoqq'
//                 }
//             ]
//         });

//         await track.save();
//     }
// }

const seedDb = async () => {
    const kartTracks = await kartingTrack.find({});
    const token = 'pk.eyJ1IjoibG9yZHJ5YW4xOSIsImEiOiJjbHZuZzdzcHgwY2w2MmlrN2VodDNhbHJ6In0.smw3HIAa6LlPsP_0-ZYyFA';

    for(let track of kartTracks) {
        const mapBoxURL = `https://api.mapbox.com/search/geocode/v6/forward?q=${track.location}&limit=1&access_token=${token}`;
        const response = await axios.get(mapBoxURL);
        track.geometry = response.data.features[0].geometry;
        await track.save();
    }
    
}

seedDb().then(() => {
    db.close();
})

