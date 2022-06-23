import { pino } from 'pino'
import { bigcommerceClient } from './auth'
import db from './db'

const logger = pino({
    transport: {
        target: 'pino-pretty',
        options: { destination: 1 }
    }
})

export async function getCart(storeHash: string, cartId: string) {
    try {
        const token = await db.getStoreToken(storeHash)
        const bigCommerce = await bigcommerceClient(token, storeHash)

        const checkout = await bigCommerce.get(`/carts/${cartId}`)
        logger.info(`Cart response for ${cartId}: ${JSON.stringify(checkout)}`)

        return checkout
    } catch (err) {
        logger.error(`Error getting cart: ${err}`)

        return
    }
}