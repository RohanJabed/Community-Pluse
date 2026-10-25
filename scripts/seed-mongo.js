const { MongoClient } = require("mongodb");
const fs = require("fs");
const path = require("path");

const uri = "mongodb+srv://Events:xG2DGkbM1s9piLed@cluster0.vyryoss.mongodb.net/communitypulse?retryWrites=true&w=majority";
const dbPath = path.join(__dirname, "..", "data", "db.json");

async function seed() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    console.log("Connected to MongoDB Atlas!");
    const db = client.db("communitypulse");

    const data = JSON.parse(fs.readFileSync(dbPath, "utf-8"));

    // Users
    const usersCol = db.collection("users");
    await usersCol.deleteMany({});
    await usersCol.insertMany(data.users);
    console.log(`Inserted ${data.users.length} users into MongoDB`);

    // Events
    const eventsCol = db.collection("events");
    await eventsCol.deleteMany({});
    await eventsCol.insertMany(data.events);
    console.log(`Inserted ${data.events.length} events into MongoDB`);

    // Registrations
    const regsCol = db.collection("registrations");
    await regsCol.deleteMany({});
    await regsCol.insertMany(data.registrations);
    console.log(`Inserted ${data.registrations.length} registrations into MongoDB`);

    console.log("MongoDB database seeded successfully!");
  } catch (err) {
    console.error("Seeding failed:", err);
  } finally {
    await client.close();
  }
}

seed();
