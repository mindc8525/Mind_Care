import React, { useState } from "react";
import {
  FaUserTie, FaUsers, FaStethoscope, FaBrain, FaHeartBroken, FaUserSecret,
  FaSmileBeam, FaThumbsUp, FaUserClock, FaCalendarTimes, FaHome, FaUser,
  FaStar, FaGlobe
} from "react-icons/fa";

// ⭐ Utility scoring functions
const age_stress = (age) => {
  if (age <= 12) return 0.1 + (age / 12) * 0.1;
  if (age <= 24) return 0.2 + ((age - 12) / 12) * 0.6;
  if (age <= 45) return 0.8 + ((age - 24) / 21) * 0.2;
  if (age <= 60) return 1.0 - ((age - 45) / 15) * 0.3;
  if (age <= 75) return 0.7 - ((age - 60) / 15) * 0.3;
  if (age <= 100) return 0.4 - ((age - 75) / 25) * 0.2;
  return 0.2;
};
const sleep_stress = (h) => 1 / Math.max(h, 1);
const social_media_stress = (h) => h < 3 ? 0 : h < 5 ? 0.2 : h < 8 ? 0.4 : h <= 12 ? 0.6 : 1;
const get_work_interest_scaling = (wi) => wi === 0 ? 1.0 : wi === 0.5 ? 0.85 : 0.7;
const calculateStressScore = (data) => {
  const wi_scale = get_work_interest_scaling(data.work_interest ?? 0.5);
  const income = Math.max(data.income || 0.1, 0.1);
  const income_stress = (1 / Math.log10(1 + income)) * 20 * wi_scale;
  let score = income_stress +
    0.9 * (data.mental_health_history || 0) +
    0.8 * (data.family_history || 0) -
    0.5 * (data.treatment || 0) +
    0.2 * (data.mood_swings || 0) +
    0.2 * (data.days_indoors || 0) +
    0.2 * (data.care_options || 0) +
    0.2 * (data.social_weakness || 0) +
    (data.occupation || 0.5) +
    sleep_stress(data.sleep_hours || 0) +
    social_media_stress(data.social_media || 0);
  if ((data.gender || "").toLowerCase() === "female") score *= 1.2;
  return parseFloat(score.toFixed(2));
};

const Card = ({ children }) => <div className="bg-white bg-opacity-70 backdrop-blur-sm shadow-xl rounded-3xl p-8">{children}</div>;
const Label = ({ children }) => <label className="block mb-1 font-semibold text-gray-700">{children}</label>;
const Select = ({ value, onChange, options, icon }) => (
  <div className="flex items-center gap-3 border px-3 py-2 rounded-lg bg-white bg-opacity-60">
    {icon && <span className="text-indigo-600 text-xl">{icon}</span>}
    <select value={value} onChange={onChange} className="bg-transparent flex-1 outline-none">
      <option value="">Select</option>
      {options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  </div>
);
const Input = ({ value, onChange, icon, placeholder }) => (
  <div className="flex items-center gap-3 border px-3 py-2 rounded-lg bg-white bg-opacity-60">
    {icon && <span className="text-indigo-600 text-xl">{icon}</span>}
    <input
      type="number"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="flex-1 bg-transparent outline-none"
    />
  </div>
);
const StarRating = ({ score }) => {
  const stars = Math.min(5, Math.max(0, Math.round(score / 4)));
  return (
    <div className="flex gap-1 mt-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <FaStar key={i} className={i < stars ? "text-yellow-400" : "text-gray-300"} />
      ))}
    </div>
  );
};

export default function Predictor() {
  const [form, setForm] = useState({});
  const [score, setScore] = useState(null);

  const handleChange = (key, value) => setForm((f) => ({ ...f, [key]: value }));
  const yesMaybeNo = (v) => v === "Yes" ? 1 : v === "Maybe" ? 0.5 : 0;
  const moodMap = { High: 1, Medium: 0.5, Low: 0 };
  const daysMap = {
    "Goes out every day": 0, "1-14 days": 0.25, "15-30 days": 0.5,
    "31-60 days": 0.75, "more than 2 months": 1
  };
  const occMap = { Business: 0.65, Corporate: 0.8, Student: 0.2, "House wife": 0.4, Others: 0.5 };
  const wiMap = { Yes: 0, No: 1, Maybe: 0.5 };
  const careMap = { Yes: 1, No: 0, Maybe: 0.5 };

  const compute = () => {
    const input = {
      ...form,
      social_media: +form.social_media || 0,
      sleep_hours: +form.sleep_hours || 0,
      age: +form.age || 0,
      income: +form.income || 0,
      mental_health_history: yesMaybeNo(form.Mental_Health_History),
      family_history: yesMaybeNo(form.family_history),
      treatment: yesMaybeNo(form.treatment),
      mood_swings: moodMap[form.Mood_Swings] ?? 0,
      days_indoors: daysMap[form.Days_Indoors] ?? 0,
      care_options: careMap[form.care_options] ?? 0,
      social_weakness: yesMaybeNo(form.Social_Weakness),
      work_interest: wiMap[form.Work_Interest] ?? 0.5,
      occupation: occMap[form.Occupation] ?? 0.5,
    };
    setScore(calculateStressScore(input));
  };

  const fields = [
    { key: "age", label: "Age", input: true, icon: <FaUser /> },
    { key: "income", label: "Income (USD)", input: true, icon: <FaUserTie /> },
    { key: "social_media", label: "Social Media (hrs/day)", input: true, icon: <FaUserClock /> },
    { key: "sleep_hours", label: "Sleep Hours", input: true, icon: <FaUserClock /> },
    { key: "Country", label: "Country", options: ["India", "US", "UK"], icon: <FaGlobe /> },
    { key: "Occupation", options: ["Business", "Student", "House wife", "Corporate", "Others"], icon: <FaUserTie /> },
    { key: "family_history", options: ["Yes", "No"], icon: <FaUsers /> },
    { key: "treatment", options: ["Yes", "No"], icon: <FaStethoscope /> },
    { key: "Growing_Stress", options: ["Yes", "No", "Maybe"], icon: <FaBrain /> },
    { key: "Coping_Struggles", options: ["Yes", "No"], icon: <FaHeartBroken /> },
    { key: "Social_Weakness", options: ["Yes", "No", "Maybe"], icon: <FaUserSecret /> },
    { key: "Mental_Health_History", options: ["Yes", "No", "Maybe"], icon: <FaSmileBeam /> },
    { key: "Changes_Habits", options: ["Yes", "No", "Maybe"], icon: <FaThumbsUp /> },
    { key: "Mood_Swings", options: ["High", "Medium", "Low"], icon: <FaUserClock /> },
    { key: "Work_Interest", options: ["Yes", "No", "Maybe"], icon: <FaCalendarTimes /> },
    { key: "Days_Indoors", options: ["Goes out every day", "1-14 days", "15-30 days", "31-60 days", "more than 2 months"], icon: <FaHome /> },
    { key: "care_options", options: ["Yes", "No", "Maybe"], icon: <FaUser /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-indigo-200 flex items-center justify-center p-6">
      <Card>
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">Stress Score Estimator</h1>
        <div className="grid md:grid-cols-2 gap-5">
          {fields.map(({ key, label, input, options, icon }) => (
            <div key={key}>
              <Label>{label || key}</Label>
              {input
                ? <Input value={form[key] || ""} onChange={(e) => handleChange(key, e.target.value)} icon={icon} placeholder={`Enter ${label || key}`} />
                : <Select value={form[key] || ""} onChange={(e) => handleChange(key, e.target.value)} options={options} icon={icon} />}
            </div>
          ))}
        </div>
        <div className="flex justify-center mt-6">
          <button onClick={compute} className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-lg hover:scale-105 transition">
            Predict
          </button>
        </div>
        {score !== null && (
          <div className="mt-6 text-center">
            <StarRating score={score} />
            <p className="mt-2 text-lg text-gray-800">Estimated Stress Score: <span className="font-bold text-indigo-600">{score} / 100</span></p>
            <p className="text-sm text-gray-500">*(Higher = more stress)</p>
          </div>
        )}
      </Card>
    </div>
  );
}