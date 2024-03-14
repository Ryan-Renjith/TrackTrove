const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const KartingTrackSchema = new Schema({
    name: String,
    location: String,
    description : String,
    price: Number,
    image:String
});

module.exports = mongoose.model('KartingTrack', KartingTrackSchema);