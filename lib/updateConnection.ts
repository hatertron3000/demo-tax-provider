import { bigcommerceClient } from "./auth";
import { SessionProps } from "@types";

export async function updateConnection(session: SessionProps) {
    try {
        const username = process.env.TAX_PROVIDER_USERNAME
        const password = process.env.TAX_PROVIDER_PASSWORD
        const providerId = process.env.TAX_PROVIDER_ID
        const { access_token, context } = session
        const storeHash = context.split('/')[1]
        const bigCommerce = bigcommerceClient(access_token, storeHash, 'v3')

        await bigCommerce.put(`/tax/providers/${providerId}/connection`, {
            username,
            password
        })
    } catch (err) {
        console.error(err)
    }

}