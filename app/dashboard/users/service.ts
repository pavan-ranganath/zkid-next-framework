import { DbCredential } from "@/lib/webauthn";

export interface credentailsFromTb extends DbCredential {
  _id: string;
}
export type dataFromServer = {
  data: credentailsFromTb[];
  totalCount: number;
  limit: number;
  totalPages: number;
};

export type User = {
  fName?: string;
  lName?: string;
  email?: string;
  createdAt?: string;
  _id?: string;
  credentialPublicKey?: any[];
};

export async function getData(query?: any): Promise<dataFromServer> {
  const res = await fetch(window.location.origin + "/api/users" + query);
  // Recommendation: handle errors
  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error("Failed to fetch data");
  }

  return res.json();
}
