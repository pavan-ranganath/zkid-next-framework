import { plonk, wtns } from "snarkjs";
import { readFileSync, writeFileSync } from "fs";
import path from "path";
import moment from "moment";

import { InputData, generateXml } from "@/lib/generateAgeVerificationCertificate";
import {
  readSigningCertificateFromFile,
  readCertificateSigningKeyPairFromFile,
  readIssuerCertificateFromFile,
} from "@/lib/generateCertificate";
import { dateToEpoch, serializeProofAndEncodeToBase64 } from "../utils";
import { XadesClass } from "../XadesClass";

const wasmFilePath = path.join(process.cwd(), "lib/circomBuilds/ageVerifcation/ageProof.wasm");
const zkeyFilePath = path.join(process.cwd(), "lib/circomBuilds/ageVerifcation/ageProof.zkey");
const wasmFile = readFileSync(wasmFilePath);
const zkeyFile = readFileSync(zkeyFilePath);
// import snarkjs from "../../../node_modules/snarkjs/build/snarkjs.js";
/**
 * Generate Zero-knowledge proof for age verification using snarkjs
 * @param dob Date of birth
 * @param name Full name
 * @param claimedAge age claimed by user
 */
export async function generateProofForAgeverification(
  dob: Date,
  name: string,
  userId: string,
  photo: string,
  ageThreshold: number,
  claimDate: Date,
) {
  const currentDay = moment(claimDate);
  const INPUT = {
    DOBDay: moment(dob).date(),
    DOBMonth: moment(dob).month() + 1,
    DOBYear: moment(dob).year(),
    ageThreshold: +ageThreshold,
    currentDay: currentDay.date(),
    currentMonth: currentDay.month() + 1,
    currentYear: currentDay.year(),
  };
  console.log("ZKP INPUT: ", INPUT);
  const { proof, publicSignals } = await plonk.fullProve(INPUT, wasmFile, zkeyFile);
  console.log("Public signals: ", publicSignals);
  // Serialize the proof and encode it in base64 format.
  const base64Proof = serializeProofAndEncodeToBase64(proof);

  return generateXMLSignedCertificateForAgeVerificationProof(userId, name, base64Proof, photo, ageThreshold, currentDay);
}

export interface LoggerProps {
  debug(message: string): void;
  error(message: string): void;
  info(message: string): void;
  warn(message: string): void;
}

const Logger = () => {
  const logger: LoggerProps = {
    debug: (message: string) => {
      console.log(`[DEBUG] ${message}`);
    },
    error: (message: string) => {
      console.log(`[ERROR] ${message}`);
    },
    info: (message: string) => {
      console.log(`[INFO] ${message}`);
    },
    warn: (message: string) => {
      console.log(`[WARN] ${message}`);
    },
  };

  return logger;
};

async function generateXMLSignedCertificateForAgeVerificationProof(
  userId: string,
  name: string,
  base64Proof: string,
  photo: string,
  ageThreshold: number,
  currentDay: moment.Moment,
) {
  const inputDataForXMlCertificate: InputData = {
    ZKID_ID: userId,
    issueDate: moment().valueOf(),
    expirydate: moment().add(1, "years").valueOf(),
    person_name: name,
    ZKPROOF: base64Proof,
    Photo: photo,
    ClaimedAge: ageThreshold,
    ClaimedDate: currentDay.toDate().valueOf(),
  };

  const generatedXml = generateXml(inputDataForXMlCertificate);
  const xades = new XadesClass();

  const hash = "SHA-256";
  const alg = {
    name: "RSASSA-PKCS1-v1_5",
    hash,
  };
  const signingCert = await readSigningCertificateFromFile();
  const issuerCert = await readIssuerCertificateFromFile();
  const XMLcertSigningkeyPair = await readCertificateSigningKeyPairFromFile();
  const xmlCertificate = await xades.signXml(generatedXml, XMLcertSigningkeyPair, alg, {
    keyValue: XMLcertSigningkeyPair.publicKey,
    references: [{ hash, transforms: ["c14n", "enveloped"] }],
    x509: [signingCert, issuerCert],
    signingCertificate: signingCert,
    productionPlace: {
      country: "India",
      state: "Karnataka",
      city: "Bengaluru",
    },
    signerRole: {
      claimed: ["EGS nZKid signer"],
    },
  });
  return xmlCertificate;
}
