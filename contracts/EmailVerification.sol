// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "@openzeppelin/contracts/access/Ownable.sol";
// Importing the Ownable contract from the OpenZeppelin library.

contract EmailVerification is Ownable {
    constructor() {}

    // Enum to represent the status of an attestation.
    enum AttestationStatus {
        WAITING,   // Attestation is waiting for approval
        ACCEPTED,  // Attestation is accepted
        REJECTED   // Attestation is rejected
    }

    // Mapping to store the addresses of trusted attestors.
    mapping(address => bool) public trustedAttestors;

    struct Attestation {
        address attestor;           // Address of the attestor
        string email;               // Email being attested
        AttestationStatus status;   // Status of the attestation
        string rejectionReason;     // Reason for rejection (if status is REJECTED)
    }

    // Mapping to store the attestation details for each address.
    mapping(address => Attestation) public attestations;

    // Events emitted when an attestation is submitted 
    event AttestationSubmitted(address indexed submitter);

    // Events emitted when an status is updated.
    event AttestationStatusUpdated(address indexed attestationAddress, AttestationStatus indexed status, string rejectionReason);

    /**
     * @notice Add valid attestor to set of trusted attestors.
     *
     * @param attestor Address to add.
     */
    function addValidAttestor(address attestor) public onlyOwner {
        trustedAttestors[attestor] = true;
    }

    /**
     * @notice Remove attestor from set of trusted attestors.
     *
     * @param attestor Address to remove.
     */
    function removeValidAttestor(address attestor) public onlyOwner {
        delete trustedAttestors[attestor];
    }

    /**
     * @notice Check if an attestor is within the set of trusted attestors.
     *
     * @param attestor Address to check.
     * @return Whether the attestor is trusted.
     */
    function checkTrustedAttestor(address attestor) public view returns (bool) {
        return trustedAttestors[attestor];
    }

    /**
     * @notice Submit an attestation for an address.
     *
     * @param attestor The address of the attestor.
     * @param email The email being attested.
     */
    function submitAttestation(address attestor, string memory email) public {
        // Check if the attestor is trusted.
        require(trustedAttestors[attestor], "Invalid attestor");

        // Check if an attestation already exists for the sender's address.
        require(attestations[msg.sender].attestor == address(0), string(abi.encodePacked("Attestation for email '", attestations[msg.sender].email, "' already exists")));

        // Create a new attestation and store it for the sender's address.
        attestations[msg.sender] = Attestation({
            attestor: attestor,
            email: email,
            status: AttestationStatus.WAITING,
            rejectionReason: ""
        });

        // Emit an event to indicate that an attestation has been submitted.
        emit AttestationSubmitted(msg.sender);
    }

    /**
     * @notice Get the attestation details for an address.
     *
     * @param _address The address to retrieve attestation details for.
     * @return attestor The address of the attestor.
     * @return email The attested email.
     * @return status The attestation status.
     * @return rejectionReason The reason for rejection (if status is REJECTED).
     */
    function getAttestationByAddress(address _address) public view returns (address attestor, string memory email, AttestationStatus status, string memory rejectionReason) {
        // Retrieve the attestation details for the specified address.
        Attestation memory attestation = attestations[_address];

        // Return the attestation details.
        return (attestation.attestor, attestation.email, attestation.status, attestation.rejectionReason);
    }

    /**
     * @notice Update the status and rejection reason of an attestation.
     *
     * @param _address The address of the attestation.
     * @param status The new attestation status.
     * @param rejectionReason The reason for rejection (if status is REJECTED).
     */
    function updateAttestationStatus(address _address, AttestationStatus status, string memory rejectionReason) public onlyOwner {
        // Retrieve the attestation details from storage.
        Attestation memory attestorInMemory = attestations[_address];

        // Check if the caller is a trusted attestor.
        require(trustedAttestors[msg.sender], "Invalid attestor");

        // Check if the attestation exists for the specified address.
        require(attestorInMemory.attestor != address(0), "Attestation does not exist");

        // Check if the caller is the attestor who created the attestation.
        require(attestorInMemory.attestor == msg.sender, "Unauthorized attestation update");

        // Check if the attestation status is not being set to WAITING.
        require(status != AttestationStatus.WAITING, "Cannot update attestation to WAITING status");

        // If the status is REJECTED, ensure a rejection reason is provided.
        if (status == AttestationStatus.REJECTED) {
            require(bytes(rejectionReason).length > 0, "Rejection reason is required for status 'REJECTED'");
        }

        // Retrieve the attestation for modification.
        Attestation storage attestation = attestations[_address];

        // Update the attestation status and rejection reason.
        attestation.status = status;
        attestation.rejectionReason = rejectionReason;

        // Emit an event to indicate that the attestation status has been updated.
        emit AttestationStatusUpdated(_address, status, rejectionReason);
    }

    /**
     * @notice Delete the caller's attestation.
     */
    function deleteAttestation() public {
        // Check if an attestation exists for the caller's address.
        require(attestations[msg.sender].attestor != address(0), "Attestation does not exist");

        // Delete the attestation.
        delete attestations[msg.sender];

    }
}
