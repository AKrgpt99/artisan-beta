// SPDX-License-Identifier: MIT OR Apache-2.0
pragma solidity ^0.8.3;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "hardhat/console.sol";

import "./ArtisanCoin.sol";

contract NFT is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    address contractAddress;
    address artist;
    address txFeeToken;
    uint txFeeAmount;
    uint256 public createdAt;
    mapping(address => bool) excluded;
    
    event ItemCreated (
        address indexed nftContract,
        uint256 indexed tokenId,
        uint256 createdAt,
        address owner
    );

    constructor(address marketplaceAddress) ERC721("Artisan", "RTZN") {
        contractAddress = marketplaceAddress;
        createdAt = block.timestamp;
        artist = _msgSender();
        excluded[artist] = true;
    }

    function _payTxFee(address from) internal {
        IERC20 token = IERC20(txFeeToken);
        token.transferFrom(from, artist, txFeeAmount);
    }

    function setExcluded(address user, bool status) external {
        require(_msgSender() == artist, "Only the artist can change this");
        excluded[user] = status;
    }

    function transferFrom(address from, address to, uint256 tokenId) public override {
        require(
            _isApprovedOrOwner(_msgSender(), tokenId),
            "ERC721: the caller is not approved or the owner"
        );

        if (excluded[from] == false) {
            _payTxFee(from);
        }

        _transfer(from, to, tokenId);
    }

    function safeTransferFrom(address from, address to, uint256 tokenId, bytes memory _data) public override {
        require(
            _isApprovedOrOwner(_msgSender(), tokenId),
            "ERC721: the caller is not approved or the owner"
        );

        if (excluded[from] == false) {
            _payTxFee(from);
        }

        _safeTransfer(from, to, tokenId, _data);
    }

    function mint(string memory tokenURI, address _txFeeToken, uint _txFeeAmount) public returns (uint) {
        txFeeToken = _txFeeToken;
        txFeeAmount = _txFeeAmount;

        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();

        _mint(_msgSender(), newItemId);
        _setTokenURI(newItemId, tokenURI);
        setApprovalForAll(contractAddress, true);

        emit ItemCreated(
            address(this),
            newItemId,
            createdAt,
            _msgSender()
        );

        return newItemId;
    }

}