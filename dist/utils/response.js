"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.success = success;
exports.error = error;
function success(data) {
    return { status: "success", data };
}
function error(message) {
    return { status: "error", message };
}
