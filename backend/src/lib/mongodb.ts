import { MongoClient, Db } from 'mongodb';

const uri = process.env.MONGODB_URI || 'mongodb+srv://Events:xG2DGkbM1s9piLed@cluster0.vyryoss.mongodb.net/communitypulse?retryWrites=true&w=majority';
const dbName = process.env.MONGODB_DB || 'communitypulse';

let clientPromise: Promise<MongoClient>;

const client = new MongoClient(uri);
clientPromise = client.connect();

export async function getDb(): Promise<Db> {
  const connectedClient = await clientPromise;
  return connectedClient.db(dbName);
}

export default clientPromise;
