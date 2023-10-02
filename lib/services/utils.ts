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
