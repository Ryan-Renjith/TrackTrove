module.exports.isLoggedIn = (req,res,next) => {
    if(!req.isAuthenticated())    //function from Passport.js to make sure a user is logged in
    {
        req.session.returnTo = req.originalUrl; //store the url that needed to be accessed before being asked to login in so that after loggin in, user can be redirected to that very url
        req.flash('error', 'Must be signed in first!');
        return res.redirect('/login');
    }

    next();
}

module.exports.storeReturnTo = (req,res,next) => {
    if(req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }

    next();
}