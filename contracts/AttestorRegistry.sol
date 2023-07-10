// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title AttestorRegistry
 * @dev A contract for managing a registry of trusted attestors and their supported attestations.
 */
contract AttestorRegistry is Ownable {
    struct Attestor {
        bool isTrusted; // Flag indicating if the attestor is trusted
        mapping(string => bool) supportedAttestations; // Mapping of supported attestation types
    }

    mapping(address => Attestor) public trustedAttestors; // Mapping of attestor addresses to their Attestor struct

    /**
     * @notice Add a valid attestor to the set of trusted attestors.
     * @dev Only the contract owner can call this function.
     * @param attestor The address of the attestor to add.
     * @param supportedAttestations An array of supported attestation types.
     */
    function addValidAttestor(address attestor, string[] memory supportedAttestations) public onlyOwner {
        Attestor storage newAttestor = trustedAttestors[attestor];
        newAttestor.isTrusted = true;

        for (uint256 i = 0; i < supportedAttestations.length; i++) {
            newAttestor.supportedAttestations[supportedAttestations[i]] = true;
        }
    }

    /**
     * @notice Add supported attestations to an existing attestor.
     * @dev Only the contract owner can call this function.
     * @param attestor The address of the existing attestor.
     * @param newSupportedAttestations An array of new supported attestation types.
     */
    function addSupportedAttestationsToExistingAttestor(
        address attestor,
        string[] memory newSupportedAttestations
    ) public onlyOwner {
        Attestor storage existingAttestor = trustedAttestors[attestor];
        require(existingAttestor.isTrusted, "Invalid attestor");

        for (uint256 i = 0; i < newSupportedAttestations.length; i++) {
            string memory attestation = newSupportedAttestations[i];
            if (!existingAttestor.supportedAttestations[attestation]) {
                existingAttestor.supportedAttestations[attestation] = true;
            }
        }
    }

    /**
     * @notice Check if a specific attestation type is supported by an attestor.
     * @param attestor The address of the attestor.
     * @param attestationType The attestation type to check.
     * @return boolean indicating if the attestation type is supported.
     */
    function isAttestionSupported(address attestor, string memory attestationType) public view returns (bool) {
        Attestor storage existingAttestor = trustedAttestors[attestor];
        require(existingAttestor.isTrusted, "Invalid attestor");
        return existingAttestor.supportedAttestations[attestationType];
    }
}
