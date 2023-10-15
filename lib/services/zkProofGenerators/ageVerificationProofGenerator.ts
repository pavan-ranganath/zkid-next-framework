import { plonk, wtns } from "snarkjs";
import { readFileSync, writeFileSync } from "fs";
import path from "path";
import moment from "moment";

import { serializeProofAndEncodeToBase64 } from "../utils";
import { InputData, generateXml } from "@/lib/generateAgeVerificationCertificate";
import { XadesClass } from "../XadesClass";
import { readCertificateFromFile, readCertificateSigningKeyPairFromFile } from "@/lib/generateCertificate";

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
) {
  const INPUT = {
    DOBDay: moment(dob).date(),
    DOBMonth: moment(dob).month() + 1,
    DOBYear: moment(dob).year(),
    ageThreshold: ageThreshold,
    currentDay: moment().date(),
    currentMonth: moment().month() + 1,
    currentYear: moment().year(),
  };

  const { proof, publicSignals } = await plonk.fullProve(INPUT, wasmFile, zkeyFile);
  //Serialize the proof and encode it in base64 format.
  const base64Proof = serializeProofAndEncodeToBase64(proof);

  const inputDataForXMlCertificate: InputData = {
    ZKID_ID: userId,
    issueDate: new Date(),
    expirydate: new Date("2025-10-15"),
    person_name: name,
    ZKPROOF: base64Proof,
    Photo: photo,
    ClaimedAge: ageThreshold,
  };

  const generatedXml = generateXml(inputDataForXMlCertificate);
  const xades = new XadesClass();

  const hash = "SHA-256";
  const alg = {
    name: "RSA-PSS",
    hash,
  };
  const x509 = await readCertificateFromFile();
  const XMLcertSigningkeyPair = await readCertificateSigningKeyPairFromFile();
  const xmlCertificate = await xades.signXml(generatedXml, XMLcertSigningkeyPair, alg, {
    references: [{ hash, transforms: ["enveloped"] }],
    signingCertificate: x509,
  });
  return xmlCertificate;
}

interface LoggerProps {
  debug(message: string): void;
  error(message: string): void;
  info(message: string): void;
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
  };

  return logger;
};
