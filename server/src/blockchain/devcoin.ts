import { Injectable } from '@nestjs/common';
import { Block, Transaction, Node } from './types' 
import * as crypto from 'crypto';
import { HttpService } from '@nestjs/axios';
import { catchError, combineLatestAll, map } from 'rxjs/operators';
import { combineLatest, merge, observable, zip } from 'rxjs';
import { response } from 'express';

@Injectable()
export class DevCoin {
    private readonly DIFFICULTY = '00';

    private chain: Block[] = [];
    private transactions: Transaction[] = [];
    private nodes: Node[] = [];

    private proofFunction: (oldProof: number, newProof: number) => number;

    constructor(private httpService: HttpService) {
        this.proofFunction = this.simpleProofFunction;
        this.addGenesisBlock();
    }

    addGenesisBlock = () => this.addBlock(1);

    addNodes = (nodes: Node[]) => {
        nodes.forEach(node => {
            if (this.nodes.findIndex(n => n.port === node.port) === -1) {
                this.nodes.push(node);
            }
        })
    }

    getNodes = () => this.nodes;

    getChain = () => this.chain;

    getLatestBlock = () =>  this.chain[this.chain.length - 1];

    calculateHash = (data: string) => crypto.createHash('sha256').update(data).digest('hex');

    hashHitsTarget = (hash: string) => hash.startsWith(this.DIFFICULTY);

    simpleProofFunction = (oldProof: number, newProof: number) => {
        return Math.pow(newProof, 4) - Math.pow(oldProof, 3);
    }

    addBlock = (proof: number): boolean => {
        if (!this.isChainValid()){
            return false;
        }

        const latestBlock = this.chain.length ? this.chain[this.chain.length - 1] : null;
        const block = {
            index: latestBlock ? latestBlock.index + 1 : 1,
            proof: proof,
            transactions: this.transactionsCopy(),
            timestamp: Date.now(),
            prevHash: latestBlock ? this.calculateHash(JSON.stringify(latestBlock)) : '0'
        }

        this.chain.push(block);
        return true;
    }

    calculateProof(latestProof: number) {
        let newProof = 0;
        let infinite = true;

        while(infinite) {
            newProof++;
            if (latestProof === newProof){
                continue;
            }

            const operation = this.proofFunction(latestProof, newProof);
            const operationHash = this.calculateHash(operation.toString());

            if (this.hashHitsTarget(operationHash)) {
                return newProof;
            }
        }
    }

    transactionsCopy = () => {
        const transactionsCopy = JSON.parse(JSON.stringify(this.transactions));
        this.transactions = [];
        return transactionsCopy;
    }

    addTransaction = (transaction: Transaction) => this.transactions.push(transaction)

    mineBlock = () => {
        const latestBlock = this.chain[this.chain.length - 1];
        const newProof = this.calculateProof(latestBlock.proof);
        this.addBlock(newProof);

        return this.chain[this.chain.length - 1].index;
    }

    isChainValid = () => {
        if (this.chain.length <= 1){
            return true;
        }

        for(let blockIndex = 1; blockIndex < this.chain.length; blockIndex++) {
            if (this.calculateHash(JSON.stringify(this.chain[blockIndex-1])) !== this.chain[blockIndex].prevHash){
                return false;
            }
        }
        return true;
    }

    replaceChain = () => {
        const observables = this.nodes.map(node => this.httpService.get(`http://${node.host}:${node.port}/dev-coin`));
        observables.forEach((observable) => {
            observable.subscribe((response) => {
                if (response.status === 200){
                    const chain = response.data;
                    if (this.chain.length < chain.length) {
                        this.chain = chain;
                    }
                }
            });
        })
    }
}