import express, { Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { errorHandler, logger } from "./middlewares/errorHandler";
import { apiReference } from "@scalar/express-api-reference";
import { generateOpenAPI } from "./utils/openapi-generator";
import authRoutes from "./api/routes/auth.routes";
import mahasiswaRoutes from "./api/routes/mahasiswa.routes";
import dosenRoutes from "./api/routes/dosen.routes";
import ranpelRoutes from "./api/routes/ranpel.routes";

import pendaftaranUjianRoutes from "./api/routes/pendaftaran-ujian.routes";
import ujianRoutes from "./api/routes/ujian.routes";
import penilaianRoutes from "./api/routes/penilaian.routes";

import fakultasRoutes from "./api/routes/fakultas.routes";
import prodiRoutes from "./api/routes/prodi.routes";
import peminatanRoutes from "./api/routes/peminatan.routes";

import ruanganRoutes from "./api/routes/ruangan.routes";
import jenisUjianRoutes from "./api/routes/jenis-ujian.routes";
import komponenPenilaianRoutes from "./api/routes/komponen-penilaian.routes";
import syaratRoutes from "./api/routes/syarat.routes";

import uploadRoutes from "./api/routes/upload.routes";
import pemenuhanSyaratRoutes from "./api/routes/pemenuhan-syarat.routes";
import keputusanRoutes from "./api/routes/keputusan.routes";

// BigInt JSON Serialization patch
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

const app = express();

const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3001",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Izinkan semua origin selama development agar tidak terblokir
      // Mirror back the incoming origin to allow credentials
      if (!origin) return callback(null, true);
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
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/fakultas", fakultasRoutes);
app.use("/api/prodi", prodiRoutes);
app.use("/api/peminatan", peminatanRoutes);

app.use("/api/ruangan", ruanganRoutes);
app.use("/api/jenis-ujian", jenisUjianRoutes);
app.use("/api/komponen-penilaian", komponenPenilaianRoutes);
app.use("/api/syarat", syaratRoutes);
app.use("/api/pemenuhan-syarat", pemenuhanSyaratRoutes);

// Routing Endpoint
app.use("/api", authRoutes);
app.use("/api/mahasiswa", mahasiswaRoutes);
app.use("/api/dosen", dosenRoutes);
app.use("/api/ranpel", ranpelRoutes);

app.use("/api/pendaftaran-ujian", pendaftaranUjianRoutes);
app.use("/api/ujian", ujianRoutes);
app.use("/api/penilaian", penilaianRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/keputusan", keputusanRoutes);

// Routing Endpoint
app.get("/api/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "success",
    message: "API is running",
    timestamp: new Date(),
  });
});

// Documentation Routes
app.get("/api-docs.json", (req: Request, res: Response) => {
  res.json(generateOpenAPI());
});

app.use(
  "/docs",
  apiReference({
    theme: "purple",
    spec: {
      url: "/api-docs.json",
    },
  }),
);

// Mount other routes here (e.g., app.use('/api', apiRoutes))

// Error Handling Middleware must be at the end
app.use(errorHandler);

export default app;
