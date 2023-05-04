// const encodedHeader = base64urlEncode(header);

// const encodedPayload = base64urlEncode(payload);

// const data = encodedHeader + "." + encodedPayload;
// const hashedData = Hash(data, secret);
// const signature = base64urlEncode(hashedData);

// header.payload.signature
// const JWT = encodedHeader + "." + encodedPayload + "." + signature;

exports.verifyToken = (req, res, next) => {
    // search token in headers most commonly used for authorization
    const header = req.headers['x-access-token'] || req.headers.authorization;
    
    if (typeof header == 'undefined')
        return res.status(401).json({ success: false, msg: "No token provided!" });
    
    const bearer = header.split(' '); // Authorization: Bearer <token>
    const token = bearer[1];
    
    try {
        let decoded = jwt.verify(token, config.SECRET);
        req.loggedUserId = decoded.id; // save user ID and role into request object
        req.loggedUserRole = decoded.role;
        next();
    } catch (err) {
        return res.status(401).json({ success: false, msg: "Unauthorized!" });
    }
};