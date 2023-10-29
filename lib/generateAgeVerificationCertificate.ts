import { randomUUID } from "crypto";
import moment from "moment";
import { create } from "xmlbuilder2";

export interface InputData {
  ZKID_ID: string;
  issueDate: number;
  expirydate: number;
  person_name: string;
  ZKPROOF: string;
  Photo: string;
  ClaimedAge: number;
  ClaimedDate: number;
}

export interface CertificateConfig {
  certificateName?: string;
  Organization_name?: string;
  certificateType?: string;
  status?: string;
  address?: {
    city: string;
    state: string;
    country: string;
  };
  // Add any other static values here
}

const defaultConfig: CertificateConfig = {
  certificateName: "Age verification",
  Organization_name: "Entrada Global Solutions",
  certificateType: "nAgeVerify",
  status: "Active",
  address: {
    city: "Cupertino",
    state: "California",
    country: "USA",
  },
  // ... Add any other static values here
};

export function generateXml(input: InputData, config?: CertificateConfig): string {
  const issueDateFormatted = moment(input.issueDate).valueOf();
  const expiryDateFormatted = moment(input.expirydate).valueOf();
  const claimDateFormatted = moment(input.ClaimedDate).valueOf();

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
          // CIN: {
          //   "@number": mergedConfig.cinNumber,
          // },
          // GSTIN: {
          //   "@number": mergedConfig.gstinNumber,
          // },
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
          "@claimedDate": claimDateFormatted,
          "#text": input.ZKPROOF,
        },
      },
    },
  });

  return xml.toString({ format: "xml" });
}
