import { XMLParser } from "fast-xml-parser";
import moment from "moment";
import { storeData, getData, updateData } from "./storage";
import { DbCredential } from "../webauthn";
import { epochToDate } from "./utils";

export interface PersonInfo {
  dob: string;
  name: string;
  email: string;
  phone: string;
}
type GenderSynonyms = {
  [key: string]: string;
  Male: string;
  M: string;
  m: string;
  male: string;
  Female: string;
  F: string;
  f: string;
  female: string;
  Other: string;
  o: string;
};
export const genderSynonyms: GenderSynonyms = {
  Male: "M",
  M: "M",
  m: "M",
  male: "M",
  MALE: "M",
  Female: "F",
  F: "F",
  f: "F",
  female: "F",
  FEMALE: "F",
  Other: "O",
  OTHERS: "O",
  o: "O",
};
export const xmlParserOptions = {
  attributeNamePrefix: "",
  ignoreAttributes: false,
  parseNodeValue: true,
  trimValues: true,
  arrayMode: false,
  allowBooleanAttributes: true,
};
export const setSimulatedDLPersonInfo = async (simulatedDLPersonInfo: { personData: string }, userEmail: string) => {
  return updateData(userEmail, simulatedDLPersonInfo, "credentials", "aadhaar");
};
export const getSimulatedDLPersonInfo = async (userEmail: string): Promise<any | null> => {
  const data = await getData(userEmail, "credentials");
  return data ? (data as any) : null;
};

// export const deleteAadhaar = async () => {
//   return deleteData(userAadhaarStorageKey);
// };

// Function to convert X.509 certificate data to PEM format
function convertToPEM(x509Certificate: string): string {
  // Replace newlines and add PEM headers
  const pemCertificate = `-----BEGIN CERTIFICATE-----\n${x509Certificate}\n-----END CERTIFICATE-----`;
  return pemCertificate;
}

// Function to decode certificate data and extract public key
// export function decodeCertificateAndGetPublicKey(x509Certificate: string): string {
//   // Convert X.509 certificate data to PEM format
//   const pemCertificate = convertToPEM(x509Certificate);

//   // Load the certificate using node-forge
//   const cert = forge.pki.certificateFromPem(pemCertificate);

//   // Extract the public key
//   const publicKey = forge.pki.publicKeyToPem(cert.publicKey);

//   return publicKey;
// }

export class AadhaarXmlParser {
  private xmlObject: any;

  private xmlString: string;

  constructor(xml: string) {
    this.xmlString = xml;
  }

  public async parseXml(): Promise<any> {
    const parser = new XMLParser(xmlParserOptions);
    try {
      this.xmlObject = await parser.parse(this.xmlString, false);
    } catch (error) {
      console.error("Error parsing XML:", error);
      this.xmlObject = null;
    }
  }

  get xmlAadhar() {
    return this.xmlObject;
  }

  get extractPersonAttributes(): PersonInfo | null {
    try {
      const person = this.xmlObject.Certificate.IssuedTo.Person;
      if (!person) {
        return null;
      }
      return {
        dob: person.dob,
        name: person.name,
        email: person.email,
        phone: person.phone,
      };
    } catch (error) {
      console.error("Error extracting Person attributes:", error);
      return null;
    }
  }

  get extractPersonAddressAttributes(): any {
    try {
      const personAddress = this.xmlObject.Certificate.IssuedTo.Person;
      if (!personAddress || !personAddress.Address) {
        return null;
      }
      return personAddress.Address;
    } catch (error) {
      console.error("Error extracting Poa attributes:", error);
      return null;
    }
  }

  get extractPhtValue(): string | null {
    try {
      const phtValue = this.xmlObject.Certificate.IssuedTo.Person.Photo["#text"];
      return phtValue || null;
    } catch (error) {
      console.error("Error extracting Pht value:", error);
      return null;
    }
  }

  get getCertificate(): any {
    try {
      const cer = this.xmlObject.Certificate["ds:Signature"]["ds:KeyInfo"]["ds:X509Data"]["ds:X509Certificate"];
      return cer;
    } catch (error) {
      console.error("Error extracting Certification attributes:", error);
      return null;
    }
  }

  get getSignatureValue(): any {
    try {
      const cer = this.xmlObject.Certificate["ds:Signature"]["ds:SignatureValue"];
      return cer;
    } catch (error) {
      console.error("Error extracting Certification attributes:", error);
      return null;
    }
  }
}

export const updateUserProfile = async (userProfile: DbCredential) => {
  return updateData(userProfile.userID, userProfile.userInfo, "credentials", "userInfo");
};

export const matchFormDataAndAadharData = async (poi: PersonInfo, _user: DbCredential) => {
  try {
    const user = _user.userInfo!;
    // const userDateObject = user.dob.value ? epochToDate(user.dob.value.toString()) : new Date();
    const userDateObjectInDB = moment(+user.dob.value);
    const userDateObjectInPOI = moment.unix(+poi.dob);
    console.log("poi", poi);
    console.log("user", user);

    const isMatchingName = poi.name.toLowerCase() === user.fullName.value.toLowerCase();
    const isMatchingDOB = userDateObjectInDB.isSame(userDateObjectInPOI, "day");

    if (!isMatchingName) {
      console.log("Name does not match:", poi.name, user.fullName.value);
      return;
    }

    if (!isMatchingDOB) {
      console.log("Date of birth does not match:", poi.dob, user.dob.value);
      return;
    }
    user.fullName.verified = true;
    user.dob.verified = true;
    // check if digilockerID already exists in DB

    await updateUserProfile({ ..._user, userInfo: user });
    return true;
  } catch (error) {
    console.error("matchFormDataAndAadharData", error);
    return false;
  }
};
