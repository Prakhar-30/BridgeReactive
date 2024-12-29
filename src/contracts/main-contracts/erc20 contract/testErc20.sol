// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TestToken is ERC20{
    
    constructor() ERC20("Test Token", "TEST"){}

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