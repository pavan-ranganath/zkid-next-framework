import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

export async function GET(req: NextRequest, context: any) {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
      searchQuery = "",
      searchFields = ["email"],
    } = Object.fromEntries(req.nextUrl.searchParams.entries());
    const collection = mongoose.connection.db.collection("users");

    const skip = (+page - 1) * +limit;
    let query = {};
    const fieldList = Array.isArray(searchFields)
      ? searchFields
      : [searchFields];

    // Apply search query
    if (searchQuery) {
      query = {
        $or: fieldList.map((field: any) => ({
          [field]: { $regex: searchQuery, $options: "i" },
        })),
      };
    }

    const sortOptions = { [sortBy as string]: sortOrder === "asc" ? 1 : -1 };

    const totalCount = await collection.countDocuments(query);
    const totalPages = Math.ceil(totalCount / +limit);

    const data = await collection
      .find(query)
      .sort(sortOptions as any)
      .skip(skip)
      .limit(+limit)
      .toArray();
    return NextResponse.json({ data, totalCount, limit, totalPages });
  } catch (error) {
    console.error("Error processing API request:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
