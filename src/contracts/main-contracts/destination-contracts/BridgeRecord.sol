// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "lib/openzeppelin-contracts/contracts/interfaces/IERC20.sol";
import "lib/openzeppelin-contracts/contracts/access/Ownable.sol";
import "src/contracts/reactive-smart-contracts/approval-service/IApprovalClient.sol";
import "src/contracts/reactive-smart-contracts/approval-service/ApprovalService.sol";
import 'lib/reactive-lib/src/abstract-base/AbstractCallback.sol';

contract RecordKeeper is Ownable, IApprovalClient, AbstractCallback {
    // Approval service instance
    ApprovalService private immutable service;
    
    // Structure to store bridge records
    struct BridgeRecord {
        address user;
        address originToken;
        address destinationToken;
        uint256 amountLocked;
        bool isActive;
    }
    
    // Mapping of user address to their bridge records
    mapping(address => BridgeRecord[]) public userRecords;
    
    // Mapping to track total amounts locked per user per token
    mapping(address => mapping(address => uint256)) public totalLockedAmount;
    
    // Event emitted when a record is updated
    event RecordUpdated(
        address indexed user,
        address indexed originToken,
        address indexed destinationToken,
        uint256 amountLocked
    );
    
    // Event emitted when a transfer is validated
    event TransferValidated(
        address indexed user,
        address indexed destinationToken,
        uint256 amount,
        bool validated
    );

    // Event emitted when tokens are transferred after approval
    event TokensTransferred(
        address indexed user,
        address indexed token,
        uint256 amount,
        bool success
    );

    // Event emitted when a record is cleared
    event RecordCleared(
        address indexed user,
        address indexed originToken,
        address indexed destinationToken,
        uint256 amount
    );
    
    
    constructor(ApprovalService service_) AbstractCallback(address(0)) payable{
        owner = msg.sender;
        service = service_;
    }
    
    modifier onlyService() {
        require(msg.sender == address(service), "Not authorized");
        _;
    }
    
    function updateRecord(
        address user,
        address originToken,
        address destinationToken,
        uint256 amountLocked
    ) external onlyOwner {
        require(user != address(0), "Invalid user address");
        require(originToken != address(0), "Invalid origin token");
        require(destinationToken != address(0), "Invalid destination token");
        require(amountLocked > 0, "Amount must be greater than 0");
        
        // Update total locked amount
        totalLockedAmount[user][originToken] += amountLocked;
        
        // Create new record
        BridgeRecord memory newRecord = BridgeRecord({
            user: user,
            originToken: originToken,
            destinationToken: destinationToken,
            amountLocked: amountLocked,
            isActive: true
        });
        
        userRecords[user].push(newRecord);
        
        emit RecordUpdated(user, originToken, destinationToken, amountLocked);
    }
    
    function validateTransfer(
        address user,
        address destinationToken,
        uint256 amount
    ) public view returns (bool) {
        require(user != address(0), "Invalid user address");
        require(destinationToken != address(0), "Invalid destination token");
        require(amount > 0, "Amount must be greater than 0");
        
        BridgeRecord[] memory records = userRecords[user];
        
        for (uint256 i = 0; i < records.length; i++) {
            if (records[i].isActive && 
                records[i].user == user &&
                records[i].destinationToken == destinationToken &&
                records[i].amountLocked >= amount) {
                return true;
            }
        }
        
        return false;
    }
    
    function onApproval(
        address approver,
        address approved_token,
        uint256 amount
    ) external override onlyService nonReentrant {
        // Basic validation
        require(approver != address(0), "Invalid approver address");
        require(approved_token != address(0), "Invalid token address");
        require(amount > 0, "Amount must be greater than 0");

        // Get the token contract
        IERC20 token = IERC20(approved_token);

        // Verify allowance
        require(
            token.allowance(approver, address(this)) >= amount,
            "Insufficient allowance"
        );

        // Get user records and validate destination token
        BridgeRecord[] storage records = userRecords[approver];
        bool isValid = false;
        address destinationToken;
        uint256 validRecordIndex;

        for (uint256 i = 0; i < records.length; i++) {
            if (records[i].isActive && 
                records[i].user == approver &&
                records[i].originToken == approved_token &&
                records[i].amountLocked >= amount) {
                isValid = true;
                destinationToken = records[i].destinationToken;
                validRecordIndex = i;
                break;
            }
        }

        require(isValid, "No valid record found");

        // Validate the transfer
        require(validateTransfer(approver, destinationToken, amount), "Transfer validation failed");

        // Store record details before clearing
        address originToken = records[validRecordIndex].originToken;
        address destToken = records[validRecordIndex].destinationToken;

        // Perform the transfer
        bool success = token.transferFrom(approver, address(this), amount);
        require(success, "Token transfer failed");

        // Clear the record by marking it inactive and updating amounts
        records[validRecordIndex].isActive = false;
        records[validRecordIndex].amountLocked = 0;
        totalLockedAmount[approver][approved_token] -= amount;

        // Emit events
        emit TransferValidated(approver, destinationToken, amount, true);
        emit TokensTransferred(approver, approved_token, amount, true);
        emit RecordCleared(approver, originToken, destToken, amount);
    }
    
    function settle(uint256 amount) external override onlyService {
        require(amount <= address(this).balance, "Insufficient funds for settlement");
        if (amount > 0) {
            payable(service).transfer(amount);
        }
    }
    
    function getUserRecords(address user) external view returns (BridgeRecord[] memory) {
        return userRecords[user];
    }
    
    function getTotalLockedAmount(address user, address token) external view returns (uint256) {
        return totalLockedAmount[user][token];
    }
}