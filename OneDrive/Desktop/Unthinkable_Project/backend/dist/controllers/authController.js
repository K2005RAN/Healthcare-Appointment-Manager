"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const authService_1 = require("../services/authService");
class AuthController {
    static async register(req, res, next) {
        try {
            const result = await authService_1.AuthService.register(req.body);
            // Set HTTP-only refresh cookie
            res.cookie('refreshToken', result.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });
            return res.status(201).json({
                success: true,
                message: 'Account registered successfully',
                data: {
                    user: result.user,
                    accessToken: result.accessToken,
                },
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async login(req, res, next) {
        try {
            const result = await authService_1.AuthService.login(req.body);
            res.cookie('refreshToken', result.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });
            return res.status(200).json({
                success: true,
                message: 'Logged in successfully',
                data: {
                    user: result.user,
                    accessToken: result.accessToken,
                },
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async refreshToken(req, res, next) {
        try {
            const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
            if (!refreshToken) {
                return res.status(401).json({
                    success: false,
                    error: { code: 'NO_REFRESH_TOKEN', message: 'Refresh token not provided' },
                });
            }
            const result = await authService_1.AuthService.refreshToken(refreshToken);
            return res.status(200).json({
                success: true,
                message: 'Token refreshed successfully',
                data: {
                    user: result.user,
                    accessToken: result.accessToken,
                },
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async logout(req, res) {
        res.clearCookie('refreshToken');
        return res.status(200).json({
            success: true,
            message: 'Logged out successfully',
        });
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=authController.js.map