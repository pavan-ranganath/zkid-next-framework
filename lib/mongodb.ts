// Importing the necessary modules and functions from "mongoose"
import { connect, connection, ConnectionStates, ConnectOptions } from "mongoose";

const options: ConnectOptions = {
  tlsAllowInvalidHostnames: true,
  tls: true,
  tlsCAFile: process.env.TLS_CA_FILE,
  tlsCertificateKeyFile: process.env.TLS_CERT_KEY_FILE,
};

// Represents the connection state of the database
const conn = {
  isConnected: ConnectionStates.disconnected,
};

// Function to establish a connection to the database
export async function dbConnect() {
  // Checking if the MongoDB URI is provided in the environment variables
  if (!process.env.MONGODB_URI) {
    throw new Error("Please add your Mongo URI to .env.local");
  }

  // Checking if already connected to the database
  if (conn.isConnected) {
    return;
  }

  // Connecting to the MongoDB database using the provided URI
  const db = await connect(process.env.MONGODB_URI, options);

  // Updating the connection state based on the ready state of the connection
  conn.isConnected = db.connections[0].readyState;
}

// Event listener for successful database connection
connection.on("connected", () => console.log("Mongodb connected to db"));

// Event listener for database connection errors
connection.on("error", (err) => console.error("Mongodb Error:", err.message));
