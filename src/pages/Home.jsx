// import React from "react";
// import { useNavigate } from "react-router-dom";
// import {
//   FaBrain,
//   FaChartBar,
//   FaExclamationTriangle,
//   FaBookOpen,
//   FaPhoneAlt,
// } from "react-icons/fa";

// const Home = () => {
//   const navigate = useNavigate();

//   const navItems = [
//     {
//       label: "Mental Health Predictor",
//       path: "/predictor",
//       icon: <FaBrain className="text-3xl" />,
//       description: "Predict mental health conditions using AI tools.",
//     },
//     {
//       label: "Comparison Analysis",
//       path: "/comparison",
//       icon: <FaChartBar className="text-3xl" />,
//       description: "Compare trends and mental health statistics.",
//     },
//     {
//       label: "Risk Factors",
//       path: "/risk-factors",
//       icon: <FaExclamationTriangle className="text-3xl" />,
//       description: "Understand key factors affecting mental health.",
//     },
//     {
//       label: "Resources",
//       path: "/resources",
//       icon: <FaBookOpen className="text-3xl" />,
//       description: "Explore guides, tools, and helplines for support.",
//     },
//     {
//       label: "Contact / Help",
//       path: "/contact",
//       icon: <FaPhoneAlt className="text-3xl" />,
//       description: "Get in touch with professionals or support services.",
//     },
//   ];

//   return (
//     <div className="relative min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-indigo-100 overflow-hidden">
//       {/* Background Image Overlay */}
//       <div
//         className="absolute inset-0 bg-cover bg-center opacity-10"
//         style={{
//           backgroundImage:
//             "url('https://images.unsplash.com/photo-1600058401678-bd397afd89be?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80')",
//         }}
//       ></div>

//       {/* Decorative blobs */}
//       <div className="absolute -top-20 -left-20 w-96 h-96 bg-purple-300 rounded-full filter blur-3xl opacity-30"></div>
//       <div className="absolute top-40 -right-20 w-96 h-96 bg-indigo-300 rounded-full filter blur-3xl opacity-30"></div>

//       {/* Navbar */}
//       <header className="relative z-10 flex justify-between items-center px-6 py-4 max-w-7xl mx-auto">
//         <h1 className="text-2xl font-extrabold text-indigo-600">
//           MindCare
//         </h1>
//         <button
//           onClick={() => navigate("/contact")}
//           className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
//         >
//           Get Help
//         </button>
//       </header>

//       {/* Hero Section */}
//       <div className="relative z-10 flex flex-col md:flex-row items-center justify-between max-w-7xl mx-auto px-6 py-20">
//         {/* Left */}
//         <div className="md:w-1/2 mb-12 md:mb-0">
//           <h2 className="text-5xl md:text-6xl font-extrabold text-gray-800 leading-tight mb-6">
//             Your Path to{" "}
//             <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">
//               Mental Wellness
//             </span>
//           </h2>
//           <p className="text-gray-700 text-lg md:text-xl max-w-xl">
//             Mental health profoundly shapes how we think, feel, and live each day.
//             Early analysis and understanding empower individuals to manage
//             mental health proactively. Discover insights, predictors, and
//             resources designed to support your mental well-being and foster
//             a healthier life for you and those around you.
//           </p>
//           <button
//             onClick={() => navigate("/predictor")}
//             className="mt-8 inline-block bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-lg shadow-lg hover:scale-105 transform transition"
//           >
//             Try Predictor
//           </button>
//         </div>

//         {/* Right - Navigation Cards */}
//         <div className="md:w-1/2 grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
//           {navItems.map((item, index) => (
//             <div
//               key={index}
//               onClick={() => navigate(item.path)}
//               className="cursor-pointer group p-6 bg-white rounded-xl shadow-xl hover:bg-gradient-to-r hover:from-indigo-500 hover:to-purple-600 hover:scale-105 transform transition-all duration-300"
//             >
//               <div className="flex items-center justify-center mb-4 text-indigo-600 group-hover:text-white">
//                 {item.icon}
//               </div>
//               <h3 className="text-xl font-bold text-gray-800 group-hover:text-white text-center">
//                 {item.label}
//               </h3>
//               <p className="mt-2 text-gray-600 group-hover:text-indigo-100 text-center text-sm">
//                 {item.description}
//               </p>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Footer */}
//       <footer className="relative z-10 text-center text-gray-600 text-sm py-6">
//         © {new Date().getFullYear()} MindCare. All rights reserved.
//       </footer>
//     </div>
//   );
// };

// export default Home;



import React from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBrain,
  FaGlobe,
  FaCircle,
  FaCubes,
  FaChartBar,
  FaChartLine,
  FaProjectDiagram,
} from "react-icons/fa";

const Home = () => {
  const navigate = useNavigate();

  const navItems = [
    {
      label: "Mental Health Predictor",
      path: "/predictor",
      icon: <FaBrain className="text-3xl" />,
      description: "Predict mental health conditions using AI tools.",
    },
    {
      label: "Country Comparison",
      path: "/country-comparison",
      icon: <FaGlobe className="text-3xl" />,
      description: "Visualize mental health trends across countries.",
    },
    {
      label: "Bubble Plot Analysis",
      path: "/bubble-plot",
      icon: <FaCircle className="text-3xl" />,
      description:
        "Explore occupation, work interest, sleep hours vs mental health.",
    },
    {
      label: "3D Bubble Plot",
      path: "/3d-bubble-plot",
      icon: <FaCubes className="text-3xl" />,
      description:
        "Visualize the relationship between sleep, social media, and mental health.",
    },
    {
      label: "Violin Plot Analysis",
      path: "/violin-plot",
      icon: <FaChartBar className="text-3xl" />,
      description:
        "Analyze mental health scores by occupation and gender distributions.",
    },
    {
      label: "Trend Analysis",
      path: "/trend-analysis",
      icon: <FaChartLine className="text-3xl" />,
      description:
        "Explore patterns and trends in mental health data over income.",
    },
    {
      label: "Parallel Plot",
      path: "/parallel-plot",
      icon: <FaProjectDiagram className="text-3xl" />,
      description:
        "Explore patterns and trends in mental health data over different attributes.",
    },
  ];

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-indigo-100 overflow-hidden">
      {/* Background Image Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-10"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1600058401678-bd397afd89be?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80')",
        }}
      ></div>

      {/* Decorative blobs */}
      <div className="absolute -top-20 -left-20 w-96 h-96 bg-purple-300 rounded-full filter blur-3xl opacity-30"></div>
      <div className="absolute top-40 -right-20 w-96 h-96 bg-indigo-300 rounded-full filter blur-3xl opacity-30"></div>

      {/* Navbar */}
      <header className="relative z-10 flex justify-between items-center px-6 py-4 max-w-7xl mx-auto">
        <h1 className="text-2xl font-extrabold text-indigo-600">
          MindCare
        </h1>
        <button
          onClick={() => navigate("/contact")}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
        >
          Get Help
        </button>
      </header>

      {/* Hero Section */}
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between max-w-7xl mx-auto px-6 py-20">
        {/* Left */}
        <div className="md:w-1/2 mb-12 md:mb-0">
          <h2 className="text-5xl md:text-6xl font-extrabold text-gray-800 leading-tight mb-6">
            Your Path to{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">
              Mental Wellness
            </span>
          </h2>
          <p className="text-gray-700 text-lg md:text-xl max-w-xl">
            Mental health profoundly shapes how we think, feel, and live each day.
            Early analysis and understanding empower individuals to manage
            mental health proactively. Discover insights, predictors, and
            powerful visualizations designed to support your mental well-being
            and foster a healthier life for you and those around you.
          </p>
          <button
            onClick={() => navigate("/predictor")}
            className="mt-8 inline-block bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-lg shadow-lg hover:scale-105 transform transition"
          >
            Try Predictor
          </button>
        </div>

        {/* Right - Navigation Cards */}
        <div className="md:w-1/2 grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
          {navItems.map((item, index) => (
            <div
              key={index}
              onClick={() => navigate(item.path)}
              className="cursor-pointer group p-6 bg-white rounded-xl shadow-xl hover:bg-gradient-to-r hover:from-indigo-500 hover:to-purple-600 hover:scale-105 transform transition-all duration-300"
            >
              <div className="flex items-center justify-center mb-4 text-indigo-600 group-hover:text-white">
                {item.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-800 group-hover:text-white text-center">
                {item.label}
              </h3>
              <p className="mt-2 text-gray-600 group-hover:text-indigo-100 text-center text-sm">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 text-center text-gray-600 text-sm py-6">
        © {new Date().getFullYear()} MindCare. All rights reserved.
      </footer>
    </div>
  );
};

export default Home;

