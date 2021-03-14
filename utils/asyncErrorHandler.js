// returns a new function with the catch block forwarding the error through next
module.exports = func => (req, res, next) => func(req, res, next).catch(next);