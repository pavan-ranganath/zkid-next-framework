import { Crypto, CryptoKey } from "@peculiar/webcrypto";
import { Certificate, AttributeTypeAndValue } from "pkijs";
import * as asn1js from "asn1js";
import { readFileSync, writeFileSync } from "fs";
import path from "path";
import { pki } from "node-forge";
// Create an instance of the WebCrypto API
const crypto = new Crypto();

export async function generateKeyPair(): Promise<CryptoKeyPair> {
  // Generate a new RSA key pair
  const keyPair = await crypto.subtle.generateKey(
    {
      name: "RSASSA-PKCS1-v1_5",
      hash: "SHA-256", // SHA-1, SHA-256, SHA-384, or SHA-512
      publicExponent: new Uint8Array([1, 0, 1]), // 0x03 or 0x010001
      modulusLength: 2048, // 1024, 2048, or 4096
      // name: "ECDSA",
      // namedCurve: "P-256", //can be "P-256", "P-384", or "P-521"
    },
    true,
    ["sign", "verify"],
  );

  return keyPair;
}

export async function generateSelfSignedCertificateWithPKIJS(commonName: string, keys: CryptoKeyPair): Promise<string> {
  // Create new Certificate using pkijs
  const certificate = new Certificate();

  // Set fields, validity dates, and other details
  certificate.serialNumber = new asn1js.Integer({ value: 1 });
  certificate.subject.typesAndValues.push(
    new AttributeTypeAndValue({
      type: "2.5.4.3", // OID for "commonName"
      value: new asn1js.PrintableString({ value: commonName }),
    }),
  );
  certificate.issuer.typesAndValues.push(
    new AttributeTypeAndValue({
      type: "2.5.4.3",
      value: new asn1js.PrintableString({ value: commonName }),
    }),
  );

  // Set validity
  const notBefore = new Date();
  const notAfter = new Date(notBefore);
  notAfter.setFullYear(notAfter.getFullYear() + 1);
  certificate.notBefore.value = notBefore;
  certificate.notAfter.value = notAfter;

  // Sign the certificate
  await certificate.sign(keys.privateKey);

  // Convert certificate to DER format
  // const derBuffer = certificate.toSchema(true).toBER(false);

  // Convert DER buffer to Base64
  // const base64Certificate = Buffer.from(derBuffer).toString('base64');
  return certificate.toString("base64");
}

export async function readCertificateSigningKeyPairFromFile() {
  // Read private key
  const privateKeyPem = readFileSync(path.join(process.cwd(), "keys/ZKIDXMLCertificateSigner.privateKey.pem"), {
    encoding: "utf8",
  });
  // Read public key
  const pubKeyPem = readFileSync(path.join(process.cwd(), "keys/ZKIDXMLCertificateSigner.publicKey.pem"), {
    encoding: "utf8",
  });

  const privateKeyDer = importKeyFromPem(privateKeyPem);
  const publicKeyDer = importKeyFromPem(pubKeyPem);

  const hash = "SHA-256";
  const alg = {
    name: "RSASSA-PKCS1-v1_5",
    hash,
  };
  const privateKey = await crypto.subtle.importKey("pkcs8", privateKeyDer, alg, true, ["sign"]);

  const pubicKey = await crypto.subtle.importKey("spki", publicKeyDer, alg, true, ["verify"]);

  return { privateKey, publicKey: pubicKey };
}
function preparePem(pem: string) {
  return (
    pem
      // remove BEGIN/END
      .replace(/-----(BEGIN|END)[\w\d\s]+-----/g, "")
      // remove \r, \n
      .replace(/[\r\n]/g, "")
  );
}
export async function readSigningCertificateFromFile() {
  // Read private key
  const cert = readFileSync(path.join(process.cwd(), "keys/ZKIDXMLCertificateSigner.pem"), {
    encoding: "utf8",
  });
  return preparePem(cert);
}

export async function readIssuerCertificateFromFile() {
  // Read private key
  const cert = readFileSync(path.join(process.cwd(), "keys/EntradaIssuingCA.pem"), {
    encoding: "utf8",
  });
  return preparePem(cert);
}

/*
Convert a string into an ArrayBuffer
from https://developers.google.com/web/updates/2012/06/How-to-convert-ArrayBuffer-to-and-from-String
*/
function str2ab(str: string) {
  const buf = new ArrayBuffer(str.length);
  const bufView = new Uint8Array(buf);
  for (let i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}

function importKeyFromPem(pem: string) {
  // fetch the part of the PEM string between header and footer
  const pemHeader = "-----BEGIN PRIVATE KEY-----";
  const pemFooter = "-----END PRIVATE KEY-----";
  const pemContents = pem.substring(pemHeader.length, pem.length - pemFooter.length);
  // base64 decode the string to get the binary data
  const binaryDerString = atob(pemContents);
  // convert from a binary string to an ArrayBuffer
  const binaryDer = str2ab(binaryDerString);
  return binaryDer;
}
function importCertificateFromPem(pem: string) {
  // fetch the part of the PEM string between header and footer
  const pemHeader = "-----BEGIN CERTIFICATE-----";
  const pemFooter = "-----END CERTIFICATE-----";
  const pemContents = pem.substring(pemHeader.length, pem.length - pemFooter.length);
  return pemContents;
}
export function parseX509Certificate(certString: string) {
  try {
    const certificate = pki.certificateFromPem(certString);
    return certificate;
  } catch (error) {
    console.error("Error parsing X.509 certificate:", error);
    return null;
  }
}
