import moment from "moment";

export function generateZKIDID(phone: string, dob: Date, aadhaarNumber: string = "0000"): string {
  // Remove special characters from phone
  const cleanedPhone = phone.replace(/[^0-9]/g, "");

  // Ensure that the phone number is 13 characters by adding leading zeros
  const formattedPhone = cleanedPhone.padStart(13, "0");

  // Format the DOB as "MMDDYYYY"
  const month = (dob.getMonth() + 1).toString().padStart(2, "0");
  const day = dob.getDate().toString().padStart(2, "0");
  const year = dob.getFullYear().toString();
  const formattedDOB = `${month}${day}${year}`;

  // Get the current epoch time
  const epochTime = Math.floor(new Date().getTime() / 1000);

  // Format the output string
  const output = `00000${formattedPhone}${formattedDOB}${aadhaarNumber}${epochTime}`;

  return output;
}

// Function to serialize a proof and encode it in base64 format
export function serializeProofAndEncodeToBase64(proof: any) {
  const proofString = JSON.stringify(proof);
  const proofBuffer = Buffer.from(proofString);
  const base64Proof = proofBuffer.toString("base64");
  return base64Proof;
}

// Function to decode a base64-encoded proof and deserialize it
export function decodeBase64AndDeserializeProof(
  base64Proof: WithImplicitCoercion<string> | { [Symbol.toPrimitive](hint: "string"): string },
) {
  const proofBuffer = Buffer.from(base64Proof, "base64");
  const proofString = proofBuffer.toString("utf8");
  const proof = JSON.parse(proofString);
  return proof;
}

export function dateToEpoch(date: string | Date): number {
  return moment(date).valueOf();
}

export function epochToDate(epoch: string): Date {
  return moment.unix(+epoch / 1000).toDate(); // Convert seconds to milliseconds for Date object
}
