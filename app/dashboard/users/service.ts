export type dataFromServer = {
  data: User[];
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
};

export async function getData(query?: any): Promise<dataFromServer> {
  const res = await fetch("http://localhost:3000/api/users" + query);
  // Recommendation: handle errors
  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error("Failed to fetch data");
  }

  return res.json();
}
