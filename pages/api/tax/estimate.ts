import { round } from 'lodash'
import { NextApiRequest, NextApiResponse } from 'next'
import { pino } from 'pino'
import { taxProviderBasicAuth } from '@lib/auth'
import { getCart } from '@lib/cartApi'
import { getCheckout } from '@lib/checkoutApi'
import { EstimateAction, EstimateRequest, EstimateRequestDocumentItem, EstimateResponse, EstimateResponseDocumentItem } from '../../../types'

const logger = pino({
    transport: {
        target: 'pino-pretty',
        options: { destination: 1 }
    }
})

const sleep = async (time: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, time))
}

const getSleepTime = (req: EstimateRequest) => {
    const { customer } = req
    try {
        const sleepTime = parseInt(customer
            .taxability_code
            .split(':')[1])

        return sleepTime
    } catch (err) {

        return 0
    }
}

const getStoreHashFromCustomer: (req: EstimateRequest) => string | void = function(req: EstimateRequest) {
    const { taxability_code } = req.customer
    if (!taxability_code.includes(':')) {

        return
    }

    const values = req.customer.taxability_code.split(':')
    if (values[0] != EstimateAction.SLEEP) {
        return values[1]
    }
}

const getActionFromCustomer: (req: EstimateRequest) => EstimateAction | void = function(req) {
    const { taxability_code } = req.customer
    if (!taxability_code.includes(':')) {

        return
    }

    return req.customer.taxability_code.split(':')[0] as EstimateAction
}

const calculateTax = (item: EstimateRequestDocumentItem): EstimateResponseDocumentItem => {
    // Oversimplified tax calculation: All prices get 10% tax applied unless the item is exempt
    const { id, price, tax_exempt, type, tax_class} = item
    const { tax_inclusive, amount } = price
    const taxRate = .1
    const amount_inclusive = round(tax_exempt
        ? amount
        : tax_inclusive
            ? amount
            : amount + (amount * taxRate)
        , 2)
    const amount_exclusive = round(tax_exempt
        ? amount
        : tax_inclusive
            ? amount / (1 + taxRate)
            : amount
        , 2)
    const total_tax = round(amount_inclusive - amount_exclusive, 2)

    return {
        id,
        price: {
            amount_inclusive, 
            amount_exclusive,
            total_tax,
            tax_rate: taxRate,
            sales_tax_summary: [
                {
                    name: 'Hardcoded Tax Rate',
                    rate: taxRate,
                    amount: total_tax,
                    tax_class,
                    id: 'Hardcoded Tax Rate ID'
                }
            ]
        },
        type
    }
}

export default async function estimate(req: NextApiRequest, res: NextApiResponse) {
    try {
        if (!taxProviderBasicAuth(req)) {
            res.status(401).json({ "error": "Unauthorized" })
            
            return
        }
        logger.info(`New rate request: ${JSON.stringify(req.body)}`)

        const action = getActionFromCustomer(req.body)
        
        if (action === EstimateAction.SLEEP) {
            const sleepTime = getSleepTime(req.body)
            logger.info(`Delaying response for ${sleepTime}ms due to customer.taxability_code`)
            await sleep(sleepTime)
        }



        const { id, documents } = req.body as EstimateRequest

        // Debugging request loops

        if (action === EstimateAction.GET_CHECKOUT_BEFORE) {
            const storeHash = getStoreHashFromCustomer(req.body)
            if (storeHash) {
                logger.info(`Checkout request for ${id} for store ${storeHash} before responding to the estimate request.`)
                await getCheckout(storeHash, id)
            }
        }

        if (action === EstimateAction.GET_CART_BEFORE) {
            const storeHash = getStoreHashFromCustomer(req.body)
            if (storeHash) {
                logger.info(`Cart request for ${id} for store ${storeHash} before responding to the estimate request.`)
                await getCart(storeHash, id)
            }
        }



        const estimate: EstimateResponse = {
            id,
            documents: documents.map(({
                id,
                shipping,
                handling,
                items
            }) => ({
                id,
                external_id: `${id}-estimate`,
                shipping: calculateTax(shipping),
                handling: calculateTax(handling),
                items: items.map(item => calculateTax(item))
            }))
        }
        res.status(200).json(estimate)

        if (action === EstimateAction.GET_CHECKOUT_AFTER) {
            const storeHash = getStoreHashFromCustomer(req.body)
            if (storeHash) {
                await sleep(50)
                logger.info(`Checkout request for ${id} for store ${storeHash} after responding to the estimate request.`)
                await getCheckout(storeHash, id)
            }
        }

        if (action === EstimateAction.GET_CART_AFTER) {
            const storeHash = getStoreHashFromCustomer(req.body)
            if (storeHash) {
                await sleep(50)
                logger.info(`Cart request for ${id} for store ${storeHash} after responding to the estimate request.`)
                await getCart(storeHash, id)
            }
        }



    } catch (error) {
        const { message, response } = error;
        res.status(response?.status || 500).json({ message });
    }
}