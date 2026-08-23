"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const db_1 = require("./config/db");
const env_1 = require("./config/env");
const startServer = async () => {
    try {
        // Connect to MongoDB Database
        await (0, db_1.connectDB)();
        app_1.default.listen(env_1.env.PORT, () => {
            console.log(`==================================================`);
            console.log(` AuraHealth Backend Server Listening on Port ${env_1.env.PORT}`);
            console.log(` Environment: ${env_1.env.NODE_ENV}`);
            console.log(` Healthcheck: http://localhost:${env_1.env.PORT}/health`);
            console.log(`==================================================`);
        });
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};
startServer();
//# sourceMappingURL=server.js.map