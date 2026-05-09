module geni::vault {
    use std::signer;
    use std::string::String;
    use aptos_framework::coin;
    use aptos_framework::aptos_coin::AptosCoin;
    use aptos_framework::event;

    /// Error codes
    const E_ASSET_NOT_FOUND: u64 = 2;
    const E_INSUFFICIENT_PAYMENT: u64 = 3;

    /// On-chain representation of a listed asset
    struct Asset has key, store {
        blob_name: String,   // Shelby blob name suffix (e.g. "photo.jpg")
        name: String,        // Display name
        price: u64,          // in Octas (1 APT = 10^8 Octas)
        creator: address,
        file_size: u64,      // bytes
    }

    // Event emitted on listing
    #[event]
    struct ListEvent has drop, store {
        creator: address,
        blob_name: String,
        name: String,
        price: u64,
    }

    // Event emitted on purchase (frontend listens for this)
    #[event]
    struct PurchaseEvent has drop, store {
        buyer: address,
        creator: address,
        blob_name: String,
        amount: u64,
    }

    /// Creator lists a new asset by storing blob_name and price on-chain
    public entry fun list_asset(
        creator: &signer,
        blob_name: String,
        name: String,
        price: u64,
        file_size: u64,
    ) {
        let creator_addr = signer::address_of(creator);
        move_to(creator, Asset {
            blob_name: copy blob_name,
            name: copy name,
            price,
            creator: creator_addr,
            file_size,
        });
        event::emit(ListEvent {
            creator: creator_addr,
            blob_name,
            name,
            price,
        });
    }

    /// Buyer purchases access — transfers APT directly to the creator
    /// Returns: the buyer can now fetch the file from Shelby using creator_addr + blob_name
    public entry fun purchase(
        buyer: &signer,
        creator_addr: address,
        amount: u64,
    ) acquires Asset {
        assert!(exists<Asset>(creator_addr), E_ASSET_NOT_FOUND);

        let asset = borrow_global<Asset>(creator_addr);
        assert!(amount >= asset.price, E_INSUFFICIENT_PAYMENT);

        // Transfer APT from buyer to creator (direct wallet-to-wallet)
        coin::transfer<AptosCoin>(buyer, creator_addr, amount);

        // Emit event — blob_name tells buyer which Shelby file to fetch
        event::emit(PurchaseEvent {
            buyer: signer::address_of(buyer),
            creator: creator_addr,
            blob_name: asset.blob_name,
            amount,
        });
    }

    #[view]
    public fun get_asset(creator_addr: address): (String, String, u64, u64) acquires Asset {
        assert!(exists<Asset>(creator_addr), E_ASSET_NOT_FOUND);
        let asset = borrow_global<Asset>(creator_addr);
        (asset.blob_name, asset.name, asset.price, asset.file_size)
    }
}
