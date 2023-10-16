export interface AgeVerificatingCertificate {
  Certificate: AgeVerificatingCertificateData;
}
export interface AgeVerificatingCertificateData {
  IssuedBy: {
    Organization: {
      CIN: {
        number: string;
      };
      GSTIN: {
        number: string;
      };
      Address: {
        locality: string;
        state: string;
        country: string;
      };
      name: string;
      type: string;
    };
  };
  IssuedTo: {
    Person: {
      Photo: {
        _: string;
        format: string;
      };
      uid: string;
      name: string;
    };
  };
  CertificateData: {
    ZKPROOF: {
      _: string;
      format: string;
      claimedAge: string;
    };
  };
  "ds:Signature": {
    "ds:SignedInfo": {
      "ds:CanonicalizationMethod": {
        Algorithm: string;
      };
      "ds:SignatureMethod": {
        Algorithm: string;
      };
      "ds:Reference": [
        {
          "ds:Transforms": {
            "ds:Transform": {
              Algorithm: string;
            };
          };
          "ds:DigestMethod": {
            Algorithm: string;
          };
          "ds:DigestValue": string;
        },
        {
          "ds:DigestMethod": {
            Algorithm: string;
          };
          "ds:DigestValue": string;
          URI: string;
          Type: string;
        },
      ];
    };
    "ds:SignatureValue": string;
    "ds:Object": {
      "xades:QualifyingProperties": {
        "xades:SignedProperties": {
          "xades:SignedSignatureProperties": {
            "xades:SigningTime": string;
            "xades:SigningCertificate": {
              "xades:Cert": {
                "xades:CertDigest": {
                  "ds:DigestMethod": {
                    Algorithm: string;
                  };
                  "ds:DigestValue": string;
                };
                "xades:IssuerSerial": {
                  "ds:X509IssuerName": string;
                  "ds:X509SerialNumber": number;
                };
              };
            };
          };
          Id: string;
        };
        Target: string;
      };
      Id: string;
    };
    "xmlns:ds": string;
  };
  name: string;
  type: string;
  number: string;
  issuedAt: string;
  issueDate: string;
  expiryDate: string;
  status: string;
}
