// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract TokenBridge is ReentrancyGuard{
    // Mapping to track locked tokens for each user
    mapping(address => mapping(address => uint256)) public lockedTokens;
    
    // Event emitted when tokens are bridged
    event TokensBridged(
        address indexed user,
        address indexed destinationToken,
        uint256 indexed amount,
        address originTokenAddress
    );
    
    // Event emitted when tokens are withdrawn
    event TokensWithdrawn(
        address indexed user,
        address indexed tokenAddress,
        uint256 amount
    );

    /**
     * @dev Bridges tokens from user to contract
     * @param tokenAddress The address of the ERC20 token to bridge
     * @param amount The amount of tokens to bridge
     * @param destinationToken The address of the token on the destination chain
     */
    function bridge(
        address tokenAddress,
        uint256 amount,
        address destinationToken
    ) external nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        require(tokenAddress != address(0), "Invalid token address");
        require(destinationToken != address(0), "Invalid destination token address");
        
        IERC20 token = IERC20(tokenAddress);
        
        // Check if user has approved the contract
        require(
            token.allowance(msg.sender, address(this)) >= amount,
            "Insufficient allowance"
        );
        
        // Transfer tokens from user to contract
        require(
            token.transferFrom(msg.sender, address(this), amount),
            "Transfer failed"
        );
        
        // Update locked tokens mapping
        lockedTokens[msg.sender][tokenAddress] += amount;
        
        // Emit bridge event
        emit TokensBridged(msg.sender, tokenAddress, amount, destinationToken);
    }
    
    /**
     * @dev Withdraws tokens back to user
     * @param tokenAddress The address of the ERC20 token to withdraw
     * @param amount The amount of tokens to withdraw
     */
    function withdraw(
        address tokenAddress,
        uint256 amount
    ) external nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        require(tokenAddress != address(0), "Invalid token address");
        
        // Check if user has enough locked tokens
        require(
            lockedTokens[msg.sender][tokenAddress] >= amount,
            "Insufficient locked tokens"
        );
        
        // Update locked tokens mapping
        lockedTokens[msg.sender][tokenAddress] -= amount;
        
        // Transfer tokens back to user
        IERC20 token = IERC20(tokenAddress);
        require(
            token.transfer(msg.sender, amount),
            "Transfer failed"
        );
        
        // Emit withdrawal event
        emit TokensWithdrawn(msg.sender, tokenAddress, amount);
    }
}