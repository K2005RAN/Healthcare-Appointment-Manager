"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const googleCalendarController_1 = require("../controllers/googleCalendarController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/callback', googleCalendarController_1.GoogleCalendarController.handleCallback);
router.use(auth_1.authenticate);
router.post('/connect', googleCalendarController_1.GoogleCalendarController.getConnectUrl);
router.delete('/disconnect', googleCalendarController_1.GoogleCalendarController.disconnect);
router.get('/status', googleCalendarController_1.GoogleCalendarController.getStatus);
exports.default = router;
//# sourceMappingURL=googleCalendarRoutes.js.map