export interface Transaction {
    from: string,
    to: string,
    amount: number
}

export interface Block {
    index: number,
    proof: number,
    timestamp: number,
    transactions: Transaction[],
    prevHash: string
}

export interface Node {
    host: string,
    port: string
}