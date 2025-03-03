import jwt from 'jsonwebtoken'; 

const AdminVerifyJWT = (req, res, next) => {
    try {
    const {token} = req.headers;
    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }
    
        
        const token_decode = jwt.verify(token, process.env.JWT_SECRET);
        if(token_decode !== process.env.ADMIN_EMAIL + process.env.ADMIN_PASSWORD){
            return res.status(401).json({ msg: 'Not an admin, authorization denied' });
        }
        next();
    } catch (err) {
        console.log(err);
        res.status(401).json({ msg: 'Token is not valid',message:err.message });    
    }
    }

export default AdminVerifyJWT;