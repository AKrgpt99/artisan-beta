// SPDX-License-Identifier: MIT OR Apache-2.0
pragma solidity ^0.8.3;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

import "hardhat/console.sol";

contract ArtisanERC721 is ERC721URIStorage {
    using SafeMath for uint256;
    using Counters for Counters.Counter;
    Counters.Counter private _tokenCount;

    struct Token {
        string tokenURI;
        string category;
        uint256 tokenId;
        uint256 txFee;
        address txToken;
        address owner;
        address artist;
        bool listed;
    }

    struct Bid {
        uint256 tokenId;
        uint256 price;
        address bidder;
    }

    struct Ask {
        uint256 tokenId;
        uint256 price;
        address asker;
    }

    event Mint (
        Token token,
        uint256 createdAt
    );

    event Sale (
        Token token,
        uint256 soldAt,
        uint256 price,
        address from,
        address to
    );

    event Listing (
        Token token,
        uint256 listedAt,
        uint256 price
    );

    event CancelListing (
        Token token,
        uint256 cancelledAt
    );

    event Offer (
        Token token,
        uint256 offeredAt,
        uint256 price,
        address from
    );

    event CancelOffer (
        Token token,
        uint256 cancelledAt,
        address from
    );

    // tokenId => Token
    mapping(uint256 => Token) private _idToToken;

    // tokenId => bidder => bidPrice
    mapping(uint256 => mapping(address => uint256)) private _idToBidFromBidder;
    // tokenId => asker => askPrice
    mapping(uint256 => mapping(address => uint256)) private _idToAskFromAsker;

    // bidder => tokenId => Token
    mapping(address => mapping(uint256 => Token)) private _bidderToTokenFromId;
    // asker => tokenId => Token
    mapping(address => mapping(uint256 => Token)) private _askerToTokenFromId;

    // tokenId => bids
    mapping(uint256 => Bid[]) _bids;
    // tokenId => asks
    mapping(uint256 => Ask[]) _asks;

    constructor() ERC721("Artisan NFT", "RTZN") {}

    /******************************************************************************
     *  @dev See {IERC721-transferFrom}.
     *****************************************************************************/
    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public virtual override {
        super.transferFrom(from, to, tokenId);

        uint256 royalty;

        if (_idToBidFromBidder[tokenId][to] > 0) {
            royalty = _idToBidFromBidder[tokenId][to] * _idToToken[tokenId].txFee / 10000;
        } else {
            royalty = _idToAskFromAsker[tokenId][from] * _idToToken[tokenId].txFee / 10000;
        }

        // Pay the artist the royalty
        ERC20(_idToToken[tokenId].txToken).transferFrom(to, _idToToken[tokenId].artist, royalty);

        // Change the owner of the token
        _idToToken[tokenId].owner = to;
    }

    /******************************************************************************
     *  @notice Internal function to check whether a token is listed or not.
     *  @param tokenId The id of the token.
     *  @return Listing boolean.
     ******************************************************************************/
    function _listed(uint256 tokenId) internal view returns (bool) {
        return _idToToken[tokenId].listed;
    }

    /******************************************************************************
     *  @notice Internal function to bid on a token with a specific price as the
     *  _msgSender().
     *  @param price The bid price to offer.
     *  @param tokenId The id of the token.
     ******************************************************************************/
    function _bid(uint256 price, uint256 tokenId) internal {
        require(price >= 0, "ArtisanERC721: price cannot be less than 0");
        require(_exists(tokenId), "ArtisanERC721: this asset does not exist");
        require(_listed(tokenId), "ArtisanERC721: this asset is unlisted");
        require(_msgSender() != _idToToken[tokenId].owner, "ArtisanERC721: you cannot bid on your own asset");

        if (price == 0) {
            // Remove existing bid
            for (uint256 i = 0; i < _bids[tokenId].length; i++) {
                if (_bids[tokenId][i].bidder == _msgSender()) {
                    // Shift elements to the left
                    for (uint256 j = i; j < _bids[tokenId].length - 1; j++) {
                        _bids[tokenId][j] = _bids[tokenId][j + 1];
                    }

                    delete _bids[tokenId][_bids[tokenId].length - 1];
                    break;
                }
            }
        } else {
            // Find existing bid
            for (uint256 i = 0; i < _bids[tokenId].length; i++) {
                if (_bids[tokenId][i].bidder == _msgSender()) {
                    _bids[tokenId][i].price = price;
                    break;
                }
            }

            // Place new bid
            _bids[tokenId].push(Bid(tokenId, price, _msgSender()));
        }

        _idToBidFromBidder[tokenId][_msgSender()] = price;
        _bidderToTokenFromId[_msgSender()][tokenId] = _idToToken[tokenId];
    }

    /******************************************************************************
     *  @notice Internal function to set an ask price on a token with a specific
     *  price as the _msgSender(), thus they must be the token owner.
     *  @param price The price to ask.
     *  @param tokenId The id of the token.
     ******************************************************************************/
    function _ask(uint256 price, uint256 tokenId) internal {
        require(price >= 0, "ArtisanERC721: price cannot be less than 0");
        require(_exists(tokenId), "ArtisanERC721: this asset does not exist");
        require(_msgSender() == _idToToken[tokenId].owner, "ArtisanERC721: you do not own this asset");

        if (price == 0) {
            // Remove listing
            require(_listed(tokenId), "ArtisanERC721: this asset is already unlisted");
            _idToToken[tokenId].listed = false;

            // Delete asks
            _asks[tokenId].pop();

            // Delete bids
            for (uint256 i = 0; i < _bids[tokenId].length; i++) {
                delete _bids[tokenId][_bids[tokenId].length - i - 1];
            }
        } else {
            // Add listing
            require(!_listed(tokenId), "ArtisanERC721: this asset is already listed");
            _asks[tokenId].push(Ask(tokenId, price, _msgSender()));
            _idToToken[tokenId].listed = true;
        }

        _idToAskFromAsker[tokenId][_msgSender()] = price;
        _askerToTokenFromId[_msgSender()][tokenId] = _idToToken[tokenId];
    }

    /******************************************************************************
     *  @notice A pure function that checks if the given percentage is within the
     *  correct bounds (decimal precision of 2).
     *  @param txFee The fee percentage to check.
     *  @return Valid boolean.
     ******************************************************************************/
    function _isTxFeePctValid(uint256 txFee) internal pure returns (bool) {
        // Make sure fee percentage is less than 10%.
        return 0 <= txFee && txFee <= 1000;
    }

    /******************************************************************************
     *  @notice Public function to check who the artist is of any token.
     *  @param tokenId The id of the token.
     *  @return Artist's address.
     ******************************************************************************/
    function artistOf(uint256 tokenId) public view returns (address) {
        return _idToToken[tokenId].artist;
    }

    /******************************************************************************
     *  @notice Public function to get all bids on the token.
     *  @param tokenId The id of the token.
     *  @return A list of bids.
     ******************************************************************************/
    function bidsOf(uint256 tokenId) public view returns (Bid[] memory) {
        return _bids[tokenId];
    }

    /******************************************************************************
     *  @notice Public function to get all asks on the token.
     *  @param tokenId The id of the token.
     *  @return A list of asks.
     ******************************************************************************/
    function asksOf(uint256 tokenId) public view returns (Ask[] memory) {
        return _asks[tokenId];
    }

    /******************************************************************************
     *  @notice Public function to get the category of a token.
     *  @param tokenId The id of the token.
     *  @return A string of the category.
     ******************************************************************************/
    function categoryOf(uint256 tokenId) public view returns (string memory) {
        return _idToToken[tokenId].category;
    }

    /******************************************************************************
     *  @notice Public pure function to get all categories.
     *  @param tokenId The id of the token.
     *  @return A list of the categories.
     ******************************************************************************/
    function categories() public pure returns (string[8] memory) {
        return [
            "ART",
            "MUSIC",
            "VIDEO",
            "UTLITY",
            "COLLECTIBLES",
            "PHOTOGRAPHY",
            "CINEMATOGRAPHY",
            "SPORTS"
        ];
    }

    /******************************************************************************
     *  @notice The main method to mint an asset, to be accessed by the
     *  marketplace. The fee percentage is to be expressed as 100.00 => 10000.
     *  Emits a Mint event.
     *  @param tokenURI_ A string of the link where the content is hosted.
     *  @param txToken_ The token that'll be used for transations.
     *  @param txFee_ The percentage the artist wants from royalties.
     *  @return Token ID.
     ******************************************************************************/
    function mint(
        string memory tokenURI_,
        string memory category_,
        address txToken_,
        uint256 txFee_,
        uint256 price_
    ) public {
        require(_isTxFeePctValid(txFee_), "ArtisanERC721: invalid royalty percentage");

        _tokenCount.increment();
        uint256 tokenId = _tokenCount.current();

        _idToToken[tokenId] = Token(
            tokenURI_,
            category_,
            tokenId,
            txFee_,
            txToken_,
            _msgSender(),
            _msgSender(),
            false
        );

        _mint(_msgSender(), tokenId);
        _setTokenURI(tokenId, tokenURI_);
        _ask(price_, tokenId);

        emit Mint(
            _idToToken[tokenId],
            block.timestamp
        );
    }

    /******************************************************************************
     *  @notice This method is to be run by the NFT owner to sell their token when
     *  they get the right offer. The owner will be sent the amount that was bid by
     *  the buyer. Emits a Sale event.
     *  @param to An address payable of whoever would like to buy the asset.
     *  @param tokenId The id of the token.
     ******************************************************************************/
    function sell(address payable to, uint256 tokenId) public payable {
        require(_exists(tokenId), "ArtisanERC721: this asset does not exist");
        require(ownerOf(tokenId) == _msgSender(), "ArtisanERC721: you do not own this asset");
        require(ownerOf(tokenId) != to, "ArtisanERC721: you already own this asset");
        require(_idToBidFromBidder[tokenId][to] != 0, "ArtisanERC721: this buyer hasn't made a bid yet");

        uint256 price = _idToBidFromBidder[tokenId][to];

        // Pay the owner the bid price
        ERC20(_idToToken[tokenId].txToken).transferFrom(to, _msgSender(), price);

        _idToAskFromAsker[tokenId][_msgSender()] = 0;
        _idToBidFromBidder[tokenId][_msgSender()] = 0;
        _idToToken[tokenId].listed = false;
        transferFrom(_msgSender(), to, tokenId);

        emit Sale(
            _idToToken[tokenId],
            block.timestamp,
            price,
            _msgSender(),
            to
        );
    }

    /******************************************************************************
     *  @notice Creates a listing on the marketplace, only the owner has access to
     *  do this. Emits a Listing event.
     *  @param price The price the owner is asking.
     *  @param tokenId The id of the token.
     ******************************************************************************/
    function list(uint256 price, uint256 tokenId) public {
        require(_exists(tokenId), "ArtisanERC721: this asset does not exist");
        require(ownerOf(tokenId) == _msgSender(), "ArtisanERC721: you do not own this asset");
        require(!_listed(tokenId), "ArtisanERC721: this asset is already listed");

        _ask(price, tokenId);

        emit Listing(
            _idToToken[tokenId],
            block.timestamp,
            price
        );
    }

    /******************************************************************************
     *  @notice Removes the listing by the owner. The token must be owned by the
     *  sender. Emits a CancelListing event.
     *  @param tokenId The id of the token.
     ******************************************************************************/
    function unlist(uint256 tokenId) public {
        require(_exists(tokenId), "ArtisanERC721: this asset does not exist");
        require(ownerOf(tokenId) == _msgSender(), "ArtisanERC721: you do not own this asset");
        require(_listed(tokenId), "ArtisanERC721: this asset is already unlisted");

        _ask(0, tokenId);

        emit CancelListing(
            _idToToken[tokenId],
            block.timestamp
        );
    }

    /******************************************************************************
     *  @notice Adds a bid to a token with the specified ID. The owner should not
     *  be able to make an offer on their own asset. Emits a Offer event.
     *  @param price The price the buyer is asking.
     *  @param tokenId The id of the token.
     ******************************************************************************/
    function offer(uint256 price, uint256 tokenId) public {
        require(_exists(tokenId), "ArtisanERC721: this asset does not exist");
        require(ownerOf(tokenId) != _msgSender(), "ArtisanERC721: you already own this asset");
        require(artistOf(tokenId) != _msgSender(), "ArtisanERC721: you are the creator of this asset");
        require(_listed(tokenId), "ArtisanERC721: this asset is unlisted");

        _bid(price, tokenId);

        emit Offer(
            _idToToken[tokenId],
            block.timestamp,
            price,
            _msgSender()
        );
    }

    /******************************************************************************
     *  @notice Removes a bid on a token with the specified ID. _msgSender() should
     *  have a bid in the bids mapping. Emits a CancelOffer event.
     *  @param tokenId The id of the token.
     ******************************************************************************/
    function unoffer(uint256 tokenId) public {
        require(_exists(tokenId), "ArtisanERC721: this asset does not exist");
        require(ownerOf(tokenId) != _msgSender(), "ArtisanERC721: you already own this asset");
        require(artistOf(tokenId) != _msgSender(), "ArtisanERC721: you are the creator of this asset");
        require(_listed(tokenId), "ArtisanERC721: this asset is unlisted");
        require(_idToBidFromBidder[tokenId][_msgSender()] != 0, "ArtisanERC721: you have not made an offer yet");

        _bid(0, tokenId);

        emit CancelOffer(
            _idToToken[tokenId],
            block.timestamp,
            _msgSender()
        );
    }
}