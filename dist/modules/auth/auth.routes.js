"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("./auth.controller");
const router = (0, express_1.Router)();
// Auth
const authController = new auth_controller_1.AuthController();
router.post("/login", authController.login.bind(authController));
exports.default = router;
