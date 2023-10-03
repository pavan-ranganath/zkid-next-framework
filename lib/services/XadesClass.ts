import { Crypto, CryptoKey } from "@peculiar/webcrypto";
import * as XAdES from "xadesjs";
import { OptionsXAdES } from "xadesjs/build/types/signed_xml";
import * as dom from "@xmldom/xmldom";
import * as xpath from "xpath";
const xadesjs = require("xadesjs") as typeof XAdES;

const crypto = new Crypto();
xadesjs.Application.setEngine("OpenSSL", crypto);
// window.DOMParser =  (require('@xmldom/xmldom').DOMParser);
// window.XMLSerializer =  (require('@xmldom/xmldom').XMLSerializer);

export class XadesClass {
  xadesjs: typeof XAdES; // Type for the xadesjs library

  constructor() {
    this.xadesjs = xadesjs;
  }

  async signXml(xmlString: string, keys: CryptoKeyPair, algorithm: any, optionalSign: OptionsXAdES): Promise<string> {
    const xmlDoc = new dom.DOMParser().parseFromString(xmlString, "application/xml");
    const signedXml: XAdES.SignedXml = new this.xadesjs.SignedXml(xmlDoc);
    await signedXml.Sign(algorithm, keys.privateKey, xmlDoc, optionalSign);
    return signedXml.toString();
  }

  async verifyXml(xmlString: string): Promise<boolean> {
    // Parse the XML document using xmldom
    const xmlDom = new dom.DOMParser().parseFromString(xmlString, "application/xml");

    // Use the namespace prefix in the XPath expression
    const select = xpath.useNamespaces({
      ds: "http://www.w3.org/2000/09/xmldsig#",
    });

    // Find all Signature elements in the XML
    const signatureElements = select("//ds:Signature", xmlDom) as Element[];

    if (!signatureElements || signatureElements.length === 0) {
      throw new Error("Signature element not found in the XML.");
    }

    // Create a SignedXml instance using xadesjs
    const signedXml: XAdES.SignedXml = new this.xadesjs.SignedXml(xmlDom);

    // Load the signature XML into the SignedXml instance
    signedXml.LoadXml(signatureElements[0]);

    // Verify the signature
    return signedXml.Verify();
  }
}
