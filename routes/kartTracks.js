const express = require('express');
const router = express.Router();

const catchAsync = require('../utils/catchAsync');

const {isLoggedIn, validateKartTrack, isAuthorized} = require('../middleware.js');
const kartTracks = require('../controllers/kartTracks.js');


router.route('/')
    .get(catchAsync(kartTracks.index))
    .post(isLoggedIn, validateKartTrack, catchAsync(kartTracks.createKartTrack));

router.get('/new', isLoggedIn, kartTracks.renderNewForm); // /new should before /:id otherwise express will thing new is the 'id'

router.route('/:id')
    .get(catchAsync(kartTracks.showKartTrack))
    .put(isLoggedIn, isAuthorized, validateKartTrack, catchAsync(kartTracks.updateKartTrack))
    .delete(isLoggedIn, isAuthorized, catchAsync(kartTracks.deleteKartTrack));

router.get('/:id/edit', isLoggedIn, isAuthorized, catchAsync(kartTracks.renderEditForm));


module.exports = router;