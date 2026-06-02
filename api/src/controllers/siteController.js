import * as siteService from '../services/siteService.js';

export const home = async (req, res) => {
    const message = await siteService.getHomeMessage();
    res.send(message);
};
