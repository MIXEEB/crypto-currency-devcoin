import { Body, Controller, Get, Post } from "@nestjs/common";
import { Block, DevCoin, Node, Transaction } from "../blockchain";

@Controller("dev-coin")
export class DevCoinController {
    constructor (private devCoin: DevCoin) {
    }

    @Get()
    getChain(): Block[] {
        return this.devCoin.getChain();
    }

    @Post("nodes")
    postNode(@Body() nodes: Node[]): Node[] {
        this.devCoin.addNodes(nodes);
        return this.devCoin.getNodes();
    }

    @Post("transaction")
    postTransaction(@Body() transaction: Transaction) {
        this.devCoin.addTransaction(transaction);
    }

    @Post("check-concurrency")
    checkConcurrency() {
        this.devCoin.replaceChain();
    }

    @Post("mine") 
    mine() {
        const blockIndex = this.devCoin.mineBlock();
        return `mined block number: ${blockIndex}`;
    }
}