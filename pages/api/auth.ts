import { NextApiRequest, NextApiResponse } from 'next';
import { encodePayload, getBCAuth, setSession } from '../../lib/auth';
import { updateConnection } from '../../lib/updateConnection'

export default async function auth(req: NextApiRequest, res: NextApiResponse) {
    try {
        // Authenticate the app on install
        const session = await getBCAuth(req.query);
        const encodedContext = encodePayload(session); // Signed JWT to validate/ prevent tampering

        await setSession(session);
        // Temporarily breaking the updateConnection request to test things
        // await updateConnection(session);
        res.redirect(302, `/?context=${encodedContext}`);
    } catch (error) {
        const { message, response } = error;
        res.status(response?.status || 500).json({ message });
    }
}
