const fs = require("fs");
const path = require("path");

const models = {
  Fakultas: { fields: { nama_fakultas: "string" } },
  Prodi: { fields: { nama_prodi: "string", fakultas_id: "number" } },
  Peminatan: { fields: { nama_peminatan: "string", prodi_id: "number" } },
  Pejabat: {
    fields: {
      nama: "string",
      jabatan: "string",
      prodi_id: "number",
      nip: "string",
    },
  },
  Faq: {
    fields: { pertanyaan: "string", jawaban: "string", kategori: "string" },
  },
  Ruangan: {
    fields: { nama_ruangan: "string", deskripsi: "string", prodi_id: "number" },
  },
  JenisUjian: { fields: { nama_jenis: "string", deskripsi: "string" } },
  KomponenPenilaian: {
    fields: {
      jenis_ujian_id: "number",
      nama_komponen: "string",
      bobot: "number",
    },
  },
  Syarat: {
    fields: {
      jenis_ujian_id: "number",
      nama_syarat: "string",
      kategori: "string",
      deskripsi: "string",
      wajib: "boolean",
    },
  },
  Template: {
    fields: {
      jenis_ujian_id: "number",
      nama_template: "string",
      deskripsi: "string",
      file_path: "string",
    },
  },
  DaftarKehadiran: {
    fields: {
      pendaftaran_ujian_id: "number",
      mahasiswa_id: "number",
      ujian_id: "number",
      dosen_id: "number",
      status_kehadiran: "string",
      catatan: "string",
    },
  },
  PemenuhanSyarat: {
    fields: {
      pendaftaran_ujian_id: "number",
      syarat_id: "number",
      status: "string",
      file_path: "string",
      keterangan: "string",
    },
  },
  JadwalPenguji: {
    fields: {
      dosen_id: "number",
      hari_tersedia: "string",
      waktu_mulai: "string",
      waktu_selesai: "string",
    },
  },
  Comment: {
    fields: {
      user_id: "number",
      pengajuan_ranpel_id: "number",
      body: "string",
    },
  },
};

const toKebab = (str) =>
  str.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
const toCamel = (str) => str.charAt(0).toLowerCase() + str.slice(1);
const toSnake = (str) =>
  str.replace(/([a-z0-9])([A-Z])/g, "$1_$2").toLowerCase();

const generateZodSchema = (modelName, fields) => {
  let schemaContent = `import { z } from 'zod';\n\nexport const create${modelName}Schema = z.object({\n  body: z.object({\n`;
  let updateSchemaContent = `export const update${modelName}Schema = z.object({\n  body: z.object({\n`;

  for (const [field, type] of Object.entries(fields)) {
    if (type === "string") {
      schemaContent += `    ${field}: z.string(),\n`;
      updateSchemaContent += `    ${field}: z.string().optional().nullable(),\n`;
    } else if (type === "number") {
      schemaContent += `    ${field}: z.coerce.number(),\n`;
      updateSchemaContent += `    ${field}: z.coerce.number().optional().nullable(),\n`;
    } else if (type === "boolean") {
      schemaContent += `    ${field}: z.coerce.boolean(),\n`;
      updateSchemaContent += `    ${field}: z.coerce.boolean().optional().nullable(),\n`;
    }
  }

  schemaContent += `  })\n});\n\n`;
  updateSchemaContent += `  }),\n  params: z.object({\n    id: z.string()\n  })\n});\n\n`;

  return `${schemaContent}${updateSchemaContent}export type Create${modelName}Input = z.infer<typeof create${modelName}Schema>['body'];\nexport type Update${modelName}Input = z.infer<typeof update${modelName}Schema>['body'];\n`;
};

const generateService = (modelName, fields) => {
  const camelName = toCamel(modelName);
  const snakeModel = modelName === "Comment" ? "comments" : toSnake(modelName);

  let storeMapping = "";
  let updateMapping = "";
  for (const [field, type] of Object.entries(fields)) {
    if (type === "number") {
      storeMapping += `        ${field}: BigInt(payload.${field}),\n`;
      updateMapping += `    if (payload.${field} !== undefined) dataUpdate.${field} = payload.${field} ? BigInt(payload.${field}) : null;\n`;
    } else {
      storeMapping += `        ${field}: payload.${field},\n`;
      updateMapping += `    if (payload.${field} !== undefined) dataUpdate.${field} = payload.${field};\n`;
    }
  }

  // Handle defaults that missing based on schema (updated_at)
  storeMapping += `        created_at: new Date(),\n        updated_at: new Date(),\n`;

  return `import { prisma } from '../utils/prisma';
import { Create${modelName}Input, Update${modelName}Input } from '../schemas/${toKebab(modelName)}.schema';

export class ${modelName}Service {
  async getAll() {
    return await prisma.${snakeModel}.findMany();
  }

  async getById(id: string) {
    return await prisma.${snakeModel}.findUnique({ where: { id: BigInt(id) } });
  }

  async store(payload: Create${modelName}Input) {
    return await prisma.${snakeModel}.create({
      data: {
${storeMapping}
      }
    });
  }

  async update(id: string, payload: Update${modelName}Input) {
    const dataUpdate: any = { updated_at: new Date() };
${updateMapping}

    return await prisma.${snakeModel}.update({
      where: { id: BigInt(id) },
      data: dataUpdate
    });
  }

  async delete(id: string) {
    return await prisma.${snakeModel}.delete({ where: { id: BigInt(id) } });
  }
}

export const ${camelName}Service = new ${modelName}Service();
`;
};

const generateController = (modelName) => {
  const camelName = toCamel(modelName);
  const kebabName = toKebab(modelName);

  return `import { Request, Response, NextFunction } from 'express';
import { ${camelName}Service } from '../../services/${kebabName}.service';

export class ${modelName}Controller {
  async index(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await ${camelName}Service.getAll();
      res.status(200).json({ data, success: true });
    } catch (error) { next(error); }
  }

  async show(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const data = await ${camelName}Service.getById(id);
      if (!data) return res.status(404).json({ message: '${modelName} tida ditemukan' });
      res.status(200).json({ data, success: true });
    } catch (error) { next(error); }
  }

  async store(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await ${camelName}Service.store(req.body);
      res.status(201).json({ data, success: true });
    } catch (error) { next(error); }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const data = await ${camelName}Service.update(id, req.body);
      res.status(200).json({ data, success: true });
    } catch (error) { next(error); }
  }

  async destroy(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      await ${camelName}Service.delete(id);
      res.status(200).json({ message: '${modelName} berhasil dihapus.' });
    } catch (error) { next(error); }
  }
}

export const ${camelName}Controller = new ${modelName}Controller();
`;
};

const generateRoutes = (modelName) => {
  const camelName = toCamel(modelName);
  const kebabName = toKebab(modelName);

  return `import { Router } from 'express';
import { ${camelName}Controller } from '../controllers/${kebabName}.controller';
import { requireAuth } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { create${modelName}Schema, update${modelName}Schema } from '../../schemas/${kebabName}.schema';

const router = Router();

router.get('/', requireAuth, ${camelName}Controller.index);
router.post('/', requireAuth, validate(create${modelName}Schema), ${camelName}Controller.store);
router.get('/:id', requireAuth, ${camelName}Controller.show);
router.put('/:id', requireAuth, validate(update${modelName}Schema), ${camelName}Controller.update);
router.delete('/:id', requireAuth, ${camelName}Controller.destroy);

export default router;
`;
};

const srcDir = path.join(__dirname, "..", "src");

Object.entries(models).forEach(([modelName, { fields }]) => {
  const kebabName = toKebab(modelName);

  // Write Schema
  fs.writeFileSync(
    path.join(srcDir, "schemas", `${kebabName}.schema.ts`),
    generateZodSchema(modelName, fields),
  );

  // Write Service
  fs.writeFileSync(
    path.join(srcDir, "services", `${kebabName}.service.ts`),
    generateService(modelName, fields),
  );

  // Write Controller
  fs.writeFileSync(
    path.join(srcDir, "api", "controllers", `${kebabName}.controller.ts`),
    generateController(modelName),
  );

  // Write Routes
  fs.writeFileSync(
    path.join(srcDir, "api", "routes", `${kebabName}.routes.ts`),
    generateRoutes(modelName),
  );

  console.log(`Generated ${modelName} CRUD`);
});

// Update app.ts
let appTsPath = path.join(srcDir, "app.ts");
let appTsContent = fs.readFileSync(appTsPath, "utf8");

let imports = Object.keys(models)
  .map((modelName) => {
    const kebabName = toKebab(modelName);
    const camelRoutes = toCamel(modelName) + "Routes";
    return `import ${camelRoutes} from "./api/routes/${kebabName}.routes";`;
  })
  .join("\n");

let routeUses = Object.keys(models)
  .map((modelName) => {
    const kebabName = toKebab(modelName);
    const snakeUrl = modelName === "Comment" ? "comments" : toSnake(modelName);
    const camelRoutes = toCamel(modelName) + "Routes";
    return `app.use("/api/${kebabName}", ${camelRoutes});`;
  })
  .join("\n");

appTsContent = appTsContent.replace(
  "// BigInt JSON Serialization patch",
  `${imports}\n\n// BigInt JSON Serialization patch`,
);
appTsContent = appTsContent.replace(
  "// Routing Endpoint",
  `${routeUses}\n\n// Routing Endpoint`,
);

fs.writeFileSync(appTsPath, appTsContent);
console.log("Updated app.ts");
