import { NextApiRequest, NextApiResponse } from 'next'
import { EstimateRequest, EstimateResponse } from '../../../types'
import { taxProviderBasicAuth } from '../../../lib/auth'

// Hard-coded tax rate for demo purposes.
const taxRate = .0825

export default async function estimate(req: NextApiRequest, res: NextApiResponse) {
    try {
        if (!taxProviderBasicAuth(req)) {
            res.status(401).json({ "error": "Unauthorized" })
            return
        }
        const estimateRequest = req.body as EstimateRequest



        res.status(200).json({ 'Hello': 'world' })
    } catch (error) {
        const { message, response } = error;
        res.status(response?.status || 500).json({ message });
    }
}