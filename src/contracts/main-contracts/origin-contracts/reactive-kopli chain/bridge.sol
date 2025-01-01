// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "lib/openzeppelin-contracts/contracts/interfaces/IERC20.sol";
import "lib/openzeppelin-contracts/contracts/utils/ReentrancyGuard.sol";
import "src/contracts/reactive-smart-contracts/approval-service/IApprovalClient.sol";
import "src/contracts/reactive-smart-contracts/approval-service/ApprovalService.sol";

contract Bridge is ReentrancyGuard, IApprovalClient {
    // Owner of the contract
    address public immutable owner;
    
    // Approval service instance
    ApprovalService private immutable service;
    
    // Mapping to track locked tokens for each user
    mapping(address => mapping(address => uint256)) public lockedTokens;
    
    // Mapping of origin token to destination token
    mapping(address => address) public tokenPairs;
    
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
    
    // Event emitted when token pair is set
    event TokenPairSet(
        address indexed originToken,
        address indexed destinationToken
    );
    
    constructor(ApprovalService service_) {
        owner = msg.sender;
        service = service_;
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    modifier onlyService() {
        require(msg.sender == address(service), "Not authorized");
        _;
    }
    
    function subscribe() external onlyOwner {
        uint256 subscription_fee = service.subscription_fee();
        require(subscription_fee <= address(this).balance, "Insufficient funds for subscription");
        service.subscribe{value: subscription_fee}();
    }
    
    function unsubscribe() external onlyOwner {
        service.unsubscribe();
    }

    // Implement IApprovalClient interface
    function onApproval(
        address approver,
        address approved_token,
        uint256 amount
    ) external override onlyService {
        // Check if token pair exists
        require(tokenPairs[approved_token] != address(0), "Token pair not configured");
        
        // Get the destination token
        address destinationToken = tokenPairs[approved_token];
        
        // Execute bridge logic
        IERC20 token = IERC20(approved_token);
        
        // Verify allowance matches the reported amount
        require(
            token.allowance(approver, address(this)) == amount,
            "Approval amount mismatch"
        );
        
        // Transfer tokens from user to contract
        require(
            token.transferFrom(approver, address(this), amount),
            "Transfer failed"
        );
        
        // Update locked tokens mapping
        lockedTokens[approver][approved_token] += amount;
        
        // Emit bridge event
        emit TokensBridged(approver, destinationToken, amount, approved_token);
    }
    
    function settle(
        uint256 amount
    ) external override onlyService {
        require(amount <= address(this).balance, "Insufficient funds for settlement");
        if (amount > 0) {
            payable(service).transfer(amount);
        }
    }
    
    /**
     * @dev Sets or updates a token pair mapping
     */
    function setTokenPair(
        address originToken,
        address destinationToken
    ) external onlyOwner {
        require(originToken != address(0), "Invalid origin token");
        require(destinationToken != address(0), "Invalid destination token");
        require(originToken != destinationToken, "Tokens must be different");
        
        tokenPairs[originToken] = destinationToken;
        emit TokenPairSet(originToken, destinationToken);
    }
    
    /**
     * @dev Removes a token pair mapping
     */
    function removeTokenPair(address originToken) external onlyOwner {
        require(tokenPairs[originToken] != address(0), "Pair doesn't exist");
        delete tokenPairs[originToken];
    }
    
    /**
     * @dev Withdraws tokens back to user
     */
    function withdraw(
        address tokenAddress,
        uint256 amount
    ) external nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        require(tokenAddress != address(0), "Invalid token address");
        
        require(
            lockedTokens[msg.sender][tokenAddress] >= amount,
            "Insufficient locked tokens"
        );
        
        lockedTokens[msg.sender][tokenAddress] -= amount;
        
        IERC20 token = IERC20(tokenAddress);
        require(
            token.transfer(msg.sender, amount),
            "Transfer failed"
        );
        
        emit TokensWithdrawn(msg.sender, tokenAddress, amount);
    }
    
    function getDestinationToken(address originToken) external view returns (address) {
        return tokenPairs[originToken];
    }

    receive() external payable {
    }
}