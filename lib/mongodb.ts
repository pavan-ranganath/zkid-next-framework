import { connect, connection, ConnectionStates } from "mongoose";

const conn = {
  isConnected: ConnectionStates.disconnected,
};

export async function dbConnect() {
  if (!process.env.MONGODB_URI) {
    throw new Error("Please add your Mongo URI to .env.local");
  }
  if (conn.isConnected) {
    return;
  }

  const db = await connect(process.env.MONGODB_URI);
  // console.log(db.connection.db.databaseName);
  conn.isConnected = db.connections[0].readyState;
}

connection.on("connected", () => console.log("Mongodb connected to db"));

connection.on("error", (err) => console.error("Mongodb Errro:", err.message));
