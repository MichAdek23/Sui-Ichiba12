import { JsonRpcProvider, SuiClient, RawSigner, SuiTransactionBlockResponse } from "@mysten/sui.js";

// Connect to Sui network
const provider = new JsonRpcProvider("https://fullnode.devnet.sui.io:443"); // Replace with the appropriate network URL

// Load a wallet from the user's browser or private key (Here we assume a wallet provider like MetaMask for Sui)
const signer = new RawSigner(walletPrivateKey); // Make sure you get the user's private key or use a wallet provider

// Define contract address and function call specifics
const ESCROW_MODULE_ADDRESS = "0x1"; // Replace with your deployed escrow contract address

// Create an Escrow
export const createEscrow = async (buyerSigner, sellerAddress, productId, price) => {
    const transaction = await provider.transactionBuilder()
        .module(ESCROW_MODULE_ADDRESS)
        .function('create_escrow')
        .args(buyerSigner.address(), sellerAddress, productId, price)
        .build();

    const response = await signer.sendTransaction(transaction);
    return response;
};

// Confirm Purchase
export const confirmPurchase = async (escrow, buyerSigner) => {
    const transaction = await provider.transactionBuilder()
        .module(ESCROW_MODULE_ADDRESS)
        .function('confirm_purchase')
        .args(escrow, buyerSigner.address())
        .build();

    const response = await signer.sendTransaction(transaction);
    return response;
};
