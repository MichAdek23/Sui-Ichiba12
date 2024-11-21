const functions = require('firebase-functions');
const { JsonRpcProvider, TransactionBlock } = require('@mysten/sui.js');  // Sui SDK

// Initialize provider for Sui blockchain
const provider = new JsonRpcProvider('https://rpc.sui.io');

// Cloud Function: Create Escrow for transactions
exports.createEscrow = functions.https.onCall(async (data, context) => {
  const { productId, buyerAddress, sellerAddress, amount } = data;

  try {
    // Create a transaction block for Sui
    const transactionBlock = new TransactionBlock();
    transactionBlock.moveCall({
      target: '0x1::SuiIchiba::create_escrow',
      arguments: [productId, buyerAddress, sellerAddress, amount],
    });

    // Submit transaction to Sui blockchain
    const txHash = await provider.submitTransaction(transactionBlock);

    // Return success with the transaction hash
    return { success: true, txHash };
  } catch (error) {
    console.error('Error creating escrow:', error);
    return { success: false, error: error.message };
  }
});
