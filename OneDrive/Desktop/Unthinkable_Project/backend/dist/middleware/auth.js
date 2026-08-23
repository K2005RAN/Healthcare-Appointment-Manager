"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.authenticate = void 0;
const jwt_1 = require("../utils/jwt");
const apiError_1 = require("../utils/apiError");
const authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        let token;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
        }
        else if (req.cookies && req.cookies.accessToken) {
            token = req.cookies.accessToken;
        }
        if (!token) {
            throw apiError_1.ApiError.unauthorized('Authentication token missing');
        }
        const decoded = (0, jwt_1.verifyAccessToken)(token);
        req.user = decoded;
        next();
    }
    catch (error) {
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            next(apiError_1.ApiError.unauthorized('Invalid or expired authentication token'));
        }
        else {
            next(error);
        }
    }
};
exports.authenticate = authenticate;
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(apiError_1.ApiError.unauthorized('User not authenticated'));
        }
        if (!roles.includes(req.user.role)) {
            return next(apiError_1.ApiError.forbidden(`User role '${req.user.role}' is not authorized to access this resource`));
        }
        next();
    };
};
exports.authorize = authorize;
//# sourceMappingURL=auth.js.map