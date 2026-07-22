// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title PayPerRegistry
 * @dev On-chain registry mapping service listings to seller endpoints on Arc.
 * Pure discovery layer for AI Agent-to-Agent Nanopayment Marketplace.
 */
contract PayPerRegistry {
    struct Listing {
        uint256 id;
        address seller;
        string name;
        string endpoint;       // Public HTTP URL of seller's live server
        uint256 pricePerCall;  // USDC, 6 decimals
        string category;       // e.g., "scraping", "summarization", "image-gen", "sentiment"
        string description;
        bool active;
        uint256 totalCalls;
        uint256 successCount;
        uint256 avgResponseMs;
        uint256 ratingScore;   // Rating score from 1-100 (e.g., 98 = 98%)
    }

    uint256 private _nextListingId;
    mapping(uint256 => Listing) public listings;
    uint256[] private _allListingIds;

    // Metrics tracking
    uint256 public totalNetworkTransactions;
    uint256 public totalUSDCVolumeMoved; // In 6 decimals USDC

    // Events
    event ServiceRegistered(
        uint256 indexed id,
        address indexed seller,
        string name,
        string category,
        uint256 pricePerCall,
        string endpoint
    );
    event ServiceUpdated(
        uint256 indexed id,
        string name,
        uint256 pricePerCall,
        string endpoint
    );
    event ServiceStatusChanged(uint256 indexed id, bool active);
    event CallRecorded(
        uint256 indexed id,
        bool success,
        uint256 responseTimeMs,
        uint256 usdcAmount
    );

    modifier onlySeller(uint256 id) {
        require(listings[id].seller == msg.sender, "PayPerRegistry: Caller is not listing seller");
        _;
    }

    /**
     * @dev Register a new seller service in the PayPer marketplace directory.
     */
    function registerService(
        string memory name,
        string memory endpoint,
        uint256 pricePerCall,
        string memory category,
        string memory description
    ) external returns (uint256) {
        require(bytes(name).length > 0, "Name cannot be empty");
        require(bytes(endpoint).length > 0, "Endpoint cannot be empty");

        _nextListingId++;
        uint256 newId = _nextListingId;

        Listing memory newListing = Listing({
            id: newId,
            seller: msg.sender,
            name: name,
            endpoint: endpoint,
            pricePerCall: pricePerCall,
            category: category,
            description: description,
            active: true,
            totalCalls: 0,
            successCount: 0,
            avgResponseMs: 150, // Default baseline response speed in ms
            ratingScore: 98     // Initial seller confidence rating (98/100)
        });

        listings[newId] = newListing;
        _allListingIds.push(newId);

        emit ServiceRegistered(newId, msg.sender, name, category, pricePerCall, endpoint);
        return newId;
    }

    /**
     * @dev Update an existing service listing.
     */
    function updateService(
        uint256 id,
        string memory name,
        string memory endpoint,
        uint256 pricePerCall,
        string memory category,
        string memory description
    ) external onlySeller(id) {
        Listing storage listing = listings[id];
        listing.name = name;
        listing.endpoint = endpoint;
        listing.pricePerCall = pricePerCall;
        listing.category = category;
        listing.description = description;

        emit ServiceUpdated(id, name, pricePerCall, endpoint);
    }

    /**
     * @dev Set listing online/offline status (sellers can self-flag unavailable).
     */
    function setActive(uint256 id, bool active) external onlySeller(id) {
        listings[id].active = active;
        emit ServiceStatusChanged(id, active);
    }

    /**
     * @dev Record verified execution metrics for a seller listing.
     */
    function recordCallMetrics(
        uint256 id,
        bool success,
        uint256 responseTimeMs
    ) external {
        Listing storage listing = listings[id];
        require(listing.id != 0, "Listing does not exist");

        listing.totalCalls++;
        totalNetworkTransactions++;

        if (success) {
            listing.successCount++;
            totalUSDCVolumeMoved += listing.pricePerCall;
        }

        // Rolling average response time
        if (listing.totalCalls == 1) {
            listing.avgResponseMs = responseTimeMs;
        } else {
            listing.avgResponseMs = (listing.avgResponseMs * 4 + responseTimeMs) / 5;
        }

        // Adjust rating based on success ratio
        uint256 successRatio = (listing.successCount * 100) / listing.totalCalls;
        listing.ratingScore = successRatio;

        emit CallRecorded(id, success, responseTimeMs, listing.pricePerCall);
    }

    /**
     * @dev Fetch all service listings.
     */
    function getServices() external view returns (Listing[] memory) {
        Listing[] memory result = new Listing[](_allListingIds.length);
        for (uint256 i = 0; i < _allListingIds.length; i++) {
            result[i] = listings[_allListingIds[i]];
        }
        return result;
    }

    /**
     * @dev Fetch services filtered by category.
     */
    function getServicesByCategory(string memory category) external view returns (Listing[] memory) {
        bytes32 categoryHash = keccak256(abi.encodePacked(category));
        uint256 matchCount = 0;

        for (uint256 i = 0; i < _allListingIds.length; i++) {
            if (keccak256(abi.encodePacked(listings[_allListingIds[i]].category)) == categoryHash) {
                matchCount++;
            }
        }

        Listing[] memory result = new Listing[](matchCount);
        uint256 currentIndex = 0;
        for (uint256 i = 0; i < _allListingIds.length; i++) {
            Listing memory listing = listings[_allListingIds[i]];
            if (keccak256(abi.encodePacked(listing.category)) == categoryHash) {
                result[currentIndex] = listing;
                currentIndex++;
            }
        }
        return result;
    }

    /**
     * @dev Fetch single listing details.
     */
    function getListing(uint256 id) external view returns (Listing memory) {
        require(listings[id].id != 0, "Listing not found");
        return listings[id];
    }

    /**
     * @dev Return total count of registered listings.
     */
    function getTotalListingsCount() external view returns (uint256) {
        return _allListingIds.length;
    }
}
