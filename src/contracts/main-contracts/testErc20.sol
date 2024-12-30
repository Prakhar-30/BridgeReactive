// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "lib/openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";

contract TestToken is ERC20{
    
    constructor(string memory TokenName, string memory TokenSymbol) ERC20(TokenName, TokenSymbol){}

    /**
     * @param amount Amount of tokens to mint
     * @param user address of user where the handler mints the tokens
     */
    function mint(address /*spender*/,address user,uint256 amount) external{
        _mint(user, amount);
    }
    
    /**
     * @notice Burns tokens from caller's address
     * @param amount Amount of tokens to burn
     */
    function burn(address user, uint256 amount) external {
        _burn(user, amount);
    }

}