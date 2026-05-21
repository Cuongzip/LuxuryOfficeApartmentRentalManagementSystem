
class Site {
    async home(req, res, next) {
        try {
            res.send('Hello World!')
        } catch (error) {
            next(error);
        }
    }
}

export default new Site();
