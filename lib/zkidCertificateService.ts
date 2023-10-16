import { updateData, getData, storeData } from "./services/storage";

export const storeCertificate = async (certificateData: string, userId: string) => {
  return storeData({ cert: certificateData, userId: userId }, "ZKIDXMLCertificate");
};
export const getDigilockerInfo = async (userId: string): Promise<any | null> => {
  const data = await getData(userId, "ZKIDXMLCertificate");
  return data ? (data as any) : null;
};
