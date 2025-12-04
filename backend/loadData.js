// // backend/loadData.js
// require("dotenv").config();
// const fs = require("fs");
// const csv = require("csv-parser");
// const mongoose = require("mongoose");
// const Rating = require("./models/Rating");

// async function main() {
//   await mongoose.connect(process.env.MONGODB_URI);
//   console.log("✅ Connected to MongoDB");

//   // 1. Clear existing ratings
//   await Rating.deleteMany({});
//   console.log("🗑 Cleared existing ratings");

//   // 2. Read full CSV with exact headers
//   const rows = [];
//   let headers = [];

//   fs.createReadStream("ratings.csv") // Make sure this is the latest CSV
//     .pipe(csv({ mapHeaders: ({ header }) => header.trim() }))
//     .on("headers", (h) => {
//       headers = h;
//       console.log("🔖 Detected headers:", headers);
//     })
//     .on("data", (row) => {
//       const doc = {};

//       // Copy every field exactly as-is from CSV
//       headers.forEach((key) => {
//         doc[key] = row[key]?.trim?.() ?? row[key];
//       });

//       rows.push(doc);
//     })
//     .on("end", async () => {
//       console.log(`🗂 ${rows.length} rows to import`);

//       if (rows.length > 0) {
//         try {
//           await Rating.insertMany(rows, { ordered: false });
//           console.log(`✅ Imported ${rows.length} rows into MongoDB`);
//         } catch (err) {
//           console.error("❌ Insert error:", err);
//         }
//       } else {
//         console.warn("⚠️ No rows imported — CSV may be empty or corrupted");
//       }

//       mongoose.disconnect();
//     })
//     .on("error", (err) => {
//       console.error("❌ CSV read error:", err);
//     });
// }

// main().catch((err) => {
//   console.error("❌ Import script error:", err);
//   process.exit(1);
// });
// backend/loadData.js
require("dotenv").config();
const fs = require("fs");
const csv = require("csv-parser");
const mongoose = require("mongoose");
const Rating = require("./models/Rating");

const BATCH_SIZE = 1000;

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("✅ Connected to MongoDB");

  await Rating.deleteMany({});
  console.log("🗑 Cleared existing ratings");

  let batch = [];
  let headers = [];

  const stream = fs.createReadStream("dataset.csv")
    .pipe(csv({ mapHeaders: ({ header }) => header.trim() }))
    .on("headers", (h) => {
      headers = h;
      console.log("🔖 Detected headers:", headers);
    })
    .on("data", async (row) => {
      const doc = {};
      headers.forEach((key) => {
        doc[key] = row[key]?.trim?.() ?? row[key];
      });

      batch.push(doc);

      if (batch.length >= BATCH_SIZE) {
        stream.pause(); // pause until insert is done
        try {
          await Rating.insertMany(batch, { ordered: false });
        } catch (err) {
          console.error("❌ Batch insert error:", err.message);
        }
        console.log(`✅ Inserted ${batch.length} rows`);
        batch = [];
        stream.resume();
      }
    })
    .on("end", async () => {
      if (batch.length > 0) {
        try {
          await Rating.insertMany(batch, { ordered: false });
          console.log(`✅ Inserted final ${batch.length} rows`);
        } catch (err) {
          console.error("❌ Final batch error:", err.message);
        }
      }
      console.log("🏁 Import completed.");
      mongoose.disconnect();
    })
    .on("error", (err) => {
      console.error("❌ CSV read error:", err);
    });
}

main().catch((err) => {
  console.error("❌ Import script error:", err);
  process.exit(1);
});
