const Joi = require('joi');

module.exports.kartTrackSchema = Joi.object({
    kartingTrack: Joi.object({
        name: Joi.string().required(),
        location: Joi.string().required(),
        description: Joi.string().required(),
        price: Joi.number().min(0),
        image: Joi.string().required()
    }).required()
});