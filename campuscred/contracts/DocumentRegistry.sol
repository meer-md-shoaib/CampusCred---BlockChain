// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract DocumentRegistry {
    struct Document {
        bytes32 documentHash;
        string ipfsCid;
        address owner;
        uint256 uploadedAt;
        bool exists;
    }

    mapping(bytes32 => Document) private documents;
    mapping(address => bytes32[]) private ownerDocuments;

    event DocumentRegistered(
        bytes32 indexed documentHash,
        string ipfsCid,
        address indexed owner,
        uint256 uploadedAt
    );

    function registerDocument(
        bytes32 _documentHash,
        string calldata _ipfsCid
    ) external {
        require(_documentHash != bytes32(0), "Invalid document hash");
        require(bytes(_ipfsCid).length > 0, "Invalid IPFS CID");
        require(!documents[_documentHash].exists, "Document already registered");

        documents[_documentHash] = Document({
            documentHash: _documentHash,
            ipfsCid: _ipfsCid,
            owner: msg.sender,
            uploadedAt: block.timestamp,
            exists: true
        });

        ownerDocuments[msg.sender].push(_documentHash);

        emit DocumentRegistered(
            _documentHash,
            _ipfsCid,
            msg.sender,
            block.timestamp
        );
    }

    function verifyDocument(
        bytes32 _documentHash
    ) external view returns (bool) {
        return documents[_documentHash].exists;
    }

    function getDocument(
        bytes32 _documentHash
    )
        external
        view
        returns (
            bytes32 documentHash,
            string memory ipfsCid,
            address owner,
            uint256 uploadedAt,
            bool exists
        )
    {
        Document memory document = documents[_documentHash];

        return (
            document.documentHash,
            document.ipfsCid,
            document.owner,
            document.uploadedAt,
            document.exists
        );
    }

    function getOwnerDocuments(
        address _owner
    ) external view returns (bytes32[] memory) {
        return ownerDocuments[_owner];
    }
}
