// blockchain/contracts/DocumentRegistry.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DocumentRegistry {
    mapping(bytes32 => bool) public registeredDocuments;

    event DocumentRegistered(bytes32 indexed documentHash);

    function registerDocument(bytes32 documentHash) public {
        require(!registeredDocuments[documentHash], "Document already registered.");
        registeredDocuments[documentHash] = true;
        emit DocumentRegistered(documentHash);
    }

    function verifyDocument(bytes32 documentHash) public view returns (bool) {
        return registeredDocuments[documentHash];
    }
}
