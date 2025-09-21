"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const hello_controller_1 = require("./hello.controller");
const router = (0, express_1.Router)();
const controller = new hello_controller_1.HelloController();
router.get("/hello", controller.sayHello.bind(controller));
exports.default = router;
