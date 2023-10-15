import { randomUUID } from "crypto";
import { create } from "xmlbuilder2";

export interface InputData {
  ZKID_ID: string;
  issueDate: Date;
  expirydate: Date;
  person_name: string;
  ZKPROOF: string;
  Photo: string;
  ClaimedAge: number;
}

export interface CertificateConfig {
  certificateName?: string;
  Organization_name?: string;
  certificateType?: string;
  status?: string;
  cinNumber?: string;
  gstinNumber?: string;
  address?: {
    locality: string;
    state: string;
    country: string;
  };
  // Add any other static values here
}

const defaultConfig: CertificateConfig = {
  certificateName: "Age verification",
  Organization_name: "Entrada Solutions Pvt Ltd",
  certificateType: "nAgeVerify",
  status: "Active",
  cinNumber: "U74994KA2017PTC105365",
  gstinNumber: "29AAECE7440H1ZI",
  address: {
    locality: "Bengaluru",
    state: "Karnataka",
    country: "IN",
  },
  // ... Add any other static values here
};

export function generateXml(input: InputData, config?: CertificateConfig): string {
  const issueDateFormatted = input.issueDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const expiryDateFormatted = input.expirydate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const mergedConfig = { ...defaultConfig, ...config };

  const xml = create({
    Certificate: {
      "@name": mergedConfig.certificateName,
      "@type": mergedConfig.certificateType,
      "@number": randomUUID(),
      "@issuedAt": mergedConfig.Organization_name,
      "@issueDate": issueDateFormatted,
      "@expiryDate": expiryDateFormatted,
      "@status": mergedConfig.status,
      IssuedBy: {
        Organization: {
          "@name": mergedConfig.Organization_name,
          "@type": mergedConfig.certificateType,
          CIN: {
            "@number": mergedConfig.cinNumber,
          },
          GSTIN: {
            "@number": mergedConfig.gstinNumber,
          },
          Address: mergedConfig.address,
        },
      },
      IssuedTo: {
        Person: {
          "@uid": input.ZKID_ID,
          "@name": input.person_name,
          Photo: {
            "@format": "base64",
            "#text": input.Photo,
          },
        },
      },
      CertificateData: {
        ZKPROOF: {
          "@format": "base64",
          "@claimedAge": input.ClaimedAge,
          "#text": input.ZKPROOF,
        },
      },
    },
  });

  return xml.toString({ format: "xml" });
}
