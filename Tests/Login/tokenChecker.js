const jwt = require('jsonwebtoken');

const tokenChecker = function(req, res, next) {
    // header or url parameters or post parameters
    const key = "05020516024124375";
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    if (!token) res.status(401).json({success:false,message:'No token provided.'})
    // decode token, verifies secret and checks expiration
    jwt.verify(token, key, function(err, decoded) {
    if (err) res.status(403).json({success:false,message:'Token not valid'})
        else {
            // if everything is good, save in req object for use in other routes
            req.loggedUser = decoded;
            next();
        }
    });
};