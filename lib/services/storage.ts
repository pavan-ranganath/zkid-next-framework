import mongoose from "mongoose";
import "bson";
export async function storeData(data: any, collectionName: string) {
  const db = mongoose.connection.db;
  const collection = db.collection(collectionName);

  try {
    const result = await collection.insertOne({ ...data });
    console.log(`Data with key '${collectionName}' stored securely.`);
    return result; // Return the result of the insert operation
  } catch (error) {
    console.error(`Error storing data with key '${collectionName}':`, error);
    // throw error; // Rethrow the error so it can be handled by the caller
    return null;
  }
}

export async function getData(key: any, collectionName: string) {
  const db = mongoose.connection.db;

  const collection = db.collection(collectionName);

  try {
    const result = await collection.findOne({ ...key });
    if (result) {
      console.log(`Data with key '${key}' retrieved securely.`);
      return result;
    }
    console.log(`Data with key '${key}' not found.`);
    return null;
  } catch (error) {
    console.error(`Error retrieving data with key '${key}':`, error);
    return null;
  }
}

// update collection in table for a key
export async function updateData(userID: any, data: any, collectionName: string, key: string, isArrayUpdate = false) {
  const db = mongoose.connection.db;

  // Check if the collection exists, and create it if it doesn't
  if (!(await db.listCollections({ name: collectionName }).hasNext())) {
    await db.createCollection(collectionName);
  }

  const collection = db.collection(collectionName);

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

export async function checkDigiLockerID(user_sso_id: string, userId: string) {
  const db = mongoose.connection.db;

  const collection = db.collection("credentials");
  const digiLockerIDDoc = await collection.findOne({
    "aadhaar.digiLockerUserInfo.user_sso_id": user_sso_id,
    userID: { $ne: userId },
  });
  if (digiLockerIDDoc) {
    // The document with the specified user_sso_id exists
    return true;
  }
  // The document with the specified user_sso_id does not exist
  return false;
}
