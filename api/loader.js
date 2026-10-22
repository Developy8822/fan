import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
    const userAgent = (req.headers['user-agent'] || '').toLowerCase();
    const forwarded = req.headers['x-forwarded-for'];
    const ip = forwarded ? forwarded.split(',')[0].trim() : (req.headers['x-real-ip'] || 'unknown');

    const isRoblox = userAgent.includes('roblox');
    
    const badUserAgents = ["15000mb", "0.673.0.6730711"];
    const badIPs = ["38.154.153.104", "23.236.233.33", "109.71.252.111"];
    const isBlockedBot = badUserAgents.some(badUa => userAgent.includes(badUa)) || badIPs.includes(ip);

    const fakeFilePath = path.join(process.cwd(), 'api', 'fake228.lua');
    const realFilePath = path.join(process.cwd(), 'api', 'loaderpro2312.lua');

    if (isRoblox && !isBlockedBot) {
        try {
            const realLoader = fs.readFileSync(realFilePath, 'utf8');
            res.setHeader('Content-Type', 'text/plain; charset=utf-8');
            res.status(200).send(realLoader);
        } catch (err) {
            res.status(500).send('File error');
        }
    } else {
        try {
            const fakeLoader = fs.readFileSync(fakeFilePath, 'utf8');
            res.setHeader('Content-Type', 'application/octet-stream');
            res.setHeader('Content-Disposition', 'attachment; filename="loader.lua"');
            res.status(200).send(fakeLoader);
        } catch (err) {
            res.status(500).send('File error');
        }
    }
}
