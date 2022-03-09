import { pino } from 'pino'
import { bigcommerceClient } from './auth'
import db from './db'

const logger = pino({
    transport: {
        target: 'pino-pretty',
        options: { destination: 1 }
    }
})

export async function getCheckout(storeHash: string, checkoutId: string) {
    try {
        const token = await db.getStoreToken(storeHash)
        const bigCommerce = await bigcommerceClient(token, storeHash)

        const checkout = await bigCommerce.get(`/checkouts/${checkoutId}`)
        logger.info(`Checkout response for ${checkoutId}: ${JSON.stringify(checkout)}`)

        return checkout
    } catch (err) {
        logger.error(`Error getting checkout: ${err}`)

        return
    }
}