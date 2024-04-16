const mongoose = require('mongoose');
const review = require('./review');
const Schema = mongoose.Schema;

const KartingTrackSchema = new Schema({
    name: String,
    location: String,
    description : String,
    price: Number,
    image:String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
});

KartingTrackSchema.post('findOneAndDelete', async function(doc) { //mongoose middleware
    if(doc) {                                                     //we have access to doc which is the deleted document which in this case is the deleted track which will contain array of objectIds to the reviews associated with it stored in the reviews collection
        await review.deleteMany({_id: {$in: doc.reviews}});
    }
});

module.exports = mongoose.model('KartingTrack', KartingTrackSchema);