"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = require("./env");
const connectDB = async () => {
    try {
        const conn = await mongoose_1.default.connect(env_1.env.MONGODB_URI, {
            autoIndex: true, // Ensure indexes are compiled in dev
        });
        console.log(`[MongoDB Connected]: ${conn.connection.host}/${conn.connection.name}`);
        return conn;
    }
    catch (error) {
        console.error(`[MongoDB Connection Error]:`, error);
        throw error;
    }
};
exports.connectDB = connectDB;
//# sourceMappingURL=db.js.map