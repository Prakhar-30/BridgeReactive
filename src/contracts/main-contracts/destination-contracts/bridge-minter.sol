// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import 'lib/reactive-lib/src/abstract-base/AbstractCallback.sol';


interface ITestToken {
    function mint(address to, uint256 amount) external;
}

contract BridgeMinter is AbstractCallback {

    constructor(address callback) AbstractCallback(callback) payable {}
    

    event TokensMinted(address token, address to, uint256 amount);
    event TokensBurned(address token, address from, uint256 amount);

    /**
     * @notice Mints tokens for a specified user
     * @param tokenAddress The address of the token contract
     * @param user The address to receive tokens
     * @param amount The amount of tokens to mint
     */
    function mintTokens(
        address /*spender*/,
        address user,
        address tokenAddress,
        uint256 amount
    ) external {
        require(tokenAddress != address(0), "Invalid token address");
        require(user != address(0), "Invalid recipient address");
        require(amount > 0, "Amount must be greater than 0");

        try ITestToken(tokenAddress).mint(user, amount) {
            emit TokensMinted(tokenAddress, user, amount);
        } catch Error(string memory reason) {
            revert(string(abi.encodePacked("Minting failed: ", reason)));
        } catch {
            revert("Minting failed");
        }
    }

}