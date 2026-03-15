module geni::vault {
    use std::signer;
    use std::string::String;
    use aptos_framework::coin;
    use aptos_framework::aptos_coin::AptosCoin;
    use aptos_framework::event;

    /// Error codes
    const E_NOT_CREATOR: u64 = 1;
    const E_ASSET_NOT_FOUND: u64 = 2;
    const E_INSUFFICIENT_PAYMENT: u64 = 3;

    /// On-chain representation of a listed asset
    struct Asset has key, store {
        cid: vector<u8>,
        name: String,
        price: u64, // in Octas (1 APT = 10^8 Octas)
        creator: address,
    }

    /// Event emitted on purchase (frontend listens for this)
    #[event]
    struct PurchaseEvent has drop, store {
        buyer: address,
        creator: address,
        asset_cid: vector<u8>,
        amount: u64,
    }

    /// Creator lists a new asset by storing CID and price on-chain
    public entry fun list_asset(
        creator: &signer,
        cid: vector<u8>,
        name: String,
        price: u64,
    ) {
        let creator_addr = signer::address_of(creator);
        move_to(creator, Asset {
            cid,
            name,
            price,
            creator: creator_addr,
        });
    }

    /// Buyer purchases an asset — transfers APT directly to the creator
    public entry fun purchase(
        buyer: &signer,
        creator_addr: address,
        amount: u64,
    ) acquires Asset {
        // Verify asset exists
        assert!(exists<Asset>(creator_addr), E_ASSET_NOT_FOUND);

        let asset = borrow_global<Asset>(creator_addr);

        // Verify payment amount
        assert!(amount >= asset.price, E_INSUFFICIENT_PAYMENT);

        // Transfer APT from buyer to creator
        coin::transfer<AptosCoin>(buyer, creator_addr, amount);

        // Emit purchase event for frontend tracking
        event::emit(PurchaseEvent {
            buyer: signer::address_of(buyer),
            creator: creator_addr,
            asset_cid: asset.cid,
            amount,
        });
    }
}
