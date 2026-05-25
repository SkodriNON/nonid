// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract NONGenesisNFT is ERC721 {

    string private constant NFT_URI =
        "ipfs://bafybeicno4ptso36my5tcel7pgz3n2ieir2xvdgym7npugygl2favbef3y";

    uint256 private nextId = 1;

    struct Identity {

        uint256 nftId;

        string noniId;

        bytes32 passwordHash;

        uint256 createdAt;

        bool active;

        uint256 nonce;
    }

    mapping(uint256 => Identity)
        private identities;

    mapping(string => bool)
        private noniExists;

    mapping(uint256 => bool)
        public sessionActive;

    mapping(uint256 => uint256)
        public internalBalance;

    event IdentityCreated(
        uint256 indexed nftId,
        string noniId,
        address owner
    );

    constructor()
        ERC721(
            "NONI Constitutional Identity",
            "NONI"
        )
    {}

    function createIdentity(
        string memory noniId,
        string memory password
    )
        external
    {
        require(
            !noniExists[noniId],
            "NONI ID exists"
        );

        uint256 id = nextId;

        nextId++;

        _safeMint(
            msg.sender,
            id
        );

        identities[id] = Identity({

            nftId: id,

            noniId: noniId,

            passwordHash:
                keccak256(
                    abi.encodePacked(
                        password
                    )
                ),

            createdAt:
                block.timestamp,

            active: true,

            nonce: 0
        });

        noniExists[noniId] = true;

        emit IdentityCreated(
            id,
            noniId,
            msg.sender
        );
    }

    function login(
        uint256 nftId,
        string memory password
    )
        external
    {
        require(
            ownerOf(nftId) ==
            msg.sender,
            "Not NFT owner"
        );

        require(
            identities[nftId]
                .passwordHash ==
            keccak256(
                abi.encodePacked(
                    password
                )
            ),
            "Wrong password"
        );

        sessionActive[nftId] = true;
    }

    function logout(
        uint256 nftId
    )
        external
    {
        require(
            ownerOf(nftId) ==
            msg.sender,
            "Not owner"
        );

        sessionActive[nftId] = false;
    }

    function mintTestBalance(
        uint256 nftId,
        uint256 amount
    )
        external
    {
        require(
            ownerOf(nftId) ==
            msg.sender,
            "Not owner"
        );

        internalBalance[nftId]
            += amount;
    }

    function transferInternal(
        uint256 fromId,
        uint256 toId,
        uint256 amount
    )
        external
    {
        require(
            ownerOf(fromId) ==
            msg.sender,
            "Not owner"
        );

        require(
            sessionActive[fromId],
            "Login required"
        );

        require(
            internalBalance[fromId]
                >= amount,
            "Low balance"
        );

        internalBalance[fromId]
            -= amount;

        internalBalance[toId]
            += amount;

        identities[fromId]
            .nonce++;
    }

    function getIdentity(
        uint256 nftId
    )
        external
        view
        returns (
            uint256,
            string memory,
            uint256,
            bool,
            uint256,
            uint256
        )
    {
        Identity memory i =
            identities[nftId];

        return (
            i.nftId,
            i.noniId,
            i.createdAt,
            i.active,
            i.nonce,
            internalBalance[nftId]
        );
    }

    function tokenURI(
        uint256
    )
        public
        pure
        override
        returns (
            string memory
        )
    {
        return NFT_URI;
    }
}


