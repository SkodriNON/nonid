// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

import "./NexusNONCapsuleAccount.sol";

interface IERC20View {
    function balanceOf(address account) external view returns (uint256);
}

contract NexusNONGenesis is ERC721, Ownable, ReentrancyGuard {
    string public constant VERSION = "NexusNON Genesis Mainnet Candidate";
    uint256 public constant CREATOR_CAPSULE_ID = 1;

    uint256 public nextCapsuleId = 1;

    address public feeVault;
    address public usdtToken;
    address public nonToken;
    address public arbToken;

    bool public feesEnabled = true;

    uint256 public activationFeeUSDT = 1e6;
    uint256 public recoveryFeeUSDT = 1e6;

    uint256 public activationFeeNON = 0;
    uint256 public recoveryFeeNON = 0;

    uint256 public activationFeeARB = 0;
    uint256 public recoveryFeeARB = 0;

    enum CapsuleType {
        INDIVIDUAL,
        DEVELOPER,
        BUSINESS,
        CREATOR,
        PROTOCOL
    }

    enum CapsuleStatus {
        NONE,
        PENDING_ACTIVATION,
        ACTIVE,
        LOCKED,
        RECOVERY,
        REVOKED
    }

    enum FeeToken {
        USDT,
        NON,
        ARB
    }

    enum IdentityCheckResult {
        CAPSULE_NOT_FOUND,
        PHONE_NOT_MATCHED,
        EMAIL_NOT_MATCHED,
        EMAIL_PHONE_CONFLICT,
        ANTI_PHISHING_NOT_MATCHED,
        MATCHED
    }

    struct Capsule {
        uint256 id;
        CapsuleType capsuleType;
        CapsuleStatus status;
        address capsuleWallet;

        bytes32 emailHash;
        bytes32 phoneHash;
        bytes32 antiPhishingHash;

        bytes encryptedEmail;
        bytes encryptedPhone;
        bytes encryptedName;

        bytes32 pinProofHash;
        bytes32 pukProofHash;
        bytes32 pupProofHash;

        uint256 createdAt;
        uint256 activatedAt;
        uint256 updatedAt;
        uint256 nonce;
    }

    mapping(uint256 => Capsule) private capsules;
    mapping(bytes32 => uint256) private emailHashToCapsule;
    mapping(bytes32 => uint256) private phoneHashToCapsule;
    mapping(address => uint256) public walletToCapsule;
    mapping(uint256 => mapping(bytes32 => bool)) public authorizations;
    mapping(address => bool) public trustedOperators;

    event CapsuleCreated(
        uint256 indexed capsuleId,
        address indexed capsuleWallet,
        CapsuleType capsuleType
    );

    event CreatorCapsuleCreated(
        uint256 indexed capsuleId,
        address indexed capsuleWallet
    );

    event PUPActivated(uint256 indexed capsuleId);
    event PUPRecovered(uint256 indexed capsuleId);
    event CapsuleLocked(uint256 indexed capsuleId);
    event CapsuleUnlocked(uint256 indexed capsuleId);

    event IdentityProofsUpdated(
        uint256 indexed capsuleId,
        bytes32 indexed emailHash,
        bytes32 indexed phoneHash
    );

    event AuthorizationSet(
        uint256 indexed capsuleId,
        bytes32 indexed authorization,
        bool active
    );

    event TrustedOperatorSet(address indexed operator, bool active);
    event FeeVaultUpdated(address indexed feeVault);

    event TokensUpdated(
        address indexed usdtToken,
        address indexed nonToken,
        address indexed arbToken
    );

    event FeesUpdated(
        uint256 activationFeeUSDT,
        uint256 recoveryFeeUSDT,
        uint256 activationFeeNON,
        uint256 recoveryFeeNON,
        uint256 activationFeeARB,
        uint256 recoveryFeeARB
    );

    event FeesEnabledUpdated(bool enabled);

    constructor(
        address _feeVault,
        address _usdtToken,
        address _nonToken,
        address _arbToken
    )
        ERC721("NexusNON Identity Capsule", "NONID")
        Ownable(msg.sender)
    {
        require(_feeVault != address(0), "INVALID_FEE_VAULT");

        feeVault = _feeVault;
        usdtToken = _usdtToken;
        nonToken = _nonToken;
        arbToken = _arbToken;

        trustedOperators[msg.sender] = true;

        emit TrustedOperatorSet(msg.sender, true);
        emit FeeVaultUpdated(_feeVault);
        emit TokensUpdated(_usdtToken, _nonToken, _arbToken);
    }

    modifier onlyOperator() {
        require(trustedOperators[msg.sender], "ONLY_OPERATOR");
        _;
    }

    modifier capsuleExists(uint256 capsuleId) {
        require(_ownerOf(capsuleId) != address(0), "CAPSULE_NOT_FOUND");
        _;
    }

    modifier onlyActive(uint256 capsuleId) {
        require(capsules[capsuleId].status == CapsuleStatus.ACTIVE, "CAPSULE_NOT_ACTIVE");
        _;
    }

    function createCapsule(
        bytes32 emailHash,
        bytes32 phoneHash,
        bytes32 antiPhishingHash,
        bytes calldata encryptedEmail,
        bytes calldata encryptedPhone,
        bytes calldata encryptedName,
        CapsuleType capsuleType
    )
        external
        onlyOperator
        nonReentrant
        returns (uint256 capsuleId, address capsuleWallet)
    {
        require(emailHash != bytes32(0), "INVALID_EMAIL_HASH");
        require(phoneHash != bytes32(0), "INVALID_PHONE_HASH");
        require(antiPhishingHash != bytes32(0), "INVALID_ANTI_PHISHING_HASH");

        require(emailHashToCapsule[emailHash] == 0, "EMAIL_ALREADY_USED");
        require(phoneHashToCapsule[phoneHash] == 0, "PHONE_ALREADY_USED");

        capsuleId = nextCapsuleId;
        nextCapsuleId++;

        CapsuleType finalCapsuleType = capsuleType;

        if (capsuleId == CREATOR_CAPSULE_ID) {
            finalCapsuleType = CapsuleType.CREATOR;
        }

        bytes32 salt = keccak256(
            abi.encodePacked(
                address(this),
                capsuleId,
                emailHash,
                phoneHash,
                block.chainid
            )
        );

        NexusNONCapsuleAccount account =
            new NexusNONCapsuleAccount{salt: salt}(
                address(this),
                capsuleId
            );

        capsuleWallet = address(account);

        _safeMint(capsuleWallet, capsuleId);

        capsules[capsuleId] = Capsule({
            id: capsuleId,
            capsuleType: finalCapsuleType,
            status: CapsuleStatus.PENDING_ACTIVATION,
            capsuleWallet: capsuleWallet,

            emailHash: emailHash,
            phoneHash: phoneHash,
            antiPhishingHash: antiPhishingHash,

            encryptedEmail: encryptedEmail,
            encryptedPhone: encryptedPhone,
            encryptedName: encryptedName,

            pinProofHash: bytes32(0),
            pukProofHash: bytes32(0),
            pupProofHash: bytes32(0),

            createdAt: block.timestamp,
            activatedAt: 0,
            updatedAt: block.timestamp,
            nonce: 0
        });

        emailHashToCapsule[emailHash] = capsuleId;
        phoneHashToCapsule[phoneHash] = capsuleId;
        walletToCapsule[capsuleWallet] = capsuleId;

        emit CapsuleCreated(
            capsuleId,
            capsuleWallet,
            finalCapsuleType
        );

        if (capsuleId == CREATOR_CAPSULE_ID) {
            feeVault = capsuleWallet;

            emit FeeVaultUpdated(capsuleWallet);

            emit CreatorCapsuleCreated(
                capsuleId,
                capsuleWallet
            );
        }
    }

    function activatePUP(
        uint256 capsuleId,
        bytes32 pinProofHash,
        bytes32 pukProofHash,
        bytes32 pupProofHash,
        FeeToken feeToken
    )
        external
        onlyOperator
        capsuleExists(capsuleId)
        nonReentrant
    {
        Capsule storage c = capsules[capsuleId];

        require(c.status == CapsuleStatus.PENDING_ACTIVATION, "NOT_PENDING");
        require(pinProofHash != bytes32(0), "INVALID_PIN_PROOF");
        require(pukProofHash != bytes32(0), "INVALID_PUK_PROOF");
        require(pupProofHash != bytes32(0), "INVALID_PUP_PROOF");

        _chargeFee(
            c.capsuleWallet,
            feeToken,
            false
        );

        c.pinProofHash = pinProofHash;
        c.pukProofHash = pukProofHash;
        c.pupProofHash = pupProofHash;
        c.status = CapsuleStatus.ACTIVE;
        c.activatedAt = block.timestamp;
        c.updatedAt = block.timestamp;

        emit PUPActivated(capsuleId);
    }

    function recoverPUP(
        uint256 capsuleId,
        bytes32 newPinProofHash,
        bytes32 newPukProofHash,
        bytes32 newPupProofHash,
        FeeToken feeToken
    )
        external
        onlyOperator
        capsuleExists(capsuleId)
        nonReentrant
    {
        Capsule storage c = capsules[capsuleId];

        require(
            c.status == CapsuleStatus.ACTIVE ||
            c.status == CapsuleStatus.LOCKED,
            "INVALID_STATUS"
        );

        require(newPinProofHash != bytes32(0), "INVALID_PIN_PROOF");
        require(newPukProofHash != bytes32(0), "INVALID_PUK_PROOF");
        require(newPupProofHash != bytes32(0), "INVALID_PUP_PROOF");

        _chargeFee(
            c.capsuleWallet,
            feeToken,
            true
        );

        c.pinProofHash = newPinProofHash;
        c.pukProofHash = newPukProofHash;
        c.pupProofHash = newPupProofHash;
        c.status = CapsuleStatus.ACTIVE;
        c.updatedAt = block.timestamp;
        c.nonce++;

        emit PUPRecovered(capsuleId);
    }

    function updateIdentityProofs(
        uint256 capsuleId,
        bytes32 newEmailHash,
        bytes32 newPhoneHash,
        bytes32 newAntiPhishingHash,
        bytes calldata newEncryptedEmail,
        bytes calldata newEncryptedPhone,
        bytes calldata newEncryptedName
    )
        external
        onlyOperator
        capsuleExists(capsuleId)
        onlyActive(capsuleId)
    {
        require(newEmailHash != bytes32(0), "INVALID_EMAIL_HASH");
        require(newPhoneHash != bytes32(0), "INVALID_PHONE_HASH");
        require(newAntiPhishingHash != bytes32(0), "INVALID_ANTI_PHISHING_HASH");

        Capsule storage c = capsules[capsuleId];

        uint256 emailOwner = emailHashToCapsule[newEmailHash];
        uint256 phoneOwner = phoneHashToCapsule[newPhoneHash];

        require(emailOwner == 0 || emailOwner == capsuleId, "EMAIL_ALREADY_USED");
        require(phoneOwner == 0 || phoneOwner == capsuleId, "PHONE_ALREADY_USED");

        delete emailHashToCapsule[c.emailHash];
        delete phoneHashToCapsule[c.phoneHash];

        c.emailHash = newEmailHash;
        c.phoneHash = newPhoneHash;
        c.antiPhishingHash = newAntiPhishingHash;

        c.encryptedEmail = newEncryptedEmail;
        c.encryptedPhone = newEncryptedPhone;
        c.encryptedName = newEncryptedName;

        c.updatedAt = block.timestamp;
        c.nonce++;

        emailHashToCapsule[newEmailHash] = capsuleId;
        phoneHashToCapsule[newPhoneHash] = capsuleId;

        emit IdentityProofsUpdated(
            capsuleId,
            newEmailHash,
            newPhoneHash
        );
    }

    function lockCapsule(uint256 capsuleId)
        external
        onlyOperator
        capsuleExists(capsuleId)
    {
        Capsule storage c = capsules[capsuleId];

        require(c.status == CapsuleStatus.ACTIVE, "NOT_ACTIVE");

        c.status = CapsuleStatus.LOCKED;
        c.updatedAt = block.timestamp;

        emit CapsuleLocked(capsuleId);
    }

    function unlockCapsule(uint256 capsuleId)
        external
        onlyOperator
        capsuleExists(capsuleId)
    {
        Capsule storage c = capsules[capsuleId];

        require(c.status == CapsuleStatus.LOCKED, "NOT_LOCKED");

        c.status = CapsuleStatus.ACTIVE;
        c.updatedAt = block.timestamp;

        emit CapsuleUnlocked(capsuleId);
    }

    function setAuthorization(
        uint256 capsuleId,
        bytes32 authorization,
        bool active
    )
        external
        onlyOperator
        capsuleExists(capsuleId)
        onlyActive(capsuleId)
    {
        require(authorization != bytes32(0), "INVALID_AUTHORIZATION");

        authorizations[capsuleId][authorization] = active;

        emit AuthorizationSet(
            capsuleId,
            authorization,
            active
        );
    }

    function executeFromCapsule(
        uint256 capsuleId,
        address target,
        uint256 value,
        bytes calldata data
    )
        external
        onlyOperator
        capsuleExists(capsuleId)
        onlyActive(capsuleId)
        nonReentrant
        returns (bytes memory)
    {
        return NexusNONCapsuleAccount(
            payable(capsules[capsuleId].capsuleWallet)
        ).execute(
            target,
            value,
            data
        );
    }

    function verifyIdentityHashes(
        bytes32 emailHash,
        bytes32 phoneHash,
        bytes32 antiPhishingHash
    )
        external
        view
        onlyOperator
        returns (
            bool matched,
            uint256 capsuleId,
            IdentityCheckResult result
        )
    {
        uint256 emailCapsule = emailHashToCapsule[emailHash];
        uint256 phoneCapsule = phoneHashToCapsule[phoneHash];

        if (emailCapsule == 0 && phoneCapsule == 0) {
            return (false, 0, IdentityCheckResult.CAPSULE_NOT_FOUND);
        }

        if (emailCapsule != 0 && phoneCapsule == 0) {
            return (false, emailCapsule, IdentityCheckResult.PHONE_NOT_MATCHED);
        }

        if (emailCapsule == 0 && phoneCapsule != 0) {
            return (false, phoneCapsule, IdentityCheckResult.EMAIL_NOT_MATCHED);
        }

        if (emailCapsule != phoneCapsule) {
            return (false, 0, IdentityCheckResult.EMAIL_PHONE_CONFLICT);
        }

        Capsule storage c = capsules[emailCapsule];

        if (c.antiPhishingHash != antiPhishingHash) {
            return (false, emailCapsule, IdentityCheckResult.ANTI_PHISHING_NOT_MATCHED);
        }

        return (true, emailCapsule, IdentityCheckResult.MATCHED);
    }

    function verifyAntiPhishingHash(
        uint256 capsuleId,
        bytes32 antiPhishingHash
    )
        external
        view
        onlyOperator
        capsuleExists(capsuleId)
        returns (bool)
    {
        return capsules[capsuleId].antiPhishingHash == antiPhishingHash;
    }

    function getCapsulePublic(uint256 capsuleId)
        external
        view
        capsuleExists(capsuleId)
        returns (
            uint256 id,
            CapsuleType capsuleType,
            CapsuleStatus status,
            address capsuleWallet,
            uint256 createdAt,
            uint256 activatedAt,
            uint256 updatedAt,
            uint256 nonce
        )
    {
        Capsule storage c = capsules[capsuleId];

        return (
            c.id,
            c.capsuleType,
            c.status,
            c.capsuleWallet,
            c.createdAt,
            c.activatedAt,
            c.updatedAt,
            c.nonce
        );
    }

    function getCapsulePrivate(uint256 capsuleId)
        external
        view
        onlyOperator
        capsuleExists(capsuleId)
        returns (Capsule memory)
    {
        return capsules[capsuleId];
    }

    function getCapsuleByEmailHash(bytes32 emailHash)
        external
        view
        onlyOperator
        returns (uint256)
    {
        return emailHashToCapsule[emailHash];
    }

    function getCapsuleByPhoneHash(bytes32 phoneHash)
        external
        view
        onlyOperator
        returns (uint256)
    {
        return phoneHashToCapsule[phoneHash];
    }

    function getCapsuleWallet(uint256 capsuleId)
        external
        view
        capsuleExists(capsuleId)
        returns (address)
    {
        return capsules[capsuleId].capsuleWallet;
    }

    function hasAuthorization(
        uint256 capsuleId,
        bytes32 authorization
    )
        external
        view
        capsuleExists(capsuleId)
        returns (bool)
    {
        return authorizations[capsuleId][authorization];
    }

    function setTrustedOperator(
        address operator,
        bool active
    )
        external
        onlyOwner
    {
        require(operator != address(0), "INVALID_OPERATOR");

        trustedOperators[operator] = active;

        emit TrustedOperatorSet(operator, active);
    }

    function setFeeVault(address newFeeVault)
        external
        onlyOwner
    {
        require(newFeeVault != address(0), "INVALID_FEE_VAULT");

        feeVault = newFeeVault;

        emit FeeVaultUpdated(newFeeVault);
    }

    function setTokens(
        address _usdtToken,
        address _nonToken,
        address _arbToken
    )
        external
        onlyOwner
    {
        usdtToken = _usdtToken;
        nonToken = _nonToken;
        arbToken = _arbToken;

        emit TokensUpdated(
            _usdtToken,
            _nonToken,
            _arbToken
        );
    }

    function setFeesEnabled(bool enabled)
        external
        onlyOwner
    {
        feesEnabled = enabled;

        emit FeesEnabledUpdated(enabled);
    }

    function setFees(
        uint256 _activationFeeUSDT,
        uint256 _recoveryFeeUSDT,
        uint256 _activationFeeNON,
        uint256 _recoveryFeeNON,
        uint256 _activationFeeARB,
        uint256 _recoveryFeeARB
    )
        external
        onlyOwner
    {
        activationFeeUSDT = _activationFeeUSDT;
        recoveryFeeUSDT = _recoveryFeeUSDT;

        activationFeeNON = _activationFeeNON;
        recoveryFeeNON = _recoveryFeeNON;

        activationFeeARB = _activationFeeARB;
        recoveryFeeARB = _recoveryFeeARB;

        emit FeesUpdated(
            _activationFeeUSDT,
            _recoveryFeeUSDT,
            _activationFeeNON,
            _recoveryFeeNON,
            _activationFeeARB,
            _recoveryFeeARB
        );
    }

    function computeCapsuleWalletAddress(
        uint256 capsuleId,
        bytes32 emailHash,
        bytes32 phoneHash
    )
        external
        view
        returns (address predicted)
    {
        bytes32 salt = keccak256(
            abi.encodePacked(
                address(this),
                capsuleId,
                emailHash,
                phoneHash,
                block.chainid
            )
        );

        bytes memory bytecode = abi.encodePacked(
            type(NexusNONCapsuleAccount).creationCode,
            abi.encode(address(this), capsuleId)
        );

        bytes32 hash = keccak256(
            abi.encodePacked(
                bytes1(0xff),
                address(this),
                salt,
                keccak256(bytecode)
            )
        );

        predicted = address(uint160(uint256(hash)));
    }

    function _chargeFee(
        address capsuleWallet,
        FeeToken feeToken,
        bool isRecovery
    )
        internal
    {
        if (!feesEnabled) {
            return;
        }

        address token;
        uint256 amount;

        if (feeToken == FeeToken.USDT) {
            token = usdtToken;
            amount = isRecovery ? recoveryFeeUSDT : activationFeeUSDT;
        } else if (feeToken == FeeToken.NON) {
            token = nonToken;
            amount = isRecovery ? recoveryFeeNON : activationFeeNON;
        } else {
            token = arbToken;
            amount = isRecovery ? recoveryFeeARB : activationFeeARB;
        }

        require(token != address(0), "FEE_TOKEN_NOT_SET");
        require(amount > 0, "FEE_AMOUNT_NOT_SET");

        uint256 balance = IERC20View(token).balanceOf(capsuleWallet);
        require(balance >= amount, "INSUFFICIENT_FEE_BALANCE");

        NexusNONCapsuleAccount(payable(capsuleWallet)).transferERC20(
            token,
            feeVault,
            amount
        );
    }

    function approve(address, uint256) public pure override {
        revert("SOULBOUND_NO_APPROVAL");
    }

    function setApprovalForAll(address, bool) public pure override {
        revert("SOULBOUND_NO_APPROVAL");
    }

    function _update(
        address to,
        uint256 tokenId,
        address auth
    )
        internal
        override
        returns (address)
    {
        address from = _ownerOf(tokenId);

        require(
            from == address(0) || to == address(0),
            "SOULBOUND_NO_TRANSFER"
        );

        return super._update(to, tokenId, auth);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override
        capsuleExists(tokenId)
        returns (string memory)
    {
        return "ipfs://NEXUSNON-GENESIS-CAPSULE";
    }
}