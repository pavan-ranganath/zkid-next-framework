/// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;
import "@openzeppelin/contracts/access/Ownable.sol";

contract AttestationContract is Ownable {
    enum AttestationStatus {
        WAITING, // Attestation is waiting for approval
        ACCEPTED, // Attestation is accepted
        REJECTED // Attestation is rejected
    }

    mapping(address => bool) public trustedAttestors;

    struct Attestation {
        address attestor; // Address of the attestor
        string email; // Email being attested
        AttestationStatus status; // Status of the attestation
        string rejectionReason; // Reason for rejection (if status is REJECTED)
    }

    mapping(address => Attestation) public attestations;

    event AttestationSubmitted(address indexed submitter);
    event AttestationStatusUpdated(
        address indexed attestationAddress,
        AttestationStatus indexed status,
        string rejectionReason
    );

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
        require(trustedAttestors[attestor], "Invalid attestor");
        require(
            attestations[msg.sender].attestor == address(0),
            string(abi.encodePacked("Attestation for email '", attestations[msg.sender].email, "' already exists"))
        );

        attestations[msg.sender] = Attestation({
            attestor: attestor,
            email: email,
            status: AttestationStatus.WAITING,
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
    function updateAttestationStatus(
        address _address,
        AttestationStatus status,
        string memory rejectionReason
    ) public onlyOwner {
        Attestation memory attestorInMemory = attestations[_address];
        require(trustedAttestors[msg.sender], "Invalid attestor");
        require(attestorInMemory.attestor != address(0), "Attestation does not exist");
        require(attestorInMemory.attestor == msg.sender, "Unauthorized attestation update");
        require(status != AttestationStatus.WAITING, "Cannot update attestation to WAITING status");

        if (status == AttestationStatus.REJECTED) {
            require(bytes(rejectionReason).length > 0, "Rejection reason is required for status 'REJECTED'");
        }

        Attestation storage attestation = attestations[_address];
        attestation.status = status;
        attestation.rejectionReason = rejectionReason;

        emit AttestationStatusUpdated(_address, status, rejectionReason);
    }

    /**
     * @notice Delete the caller's attestation.
     */
    function deleteAttestation() public {
        require(attestations[msg.sender].attestor != address(0), "Attestation does not exist");
        delete attestations[msg.sender];
    }
}
