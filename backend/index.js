// // backend/index.js
// let globalScores = [];
// let countryIndex = {};

// require("dotenv").config();
// const express      = require("express");
// const mongoose     = require("mongoose");
// const cors         = require("cors");
// const bodyParser   = require("body-parser");
// const compression  = require("compression");

// const Rating = require("./models/Rating");

// const app  = express();
// const PORT = process.env.PORT || 5051;

// // Middleware
// app.use(cors());
// app.use(bodyParser.json());
// app.use(compression());

// // MongoDB Connection
// mongoose.connect(process.env.MONGODB_URI)
//   .then(() => {
//     console.log("🚀 Connected to MongoDB");

//     // 🔧 Create indexes
//    Rating.collection.createIndex({ Country: 1 });
// Rating.collection.createIndex({ Rating: 1 });

// (async () => {
//   const allDocs = await Rating.find().select("score Score rating Rating Country");

//   // Try every possible key for rating
//   globalScores = allDocs
//     .map(r => parseFloat(r.Rating || r.rating || r.Score || r.score))
//     .filter(val => !isNaN(val));

//   countryIndex = {};

//   for (const doc of allDocs) {
//     const country = doc.Country || doc.country || "Unknown";
//     const value = parseFloat(doc.Rating || doc.rating || doc.Score || doc.score);
//     if (!isNaN(value)) {
//       if (!countryIndex[country]) countryIndex[country] = [];
//       countryIndex[country].push(value);
//     }
//   }

//   console.log(`⚡ Cached ${globalScores.length} ratings into memory`);
// })();


//   })
//   .catch(err => {
//     console.error("❌ MongoDB connection error:", err);
//     process.exit(1);
//   });

// // 1. Health check
// app.get("/api/message", (req, res) => {
//   res.json({ message: "Backend with MongoDB is up!" });
// });

// // 2. Paginated ratings
// // 2. Return every CSV field, unmodified
// app.get("/api/ratings", async (req, res) => {
//   try {
//     // .lean() makes this faster and removes mongoose wrappers
//     const all = await Rating.find({}).lean();
//     res.json(all);
//   } catch (err) {
//     console.error("❌ /api/ratings error:", err);
//     res.status(500).json({ error: "Failed to fetch ratings." });
//   }
// });


// // 3. Cached country averages
// let averageCache = null;

// app.get("/api/ratings/average", async (req, res) => {
//   if (averageCache) {
//     return res.json(averageCache);
//   }

//   try {
//     const agg = await Rating.aggregate([
//       { $match: { Rating: { $type: "number" } } },
//       { $group: {
//           _id: "$Country",
//           avg: { $avg: "$Rating" }
//         }
//       },
//       { $project: {
//           country: "$_id",
//           rating: { $round: ["$avg", 2] },
//           _id: 0
//         }
//       }
//     ]);
//     averageCache = agg;
//     res.json(agg);
//   } catch (err) {
//     res.status(500).json({ error: "Failed to compute averages." });
//   }
// });

// // 4. Predictor logic
// function calculateRating(data) {
//   let score = 0;
//   const yesMaybeNo = v => v === "Yes" ? 1 : (v === "Maybe" ? 0.5 : 0);
//   const copingMap   = { Yes: 1, No: 0 };
//   const daysMap     = {
//     "Goes out every day": 0,
//     "1-14 days": 0.25,
//     "15-30 days": 0.5,
//     "31-60 days": 0.75,
//     "more than 2 months": 1
//   };
//   const moodMap     = { High: 1, Medium: 0.5, Low: 0 };
//   const occMap      = { Business: 0.65, Corporate: 0.8, Student: 0.2, Others: 0.5 };
//   const interestMap = { Yes: 0, No: 1, Maybe: 0.5 };
//   const careMap     = { Yes: 1, No: 0, Maybe: 0.5 };

//   score += yesMaybeNo(data.Mental_Health_History) * 0.10;
//   score += (copingMap[data.Coping_Struggles] || 0) * 0.10;
//   score += yesMaybeNo(data.Growing_Stress) * 0.10;
//   score += (moodMap[data.Mood_Swings] || 0) * 0.10;
//   score += yesMaybeNo(data.Changes_Habits) * 0.10;
//   score += yesMaybeNo(data.treatment) * 0.10;
//   score += (daysMap[data.Days_Indoors] || 0) * 0.08;
//   score += yesMaybeNo(data.family_history) * 0.07;
//   score += yesMaybeNo(data.Social_Weakness) * 0.08;
//   score += (interestMap[data.Work_Interest] || 0) * 0.05;
//   score += (1 - (careMap[data.care_options] || 0)) * 0.02;
//   score += (occMap[data.Occupation] || 0.10) * 0.10;

//   return score;
// }

// function percentile(scores, v) {
//   const above = scores.filter(x => v > x).length;
//   return (above / scores.length) * 100;
// }

// app.post("/api/predict", async (req, res) => {
//   try {
//     const input = req.body;
//     const score = calculateRating(input);

//     const globalPct = percentile(globalScores, score);

//     const countryScores = countryIndex[input.Country] || [];
//     const countryPct = countryScores.length > 0
//       ? percentile(countryScores, score)
//       : null;

//     res.json({
//       score: parseFloat(score.toFixed(2)),
//       globalPercent: parseFloat(globalPct.toFixed(1)),
//       countryPercent: countryPct != null ? parseFloat(countryPct.toFixed(1)) : null
//     });
//   } catch (err) {
//     console.error("❌ Prediction error:", err);
//     res.status(500).json({ error: "Prediction failed." });
//   }
// });


// // Start server
// app.listen(PORT, () => {
//   console.log(`📡 Backend listening on http://localhost:${PORT}`);
// });



// backend/index.js

// let globalScores = [];
// let countryIndex = {};

// require("dotenv").config();
// const express      = require("express");
// const mongoose     = require("mongoose");
// const cors         = require("cors");
// const bodyParser   = require("body-parser");
// const compression  = require("compression");

// const Rating = require("./models/Rating");

// const app  = express();
// const PORT = process.env.PORT || 5051;

// app.use(cors());
// app.use(bodyParser.json());
// app.use(compression());

// // MongoDB connection and caching logic
// mongoose.connect(process.env.MONGODB_URI)
//   .then(() => {
//     console.log("🚀 Connected to MongoDB");

//     Rating.collection.createIndex({ Country: 1 });
//     Rating.collection.createIndex({ Rating: 1 });

//     (async () => {
//       const allDocs = await Rating.find().select("score Score rating Rating Country");

//       globalScores = allDocs
//         .map(r => parseFloat(r.Rating || r.rating || r.Score || r.score))
//         .filter(val => !isNaN(val));

//       countryIndex = {};

//       for (const doc of allDocs) {
//         const country = doc.Country || doc.country || "Unknown";
//         const value = parseFloat(doc.Rating || doc.rating || doc.Score || doc.score);
//         if (!isNaN(value)) {
//           if (!countryIndex[country]) countryIndex[country] = [];
//           countryIndex[country].push(value);
//         }
//       }

//       console.log(`⚡ Cached ${globalScores.length} ratings into memory`);
//     })();
//   })
//   .catch(err => {
//     console.error("❌ MongoDB connection error:", err);
//     process.exit(1);
//   });

// // --- New Stress Scoring Functions (ported from Python) ---

// function age_stress(age) {
//   if (age <= 12) {
//     return 0.1 + (age / 12) * 0.1;
//   } else if (age <= 24) {
//     return 0.2 + ((age - 12) / 12) * 0.6;
//   } else if (age <= 45) {
//     return 0.8 + ((age - 24) / 21) * 0.2;
//   } else if (age <= 60) {
//     return 1.0 - ((age - 45) / 15) * 0.3;
//   } else if (age <= 75) {
//     return 0.7 - ((age - 60) / 15) * 0.3;
//   } else if (age <= 100) {
//     return 0.4 - ((age - 75) / 25) * 0.2;
//   } else {
//     return 0.2;
//   }
// }

// function sleep_stress(sleep_hours) {
//   return 1 / Math.max(sleep_hours, 1);
// }

// function social_media_stress(sm_hours) {
//   if (sm_hours < 3) return 0.0;
//   else if (sm_hours < 5) return 0.2;
//   else if (sm_hours < 8) return 0.4;
//   else if (sm_hours <= 12) return 0.6;
//   else return 1.0;
// }

// function get_work_interest_scaling(wi) {
//   if (wi === 0) return 1.0;
//   else if (wi === 0.5) return 0.85;
//   else if (wi === 1) return 0.7;
//   else return 1.0;
// }

// function calculateStressScore(data) {
//   try {
//     const wi_scale = get_work_interest_scaling(data.work_interest);

//     const income_val = Math.max(data.income, 0.1);
//     const log_term = Math.log10(1 + income_val);
//     const income_stress = (1 / log_term) * 20 * wi_scale;

//     let stress = income_stress +
//       0.9 * data.mental_health_history +
//       0.8 * data.family_history -
//       0.5 * data.treatment +
//       0.2 * data.mood_swings +
//       0.2 * data.days_indoors +
//       0.2 * data.care_options +
//       0.2 * data.social_weakness +
//       age_stress(data.age) +
//       sleep_stress(data.sleep_hours) +
//       social_media_stress(data.social_media);

//     if (String(data.gender || "").trim().toLowerCase() === "female") {
//       stress *= 1.2;
//     }

//     return parseFloat(stress.toFixed(3));
//   } catch (err) {
//     console.error("❌ Error computing stress:", err);
//     return 0;
//   }
// }

// function percentile(scores, v) {
//   const above = scores.filter(x => v > x).length;
//   return (above / scores.length) * 100;
// }

// // --- API Routes ---

// app.get("/api/message", (req, res) => {
//   res.json({ message: "Backend with MongoDB is up!" });
// });

// app.get("/api/ratings", async (req, res) => {
//   try {
//     const all = await Rating.find({}).lean();
//     res.json(all);
//   } catch (err) {
//     res.status(500).json({ error: "Failed to fetch ratings." });
//   }
// });

// let averageCache = null;
// app.get("/api/ratings/average", async (req, res) => {
//   if (averageCache) {
//     return res.json(averageCache);
//   }
//   try {
//     const agg = await Rating.aggregate([
//       { $match: { Rating: { $type: "number" } } },
//       { $group: {
//           _id: "$Country",
//           avg: { $avg: "$Rating" }
//         }
//       },
//       { $project: {
//           country: "$_id",
//           rating: { $round: ["$avg", 2] },
//           _id: 0
//         }
//       }
//     ]);
//     averageCache = agg;
//     res.json(agg);
//   } catch (err) {
//     res.status(500).json({ error: "Failed to compute averages." });
//   }
// });

// // --- Predictor Endpoint ---
// app.post("/api/predict", async (req, res) => {
//   try {
//     const input = req.body;

//     // ensure numeric conversion
//     for (const k of [
//       "income", "work_interest", "mental_health_history", "family_history",
//       "treatment", "mood_swings", "days_indoors", "care_options",
//       "social_weakness", "age", "sleep_hours", "social_media"
//     ]) {
//       if (input[k] !== undefined) {
//         input[k] = Number(input[k]) || 0;
//       }
//     }

//     const stressScore = calculateStressScore(input);

//     const globalPct = percentile(globalScores, stressScore);
//     const countryScores = countryIndex[input.country] || [];
//     const countryPct = countryScores.length > 0
//       ? percentile(countryScores, stressScore)
//       : null;

//     res.json({
//       score: stressScore,
//       globalPercent: parseFloat(globalPct.toFixed(1)),
//       countryPercent: countryPct != null ? parseFloat(countryPct.toFixed(1)) : null
//     });
//   } catch (err) {
//     console.error("❌ Prediction error:", err);
//     res.status(500).json({ error: "Prediction failed." });
//   }
// });

// app.listen(PORT, () => {
//   console.log(`📡 Backend listening on http://localhost:${PORT}`);
// });





// backend/index.js

let globalScores = [];
let countryIndex = {};

require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const compression = require("compression");

const Rating = require("./models/Rating");

const app = express();
const PORT = process.env.PORT || 5051;

app.use(cors());
app.use(bodyParser.json());
app.use(compression());

// MongoDB connection and caching logic
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("🚀 Connected to MongoDB");

    Rating.collection.createIndex({ Country: 1 });
    Rating.collection.createIndex({ Rating: 1 });

    (async () => {
      const allDocs = await Rating.find().select("score Score rating Rating Country");

      globalScores = allDocs
        .map((r) => parseFloat( r.ratings))
        .filter((val) => !isNaN(val));

      countryIndex = {};

      for (const doc of allDocs) {
        const country = (doc.Country || doc.country || "Unknown").trim().toUpperCase();
        const value = parseFloat(doc.Rating || doc.rating || doc.Score || doc.score);
        if (!isNaN(value)) {
          if (!countryIndex[country]) countryIndex[country] = [];
          countryIndex[country].push(value);
        }
      }

      console.log(`⚡ Cached ${globalScores.length} ratings into memory`);
      console.log(`✅ Available countries in cache: ${Object.keys(countryIndex).join(", ")}`);
    })();
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

// --- New Stress Scoring Functions ---

function age_stress(age) {
  if (age <= 12) {
    return 0.1 + (age / 12) * 0.1;
  } else if (age <= 24) {
    return 0.2 + ((age - 12) / 12) * 0.6;
  } else if (age <= 45) {
    return 0.8 + ((age - 24) / 21) * 0.2;
  } else if (age <= 60) {
    return 1.0 - ((age - 45) / 15) * 0.3;
  } else if (age <= 75) {
    return 0.7 - ((age - 60) / 15) * 0.3;
  } else if (age <= 100) {
    return 0.4 - ((age - 75) / 25) * 0.2;
  } else {
    return 0.2;
  }
}

function sleep_stress(sleep_hours) {
  return 1 / Math.max(sleep_hours, 1);
}

function social_media_stress(sm_hours) {
  if (sm_hours < 3) return 0.0;
  else if (sm_hours < 5) return 0.2;
  else if (sm_hours < 8) return 0.4;
  else if (sm_hours <= 12) return 0.6;
  else return 1.0;
}

function get_work_interest_scaling(wi) {
  if (wi === 0) return 1.0;
  else if (wi === 0.5) return 0.85;
  else if (wi === 1) return 0.7;
  else return 1.0;
}

function calculateStressScore(data) {
  try {
    const wi_scale = get_work_interest_scaling(data.work_interest);

    const income_val = Math.max(data.income, 0.1);
    const log_term = Math.log10(1 + income_val);
    const income_stress = (1 / log_term) * 20 * wi_scale;

    let stress =
      income_stress +
      0.9 * data.mental_health_history +
      0.8 * data.family_history -
      0.5 * data.treatment +
      0.2 * data.mood_swings +
      0.2 * data.days_indoors +
      0.2 * data.care_options +
      0.2 * data.social_weakness +
      data.occupation+
      sleep_stress(data.sleep_hours) +
      social_media_stress(data.social_media);

    if (String(data.gender || "").trim().toLowerCase() === "female") {
      stress *= 1.2;
    }

    return parseFloat(stress.toFixed(3));
  } catch (err) {
    console.error("❌ Error computing stress:", err);
    return 0;
  }
}

function percentile(scores, v) {
  const above = scores.filter((x) => v > x/2).length;
  return (above / scores.length) * 100;
}

// --- API Routes ---

app.get("/api/message", (req, res) => {
  res.json({ message: "Backend with MongoDB is up!" });
});

app.get("/api/ratings", async (req, res) => {
  try {
    const all = await Rating.find({}).lean();
    res.json(all);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch ratings." });
  }
});

let averageCache = null;
app.get("/api/ratings/average", async (req, res) => {
  if (averageCache) {
    return res.json(averageCache);
  }
  try {
    const agg = await Rating.aggregate([
      { $match: { Rating: { $type: "number" } } },
      {
        $group: {
          _id: "$Country",
          avg: { $avg: "$Rating" },
        },
      },
      {
        $project: {
          country: "$_id",
          rating: { $round: ["$avg", 2] },
          _id: 0,
        },
      },
    ]);
    averageCache = agg;
    res.json(agg);
  } catch (err) {
    res.status(500).json({ error: "Failed to compute averages." });
  }
});

// --- Predictor Endpoint ---

app.post("/api/predict", async (req, res) => {
  try {
    const input = req.body;
    console.log("Incoming backend data:", input);

    // Ensure numeric conversion
    for (const k of [
      "income",
      "work_interest",
      "mental_health_history",
      "family_history",
      "treatment",
      "mood_swings",
      "days_indoors",
      "care_options",
      "social_weakness",
      "age",
      "sleep_hours",
      "social_media",
    ]) {
      if (input[k] !== undefined) {
        input[k] = Number(input[k]) || 0;
      }
    }

    const stressScore = calculateStressScore(input);

    const countryKey = (input.Country || "").trim().toUpperCase();
    console.log("Looking up country:", countryKey);
    console.log("Available countries in index:", Object.keys(countryIndex));

    const countryScores = countryIndex[countryKey] || [];
    const countryPct =
      countryScores.length > 0
        ? percentile(countryScores, stressScore)
        : null;


    const globalnewscore = stressScore * 5 + 2;
    const globalPct = percentile(globalScores, globalnewscore);

    res.json({
      score: stressScore,
      globalPercent: parseFloat(globalPct.toFixed(1)),
      countryPercent: countryPct != null ? parseFloat(countryPct.toFixed(1)) : null,
    });
  } catch (err) {
    console.error("❌ Prediction error:", err);
    res.status(500).json({ error: "Prediction failed." });
  }
});

// --- Start server ---

app.listen(PORT, () => {
  console.log(`📡 Backend listening on http://localhost:${PORT}`);
});
