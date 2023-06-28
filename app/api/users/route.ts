import { NextRequest, NextResponse } from "next/server"; // Import Next.js server functions for handling requests and responses
import mongoose from "mongoose"; // Import Mongoose library for MongoDB database interaction
import { Sort } from "mongodb"; // Import MongoDB Sort interface for sorting query results
import { dbConnect } from "@/lib/mongodb"; // Import custom function for connecting to MongoDB
import { ColumnSort, ColumnFilter } from "@tanstack/table-core"; // Import interfaces for column sorting and filtering

export const dynamic = "force-dynamic"; // to supress Error processing API request: DynamicServerError: Dynamic server usage: nextUrl.searchParams

// Define the type for the filter object
export type filter = {
  id: string;
  value: string;
};

// Handler function for users GET requests with filtering, sorting, and pagination functionality
// Return the JSON response with the data and pagination details
export async function GET(req: NextRequest, context: any) {
  try {
    // Establishing a connection to the database
    await dbConnect();

    // Extract query parameters from the request URL
    const { page = 1, limit = 10, sorting = "", filters = "" } = Object.fromEntries(req.nextUrl.searchParams.entries());

    // Access the "credentials" collection in the MongoDB database
    const collection = mongoose.connection.db.collection("credentials");

    // Calculate the number of documents to skip based on the pagination parameters
    const skip = +page * +limit;

    // Create an empty query object
    let query = {};

    // Parse the filters parameter into an array of ColumnFilter objects
    const searchQuery: ColumnFilter[] = JSON.parse(filters);

    // Apply search query
    if (searchQuery.length) {
      // Construct the query using the search query filters
      query = {
        $or: searchQuery.map((field: ColumnFilter) => ({
          [field.id]: { $regex: field.value, $options: "i" }, // Perform case-insensitive matching on the field value
        })),
      };
    }

    // Parse the sorting parameter into an array of ColumnSort objects
    const sortOptions: ColumnSort[] = JSON.parse(sorting);

    // Create an empty sorting object
    const sortingObj: Sort = {};

    // Apply sorting options
    if (sortOptions.length) {
      // Iterate through the sort options and construct the sorting object
      for (let i = 0; i < sortOptions.length; i++) {
        sortingObj[sortOptions[i].id] = !sortOptions[i].desc ? 1 : -1;
      }
    }

    // Get the total count of documents matching the query
    const totalCount = await collection.countDocuments(query);

    // Calculate the total number of pages based on the limit parameter
    const totalPages = Math.ceil(totalCount / +limit);

    // Fetch the data from the collection, applying query, sorting, pagination
    const data = await collection.find(query).sort(sortingObj).skip(skip).limit(+limit).toArray();

    // Return the JSON response with the data and pagination details
    return NextResponse.json({ data, totalCount, limit, totalPages });
  } catch (error) {
    console.error("Error processing API request:", error);
    // Return an error response if any exception occurs
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
