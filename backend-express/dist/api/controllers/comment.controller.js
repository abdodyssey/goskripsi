"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commentController = exports.CommentController = void 0;
const comment_service_1 = require("../../services/comment.service");
class CommentController {
    async index(req, res, next) {
        try {
            const data = await comment_service_1.commentService.getAll();
            res.status(200).json({ data, success: true });
        }
        catch (error) {
            next(error);
        }
    }
    async show(req, res, next) {
        try {
            const id = req.params.id;
            const data = await comment_service_1.commentService.getById(id);
            if (!data)
                return res.status(404).json({ message: 'Comment tida ditemukan' });
            res.status(200).json({ data, success: true });
        }
        catch (error) {
            next(error);
        }
    }
    async store(req, res, next) {
        try {
            const data = await comment_service_1.commentService.store(req.body);
            res.status(201).json({ data, success: true });
        }
        catch (error) {
            next(error);
        }
    }
    async update(req, res, next) {
        try {
            const id = req.params.id;
            const data = await comment_service_1.commentService.update(id, req.body);
            res.status(200).json({ data, success: true });
        }
        catch (error) {
            next(error);
        }
    }
    async destroy(req, res, next) {
        try {
            const id = req.params.id;
            await comment_service_1.commentService.delete(id);
            res.status(200).json({ message: 'Comment berhasil dihapus.' });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.CommentController = CommentController;
exports.commentController = new CommentController();
