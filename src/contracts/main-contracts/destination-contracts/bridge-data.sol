// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import 'lib/reactive-lib/src/abstract-base/AbstractCallback.sol';
import 'src/contracts/main-contracts/bridge-erc20.sol';

contract RecordKeeper is AbstractCallback {
    
    struct BridgeRecord {
        address user;
        address originToken;
        address destinationToken;
        uint256 amountLocked;
        uint256 amountBurned;
        bool isActive;
    }
    
    mapping(address => BridgeRecord[]) public userRecords;
    mapping(address => mapping(address => uint256)) public totalLockedAmount;
    
    event RecordUpdated(
        address indexed user,
        address indexed originToken,
        address indexed destinationToken,
        uint256 amountLocked
    );
    
    event TokensBurned(
        address indexed user,
        address indexed originToken,
        uint256 indexed amount
    );
    
    constructor(address callbackAddress) AbstractCallback(callbackAddress) payable {
    }
    
    function updateRecord(
        address /*spender*/,
        address user,
        address originToken,
        address destinationToken,
        uint256 amountLocked
    ) external {
        require(user != address(0), "Invalid user address");
        require(originToken != address(0), "Invalid origin token");
        require(destinationToken != address(0), "Invalid destination token");
        require(amountLocked > 0, "Amount must be greater than 0");
        
        totalLockedAmount[user][originToken] += amountLocked;
        
        BridgeRecord memory newRecord = BridgeRecord({
            user: user,
            originToken: originToken,
            destinationToken: destinationToken,
            amountLocked: amountLocked,
            amountBurned: 0,
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
                records[i].destinationToken == destinationToken &&
                records[i].amountLocked >= (records[i].amountBurned + amount)) {
                return true;
            }
        }
        
        return false;
    }

    function burnTokens(
        address burningToken,
        uint256 amount
    ) external {
        address user = msg.sender;
        require(burningToken != address(0), "Invalid token address");
        require(amount > 0, "Amount must be greater than 0");

        BridgeRecord[] storage records = userRecords[user];
        bool isValid = false;
        uint256 validRecordIndex;

        // Changed to check destination token instead of origin token
        for (uint256 i = 0; i < records.length; i++) {
            if (records[i].isActive && 
                records[i].destinationToken == burningToken &&  // Changed this line
                records[i].amountLocked >= (records[i].amountBurned + amount)) {
                isValid = true;
                validRecordIndex = i;
                break;
            }
        }

        require(isValid, "No valid record found or insufficient balance");

        // Try to burn the tokens
        try BridgeToken(burningToken).burn(user, amount) {
            // Update the record after successful burn
            records[validRecordIndex].amountBurned += amount;
            totalLockedAmount[user][records[validRecordIndex].originToken] -= amount;  // Updated this line
            
            // Mark as inactive if fully burned
            if (records[validRecordIndex].amountBurned >= records[validRecordIndex].amountLocked) {
                records[validRecordIndex].isActive = false;
            }

            emit TokensBurned(user, records[validRecordIndex].originToken, amount);
        } catch {
            revert("Token burn failed");
        }
    }
    
    function getUserRecords(address user) external view returns (BridgeRecord[] memory) {
        return userRecords[user];
    }
    
    function getTotalLockedAmount(address user, address token) external view returns (uint256) {
        return totalLockedAmount[user][token];
    }
}