import { round } from 'lodash'
import { NextApiRequest, NextApiResponse } from 'next'
import { pino } from 'pino'
import { taxProviderBasicAuth } from '../../../lib/auth'
import { EstimateRequest, EstimateRequestDocumentItem, EstimateResponse, EstimateResponseDocumentItem } from '../../../types'

const logger = pino({
    transport: {
        target: 'pino-pretty',
        options: { destination: 1 }
    }
})

const calculateTax = (item: EstimateRequestDocumentItem): EstimateResponseDocumentItem => {
    // Oversimplified tax calculation: All prices get 10% tax applied unless the item is exempt
    const { id, price, tax_exempt, type, tax_class, quantity} = item
    const { tax_inclusive, amount } = price
    const taxRate = .1
    const amount_inclusive = round(tax_exempt
        ? amount
        : tax_inclusive
            ? amount * quantity
            : (amount + (amount * taxRate)) * quantity, 2)
    const amount_exclusive = round(tax_exempt
        ? amount * quantity
        : tax_inclusive
            ? (amount / (1 + taxRate)) * quantity
            : amount * quantity, 2)
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
        const { id, documents } = req.body as EstimateRequest

        logger.info(`New rate request: ${ JSON.stringify(req.body) }`)

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
    } catch (error) {
        const { message, response } = error;
        res.status(response?.status || 500).json({ message });
    }
}