import { JsonRpcProvider, SuiTransactionBlockResponse, TransactionBlock } from '@mysten/sui.js';

// Sui client
const provider = new JsonRpcProvider('https://fullnode.devnet.sui.io:443');

// Smart contract address and module
const productModuleAddress = '0xYourContractAddress'; // Replace with your deployed contract address
const productModule = `${productModuleAddress}::ProductModule`;

export const addProductToBlockchain = async (name, price, description, imageUrl) => {
  const transaction = new TransactionBlock();
  
  transaction.moveCall({
    target: `${productModule}::add_product`,
    arguments: [
      transaction.sender(),
      transaction.pure(name),
      transaction.pure(price),
      transaction.pure(description),
      transaction.pure(imageUrl),
    ],
  });

  const response = await provider.sendTransactionBlock(transaction);
  return response;
};

export const updateProductOnBlockchain = async (productId, name, price, description, imageUrl) => {
  const transaction = new TransactionBlock();

  transaction.moveCall({
    target: `${productModule}::update_product`,
    arguments: [
      transaction.sender(),
      transaction.pure(productId),
      transaction.pure(name),
      transaction.pure(price),
      transaction.pure(description),
      transaction.pure(imageUrl),
    ],
  });

  const response = await provider.sendTransactionBlock(transaction);
  return response;
};

export const getProductFromBlockchain = async (productId) => {
  const response = await provider.getObject({ id: productId });
  return response.data;
};
