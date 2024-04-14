const express = require('express');
const router = express.Router();
const User = require('../models/user');
const passport = require('passport');
const {storeReturnTo} = require('../middleware');

router.get('/register', (req,res) => {
    res.render('users/register');
});

router.post('/register', async (req,res) => {
    try {
        const {email, username, password} = req.body;
        const user = new User({email, username});
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {  //login the user after registering instead of user having to login again
            if(err) {
                return next(err);
            }
            req.flash('success', 'Welcome to TrackTrove!');
            res.redirect('/kartTracks');
        });
    } catch(e) {
        req.flash('error', e.message);   //error message coming from password
        res.redirect('/register');
    }
    
});

router.get('/login', (req,res) => {
    res.render('users/login');
});

router.post('/login', storeReturnTo, passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'}),(req,res) => {
    req.flash('success', 'Welcome back!');
    const redirectUrl = res.locals.returnTo || '/kartTracks';
    res.redirect(redirectUrl);
});

router.get('/logout', (req,res,next) => {
    req.logout(function (err) { //logout functionality coming from Passport
        if(err) {
            return next(err);
        }
        req.flash('success', 'Goodbye!');
        res.redirect('/kartTracks');
    });
});

module.exports = router;