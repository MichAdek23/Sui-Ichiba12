module 0x1::escrow {

    struct Escrow {
        buyer: address,
        seller: address,
        product_id: u64,
        price: u64,
        is_confirmed: bool,
    }

    public fun create_escrow(
        buyer: &signer,
        seller: address,
        product_id: u64,
        price: u64
    ): Escrow {
        assert!(price > 0, 0);
        Escrow {
            buyer: signer::address_of(buyer),
            seller,
            product_id,
            price,
            is_confirmed: false,
        }
    }

    public fun confirm_purchase(
        escrow: &mut Escrow,
        buyer: &signer
    ) {
        assert!(escrow.buyer == signer::address_of(buyer), 0);
        assert!(!escrow.is_confirmed, 0);
        escrow.is_confirmed = true;
    }
}
