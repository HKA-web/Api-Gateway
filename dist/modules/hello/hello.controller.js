"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HelloController = void 0;
const hello_service_1 = require("./hello.service");
class HelloController {
    constructor() {
        this.service = new hello_service_1.HelloService();
    }
    sayHello(req, res) {
        const name = req.query.name || "World";
        res.json(this.service.greet(name));
    }
}
exports.HelloController = HelloController;
