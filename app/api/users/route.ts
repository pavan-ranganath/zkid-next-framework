import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { Sort } from "mongodb";
import { dbConnect } from "@/lib/mongodb";
import { ColumnSort, ColumnFilter } from "@tanstack/table-core";

dbConnect();
export type filter = {
  id: string;
  value: string;
};
export async function GET(req: NextRequest, context: any) {
  try {
    const { page = 1, limit = 10, sorting = "", filters = "" } = Object.fromEntries(req.nextUrl.searchParams.entries());
    const collection = mongoose.connection.db.collection("credentials");

    const skip = +page * +limit;
    let query = {};
    const searchQuery: ColumnFilter[] = JSON.parse(filters);
    // Apply search query
    if (searchQuery.length) {
      query = {
        $or: searchQuery.map((field: ColumnFilter) => ({
          [field.id]: { $regex: field.value, $options: "i" },
        })),
      };
    }
    const sortOptions: ColumnSort[] = JSON.parse(sorting);
    const sortingObj: Sort = {};
    if (sortOptions.length) {
      //   sortOptions.map((field: ColumnSort) => ({
      //   [field.id]: !field.desc,
      // }));
      for (let i = 0; i < sortOptions.length; i++) {
        sortingObj[sortOptions[i].id] = !sortOptions[i].desc ? 1 : -1;
      }
    }

    const totalCount = await collection.countDocuments(query);
    const totalPages = Math.ceil(totalCount / +limit);

    const data = await collection.find(query).sort(sortingObj).skip(skip).limit(+limit).toArray();
    return NextResponse.json({ data, totalCount, limit, totalPages });
  } catch (error) {
    console.error("Error processing API request:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
