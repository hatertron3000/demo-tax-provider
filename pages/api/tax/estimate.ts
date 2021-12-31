import { NextApiRequest, NextApiResponse } from 'next';
import { taxProviderBasicAuth } from '../../../lib/auth'

export default async function estimate(req: NextApiRequest, res: NextApiResponse) {
    try {
        if (!taxProviderBasicAuth(req)) {
            res.status(401).json({ "error": "Unauthorized" })
            return
        }
        
        res.status(200).json({ 'Hello': 'world' })
    } catch (error) {
        const { message, response } = error;
        res.status(response?.status || 500).json({ message });
    }
}