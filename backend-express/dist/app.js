"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const errorHandler_1 = require("./middlewares/errorHandler");
const express_api_reference_1 = require("@scalar/express-api-reference");
const openapi_generator_1 = require("./utils/openapi-generator");
const auth_routes_1 = __importDefault(require("./api/routes/auth.routes"));
const mahasiswa_routes_1 = __importDefault(require("./api/routes/mahasiswa.routes"));
const dosen_routes_1 = __importDefault(require("./api/routes/dosen.routes"));
const ranpel_routes_1 = __importDefault(require("./api/routes/ranpel.routes"));
const pendaftaran_ujian_routes_1 = __importDefault(require("./api/routes/pendaftaran-ujian.routes"));
const ujian_routes_1 = __importDefault(require("./api/routes/ujian.routes"));
const penilaian_routes_1 = __importDefault(require("./api/routes/penilaian.routes"));
const fakultas_routes_1 = __importDefault(require("./api/routes/fakultas.routes"));
const prodi_routes_1 = __importDefault(require("./api/routes/prodi.routes"));
const peminatan_routes_1 = __importDefault(require("./api/routes/peminatan.routes"));
const ruangan_routes_1 = __importDefault(require("./api/routes/ruangan.routes"));
const jenis_ujian_routes_1 = __importDefault(require("./api/routes/jenis-ujian.routes"));
const komponen_penilaian_routes_1 = __importDefault(require("./api/routes/komponen-penilaian.routes"));
const syarat_routes_1 = __importDefault(require("./api/routes/syarat.routes"));
const upload_routes_1 = __importDefault(require("./api/routes/upload.routes"));
const pemenuhan_syarat_routes_1 = __importDefault(require("./api/routes/pemenuhan-syarat.routes"));
const keputusan_routes_1 = __importDefault(require("./api/routes/keputusan.routes"));
// BigInt JSON Serialization patch
BigInt.prototype.toJSON = function () {
    return this.toString();
};
const app = (0, express_1.default)();
const allowedOrigins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
];
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Izinkan semua origin selama development agar tidak terblokir
        // Mirror back the incoming origin to allow credentials
        if (!origin)
            return callback(null, true);
        callback(null, origin);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
        "Content-Type",
        "Authorization",
        "X-Requested-With",
        "Accept",
        "Origin",
    ],
    preflightContinue: false,
    optionsSuccessStatus: 200,
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
app.use("/api/fakultas", fakultas_routes_1.default);
app.use("/api/prodi", prodi_routes_1.default);
app.use("/api/peminatan", peminatan_routes_1.default);
app.use("/api/ruangan", ruangan_routes_1.default);
app.use("/api/jenis-ujian", jenis_ujian_routes_1.default);
app.use("/api/komponen-penilaian", komponen_penilaian_routes_1.default);
app.use("/api/syarat", syarat_routes_1.default);
app.use("/api/pemenuhan-syarat", pemenuhan_syarat_routes_1.default);
// Routing Endpoint
app.use("/api", auth_routes_1.default);
app.use("/api/mahasiswa", mahasiswa_routes_1.default);
app.use("/api/dosen", dosen_routes_1.default);
app.use("/api/ranpel", ranpel_routes_1.default);
app.use("/api/pendaftaran-ujian", pendaftaran_ujian_routes_1.default);
app.use("/api/ujian", ujian_routes_1.default);
app.use("/api/penilaian", penilaian_routes_1.default);
app.use("/api/upload", upload_routes_1.default);
app.use("/api/keputusan", keputusan_routes_1.default);
// Routing Endpoint
app.get("/api/health", (req, res) => {
    res.status(200).json({
        status: "success",
        message: "API is running",
        timestamp: new Date(),
    });
});
// Documentation Routes
app.get("/api-docs.json", (req, res) => {
    res.json((0, openapi_generator_1.generateOpenAPI)());
});
app.use("/docs", (0, express_api_reference_1.apiReference)({
    theme: "purple",
    spec: {
        url: "/api-docs.json",
    },
}));
// Mount other routes here (e.g., app.use('/api', apiRoutes))
// Error Handling Middleware must be at the end
app.use(errorHandler_1.errorHandler);
exports.default = app;
