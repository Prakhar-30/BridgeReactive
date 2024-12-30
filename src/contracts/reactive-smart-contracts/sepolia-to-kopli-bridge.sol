// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "lib/reactive-lib/src/interfaces/IReactive.sol";
import "lib/reactive-lib/src/abstract-base/AbstractReactive.sol";
import "lib/reactive-lib/src/interfaces/ISystemContract.sol";

contract TokenBridgeReactive is IReactive, AbstractReactive {
    // Chain IDs
    uint256 private constant SEPOLIA_CHAIN_ID = 11155111;  // Source chain
    uint256 private constant KOPLI_CHAIN_ID = 5318008;    // Destination chain
    uint64 private constant GAS_LIMIT = 1000000;
    
    // State specific to reactive network instance of the contract
    address private _callback;

    constructor(address _service, address _contract, address callback) {
        service = ISystemContract(payable(_service));
        
        // Subscribe to TokensBridged event on Sepolia
        bytes memory payload = abi.encodeWithSignature(
            "subscribe(uint256,address,uint256,uint256,uint256,uint256)",
            SEPOLIA_CHAIN_ID,  // Changed to SEPOLIA_CHAIN_ID to listen on the source chain
            _contract,
            uint256(keccak256("TokensBridged(address,address,uint256,address)")),
            REACTIVE_IGNORE,
            REACTIVE_IGNORE,
            REACTIVE_IGNORE
        );
        
        (bool subscription_result,) = address(service).call(payload);
        vm = !subscription_result;
        _callback = callback;
    }

    // Implement the react function using LogRecord struct
    function react(LogRecord calldata log) external override vmOnly {
        // Prepare the mintTokens function call
        bytes memory payload = abi.encodeWithSignature(
            "mintTokens(address,address,address,uint256)",
            address(0),  // spender (not used in mintTokens)
            address(uint160(log.topic_2)),  // destination token address
            address(uint160(log.topic_1)),  // user address
            log.topic_3  // amount
        );

        // Emit callback to trigger token minting on Kopli
        emit Callback(KOPLI_CHAIN_ID, _callback, GAS_LIMIT, payload);
    }

    // Testing helper functions
    function subscribe(address _contract) external {
        service.subscribe(
            SEPOLIA_CHAIN_ID,  // Changed to SEPOLIA_CHAIN_ID
            _contract,
            uint256(keccak256("TokensBridged(address,address,uint256,address)")),
            REACTIVE_IGNORE,
            REACTIVE_IGNORE,
            REACTIVE_IGNORE
        );
    }

    function unsubscribe(address _contract) external {
        service.unsubscribe(
            SEPOLIA_CHAIN_ID,  // Changed to SEPOLIA_CHAIN_ID
            _contract,
            uint256(keccak256("TokensBridged(address,address,uint256,address)")),
            REACTIVE_IGNORE,
            REACTIVE_IGNORE,
            REACTIVE_IGNORE
        );
    }

    function pretendVm() external {
        vm = true;
    }
}