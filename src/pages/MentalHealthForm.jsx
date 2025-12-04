import React, { useState, useEffect } from "react";
import Papa from "papaparse";
import {
  FaUserTie,
  FaUsers,
  FaStethoscope,
  FaBrain,
  FaHeartBroken,
  FaUserSecret,
  FaSmileBeam,
  FaThumbsUp,
  FaUserClock,
  FaCalendarTimes,
  FaHome,
  FaUser,
  FaStar,
  FaGlobe,
} from "react-icons/fa";

// ✅ UI Components
const Card = ({ children, className = "" }) => (
  <div className={`bg-white bg-opacity-70 backdrop-blur-sm shadow-xl rounded-3xl ${className}`}>
    {children}
  </div>
);

const CardContent = ({ children, className = "" }) => (
  <div className={`p-8 ${className}`}>{children}</div>
);

const Button = ({ children, onClick }) => (
  <button
    onClick={onClick}
    className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:scale-105 transition-all duration-300"
  >
    {children}
  </button>
);

const Label = ({ children }) => (
  <label className="block mb-1 font-semibold text-gray-700">{children}</label>
);

const Select = ({ value, onChange, options, icon }) => (
  <div className="flex items-center gap-3 border border-gray-300 rounded-lg px-3 py-2 bg-white bg-opacity-60 hover:bg-opacity-80 transition">
    {icon && <span className="text-indigo-600 text-xl">{icon}</span>}
    <select
      value={value}
      onChange={onChange}
      className="flex-1 bg-transparent outline-none"
    >
      <option value="">Select an option</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  </div>
);

// ✅ StarRating Component
const StarRating = ({ score }) => {
  const fullStars = Math.floor(score * 5);
  const stars = [];

  for (let i = 0; i < 5; i++) {
    stars.push(
      <FaStar
        key={i}
        className={
          i < fullStars
            ? "text-yellow-400"
            : "text-gray-300"
        }
      />
    );
  }

  return <div className="flex gap-1">{stars}</div>;
};

// ✅ Scoring logic
function calculateRating(data) {
  let score = 0;

  const yesMaybeNo = (value) => {
    if (value === "Yes") return 1;
    if (value === "Maybe") return 0.5;
    return 0;
  };

  const copingStrugglesMap = {
    "Yes": 1,
    "No": 0,
  };
  const daysIndoorMap = {
    "Goes out every day": 0,
    "1-14 days": 0.25,
    "15-30 days": 0.5,
    "31-60 days": 0.75,
    "more than 2 months": 1,
  };

  const moodSwingsMap = {
    "High": 1,
    "Medium": 0.5,
    "Low": 0,
  };

  const occupationMap = {
    "Business": 0.65,
    "Corporate": 0.8,
    "Student": 0.2,
    "House wife": 0.3,
    "Others": 0.5,
  };

  const workInterestMap = {
    "Yes": 0,
    "No": 1,
    "Maybe": 0.5,
  };

  const careOptionsMap = {
    "Yes": 1,
    "No": 0,
    "Maybe": 0.5,
  };

  score += yesMaybeNo(data.Mental_Health_History) * 0.10;
  score += copingStrugglesMap[data.Coping_Struggles] * 0.10;
  score += yesMaybeNo(data.Growing_Stress) * 0.10;
  score += moodSwingsMap[data.Mood_Swings] * 0.10 || 0;
  score += yesMaybeNo(data.Changes_Habits) * 0.10;
  score += yesMaybeNo(data.treatment) * 0.10;
  score += (daysIndoorMap[data.Days_Indoors] || 0) * 0.08;
  score += yesMaybeNo(data.family_history) * 0.07;
  score += yesMaybeNo(data.Social_Weakness) * 0.08;
  score += workInterestMap[data.Work_Interest] * 0.05 || 0;
  score += (1 - careOptionsMap[data.care_options]) * 0.02 || 0;
  score += occupationMap[data.Occupation] * 0.10 || 0.10;

  return score;
}

export default function CombinedMentalHealthForm() {
  const [formData, setFormData] = useState({});
  const [rating, setRating] = useState(null);
  const [countryPercentile, setCountryPercentile] = useState(null);
  const [globalPercentile, setGlobalPercentile] = useState(null);
  const [dataset, setDataset] = useState([]);

  const countries = [
    "United States", "Poland", "Australia", "Canada", "United Kingdom",
    "South Africa", "Sweden", "New Zealand", "Netherlands", "India",
    "Belgium", "Ireland", "France", "Portugal", "Brazil", "Costa Rica",
    "Russia", "Germany", "Switzerland", "Finland", "Israel", "Italy",
    "Bosnia and Herzegovina", "Singapore", "Nigeria", "Croatia",
    "Thailand", "Denmark", "Mexico", "Greece", "Moldova", "Colombia",
    "Georgia", "Czech Republic", "Philippines"
  ];

  useEffect(() => {
    fetch("/ratings.csv")
      .then((res) => res.text())
      .then((csvText) => {
        Papa.parse(csvText, {
          header: true,
          complete: (results) => {
            const parsed = results.data
              .map((row) => ({
                country: row.Country?.trim(),
                score: parseFloat(row.Score),
              }))
              .filter((r) => r.country && !isNaN(r.score));
            setDataset(parsed);
          },
          error: (err) => console.error("CSV Parse Error:", err),
        });
      })
      .catch((err) => console.error("Error loading CSV:", err));
  }, []);

  const handleChange = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = () => {
    const r = calculateRating(formData);
    setRating(r.toFixed(2));

    if (dataset.length > 0) {
      // Global percentile
      const allScores = dataset.map(d => d.score);
      const globalAbove = allScores.filter(d => r > d).length;
      const gp = ((globalAbove / allScores.length) * 100).toFixed(1);
      setGlobalPercentile(gp);

      // Country-specific percentile
      const selectedCountry = formData.Country;
      if (selectedCountry) {
        const countryScores = dataset
          .filter(d => d.country === selectedCountry)
          .map(d => d.score);

        if (countryScores.length > 0) {
          const above = countryScores.filter((d) => r > d).length;
          const cp = ((above / countryScores.length) * 100).toFixed(1);
          setCountryPercentile(cp);
        } else {
          setCountryPercentile("No data for selected country");
        }
      } else {
        setCountryPercentile("Country not selected");
      }
    } else {
      setGlobalPercentile("No dataset available");
      setCountryPercentile("No dataset available");
    }
  };

  const getMessageForRating = (ratingValue) => {
    const scaled = ratingValue * 5;
    if (scaled < 1) {
      return { emoji: "😢", message: "It looks like you’re facing significant challenges. Seeking professional support could be very helpful." };
    } else if (scaled < 2) {
      return { emoji: "😟", message: "There are some areas of concern. Talking to someone you trust may help you feel better." };
    } else if (scaled < 3) {
      return { emoji: "🙂", message: "Your results are moderate. Maintaining healthy habits and self-care is important." };
    } else if (scaled < 4) {
      return { emoji: "😃", message: "You’re doing quite well! Keep taking care of your mental health." };
    } else {
      return { emoji: "🎉", message: "Fantastic! You appear to be in great mental shape. Keep up the positive momentum!" };
    }
  };

  const fields = [
    {
      key: "Country",
      label: "Country",
      icon: <FaGlobe />,
      options: countries,
    },
    {
      key: "Occupation",
      label: "Occupation",
      icon: <FaUserTie />,
      options: ["Business", "Student", "House wife", "Others", "Corporate"],
    },
    {
      key: "family_history",
      label: "Family History",
      icon: <FaUsers />,
      options: ["Yes", "No"],
    },
    {
      key: "treatment",
      label: "Treatment",
      icon: <FaStethoscope />,
      options: ["Yes", "No"],
    },
    {
      key: "Growing_Stress",
      label: "Growing Stress",
      icon: <FaBrain />,
      options: ["Yes", "No", "Maybe"],
    },
    {
      key: "Coping_Struggles",
      label: "Coping Struggles",
      icon: <FaHeartBroken />,
      options: ["Yes", "No", "Maybe"],
    },
    {
      key: "Social_Weakness",
      label: "Social Weakness",
      icon: <FaUserSecret />,
      options: ["Yes", "No", "Maybe"],
    },
    {
      key: "Mental_Health_History",
      label: "Mental Health History",
      icon: <FaSmileBeam />,
      options: ["Yes", "No", "Maybe"],
    },
    {
      key: "Changes_Habits",
      label: "Changes in Habits",
      icon: <FaThumbsUp />,
      options: ["Yes", "No", "Maybe"],
    },
    {
      key: "Mood_Swings",
      label: "Mood Swings",
      icon: <FaUserClock />,
      options: ["High", "Medium", "Low"],
    },
    {
      key: "Work_Interest",
      label: "Work Interest",
      icon: <FaCalendarTimes />,
      options: ["Yes", "No", "Maybe"],
    },
    {
      key: "Days_Indoors",
      label: "Days Indoors",
      icon: <FaHome />,
      options: [
        "Goes out every day",
        "1-14 days",
        "15-30 days",
        "31-60 days",
        "more than 2 months",
      ],
    },
    {
      key: "care_options",
      label: "Care Options",
      icon: <FaUser />,
      options: ["Yes", "No", "Maybe"],
    }
  ];

  return (
    <div className="relative overflow-hidden min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-indigo-200 p-6 flex items-center justify-center">
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-purple-300 rounded-full filter blur-3xl opacity-30"></div>
      <div className="absolute top-32 -right-24 w-96 h-96 bg-indigo-300 rounded-full filter blur-3xl opacity-30"></div>

      <Card className="w-full max-w-4xl relative z-10">
        <CardContent>
          <h2 className="text-4xl font-extrabold text-center text-gray-800 mb-8">
            Mental Health Rating Form
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {fields.map((field) => (
              <div key={field.key}>
                <Label>{field.label}</Label>
                <Select
                  value={formData[field.key] || ""}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  options={field.options}
                  icon={field.icon}
                />
              </div>
            ))}
          </div>

          <div className="mt-10 flex justify-center">
            <Button onClick={handleSubmit}>Calculate Rating</Button>
          </div>

          {rating && (() => {
            const { emoji, message } = getMessageForRating(parseFloat((100-globalPercentile) / 100));
            return (
              <div className="mt-8 flex flex-col items-center text-lg">
                <StarRating score={parseFloat(rating)} />
                <p className="font-semibold mt-2">
                  Rating: <span className="text-indigo-600">{(rating * 5).toFixed(2)} / 5.00</span>
                </p>

                  <p className="mt-4 text-gray-800 text-center text-lg">
                    Based on our data, you rank in the 
                    <span className="text-indigo-600 font-semibold">
                      {" "}
                      {globalPercentile === "No dataset available"
                        ? `${(100 - globalPercentile).toFixed(1)}%`
                        : globalPercentile}
                    </span>{" "}
                    of individuals{" "}
                    <span className="text-indigo-700 font-bold">Globally</span>{" "}
                    for good mental health.
                  </p>

                  <p className="mt-2 text-gray-800 text-center text-lg">
                    Within{" "}
                    <span className="text-indigo-700 font-bold">
                      {formData.Country || "your selected country"}
                    </span>
                    , you’re among the top{" "}
                    <span className="text-indigo-600 font-semibold">
                      {typeof countryPercentile === "string"
                        ? countryPercentile
                        : `${(countryPercentile).toFixed(1)}%`}
                    </span>{" "}
                    in mental health scores.
                  </p>   
                  <div className="p-4 rounded-lg bg-purple-100 text-center text-gray-800 flex items-center justify-center gap-4 mt-6">
                    <div className="text-5xl">{emoji}</div>
                    <div className="text-lg">{message}</div>
                  </div>
              </div>
            );
          })()}

        </CardContent>
      </Card>
    </div>
  );
}
