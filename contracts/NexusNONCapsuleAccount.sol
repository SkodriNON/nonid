// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface IERC20 {
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
}

interface IERC721Receiver {
    function onERC721Received(
        address operator,
        address from,
        uint256 tokenId,
        bytes calldata data
    ) external returns (bytes4);
}

contract NexusNONCapsuleAccount is IERC721Receiver, ReentrancyGuard {
    address public immutable genesis;
    uint256 public immutable capsuleId;

    event Received(address indexed from, uint256 amount);
    event ERC20Transferred(address indexed token, address indexed to, uint256 amount);
    event Executed(address indexed target, uint256 value, bytes32 indexed dataHash);

    modifier onlyGenesis() {
        require(msg.sender == genesis, "ONLY_GENESIS");
        _;
    }

    constructor(address _genesis, uint256 _capsuleId) {
        require(_genesis != address(0), "INVALID_GENESIS");
        require(_capsuleId > 0, "INVALID_CAPSULE_ID");

        genesis = _genesis;
        capsuleId = _capsuleId;
    }

    receive() external payable {
        emit Received(msg.sender, msg.value);
    }

    function onERC721Received(
        address,
        address,
        uint256,
        bytes calldata
    ) external pure override returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }

    function tokenBalance(address token) external view returns (uint256) {
        require(token != address(0), "INVALID_TOKEN");
        return IERC20(token).balanceOf(address(this));
    }

    function transferERC20(
        address token,
        address to,
        uint256 amount
    ) external onlyGenesis nonReentrant {
        require(token != address(0), "INVALID_TOKEN");
        require(to != address(0), "INVALID_TO");
        require(amount > 0, "INVALID_AMOUNT");

        require(IERC20(token).transfer(to, amount), "TRANSFER_FAILED");

        emit ERC20Transferred(token, to, amount);
    }

    function execute(
        address target,
        uint256 value,
        bytes calldata data
    ) external onlyGenesis nonReentrant returns (bytes memory result) {
        require(target != address(0), "INVALID_TARGET");
        require(address(this).balance >= value, "INSUFFICIENT_NATIVE");

        (bool ok, bytes memory res) = target.call{value: value}(data);

        require(ok, "EXECUTION_FAILED");

        emit Executed(target, value, keccak256(data));

        return res;
    }
}