export interface EstimateRequestCustomer {
    customer_id: string;
    customer_group_id: string;
    taxability_code?: string;
}

export interface EstimateDocumentItemTaxClass {
    code: string;
    class_id: string;
    name: string;
}

export interface EstimateRequestDocumentPrice {
    amount: number;
    tax_inclusive: boolean;
}

export enum EstimateDocumentItemType {
    ITEM = "item",
    WRAPPING = "wrapping",
    HANDLING = "handling",
    SHIPPING = "shipping",
    REFUND = "refund"
}

export interface EstimateRequestDocumentItem {
    id: string;
    item_code?: string;
    name?: string;
    price: EstimateRequestDocumentPrice;
    quantity: number;
    tax_class?: EstimateDocumentItemTaxClass;
    tax_exempt?: boolean;
    type: EstimateDocumentItemType;
    wrapping?: any;
}

export enum EstimateRequestDocumentAddressType {
    RESIDENTIAL = "RESIDENTIAL",
    COMMERCIAL = "COMMERCIAL",
}

export interface EstimateRequestDocumentAddress {
    line1?: string;
    line2?: string;
    city?: string;
    region_name?: string;
    region_code?: string;
    country_name?: string;
    country_code?: string;
    postal_code?: string;
    company_name?: string;
    type?: EstimateRequestDocumentAddressType;
}

export interface EstimateRequestDocument {
    id: string;
    billing_address?: EstimateRequestDocumentAddress;
    destination_address: EstimateRequestDocumentAddress;
    origin_address: EstimateRequestDocumentAddress;
    shipping: EstimateRequestDocumentItem;
    handling: EstimateRequestDocumentItem;
    items: EstimateRequestDocumentItem[];
}

export interface EstimateRequest {
    id: string;
    currency_code: string;
    customer: EstimateRequestCustomer;
    transaction_date: string;
    documents: EstimateRequestDocument[]
}

export interface EstimateResponseTaxSummaryItem {
    name: string;
    rate: number;
    amount: number;
    tax_class?: EstimateDocumentItemTaxClass;
    id: string;
}

export interface EstimateResponseDocumentPrice {
    amount_inclusive: number;
    amount_exclusive: number;
    total_tax: number;
    tax_rate: number;
    sales_tax_summary: EstimateResponseTaxSummaryItem[]
}

export interface EstimateResponseDocumentItem {
    id: string;
    price: EstimateResponseDocumentPrice;
    type: EstimateDocumentItemType;
    wrapping?: any;
}

export interface EstimateResponseDocument {
    id: string;
    external_id: string;
    items: EstimateResponseDocumentItem[];
    shipping: EstimateResponseDocumentItem;
    handling: EstimateResponseDocumentItem;
}

export interface EstimateResponse {
    id: string;
    documents: EstimateResponseDocument[]
}

export enum EstimateAction {
    GET_CHECKOUT_BEFORE = "GET_CHECKOUT_BEFORE",
    GET_CHECKOUT_AFTER = "GET_CHECKOUT_AFTER",
    GET_CART_BEFORE = "GET_CART_BEFORE",
    GET_CART_AFTER = "GET_CART_AFTER",
    SLEEP = "DELAY",
}