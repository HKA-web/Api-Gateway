"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("./user.controller");
const router = (0, express_1.Router)();
const controller = new user_controller_1.UserController();
router.get("/users", controller.getUsers.bind(controller));
router.get("/user/:id", controller.getUser.bind(controller));
exports.default = router;
