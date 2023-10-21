import { updateData, getData, storeData } from "./services/storage";

export const storeCertificate = async (certificateData: string, userSystemID: string, type = "nAgeVerify") => {
  return storeData({ cert: certificateData, userSystemID, type }, "ZKIDXMLCertificate");
};
export const getCertificateInfoBySystemUserID = async (userSystemID: string, type: string): Promise<any | null> => {
  const data = await getData({ userSystemID, type }, "ZKIDXMLCertificate");
  return data ? (data as any) : null;
};
