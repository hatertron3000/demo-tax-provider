import { NextApiRequest, NextApiResponse } from 'next'
import { taxProviderBasicAuth } from '../../../lib/auth'
import { EstimateRequest, EstimateRequestDocumentItem, EstimateResponse, EstimateResponseDocumentItem } from '../../../types'

const calculateTax = (item: EstimateRequestDocumentItem): EstimateResponseDocumentItem => {
    // Oversimplified tax calculation: All prices get 10% tax applied unless the item is exempt
    const { id, price, tax_exempt, type, tax_class, quantity} = item
    const { tax_inclusive, amount } = price
    const taxRate = .1

    return {
        id,
        price: {
            amount_inclusive: tax_exempt
                ? amount
                : tax_inclusive
                    ? amount * quantity
                    : (amount + (amount * taxRate)) * quantity,
            amount_exclusive: tax_exempt
                ? amount * quantity
                : tax_inclusive
                    ? (amount / (1 + taxRate)) * quantity
                    : amount * quantity,
            tax_rate: taxRate,
            sales_tax_summary: [
                {
                    name: 'Hardcoded Tax Rate',
                    rate: taxRate,
                    amount: tax_inclusive
                        ? (amount - (amount / (1 + taxRate) )) * quantity
                        : (amount + (amount * taxRate)) * quantity,
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