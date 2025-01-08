// SPDX-License-Identifier: UNLICENSED

pragma solidity >=0.8.0;
// @title Interface for reactive contracts.
// @notice Reactive contracts receive notifications about new events matching the criteria of their event subscriptions.
interface IReactive {
    event Callback(
        uint256 indexed chain_id,
        address indexed _contract,
        uint64 indexed gas_limit,
        bytes payload
    );

    // @notice Entry point for handling new event notifications.
    // @param chain_id EIP155 origin chain ID for the event (as a uint256).
    // @param _contract Address of the originating contract for the received event.
    // @param topic_0 Topic 0 of the event (or 0 for LOG0).
    // @param topic_1 Topic 1 of the event (or 0 for LOG0 and LOG1).
    // @param topic_2 Topic 2 of the event (or 0 for LOG0 .. LOG2).
    // @param topic_3 Topic 3 of the event (or 0 for LOG0 .. LOG3).
    // @param data Event data as a byte array.
    // @param block_number Block number where the log record is located in its chain of origin.
    // @param op_code Number of topics in the log record (0 to 4).
    function react(
        uint256 chain_id,
        address _contract,
        uint256 topic_0,
        uint256 topic_1,
        uint256 topic_2,
        uint256 topic_3,
        bytes calldata data,
        uint256 block_number,
        uint256 op_code
    ) external;
}


interface IPayable {
    // @notice Allows contracts to pay their debts and resume subscriptions.
    receive() external payable;

    // @notice Allows reactive contracts to check their outstanding debt.
    // @param _contract Reactive contract's address.
    function debt(address _contract) external view returns (uint256);
}

interface IPayer {
    // @dev Make sure to check the msg.sender
    function pay(uint256 amount) external;
}

abstract contract AbstractPayer is IPayer {
    IPayable internal vendor;

    constructor() {
    }

    modifier authorizedSenderOnly() {
        require(address(vendor) == address(0) || msg.sender == address(vendor), 'Authorized sender only');
        _;
    }

    function pay(uint256 amount) external authorizedSenderOnly {
        _pay(payable(msg.sender), amount);
    }

    function coverDebt() external {
        uint256 amount = vendor.debt(address(this));
        _pay(payable(vendor), amount);
    }

    function _pay(address payable recipient, uint256 amount) internal {
        require(address(this).balance >= amount, 'Insufficient funds');
        if (amount > 0) {
            (bool success,) = payable(recipient).call{value: amount}(new bytes(0));
            require(success, 'Transfer failed');
        }
    }
}



// @title Interface for event subscription service.
// @notice Reactive contracts receive notifications about new events matching the criteria of their event subscriptions.
interface ISubscriptionService {
    // @notice Subscribes the calling contract to receive events matching the criteria specified.
    // @param chain_id EIP155 origin chain ID for the event (as a uint256), or 0 for all chains.
    // @param _contract Contract address to monitor, or 0 for all contracts.
    // @param topic_0 Topic 0 to monitor, or REACTIVE_IGNORE for all topics.
    // @param topic_1 Topic 1 to monitor, or REACTIVE_IGNORE for all topics.
    // @param topic_2 Topic 2 to monitor, or REACTIVE_IGNORE for all topics.
    // @param topic_3 Topic 3 to monitor, or REACTIVE_IGNORE for all topics.
    // @dev At least one of criteria above must be non-REACTIVE_IGNORE.
    // @dev Will allow duplicate or overlapping subscriptions, clients must ensure idempotency.
    function subscribe(
        uint256 chain_id,
        address _contract,
        uint256 topic_0,
        uint256 topic_1,
        uint256 topic_2,
        uint256 topic_3
    ) external;

    // @notice Removes active subscription of the calling contract, matching the criteria specified, if one exists.
    // @param chain_id Chain ID criterion of the original subscription.
    // @param _contract Contract address criterion of the original subscription.
    // @param topic_0 Topic 0 criterion of the original subscription.
    // @param topic_1 Topic 0 criterion of the original subscription.
    // @param topic_2 Topic 0 criterion of the original subscription.
    // @param topic_3 Topic 0 criterion of the original subscription.
    // @dev This is very expensive.
    function unsubscribe(
        uint256 chain_id,
        address _contract,
        uint256 topic_0,
        uint256 topic_1,
        uint256 topic_2,
        uint256 topic_3
    ) external;
}

interface ISystemContract is IPayable, ISubscriptionService {
}


abstract contract AbstractReactive is IReactive, AbstractPayer {
    uint256 internal constant REACTIVE_IGNORE = 0xa65f96fc951c35ead38878e0f0b7a3c744a6f5ccc1476b313353ce31712313ad;
    ISystemContract internal constant SERVICE_ADDR = ISystemContract(payable(0x0000000000000000000000000000000000fffFfF));

    /**
     * Indicates whether this is a ReactVM instance of the contract.
     */
    bool internal vm;

    ISystemContract internal service;

    constructor() {
        vendor = service = SERVICE_ADDR;
    }

    modifier rnOnly() {
        // require(!vm, 'Reactive Network only');
        _;
    }

    modifier vmOnly() {
        // require(vm, 'VM only');
        _;
    }

    modifier sysConOnly() {
        require(msg.sender == address(service), 'System contract only');
        _;
    }

    function detectVm() internal {
        bytes memory payload = abi.encodeWithSignature("ping()");
        (bool result,) = address(service).call(payload);
        vm = !result;
    }
}


abstract contract AbstractPausableReactive is IReactive, AbstractReactive {
    struct Subscription{
        uint256 chain_id;
        address _contract;
        uint256 topic_0;
        uint256 topic_1;
        uint256 topic_2;
        uint256 topic_3;
    }

    address internal owner;
    bool internal paused;

    constructor() {
        owner = msg.sender;
    }

    function getPausableSubscriptions() virtual internal view returns (Subscription[] memory);

    modifier onlyOwner() {
        require(msg.sender == owner, 'Unauthorized');
        _;
    }

    function pause() external rnOnly onlyOwner {
        require(!paused, 'Already paused');
        Subscription[] memory subscriptions = getPausableSubscriptions();
        for (uint256 ix = 0; ix != subscriptions.length; ++ix) {
            service.unsubscribe(
                subscriptions[ix].chain_id,
                subscriptions[ix]._contract,
                subscriptions[ix].topic_0,
                subscriptions[ix].topic_1,
                subscriptions[ix].topic_2,
                subscriptions[ix].topic_3
            );
        }
        paused = true;
    }

    function resume() external rnOnly onlyOwner {
        require(paused, 'Not paused');
        Subscription[] memory subscriptions = getPausableSubscriptions();
        for (uint256 ix = 0; ix != subscriptions.length; ++ix) {
            service.subscribe(
                subscriptions[ix].chain_id,
                subscriptions[ix]._contract,
                subscriptions[ix].topic_0,
                subscriptions[ix].topic_1,
                subscriptions[ix].topic_2,
                subscriptions[ix].topic_3
            );
        }
        paused = false;
    }
}

contract TokenBridgeReactive is AbstractPausableReactive {
    // Chain and contract constants
    uint256 private constant ORIGIN_CHAIN_ID = 11155111;
    uint256 private constant DESTINATION_CHAIN_ID = 5318008;
    address private constant ORIGIN_CONTRACT = 0x2B382312d63696c34C58257Ff7C6fB7A88ab68cE;
    address private constant DESTINATION_CONTRACT = 0x01F7e833bc688420c712F15c4C9FE455620d57c3;
    uint64 private constant CALLBACK_GAS_LIMIT = 3000000;

    // Event topic constants
    uint256 private constant EVENT_0_TOPIC_0 = 0x52d1932b2d8d6a97999f213ba0781cd05860c8ce4b35baf9b72ce2c17c101848;

    constructor() {
        
        paused = false;
        
        // Subscribe to all events
        
        bytes memory payload_0 = abi.encodeWithSignature(
            "subscribe(uint256,address,uint256,uint256,uint256,uint256)",
            ORIGIN_CHAIN_ID,
            ORIGIN_CONTRACT,
            EVENT_0_TOPIC_0,
            REACTIVE_IGNORE,
            REACTIVE_IGNORE,
            REACTIVE_IGNORE
        );
        (bool subscription_result_0,) = address(service).call(payload_0);
        vm = !subscription_result_0;
    }

    receive() external payable {}

    
    function getPausableSubscriptions() override internal pure returns (Subscription[] memory) {
        Subscription[] memory result = new Subscription[](1);
        
        result[0] = Subscription(
            ORIGIN_CHAIN_ID,
            ORIGIN_CONTRACT,
            EVENT_0_TOPIC_0,
            REACTIVE_IGNORE,
            REACTIVE_IGNORE,
            REACTIVE_IGNORE
        );
        return result;
    }

    function react(
        uint256 /*chain_id*/,
        address /*_contract*/,
        uint256 topic_0,
        uint256 topic_1,
        uint256 topic_2,
        uint256 topic_3,
        bytes calldata /*data*/,
        uint256 /*block_number*/,
        uint256 /*op_code*/
    ) external vmOnly {
        
        if (topic_0 == 0x52d1932b2d8d6a97999f213ba0781cd05860c8ce4b35baf9b72ce2c17c101848) {
          // Call the destination contract with decoded parameters
          bytes memory payload = abi.encodeWithSignature(
            "mintTokens(address,address,address,uint256)",
            address(0), address(uint160(topic_1)), address(uint160(topic_2)), topic_3
          );
          emit Callback(DESTINATION_CHAIN_ID, DESTINATION_CONTRACT, CALLBACK_GAS_LIMIT, payload);
        }
    }
    }