// Async function to fetch data from sepecified url
export const fetcher = async (url: string) => {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Failed to fetch data");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    throw new Error((error as Error).message);
  }
};
