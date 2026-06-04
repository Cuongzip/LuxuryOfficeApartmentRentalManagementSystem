import { siteService } from '../services/index.js';

export const home = async (req, res) => {
    const message = await siteService.getHomeMessage();
    res.send(message);
};
