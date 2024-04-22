const User = require('../models/user');

module.exports.renderRegister = (req,res) => {
    res.render('users/register');
}

module.exports.register = async (req,res) => {
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
    
}

module.exports.renderLogin = (req,res) => {
    res.render('users/login');
}

module.exports.login = (req,res) => {
    req.flash('success', 'Welcome back!');
    const redirectUrl = res.locals.returnTo || '/kartTracks';
    res.redirect(redirectUrl);
}

module.exports.logout = (req,res,next) => {
    req.logout(function (err) { //logout functionality coming from Passport
        if(err) {
            return next(err);
        }
        req.flash('success', 'Goodbye!');
        res.redirect('/kartTracks');
    });
}