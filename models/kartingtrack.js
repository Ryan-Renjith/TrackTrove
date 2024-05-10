const mongoose = require('mongoose');
const review = require('./review');
const Schema = mongoose.Schema;


const ImageSchema = new Schema({
    url: String,
    filename: String
});

ImageSchema.virtual('thumbnail').get(function() {
    return this.url.replace('/upload', '/upload/w_200');    //image transformations via cloudinary by passing details in the query string
});

const opts = { toJSON: { virtuals: false } };    //By default, Mongoose does not include virtuals when you convert a document to JSON so we need to set this to true so that we can access the data returned by the virtual function in mapbox implementation of popup.

const KartingTrackSchema = new Schema({
    name: String,
    location: String,
    geometry: {             //GeoJSON
        type: {
          type: String, 
          enum: ['Point'], 
          required: true
        },
        coordinates: {
          type: [Number],   //[longitude, latitude]
          required: true
        }
    },
    description : String,
    price: Number,
    images:[ImageSchema],
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
}, opts);

KartingTrackSchema.virtual('properties.popUpMarkup').get(function () {    //Mapbox when looking to fill the popups on maps looks for data specifically in the 'properties' section of JSON. Therefore we need to use a virtual to attach that key and associated data to our kartingTrack object and also set the opts we have declared above the kartingTrackSchema in line 15 to include our virtuals when converting to JSON or JSON string
    return `<strong><a href="/kartTracks/${this._id}">${this.name}</a><strong><p>${this.description}</p>`
});

KartingTrackSchema.post('findOneAndDelete', async function(doc) { //mongoose middleware
    if(doc) {                                                     //we have access to doc which is the deleted document which in this case is the deleted track which will contain array of objectIds to the reviews associated with it stored in the reviews collection
        await review.deleteMany({_id: {$in: doc.reviews}});
    }
});

module.exports = mongoose.model('KartingTrack', KartingTrackSchema);