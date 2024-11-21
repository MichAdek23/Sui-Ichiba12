// DepositContract.move

address 0x1 {
    module DepositContract {
        // Resource to store user balances
        struct UserBalance has store {
            balance: u64,  // User balance in SUI
        }

        // Function to initialize user balance (called once when a user first deposits)
        public fun initialize_balance(account: &signer) {
            let user_balance = UserBalance { balance: 0 };
            move_to(account, user_balance);
        }

        // Function to deposit SUI into user's balance
        public fun deposit(account: &signer, amount: u64) {
            let user_balance_ref = borrow_global_mut<UserBalance>(signer::address_of(account));
            user_balance_ref.balance = user_balance_ref.balance + amount;
        }

        // Function to check the balance of a user
        public fun check_balance(account: address): u64 {
            let user_balance = borrow_global<UserBalance>(account);
            user_balance.balance
        }
    }
}
