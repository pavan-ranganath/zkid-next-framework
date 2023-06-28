// Importing the DbCredential interface from the "@/lib/webauthn" module
import { DbCredential } from "@/lib/webauthn";

// Defining an interface credentailsFromTb that extends DbCredential and adds an _id property
export interface credentailsFromTb extends DbCredential {
  _id: string;
}

// Defining a type dataFromServer that contains an array of credentailsFromTb, along with other properties
export type dataFromServer = {
  data: credentailsFromTb[];
  totalCount: number;
  limit: number;
  totalPages: number;
};

// Defining a type User that represents a user and its properties
export type User = {
  fName?: string;
  lName?: string;
  email?: string;
  createdAt?: string;
  _id?: string;
};

// Defining an asynchronous function getData that returns a Promise of type dataFromServer
// It takes an optional query parameter for pagination, sorting, search
export async function getData(query?: any): Promise<dataFromServer> {
  // Making a fetch request to the "/api/users" endpoint with the provided query
  const res = await fetch(`${window.location.origin}/api/users${query}`);

  // Recommendation: handle errors
  // If the fetch request was not successful, throw an error to activate the closest Error Boundary
  if (!res.ok) {
    throw new Error("Failed to fetch data");
  }

  // Returning the JSON response from the fetch request
  return res.json();
}
