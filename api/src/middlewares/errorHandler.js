import { AppError } from '../utils/index.js';

const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.isOperational ? err.message : 'Hệ thống đang gặp sự cố, vui lòng thử lại sau!';

    if (process.env.NODE_ENV !== 'production' && !err.isOperational) {
        console.error(err);
    }

    res.status(statusCode).json({
        success: false,
        message,
        ...(err.errors ? { errors: err.errors } : {}),
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};

export { AppError };
export default errorHandler;
