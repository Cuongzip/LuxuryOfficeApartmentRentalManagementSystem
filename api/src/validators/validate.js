import { AppError } from '../utils/index.js';

const toFieldErrors = (issues) => {
    const errors = {};

    for (const issue of issues) {
        const key = issue.path?.[0] ? String(issue.path[0]) : 'body';
        if (errors[key]) continue;
        errors[key] = issue.message;
    }

    return errors;
};

export const validateBody = (schema) => (req, res, next) => {
    const parsed = schema.safeParse(req.body);
    if (parsed.success) {
        req.body = parsed.data;
        next();
        return;
    }

    const errors = toFieldErrors(parsed.error.issues);
    next(new AppError('Thông tin không hợp lệ', 400, errors));
};
