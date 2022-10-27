const jwt = require("jsonwebtoken")

module.exports = async function (req, res, proceed) {

    // If `req.me` is set, then we know that this request originated
    // from a logged-in user.  So we can safely proceed to the next policy--
    // or, if this is the last policy, the relevant action.
    // > For more about where `req.me` comes from, check out this app's
    // > custom hook (`api/hooks/custom/index.js`).
    const {Authorization} = req.cookies;
    if (Authorization) {
        const [key,token] = Authorization.split(' ')
        if(key === 'Bearer'){
            try {
                jwt.verify(token,sails.config.custom.jwtRefeshKey);
                return proceed();
              } catch(err) {
                return res.forbidden();
              }
        }
    }
    //--•
    // Otherwise, this request did not come from a logged-in user.
    return res.forbidden();
  
  };