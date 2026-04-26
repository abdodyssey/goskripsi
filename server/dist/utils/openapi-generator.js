"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateOpenAPI = exports.registry = void 0;
const zod_to_openapi_1 = require("@asteasolutions/zod-to-openapi");
const zod_to_openapi_2 = require("@asteasolutions/zod-to-openapi");
const zod_1 = require("zod");
(0, zod_to_openapi_2.extendZodWithOpenApi)(zod_1.z);
exports.registry = new zod_to_openapi_1.OpenAPIRegistry();
// Define JWT Security Scheme
const bearerAuth = exports.registry.registerComponent("securitySchemes", "bearerAuth", {
    type: "http",
    scheme: "bearer",
    bearerFormat: "JWT",
});
const generateOpenAPI = () => {
    const generator = new zod_to_openapi_1.OpenApiGeneratorV3(exports.registry.definitions);
    return generator.generateDocument({
        openapi: "3.0.0",
        info: {
            version: "1.0.0",
            title: "GoSkripsi API Documentation",
            description: "Dokumentasi interaktif untuk Backend Express GoSkripsi.",
        },
        servers: [{ url: "http://localhost:3000" }],
    });
};
exports.generateOpenAPI = generateOpenAPI;
