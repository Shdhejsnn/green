// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract GreenLedger is ERC721URIStorage, Ownable {
    uint256 public tokenCounter;

    enum CompanyType { Agriculture, Manufacturing, Technology, Energy }

    struct Company {
        string name;
        address wallet;
        CompanyType companyType;
        uint256 threshold;
        bool registered;
    }

    mapping(address => Company) public companies;

    constructor() ERC721("GreenCredit", "GCC") Ownable(msg.sender) {
    tokenCounter = 0;
}


    function registerCompany(string memory _name, CompanyType _type) public {
        require(!companies[msg.sender].registered, "Already registered");

        uint256 threshold = 100; // Default
        if (_type == CompanyType.Manufacturing) threshold = 200;
        else if (_type == CompanyType.Technology) threshold = 80;
        else if (_type == CompanyType.Energy) threshold = 300;

        companies[msg.sender] = Company(_name, msg.sender, _type, threshold, true);
    }

    function getCompany(address _addr) public view returns (
        string memory, address, CompanyType, uint256, bool
    ) {
        Company memory c = companies[_addr];
        return (c.name, c.wallet, c.companyType, c.threshold, c.registered);
    }

    function mintCredit(address to, string memory tokenURI) public onlyOwner {
        uint256 tokenId = tokenCounter;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);
        tokenCounter++;
    }

    // 🚨 MARKETPLACE LOGIC STARTS HERE 🚨

    struct Listing {
        uint256 tokenId;
        uint256 price;
        address seller;
    }

    mapping(uint256 => Listing) public listings;

    function listCredit(uint256 tokenId, uint256 price) public {
        require(ownerOf(tokenId) == msg.sender, "Not the owner");
        require(price > 0, "Price must be > 0");

        listings[tokenId] = Listing(tokenId, price, msg.sender);
    }

    function buyCredit(uint256 tokenId) public payable {
        Listing memory listing = listings[tokenId];
        require(listing.price > 0, "Token not listed");
        require(msg.value >= listing.price, "Insufficient ETH");

        // Transfer credit
        _transfer(listing.seller, msg.sender, tokenId);

        // Pay seller
        payable(listing.seller).transfer(listing.price);

        // Remove listing
        delete listings[tokenId];
    }

    function getListing(uint256 tokenId) public view returns (Listing memory) {
        return listings[tokenId];
    }
}
