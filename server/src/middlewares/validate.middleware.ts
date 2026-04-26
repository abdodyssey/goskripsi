import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

export const validate =
  (schema: ZodSchema) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validData = (await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      })) as any;
      if (validData.body !== undefined) req.body = validData.body;
      if (validData.query) {
        Object.keys(req.query).forEach(
          (key) => delete req.query[key as string],
        );
        Object.assign(req.query, validData.query);
      }
      if (validData.params) {
        Object.keys(req.params).forEach((key) => delete req.params[key]);
        Object.assign(req.params, validData.params);
      }
      return next();
    } catch (error) {
      return next(error);
    }
  };
