// SPDX-License-Identifier: MIT OR Apache-2.0
pragma solidity ^0.8.3;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

import "hardhat/console.sol";

import "./NFT.sol";

contract NFTMarket is ReentrancyGuard {
  using Counters for Counters.Counter;
  Counters.Counter private _itemIds;
  Counters.Counter private _itemsSold;

  address payable _owner;
  uint256 _listingPrice = 0 ether;

  constructor() {
    _owner = payable(msg.sender);
  }

  struct MarketItem {
    uint itemId;
    address nftContract;
    uint256 tokenId;
    uint256 createdAt;
    uint256 listedAt;
    address payable creator;
    address payable owner;
    uint256 price;
    uint256 royalty;
    bool sold;
    bool listed;
  }

  mapping(uint256 => MarketItem) private idToMarketItem;

  event ItemListed (
    uint indexed itemId,
    address indexed nftContract,
    uint256 indexed tokenId,
    uint256 createdAt,
    uint256 listedAt,
    address creator,
    address owner,
    uint256 price,
    uint256 royalty,
    bool sold,
    bool listed
  );

  function getListingPrice() public view returns (uint256) {
    return _listingPrice;
  }
  
  function listMarketItem(
    address nftContract,
    uint256 tokenId,
    uint256 createdAt,
    uint256 royalty
  ) public payable nonReentrant {
    require(royalty >= 0, "Royalty must be positive");
    require(msg.value == _listingPrice, "Price must be equal to listing price");

    _itemIds.increment();

    uint256 itemId = _itemIds.current();
    uint256 listedAt = block.timestamp;

    MarketItem memory item = MarketItem(
      itemId,
      nftContract,
      tokenId,
      createdAt,
      listedAt,
      payable(msg.sender),
      payable(address(this)),
      msg.value,
      royalty,
      false,
      true
    );
  
    idToMarketItem[itemId] = item;

    IERC721(nftContract).transferFrom(msg.sender, address(this), tokenId);

    emit ItemListed(
      itemId,
      nftContract,
      tokenId,
      createdAt,
      listedAt,
      msg.sender,
      address(this),
      msg.value,
      royalty,
      false,
      true
    );
  }

  function createMarketSale(
    address nftContract,
    uint256 itemId
    ) public payable nonReentrant {
    uint price = idToMarketItem[itemId].price;
    uint tokenId = idToMarketItem[itemId].tokenId;
    require(msg.sender != idToMarketItem[itemId].owner, "You cannot buy your own assets");
    require(msg.value == price, "Please submit the asking price in order to complete the purchase");

    idToMarketItem[itemId].owner.transfer(msg.value);
    IERC721(nftContract).transferFrom(address(this), msg.sender, tokenId);
    idToMarketItem[itemId].owner = payable(msg.sender);
    idToMarketItem[itemId].sold = true;
    _itemsSold.increment();
    
    if (_listingPrice > 0) {
      payable(_owner).transfer(_listingPrice);
    }
  }

  function fetchAllMarketItems() public view returns (MarketItem[] memory) {
    uint itemCount = _itemIds.current();
    uint unsoldItemCount = _itemIds.current() - _itemsSold.current();
    uint currentIndex = 0;

    MarketItem[] memory items = new MarketItem[](unsoldItemCount);
    for (uint i = 0; i < itemCount; i++) {
      if (idToMarketItem[i + 1].owner == address(0)) {
        uint currentId = i + 1;
        MarketItem storage currentItem = idToMarketItem[currentId];
        items[currentIndex] = currentItem;
        currentIndex += 1;
      }
    }
    return items;
  }

  function fetchPurchasedItems() public view returns (MarketItem[] memory) {
    uint totalItemCount = _itemIds.current();
    uint itemCount = 0;
    uint currentIndex = 0;

    for (uint i = 0; i < totalItemCount; i++) {
      if (idToMarketItem[i + 1].owner == msg.sender) {
        itemCount += 1;
      }
    }

    MarketItem[] memory items = new MarketItem[](itemCount);
    for (uint i = 0; i < totalItemCount; i++) {
      if (idToMarketItem[i + 1].owner == msg.sender) {
        uint currentId = i + 1;
        MarketItem storage currentItem = idToMarketItem[currentId];
        items[currentIndex] = currentItem;
        currentIndex += 1;
      }
    }
    return items;
  }

  function fetchCreatedItems() public view returns (MarketItem[] memory) {
    uint totalItemCount = _itemIds.current();
    uint itemCount = 0;
    uint currentIndex = 0;

    for (uint i = 0; i < totalItemCount; i++) {
      if (idToMarketItem[i + 1].owner == msg.sender) {
        itemCount += 1;
      }
    }

    MarketItem[] memory items = new MarketItem[](itemCount);
    for (uint i = 0; i < totalItemCount; i++) {
      if (idToMarketItem[i + 1].owner == msg.sender) {
        uint currentId = i + 1;
        MarketItem storage currentItem = idToMarketItem[currentId];
        items[currentIndex] = currentItem;
        currentIndex += 1;
      }
    }
    return items;
  }
}