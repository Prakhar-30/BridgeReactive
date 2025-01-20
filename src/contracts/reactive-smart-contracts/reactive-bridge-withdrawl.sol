// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import 'lib/reactive-lib/src/abstract-base/AbstractReactive.sol';
import 'lib/reactive-lib/src/interfaces/ISubscriptionService.sol';
import 'lib/reactive-lib/src/interfaces/IReactive.sol';

contract BRIDGE_SEPO_TO_KOPLI is AbstractReactive {
    uint256 private constant ORIGIN_CHAIN_ID = 5318008;
    uint256 private constant DESTINATION_CHAIN_ID = 11155111;
    uint64 private constant CALLBACK_GAS_LIMIT = 3000000;
    uint256 private constant TOKENS_WITHDRAWAL_TOPIC = 0xbd44e2822c2eeff147cacf9e502f4cef52db0dfe061ef7bfb9d48196e25a6c78;
    
    address private immutable origin_contract;
    address private immutable destination_contract;
    
    event SubscriptionStatus(bool success);

    constructor(address Origin_Contract, address Destination_Contract) {
        origin_contract = Origin_Contract;
        destination_contract = Destination_Contract;
        
        if (!vm) {
            try service.subscribe(
                ORIGIN_CHAIN_ID,
                Origin_Contract,
                TOKENS_WITHDRAWAL_TOPIC,
                REACTIVE_IGNORE,
                REACTIVE_IGNORE,
                REACTIVE_IGNORE
            ) {
                emit SubscriptionStatus(true);
            } catch {
                emit SubscriptionStatus(false);
            }
        }
    }

    function react(LogRecord calldata log) external override vmOnly {
        require(log.chain_id == ORIGIN_CHAIN_ID, "Wrong chain");
        require(log._contract == origin_contract, "Wrong contract");
        
        bytes memory payload_callback = abi.encodeWithSignature(
            "withdraw(address,address,address,uint256)",
            address(0),
            address(uint160(log.topic_1)),
            address(uint160(log.topic_2)),
            log.topic_3
        );

        emit Callback(
            DESTINATION_CHAIN_ID,
            destination_contract,
            CALLBACK_GAS_LIMIT,
            payload_callback
        );
    }
}
