import React, { useState } from "react";
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

// UI Components
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
    <select value={value} onChange={onChange} className="flex-1 bg-transparent outline-none">
      <option value="">Select an option</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  </div>
);

const TextInput = ({ value, onChange, icon, placeholder }) => (
  <div className="flex items-center gap-3 border border-gray-300 rounded-lg px-3 py-2 bg-white bg-opacity-60 hover:bg-opacity-80 transition">
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
  const fullStars = Math.floor((score * 5) / 20); // Scale 0–20 → stars out of 5
  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <FaStar key={i} className={i < fullStars ? "text-yellow-400" : "text-gray-300"} />
      ))}
    </div>
  );
};

export default function Predictor() {
  const [formData, setFormData] = useState({});
  const [rating, setRating] = useState(null);
  const [countryPercentile, setCountryPercentile] = useState(null);
  const [globalPercentile, setGlobalPercentile] = useState(null);

  const countries = [
    "United States", "Poland", "Australia", "Canada", "United Kingdom",
    "South Africa", "Sweden", "New Zealand", "Netherlands", "India",
    "Belgium", "Ireland", "France", "Portugal", "Brazil", "Costa Rica",
    "Russia", "Germany", "Switzerland", "Finland", "Israel", "Italy",
    "Bosnia and Herzegovina", "Singapore", "Nigeria", "Croatia",
    "Thailand", "Denmark", "Mexico", "Greece", "Moldova", "Colombia",
    "Georgia", "Czech Republic", "Philippines",
  ];

  const fields = [
    { key: "Country", label: "Country", icon: <FaGlobe />, options: countries },
    { key: "Occupation", label: "Occupation", icon: <FaUserTie />, options: ["Business","Student","House wife","Others","Corporate"] },
    { key: "family_history", label: "Family History", icon: <FaUsers />, options: ["Yes","No"] },
    { key: "treatment", label: "Treatment", icon: <FaStethoscope />, options: ["Yes","No"] },
    { key: "Growing_Stress", label: "Growing Stress", icon: <FaBrain />, options: ["Yes","No","Maybe"] },
    { key: "Coping_Struggles", label: "Coping Struggles", icon: <FaHeartBroken />, options: ["Yes","No","Maybe"] },
    { key: "Social_Weakness", label: "Social Weakness", icon: <FaUserSecret />, options: ["Yes","No","Maybe"] },
    { key: "Mental_Health_History", label: "Mental Health History", icon: <FaSmileBeam />, options: ["Yes","No","Maybe"] },
    { key: "Changes_Habits", label: "Changes in Habits", icon: <FaThumbsUp />, options: ["Yes","No","Maybe"] },
    { key: "Mood_Swings", label: "Mood Swings", icon: <FaUserClock />, options: ["High","Medium","Low"] },
    { key: "Work_Interest", label: "Work Interest", icon: <FaCalendarTimes />, options: ["Yes","No","Maybe"] },
    { key: "Days_Indoors", label: "Days Indoors", icon: <FaHome />, options: ["Goes out every day","1-14 days","15-30 days","31-60 days","more than 2 months"] },
    { key: "care_options", label: "Care Options", icon: <FaUser />, options: ["Yes","No","Maybe"] },
    { key: "social_media", label: "Social Media Usage (hours/day)", icon: <FaUserClock />, options: ["0","1","2","3","4","5","6","7","8","9","10","11","12","13","14","15"] },
    { key: "sleep_hours", label: "Sleep Hours per Night", icon: <FaUserClock />, options: ["1","2","3","4","5","6","7","8","9","10","11","12"] },
    { key: "age", label: "Age", icon: <FaUser />, options: Array.from({length: 100}, (_, i) => String(i+1)) },
    { key: "income", label: "Monthly Income (USD)", icon: <FaUserTie />, inputType: "text" },
  ];

  const handleChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    const finalData = {};

    // Uppercase country to match backend cache
    finalData.Country = (formData["Country"] || "").toUpperCase();

    // Transform frontend values into numeric values matching backend logic
    const yesMaybeNo = v => v === "Yes" ? 1 : v === "Maybe" ? 0.5 : 0;
    const moodMap = { High: 1, Medium: 0.5, Low: 0 };
    const daysMap = {
      "Goes out every day": 0,
      "1-14 days": 0.25,
      "15-30 days": 0.5,
      "31-60 days": 0.75,
      "more than 2 months": 1,
    };
    const occMap = { Business: 0.65, Corporate: 0.8, Student: 0.2, "House wife": 0.4, Others: 0.5 };
    const interestMap = { Yes: 0, No: 1, Maybe: 0.5 };
    const careMap = { Yes: 1, No: 0, Maybe: 0.5 };

    finalData.mental_health_history = yesMaybeNo(formData["Mental_Health_History"]);
    finalData.family_history = yesMaybeNo(formData["family_history"]);
    finalData.treatment = yesMaybeNo(formData["treatment"]);
    finalData.mood_swings = moodMap[formData["Mood_Swings"]] ?? 0;
    finalData.days_indoors = daysMap[formData["Days_Indoors"]] ?? 0;
    finalData.care_options = careMap[formData["care_options"]] ?? 0;
    finalData.social_weakness = yesMaybeNo(formData["Social_Weakness"]);
    finalData.work_interest = interestMap[formData["Work_Interest"]] ?? 1;
    finalData.occupation = occMap[formData["Occupation"]] ?? 0.1;
    finalData.Growing_Stress = yesMaybeNo(formData["Growing_Stress"]);
    finalData.Changes_Habits = yesMaybeNo(formData["Changes_Habits"]);
    finalData.income = Number(formData["income"]) || 0;
    finalData.age = Number(formData["age"]) || 0;
    finalData.sleep_hours = Number(formData["sleep_hours"]) || 0;
    finalData.social_media = Number(formData["social_media"]) || 0;

    console.log("Data sent to backend:", finalData);

    fetch("http://localhost:5051/api/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(finalData),
    })
      .then((res) => res.json())
      .then(({ score, globalPercent, countryPercent }) => {
        setRating(score);
        setGlobalPercentile(globalPercent);
        setCountryPercentile(countryPercent);
      })
      .catch((err) => console.error("Predict API error:", err));
  };

  const getMessageForRating = (r) => {
    // backend score is 0–20
    scaled = r;
    if (scaled < 1) return { emoji: "😢", message: "Consider professional support." };
    if (scaled < 2) return { emoji: "😟", message: "Talk to someone you trust." };
    if (scaled < 3) return { emoji: "🙂", message: "Maintain healthy habits." };
    if (scaled < 4) return { emoji: "😃", message: "You’re doing quite well!" };
    return { emoji: "🎉", message: "Fantastic mental health!" };
  };

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
            {fields.map(({ key, label, icon, options, inputType }) => (
              <div key={key}>
                <Label>{label}</Label>
                {inputType === "text" ? (
                  <TextInput
                    value={formData[key] || ""}
                    onChange={e => handleChange(key, e.target.value)}
                    icon={icon}
                    placeholder={`Enter ${label}`}
                  />
                ) : (
                  <Select
                    value={formData[key] || ""}
                    onChange={e => handleChange(key, e.target.value)}
                    options={options}
                    icon={icon}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="mt-10 flex justify-center">
            <Button onClick={handleSubmit}>Calculate Rating</Button>
          </div>

          {rating !== null && (() => {
            // const { emoji, message } = getMessageForRating(rating * 5 / 20 -0.5);
            return (
              <div className="mt-8 flex flex-col items-center text-lg">
                {/* <StarRating score={rating} /> */}
                <p className="font-semibold mt-2">
                  Stress Score: <span className="text-indigo-600">{(rating * 5 / 20 -0.5).toFixed(2)} / 5.00</span>
                </p>
                <p className="mt-4 text-gray-800 text-center">
                  {/* Globally, <span className="text-indigo-600 font-semibold">{globalPercentile}%</span> of people have higher stress than you. */}
                </p>
                <p className="mt-2 text-gray-800 text-center">
                  {/* In <span className="text-indigo-700 font-bold">{formData.Country || "your country"}</span>, you rank in the top <span className="text-indigo-600 font-semibold">{countryPercentile ?? "N/A"}%</span>. */}
                </p>
                {/* <div className="p-4 rounded-lg bg-purple-100 text-center text-gray-800 flex items-center justify-center gap-4 mt-6">
                  <div className="text-5xl">{emoji}</div>
                  <div className="text-lg">{message}</div>
                </div> */}
              </div>
            );
          })()}
        </CardContent>
      </Card>
    </div>
  );
}




// src/pages/Predictor.jsx

// import React, { useState } from "react";
// import {
//   FaUserTie,
//   FaUsers,
//   FaStethoscope,
//   FaBrain,
//   FaHeartBroken,
//   FaUserSecret,
//   FaSmileBeam,
//   FaThumbsUp,
//   FaUserClock,
//   FaCalendarTimes,
//   FaHome,
//   FaUser,
//   FaStar,
//   FaGlobe,
// } from "react-icons/fa";

// // UI Components
// const Card = ({ children, className = "" }) => (
//   <div className={`bg-white bg-opacity-70 backdrop-blur-sm shadow-xl rounded-3xl ${className}`}>
//     {children}
//   </div>
// );

// const CardContent = ({ children, className = "" }) => (
//   <div className={`p-8 ${className}`}>{children}</div>
// );

// const Button = ({ children, onClick }) => (
//   <button
//     onClick={onClick}
//     className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:scale-105 transition-all duration-300"
//   >
//     {children}
//   </button>
// );

// const Label = ({ children }) => (
//   <label className="block mb-1 font-semibold text-gray-700">{children}</label>
// );

// const Select = ({ value, onChange, options, icon }) => (
//   <div className="flex items-center gap-3 border border-gray-300 rounded-lg px-3 py-2 bg-white bg-opacity-60 hover:bg-opacity-80 transition">
//     {icon && <span className="text-indigo-600 text-xl">{icon}</span>}
//     <select value={value} onChange={onChange} className="flex-1 bg-transparent outline-none">
//       <option value="">Select an option</option>
//       {options.map((opt) => (
//         <option key={opt} value={opt}>
//           {opt}
//         </option>
//       ))}
//     </select>
//   </div>
// );

// const TextInput = ({ value, onChange, icon, placeholder }) => (
//   <div className="flex items-center gap-3 border border-gray-300 rounded-lg px-3 py-2 bg-white bg-opacity-60 hover:bg-opacity-80 transition">
//     {icon && <span className="text-indigo-600 text-xl">{icon}</span>}
//     <input
//       type="number"
//       value={value}
//       onChange={onChange}
//       placeholder={placeholder}
//       className="flex-1 bg-transparent outline-none"
//     />
//   </div>
// );

// const StarRating = ({ score }) => {
//   const fullStars = Math.floor(score * 5);
//   return (
//     <div className="flex gap-1">
//       {Array.from({ length: 5 }).map((_, i) => (
//         <FaStar key={i} className={i < fullStars ? "text-yellow-400" : "text-gray-300"} />
//       ))}
//     </div>
//   );
// };

// export default function Predictor() {
//   const [formData, setFormData] = useState({});
//   const [rating, setRating] = useState(null);
//   const [countryPercentile, setCountryPercentile] = useState(null);
//   const [globalPercentile, setGlobalPercentile] = useState(null);

//   const countries = [
//     "United States", "Poland", "Australia", "Canada", "United Kingdom",
//     "South Africa", "Sweden", "New Zealand", "Netherlands", "India",
//     "Belgium", "Ireland", "France", "Portugal", "Brazil", "Costa Rica",
//     "Russia", "Germany", "Switzerland", "Finland", "Israel", "Italy",
//     "Bosnia and Herzegovina", "Singapore", "Nigeria", "Croatia",
//     "Thailand", "Denmark", "Mexico", "Greece", "Moldova", "Colombia",
//     "Georgia", "Czech Republic", "Philippines",
//   ];

//   const fields = [
//     { key: "Country",               label: "Country",               icon: <FaGlobe />,         options: countries },
//     { key: "Occupation",            label: "Occupation",            icon: <FaUserTie />,       options: ["Business","Student","House wife","Others","Corporate"] },
//     { key: "family_history",        label: "Family History",        icon: <FaUsers />,         options: ["Yes","No"] },
//     { key: "treatment",             label: "Treatment",             icon: <FaStethoscope />,   options: ["Yes","No"] },
//     { key: "Growing_Stress",        label: "Growing Stress",        icon: <FaBrain />,         options: ["Yes","No","Maybe"] },
//     { key: "Coping_Struggles",      label: "Coping Struggles",       icon: <FaHeartBroken />,   options: ["Yes","No","Maybe"] },
//     { key: "Social_Weakness",       label: "Social Weakness",        icon: <FaUserSecret />,    options: ["Yes","No","Maybe"] },
//     { key: "Mental_Health_History", label: "Mental Health History",  icon: <FaSmileBeam />,     options: ["Yes","No","Maybe"] },
//     { key: "Changes_Habits",        label: "Changes in Habits",      icon: <FaThumbsUp />,      options: ["Yes","No","Maybe"] },
//     { key: "Mood_Swings",           label: "Mood Swings",            icon: <FaUserClock />,     options: ["High","Medium","Low"] },
//     { key: "Work_Interest",         label: "Work Interest",          icon: <FaCalendarTimes />, options: ["Yes","No","Maybe"] },
//     { key: "Days_Indoors",          label: "Days Indoors",           icon: <FaHome />,          options: ["Goes out every day","1-14 days","15-30 days","31-60 days","more than 2 months"] },
//     { key: "care_options",          label: "Care Options",           icon: <FaUser />,          options: ["Yes","No","Maybe"] },
//     { key: "social_media",          label: "Social Media Usage (hours/day)", icon: <FaUserClock />, options: ["0","1","2","3","4","5","6","7","8","9","10","11","12","13","14","15"] },
//     { key: "sleep_hours",           label: "Sleep Hours per Night",  icon: <FaUserClock />,     options: ["1","2","3","4","5","6","7","8","9","10","11","12"] },
//     { key: "age",                   label: "Age",                    icon: <FaUser />,          options: Array.from({length: 100}, (_, i) => String(i+1)) },
//     { key: "income",                label: "Monthly Income (USD)",   icon: <FaUserTie />,       inputType: "text" }
//   ];

//   const handleChange = (key, value) => {
//     setFormData(prev => ({ ...prev, [key]: value }));
//   };

//   const handleSubmit = () => {
//     const numericFields = ["social_media", "sleep_hours", "age", "income"];
//     const finalData = { ...formData };

//     numericFields.forEach((field) => {
//       if (finalData[field] !== undefined) {
//         finalData[field] = Number(finalData[field]) || 0;
//       }
//     });

//     const yesMaybeNo = v => v === "Yes" ? 1 : v === "Maybe" ? 0.5 : 0;
//     const moodMap = { High: 1, Medium: 0.5, Low: 0 };
//     const daysMap = {
//       "Goes out every day": 0,
//       "1-14 days": 0.25,
//       "15-30 days": 0.5,
//       "31-60 days": 0.75,
//       "more than 2 months": 1
//     };
//     const occMap = { Business: 0.65, Corporate: 0.8, Student: 0.2, "House wife": 0.4, Others: 0.5 };
//     const interestMap = { Yes: 0, No: 1, Maybe: 0.5 };
//     const careMap = { Yes: 1, No: 0, Maybe: 0.5 };

//     finalData.mental_health_history = yesMaybeNo(formData["Mental_Health_History"]);
//     finalData.family_history = yesMaybeNo(formData["family_history"]);
//     finalData.treatment = yesMaybeNo(formData["treatment"]);
//     finalData.mood_swings = moodMap[formData["Mood_Swings"]] ?? 0;
//     finalData.days_indoors = daysMap[formData["Days_Indoors"]] ?? 0;
//     finalData.care_options = careMap[formData["care_options"]] ?? 0;
//     finalData.social_weakness = yesMaybeNo(formData["Social_Weakness"]);
//     finalData.work_interest = interestMap[formData["Work_Interest"]] ?? 1;
//     finalData.Occupation = occMap[formData["Occupation"]] ?? 0.1;
//     finalData.Growing_Stress = yesMaybeNo(formData["Growing_Stress"]);
//     finalData.Changes_Habits = yesMaybeNo(formData["Changes_Habits"]);

//     // ✅ ✅ ✅ IMPORTANT FIX:
//     finalData.Country = formData.Country;

//     console.log("Data being sent to backend:", finalData);

//     fetch("http://localhost:5051/api/predict", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(finalData),
//     })
//       .then((res) => res.json())
//       .then(({ score, globalPercent, countryPercent }) => {
//         console.log(globalPercent);
//         setRating(score);
//         setGlobalPercentile(globalPercent);
//         setCountryPercentile(countryPercent);
//       })
//       .catch((err) => console.error("Predict API error:", err));
//   };

//   const getMessageForRating = (r) => {

//     const scaled = r / 20;
//     if (scaled < 1) return { emoji: "😢", message: "Consider professional support." };
//     if (scaled < 2) return { emoji: "😟", message: "Talk to someone you trust." };
//     if (scaled < 3) return { emoji: "🙂", message: "Maintain healthy habits." };
//     if (scaled < 4) return { emoji: "😃", message: "You’re doing quite well!" };
//     return { emoji: "🎉", message: "Fantastic mental health!" };
//   };

//   return (
//     <div className="relative overflow-hidden min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-indigo-200 p-6 flex items-center justify-center">
//       <div className="absolute -top-24 -left-24 w-96 h-96 bg-purple-300 rounded-full filter blur-3xl opacity-30"></div>
//       <div className="absolute top-32 -right-24 w-96 h-96 bg-indigo-300 rounded-full filter blur-3xl opacity-30"></div>

//       <Card className="w-full max-w-4xl relative z-10">
//         <CardContent>
//           <h2 className="text-4xl font-extrabold text-center text-gray-800 mb-8">
//             Mental Health Rating Form
//           </h2>

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             {fields.map(({ key, label, icon, options, inputType }) => (
//               <div key={key}>
//                 <Label>{label}</Label>
//                 {inputType === "text" ? (
//                   <TextInput
//                     value={formData[key] || ""}
//                     onChange={e => handleChange(key, e.target.value)}
//                     icon={icon}
//                     placeholder={`Enter ${label}`}
//                   />
//                 ) : (
//                   <Select
//                     value={formData[key] || ""}
//                     onChange={e => handleChange(key, e.target.value)}
//                     options={options}
//                     icon={icon}
//                   />
//                 )}
//               </div>
//             ))}
//           </div>

//           <div className="mt-10 flex justify-center">
//             <Button onClick={handleSubmit}>Calculate Rating</Button>
//           </div>

//           {rating !== null && (() => {
//             const { emoji, message } = getMessageForRating(globalPercentile);
//             return (
//               <div className=" flex flex-col items-center text-lg">
//                 <p className="font-semibold mt-2">
//                   Stress Score: <span className="text-indigo-600">{((rating) *5 + 2).toFixed(2)} / 5.00</span>
//                 </p>
//                 <p className="mt-4 text-gray-800 text-center">
//                   GLobally <span className="text-indigo-600 font-semibold">{globalPercentile}%</span> people have more stress than you.
//                 </p>
//                 <div className="p-4 rounded-lg bg-purple-100 text-center text-gray-800 flex items-center justify-center gap-4 mt-6">
//                   <div className="text-5xl">{emoji}</div>
//                   <div className="text-lg">{message}</div>
//                 </div>
//               </div>
//             );
//           })()}
//         </CardContent>
//       </Card>
//     </div>
//   );
// }
