// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import 'lib/reactive-lib/src/abstract-base/AbstractCallback.sol';

contract User_Data is AbstractCallback {
    // Struct to store user data
    struct UserData {
        address userAddress;
        address originToken;
        address destinationToken;
        uint256 amount;
    }

    // Mapping from user address to their data
    mapping(address => UserData) public userData;

    // Event for data updates
    event UserDataUpdated(
        address indexed user,
        address originToken,
        address destinationToken,
        uint256 amount
    );

    /**
     * @dev Stores or updates user data
     * @param _originToken Address of the origin token
     * @param _destinationToken Address of the destination token
     * @param _amount Amount of tokens
     */
    function setUserData(
        address user,
        address _originToken,
        address _destinationToken,
        uint256 _amount
    ) external {
        userData[user] = UserData({
            userAddress: user,
            originToken: _originToken,
            destinationToken: _destinationToken,
            amount: _amount
        });

        emit UserDataUpdated(
            user,
            _originToken,
            _destinationToken,
            _amount
        );
    }

    /**
     * @dev Retrieves user data
     * @param _user Address of the user
     * @return UserData struct containing user's data
     */
    function getUserData(address _user) 
        external 
        view 
        returns (UserData memory) 
    {
        return userData[_user];
    }

    receive() external payable {}
}