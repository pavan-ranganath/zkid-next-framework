import mongoose from "mongoose";

export async function storeData(data: any, collectionName: string) {
  const collection = mongoose.connection.db.collection(collectionName);

  try {
    const result = await collection.insertOne({ data });
    console.log(`Data with key '${collectionName}' stored securely.`);
    return result; // Return the result of the insert operation
  } catch (error) {
    console.error(`Error storing data with key '${collectionName}':`, error);
    // throw error; // Rethrow the error so it can be handled by the caller
    return null;
  }
}

export async function getData(key: any, collectionName: string) {
  const collection = mongoose.connection.db.collection(collectionName);

  try {
    const result = await collection.findOne({ key });
    if (result) {
      console.log(`Data with key '${key}' retrieved securely.`);
      return result.data;
    } else {
      console.log(`Data with key '${key}' not found.`);
      return null;
    }
  } catch (error) {
    console.error(`Error retrieving data with key '${key}':`, error);
    return null;
  }
}

// update collection in table for a key
export async function updateData(userID: any, data: any, collectionName: string, key: string) {
  const collection = mongoose.connection.db.collection(collectionName);

  try {
    const result = await collection.updateOne({ userID }, { $set: { [key]: data } });

    console.log(`Data with key '${userID}' updated securely.`);
    return result; // Return the result of the insert operation
  } catch (error) {
    console.error(`Error updating data with key '${userID}':`, error);
    // throw error; // Rethrow the error so it can be handled by the caller
    return null;
  }
}
