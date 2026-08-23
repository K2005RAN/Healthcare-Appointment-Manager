"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiError = void 0;
class ApiError extends Error {
    statusCode;
    errorCode;
    details;
    constructor(statusCode, errorCode, message, details) {
        super(message);
        this.statusCode = statusCode;
        this.errorCode = errorCode;
        this.details = details;
        Object.setPrototypeOf(this, new.target.prototype);
        Error.captureStackTrace(this, this.constructor);
    }
    static badRequest(message, errorCode = 'BAD_REQUEST', details) {
        return new ApiError(400, errorCode, message, details);
    }
    static unauthorized(message = 'Unauthorized access', errorCode = 'UNAUTHORIZED') {
        return new ApiError(401, errorCode, message);
    }
    static forbidden(message = 'Access forbidden', errorCode = 'FORBIDDEN') {
        return new ApiError(403, errorCode, message);
    }
    static notFound(message = 'Resource not found', errorCode = 'NOT_FOUND') {
        return new ApiError(404, errorCode, message);
    }
    static conflict(message, errorCode = 'CONFLICT', details) {
        return new ApiError(409, errorCode, message, details);
    }
    static slotAlreadyBooked(message = 'This appointment slot is no longer available.') {
        return new ApiError(409, 'SLOT_ALREADY_BOOKED', message);
    }
    static internal(message = 'Internal server error', errorCode = 'INTERNAL_ERROR') {
        return new ApiError(500, errorCode, message);
    }
}
exports.ApiError = ApiError;
//# sourceMappingURL=apiError.js.map