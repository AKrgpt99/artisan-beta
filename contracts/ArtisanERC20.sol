// SPDX-License-Identifier: MIT OR Apache-2.0
pragma solidity ^0.8.3;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "hardhat/console.sol";

contract ArtisanERC20 is ERC20, Ownable {
    using SafeMath for uint256;
    
    constructor(uint256 totalSupply_) ERC20("Artisan Coin", "RTZN") Ownable() {
        _mint(_msgSender(), totalSupply_);
    }
}