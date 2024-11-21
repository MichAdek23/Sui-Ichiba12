

// Initialize the Sui client
const client = new SuiClient({ url: 'https://fullnode.devnet.sui.io:443' });

// Contract address and module for product management
const productModuleAddress = '0xYourContractAddress'; // Replace with your deployed contract address
const productModule = `${productModuleAddress}::ProductModule`;

// Function to add a product to the blockchain
export const addProductToBlockchain = async (name, price, description, imageUrl) => {
  const transaction = new Transaction();

  // Add a move call to the transaction
  transaction.moveCall({
    target: `${productModule}::add_product`,  // Define the function to call in the module
    arguments: [
      transaction.sender(),  // Sender address
      transaction.pure(name),  // Product name
      transaction.pure(price),  // Product price
      transaction.pure(description),  // Product description
      transaction.pure(imageUrl),  // Product image URL
    ],
  });

  // Execute the transaction
  const response = await client.executeTransactionBlock({
    transactionBlock: transaction,
    signature: 'your-signature',  // Sign the transaction
    options: {
      showEffects: true,  // Show effects after execution
      showObjectChanges: true,  // Show object changes
    },
  });

  return response;
};

// Function to update a product on the blockchain
export const updateProductOnBlockchain = async (productId, name, price, description, imageUrl) => {
  const transaction = new Transaction();

  // Add a move call to update the product
  transaction.moveCall({
    target: `${productModule}::update_product`,  // Define the function to call for updating
    arguments: [
      transaction.sender(),  // Sender address
      transaction.pure(productId),  // Product ID
      transaction.pure(name),  // New name for the product
      transaction.pure(price),  // New price for the product
      transaction.pure(description),  // New description for the product
      transaction.pure(imageUrl),  // New image URL for the product
    ],
  });

  // Execute the transaction
  const response = await client.executeTransactionBlock({
    transactionBlock: transaction,
    signature: 'your-signature',  // Ensure this is signed
    options: {
      showEffects: true,
      showObjectChanges: true,
    },
  });

  return response;
};

// Function to retrieve product information from the blockchain
export const getProductFromBlockchain = async (productId) => {
  const response = await client.getObject({ id: productId });
  return response.data;
};
