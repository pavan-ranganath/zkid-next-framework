// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;
import "./AttestorRegistry.sol";

// Contract for managing email attestations
contract EmailVerification {
    struct Attestation {
        address attestor; // Address of the attestor
        string email; // Email being attested
        AttestationStatus status; // Status of the attestation
        string rejectionReason; // Reason for rejection (if status is REJECTED)
    }
    string ATTESTION_TYPE = "EMAIL";
    enum AttestationStatus {
        PENDING, // Attestation is pending for approval
        ACCEPTED, // Attestation is accepted
        REJECTED // Attestation is rejected
    }

    mapping(address => Attestation) public attestations; // Mapping of addresses to their corresponding attestation details
    AttestorRegistry public attestorRegistry; // Instance of the AttestorRegistry contract

    // The indexed keyword is used to mark an event parameter as indexed.
    // Indexed parameters enable efficient filtering of events when querying the blockchain.
    event AttestationSubmitted(address indexed submitter); // Event emitted when an attestation is submitted
    event AttestationStatusUpdated(
        address indexed attestationAddress,
        AttestationStatus indexed status,
        string rejectionReason
    ); // Event emitted when the status of an attestation is updated

    constructor(address attestorRegistryAddress) {
        attestorRegistry = AttestorRegistry(attestorRegistryAddress);
    }

    /**
     * @notice Submit an attestation for an address.
     *
     * @param attestor The address of the attestor.
     * @param email The email being attested.
     */
    function submitAttestation(address attestor, string memory email) public {
        require(attestorRegistry.trustedAttestors(attestor), "Invalid attestor");
        require(attestorRegistry.isAttestionSupported(attestor, ATTESTION_TYPE), "Attestor is not allowed to attest Email");
        require(attestations[msg.sender].attestor == address(0), "Attestation for this address already exists");

        attestations[msg.sender] = Attestation({
            attestor: attestor,
            email: email,
            status: AttestationStatus.PENDING,
            rejectionReason: ""
        });

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
    function getAttestationByAddress(
        address _address
    ) public view returns (address attestor, string memory email, AttestationStatus status, string memory rejectionReason) {
        Attestation memory attestation = attestations[_address];
        return (attestation.attestor, attestation.email, attestation.status, attestation.rejectionReason);
    }

    /**
     * @notice Update the status and rejection reason of an attestation.
     *
     * @param _address The address of the attestation.
     * @param status The new attestation status.
     * @param rejectionReason The reason for rejection (if status is REJECTED).
     */
    function updateAttestationStatus(address _address, AttestationStatus status, string memory rejectionReason) public {
        Attestation storage attestation = attestations[_address];
        require(attestorRegistry.trustedAttestors(msg.sender), "Invalid attestor");
        require(
            attestorRegistry.isAttestionSupported(msg.sender, ATTESTION_TYPE),
            "Attestor is not allowed to attest Email"
        );
        require(attestation.attestor != address(0), "Attestation does not exist");
        require(attestation.attestor == msg.sender, "Unauthorized attestation update");
        require(status != AttestationStatus.PENDING, "Cannot update attestation to PENDING status");

        if (status == AttestationStatus.REJECTED) {
            require(bytes(rejectionReason).length > 0, "Rejection reason is required for status 'REJECTED'");
        }

        attestation.status = status;
        attestation.rejectionReason = rejectionReason;

        emit AttestationStatusUpdated(_address, status, rejectionReason);
    }
}
