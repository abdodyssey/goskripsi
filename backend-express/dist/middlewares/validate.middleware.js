"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const validate = (schema) => async (req, res, next) => {
    try {
        const validData = (await schema.parseAsync({
            body: req.body,
            query: req.query,
            params: req.params,
        }));
        if (validData.body !== undefined)
            req.body = validData.body;
        if (validData.query) {
            Object.keys(req.query).forEach((key) => delete req.query[key]);
            Object.assign(req.query, validData.query);
        }
        if (validData.params) {
            Object.keys(req.params).forEach((key) => delete req.params[key]);
            Object.assign(req.params, validData.params);
        }
        return next();
    }
    catch (error) {
        return next(error);
    }
};
exports.validate = validate;
