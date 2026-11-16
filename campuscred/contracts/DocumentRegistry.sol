// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract DocumentRegistry {
    struct Document {
        bytes32 documentHash;
        string ipfsCid;
        address owner;
        uint256 uploadedAt;
        bool registered;
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
        string memory _ipfsCid
    ) external {
        require(_documentHash != bytes32(0), "Invalid document hash");
        require(bytes(_ipfsCid).length > 0, "Invalid IPFS CID");
        require(!documents[_documentHash].registered, "Document already registered");

        documents[_documentHash] = Document({
            documentHash: _documentHash,
            ipfsCid: _ipfsCid,
            owner: msg.sender,
            uploadedAt: block.timestamp,
            registered: true
        });

        ownerDocuments[msg.sender].push(_documentHash);

        emit DocumentRegistered(
            _documentHash,
            _ipfsCid,
            msg.sender,
            block.timestamp
        );
    }

    function getDocument(
        bytes32 _documentHash
    )
        external
        view
        returns (
            string memory ipfsCid,
            address owner,
            uint256 uploadedAt,
            bool registered
        )
    {
        Document memory document = documents[_documentHash];
        require(document.registered, "Document not found");

        return (
            document.ipfsCid,
            document.owner,
            document.uploadedAt,
            document.registered
        );
    }

    function isDocumentRegistered(
        bytes32 _documentHash
    ) external view returns (bool) {
        return documents[_documentHash].registered;
    }

    function getOwnerDocuments(
        address _owner
    ) external view returns (bytes32[] memory) {
        return ownerDocuments[_owner];
    }
}
