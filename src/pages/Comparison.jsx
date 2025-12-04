// import React, { useEffect, useState, useMemo, useRef, useCallback } from "react";
// import * as d3 from "d3";
// import { feature } from "topojson-client";
// import { FiRefreshCw, FiInfo, FiGlobe, FiBarChart2, FiX, FiHeart, FiPlay, FiPause } from "react-icons/fi";
// import { motion, AnimatePresence } from "framer-motion";

// const countriesDataList = [
//     "Poland", "Australia", "United States of America", "Canada", "United Kingdom",
//     "South Africa", "Sweden", "New Zealand", "Netherlands", "India",
//     "Belgium", "Ireland", "France", "Portugal", "Brazil", "Costa Rica",
//     "Russia", "Germany", "Switzerland", "Finland", "Israel", "Italy",
//     "Bosnia and Herzegovina", "Singapore", "Nigeria", "Croatia",
//     "Thailand", "Denmark", "Mexico", "Greece", "Moldova", "Colombia",
//     "Georgia", "Czech Republic", "Philippines"
// ];

// const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// // Radar Chart Component
// const RadarChart = ({ data, width, height, outerRadius, colorScale, axisDomains }) => {
//     const svgRef = useRef();
//     const margin = { top: 40, right: 40, bottom: 40, left: 40 };

//     useEffect(() => {
//         if (!data || data.length === 0 || !data[0].axes || data[0].axes.length === 0) {
//             d3.select(svgRef.current).selectAll("*").remove();
//             return;
//         }

//         const svg = d3.select(svgRef.current);
//         svg.selectAll("*").remove(); // Clear previous drawings

//         // Create a radial scale for each axis based on its specific domain
//         const radialScale = (axisName, value) => {
//             const domain = axisDomains[axisName] || [0, 100]; // Default to 0-100 if no specific domain
//             return d3.scaleLinear().domain(domain).range([0, outerRadius])(value);
//         };

//         const allAxes = data[0].axes.map(d => d.axis);
//         const angleSlice = Math.PI * 2 / allAxes.length;

//         const radarLine = d3.lineRadial()
//             .curve(d3.curveLinearClosed)
//             .radius(d => radialScale(d.axis, d.value)) // Use axis-specific radial scale
//             .angle((d, i) => i * angleSlice);

//         const g = svg.append("g")
//             .attr("transform", `translate(${width / 2},${height / 2})`);

//         // Draw grid circles (using a common max for visual consistency, or adjust per axis if needed)
//         const numCircles = 5;
//         // The grid circles provide a general background. Specific numerical labels will be added per axis.
//         g.selectAll(".grid-circle")
//             .data(d3.range(1, numCircles + 1).map(i => i * outerRadius / numCircles))
//             .join("circle")
//             .attr("class", "grid-circle")
//             .attr("r", d => d)
//             .style("fill", "#CDCDCD")
//             .style("stroke", "#CDCDCD")
//             .style("fill-opacity", 0.1)
//             .style("stroke-width", 0.5);

//         // Remove the old grid labels (labels for concentric circles)
//         g.selectAll(".grid-label").remove();


//         // Draw axes
//         const axis = g.selectAll(".axis")
//             .data(allAxes)
//             .join("g")
//             .attr("class", "axis");

//         axis.append("line")
//             .attr("x1", 0)
//             .attr("y1", 0)
//             .attr("x2", (d, i) => radialScale(d, axisDomains[d]?.[1] || 100) * Math.cos(angleSlice * i - Math.PI / 2)) // Use axis-specific max value for line length
//             .attr("y2", (d, i) => radialScale(d, axisDomains[d]?.[1] || 100) * Math.sin(angleSlice * i - Math.PI / 2)) // Use axis-specific max value for line length
//             .attr("stroke", "#CDCDCD")
//             .attr("stroke-width", 1);

//         // Axis name labels (e.g., "Avg Social Media Hours (hours)")
//         axis.append("text")
//             .attr("class", "legend")
//             .style("font-size", "12px")
//             // Adjusted text-anchor and position for axis names more dynamically
//             .attr("text-anchor", (d, i) => {
//                 // Adjust text-anchor based on axis index
//                 if (i === 0) return "middle"; // % Caretaker Options (Top)
//                 if (i === 1) return "start";  // Avg Outdoor Days (Top-right)
//                 if (i === 2) return "start";  // Avg Sleep Hours (Bottom-right)
//                 if (i === 3) return "middle"; // Avg Social Media Hours (Bottom)
//                 if (i === 4) return "end";    // % Family History (Bottom-left)
//                 if (i === 5) return "end";    // % Coping Struggle (Top-left)
//                 return "middle";
//             })
//             .attr("dy", (d, i) => {
//                 // Adjust dy based on axis index
//                 if (i === 0) return "-1.2em"; // Top: higher above
//                 if (i === 1) return "-0.5em"; // Top-right: above
//                 if (i === 2) return "0.5em"; // Bottom-right: below
//                 if (i === 3) return "2em"; // Bottom: much further below
//                 if (i === 4) return "0.5em"; // Bottom-left: below
//                 if (i === 5) return "-0.5em"; // Top-left: above
//                 return "0.35em";
//             })
//             .attr("x", (d, i) => radialScale(d, (axisDomains[d]?.[1] || 100) * 1.35) * Math.cos(angleSlice * i - Math.PI / 2)) // Increased multiplier further
//             .attr("y", (d, i) => radialScale(d, (axisDomains[d]?.[1] || 100) * 1.35) * Math.sin(angleSlice * i - Math.PI / 2)) // Increased multiplier further
//             .text(d => {
//                 // Add units to specific axis labels
//                 if (d === "Avg Social Media Hours" || d === "Avg Sleep Hours") {
//                     return `${d} (hours)`;
//                 } else if (d === "Avg Outdoor Days") {
//                     return `${d} (days)`;
//                 }
//                 return d;
//             })
//             .attr("fill", "#333");

//         // Add numerical tick labels along each axis
//         axis.each(function(axisName, i) {
//             const axisGroup = d3.select(this);

//             let tickValues;
//             let tickSuffix = '';

//             if (axisName === "Avg Social Media Hours" || axisName === "Avg Sleep Hours") {
//                 tickValues = [4, 6, 8, 10, 12]; // Added 10 for more ticks
//                 tickSuffix = 'h';
//             } else if (axisName === "Avg Outdoor Days") {
//                 tickValues = [30, 60, 90]; // Explicit ticks for days
//                 tickSuffix = 'd';
//             } else { // For percentage axes
//                 tickValues = [25, 50, 75, 100];
//                 tickSuffix = '%';
//             }

//             // Calculate angle for current axis
//             const angleRad = angleSlice * i - Math.PI / 2;

//             axisGroup.selectAll(".axis-tick-value")
//                 .data(tickValues)
//                 .join("text")
//                 .attr("class", "axis-tick-value")
//                 .attr("x", (tickVal) => {
//                     const r = radialScale(axisName, tickVal);
//                     return r * Math.cos(angleRad);
//                 })
//                 .attr("y", (tickVal) => {
//                     const r = radialScale(axisName, tickVal);
//                     return r * Math.sin(angleRad);
//                 })
//                 .attr("dx", () => {
//                     // Adjust dx based on axis index for better separation
//                     if (i === 0) return "0em"; // % Caretaker Options (Top): no horizontal offset
//                     if (i === 1) return "0.6em"; // Avg Outdoor Days (Top-right): more to the right
//                     if (i === 2) return "0.6em"; // Avg Sleep Hours (Bottom-right): more to the right
//                     if (i === 3) return "0em"; // Avg Social Media Hours (Bottom): no horizontal offset
//                     if (i === 4) return "-0.6em"; // % Family History (Bottom-left): more to the left
//                     if (i === 5) return "-0.6em"; // % Coping Struggle (Top-left): more to the left
//                     return "0em";
//                 })
//                 .attr("dy", () => {
//                     // Adjust dy based on axis index
//                     if (i === 0) return "-0.5em"; // % Caretaker Options (Top): above
//                     if (i === 1) return "-0.2em"; // Avg Outdoor Days (Top-right): slight above
//                     if (i === 2) return "0.8em"; // Avg Sleep Hours (Bottom-right): below
//                     if (i === 3) return "1.2em"; // Avg Social Media Hours (Bottom): far below
//                     if (i === 4) return "0.8em"; // % Family History (Bottom-left): below
//                     if (i === 5) return "-0.2em"; // % Coping Struggle (Top-left): slight above
//                     return "0em";
//                 })
//                 .style("font-size", "9px")
//                 .attr("text-anchor", () => {
//                     // Adjust text-anchor based on axis index for better alignment
//                     if (i === 0) return "middle"; // Top
//                     if (i === 1) return "start"; // Top-right
//                     if (i === 2) return "start"; // Bottom-right
//                     if (i === 3) return "middle"; // Bottom
//                     if (i === 4) return "end";   // Bottom-left
//                     if (i === 5) return "end";   // Top-left
//                     return "middle";
//                 })
//                 .attr("fill", "#555")
//                 .text(tickVal => `${tickVal}${tickSuffix}`);
//         });


//         // Draw radar areas and paths
//         const countryPaths = g.selectAll(".radarArea")
//             .data(data)
//             .join("path")
//             .attr("class", "radarArea")
//             .attr("fill", (d, i) => colorScale(i))
//             .attr("fill-opacity", 0.1)
//             .attr("stroke-width", 2)
//             .attr("stroke", (d, i) => colorScale(i))
//             .attr("d", d => radarLine(d.axes))
//             .style("pointer-events", "all")
//             .on("mouseover", function(event, d) {
//                 d3.select(this).attr("fill-opacity", 0.7);
//             })
//             .on("mouseout", function() {
//                 d3.select(this).attr("fill-opacity", 0.1);
//             });

//         // Draw circles for points
//         data.forEach((d, i) => {
//             g.selectAll(`.radarCircle-${i}`)
//                 .data(d.axes)
//                 .join("circle")
//                 .attr("class", `radarCircle-${i}`)
//                 .attr("r", 5)
//                 .attr("cx", (p, j) => radialScale(p.axis, p.value) * Math.cos(angleSlice * j - Math.PI / 2)) // Use axis-specific radial scale
//                 .attr("cy", (p, j) => radialScale(p.axis, p.value) * Math.sin(angleSlice * j - Math.PI / 2)) // Use axis-specific radial scale
//                 .attr("fill", colorScale(i))
//                 .attr("fill-opacity", 0.8);
//         });

//     }, [data, width, height, outerRadius, colorScale, axisDomains]);

//     return <svg ref={svgRef} width={width} height={height}></svg>;
// };

// const Map = () => {
//     const [geoCountries, setGeoCountries] = useState([]);
//     const [data, setData] = useState([]);
//     const [rawRows, setRawRows] = useState([]);
//     const [nameToId, setNameToId] = useState({});
//     const [isLoading, setIsLoading] = useState(true);
//     const [countryA, setCountryA] = useState("United States of America");
//     const [countryB, setCountryB] = useState("India");
//     const [activeTab, setActiveTab] = useState("map"); // "map" or "comparison"
//     const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, content: "" });

//     const [mentalHealthFact, setMentalHealthFact] = useState("");
//     const [showInfo, setShowInfo] = useState(false);
//     const [showTour, setShowTour] = useState(false);
//     const [tourStep, setTourStep] = useState(0);
//     const [isPlaying, setIsPlaying] = useState(false);
//     const playTimerRef = useRef(null);
//     const factTimer = useRef(null);

//     const mentalHealthFacts = useMemo(() => [
//         "Globally, more than 450 million people currently suffer from mental or neurological conditions.",
//         "Depression is a leading cause of disability worldwide, affecting over 280 million people.",
//         "Around 1 in 7 people aged 10-19 years worldwide experience a mental disorder.",
//         "Stigma and discrimination continue to be a barrier to mental health care worldwide.",
//         "An estimated 700,000 people die by suicide each year, making it a leading cause of death globally.",
//         "Investment in mental health remains low, with many countries spending less than 2% of their health budgets on it.",
//         "Early intervention in mental health can prevent more severe conditions and improve outcomes.",
//         "Access to mental health services varies greatly across countries, with many lacking adequate resources.",
//         "Digital mental health interventions are emerging as a way to increase access to care.",
//         "Promoting mental well-being is as important as treating mental illness."
//     ], []);

//     const tourSteps = useMemo(() => [
//         "Welcome to the Global Mental Health Dashboard! Here you can explore mental health data across various countries.",
//         "Use the 'Map View' tab to see an overview of mental health ratings across the world. Hover over countries for details.",
//         "Switch to the 'Comparison View' tab to compare mental health factors between two selected countries using a radar chart.",
//         "Select countries using the dropdowns in the 'Comparison View' to see their detailed demographic and health comparisons.",
//         "The radar chart visualizes various factors. The further a point is from the center, the higher the value for that factor.",
//         "You can refresh the data or get more information using the buttons at the top right.",
//         "Enjoy exploring the data and gaining insights into global mental health!"
//     ], []);

//     useEffect(() => {
//         // Mental health fact updater
//         factTimer.current = setInterval(() => {
//             const randomIndex = Math.floor(Math.random() * mentalHealthFacts.length);
//             setMentalHealthFact(mentalHealthFacts[randomIndex]);
//         }, 8000); // Change fact every 8 seconds

//         return () => clearInterval(factTimer.current);
//     }, [mentalHealthFacts]);

//     useEffect(() => {
//         if (isPlaying) {
//             playTimerRef.current = setInterval(() => {
//                 setTourStep(prevStep => (prevStep + 1) % tourSteps.length);
//             }, 5000); // Change tour step every 5 seconds
//         } else {
//             clearInterval(playTimerRef.current);
//         }
//         return () => clearInterval(playTimerRef.current);
//     }, [isPlaying, tourSteps]);

//     useEffect(() => {
//         const loadData = async () => {
//             setIsLoading(true);

//             try {
//                 const topoRes = await fetch(geoUrl);
//                 const topoJson = await topoRes.json();
//                 const geoData = feature(topoJson, topoJson.objects.countries).features;

//                 setGeoCountries(geoData);

//                 const mapping = {};
//                 geoData.forEach((d) => {
//                     const name = d.properties.name;
//                     const id = d.id?.toString().padStart(3, "0");
//                     if (name && id) mapping[name] = id;
//                 });
//                 setNameToId(mapping);

//                 const rows = await d3.csv("data_trimmed.csv", d3.autoType);
//                 // const res = await fetch("http://localhost:5051/api/ratings");
//                 // const rows = await res.json();
//                 const filteredRows = rows.filter(d => countriesDataList.includes(d.country));
//                 setRawRows(filteredRows);
//                 console.log("Raw rows loaded:", filteredRows);

//                 const grouped = d3.groups(filteredRows, (d) => d.country);
//                 const averaged = grouped.map(([country, records]) => {
//                     const scores = records.map((r) => +r.ratings).filter((s) => !isNaN(s));
//                     const avg = d3.mean(scores);
//                     const id = mapping[country];
//                     if (!id || isNaN(avg)) return null;
//                     return { id, country, rating: +avg.toFixed(2) };
//                 });
//                 setData(averaged.filter((d) => d !== null));
//             } catch (error) {
//                 console.error("Error loading data:", error);
//             } finally {
//                 setIsLoading(false);
//             }
//         };

//         loadData();
//     }, []);

//     const width = 960;
//     const height = 500;
//     const projection = d3.geoMercator().scale(120).translate([width / 2, height / 2]);
//     const pathGenerator = d3.geoPath().projection(projection);

//     const colorScale = useMemo(() =>
//         d3.scaleSequential()
//             .domain([1, 5])
//             .interpolator(d3.interpolateYlOrRd),
//         []
//     );

//     const getRating = (name) => {
//         const entry = data.find((d) => d.country === name);
//         return entry ? entry.rating : "N/A";
//     };

//     const prepareSpiderData = useCallback(() => {
//         const selectedCountries = new Set([countryA, countryB].filter(Boolean));
//         if (selectedCountries.size === 0) return [];

//         const spiderData = [];

//         const newAxes = [
//             "% Caretaker Options",
//             "Avg Outdoor Days",
//             "Avg Sleep Hours",
//             "Avg Social Media Hours",
//             "% Family History",
//             "% Coping Struggle"
//         ];

//         for (const country of selectedCountries) {
//             const countryRecords = rawRows.filter(d => d.country === country);
//             if (countryRecords.length === 0) continue;

//             const axes = [];

//             // 1. % people that have caretaker options
//             const caretakerYes = countryRecords.filter(r => r.care_options === 0).length; // 0 means yes
//             const percentCaretaker = countryRecords.length > 0 ? (caretakerYes / countryRecords.length) * 100 : 0;
//             axes.push({ axis: "% Caretaker Options", value: percentCaretaker });

//             // 2. Average of outdoor days (Keep raw value in days - scale 0-90)
//             const outdoorDayScores = countryRecords.map(r => {
//                 switch (r.days_indoors) {
//                     case 0: return 90; // Goes out every day (max outdoor score = 90 days outdoor)
//                     case 0.25: return 75; // 1-14 days indoor (approx 75 days outdoor)
//                     case 0.5: return 45; // 15-30 days indoor (approx 45 days outdoor)
//                     case 0.75: return 15; // 31-60 days indoor (approx 15 days outdoor)
//                     case 1: return 0; // more than 2 months indoor (min outdoor score = 0 days outdoor)
//                     default: return 0;
//                 }
//             }).filter(v => !isNaN(v));
//             const avgOutdoorDays = outdoorDayScores.length > 0 ? d3.mean(outdoorDayScores) : 0;
//             axes.push({ axis: "Avg Outdoor Days", value: avgOutdoorDays });


//             // 3. Average sleep hour (Keep raw value in hours - scale 0-12)
//             const sleepHours = countryRecords.map(r => +r.sleep_hours).filter(s => !isNaN(s));
//             const avgSleepHours = sleepHours.length > 0 ? d3.mean(sleepHours) : 0;
//             axes.push({ axis: "Avg Sleep Hours", value: avgSleepHours });

//             // 4. Average social media hour (Keep raw value in hours - scale 0-12)
//             const socialMediaHours = countryRecords.map(r => +r.social_media_usage).filter(s => !isNaN(s));
//             const avgSocialMediaHours = socialMediaHours.length > 0 ? d3.mean(socialMediaHours) : 0;
//             axes.push({ axis: "Avg Social Media Hours", value: avgSocialMediaHours });

//             // 5. % of people that family history
//             const familyHistoryYes = countryRecords.filter(r => r.family_history === 1).length; // 1 means yes
//             const percentFamilyHistory = countryRecords.length > 0 ? (familyHistoryYes / countryRecords.length) * 100 : 0;
//             axes.push({ axis: "% Family History", value: percentFamilyHistory });

//             // 6. % of people that has coping struggle
//             const copingStruggleYes = countryRecords.filter(r => r.coping_struggles === 1).length; // 1 means yes
//             const percentCopingStruggle = countryRecords.length > 0 ? (copingStruggleYes / countryRecords.length) * 100 : 0;
//             axes.push({ axis: "% Coping Struggle", value: percentCopingStruggle });

//             spiderData.push({ country, axes });
//         }

//         if (spiderData.length > 0) {
//             spiderData.forEach(countryData => {
//                 const existingAxes = new Set(countryData.axes.map(a => a.axis));
//                 for (const axisName of newAxes) {
//                     if (!existingAxes.has(axisName)) {
//                         countryData.axes.push({ axis: axisName, value: 0 });
//                     }
//                 }
//                 countryData.axes.sort((a, b) => newAxes.indexOf(a.axis) - newAxes.indexOf(b.axis));
//             });
//         }

//         return spiderData;
//     }, [countryA, countryB, rawRows]);


//     const radarChartData = prepareSpiderData();

//     // Define specific domains for each axis
//     const axisDomains = useMemo(() => ({
//         "% Caretaker Options": [0, 100],
//         "Avg Outdoor Days": [0, 90], // Customized to 0-90 days
//         "Avg Sleep Hours": [0, 12],   // Customized to 0-12 hours
//         "Avg Social Media Hours": [0, 12], // Customized to 0-12 hours
//         "% Family History": [0, 100],
//         "% Coping Struggle": [0, 100]
//     }), []);

//     const radarChartColors = useMemo(() => d3.scaleOrdinal(d3.schemeCategory10), []);

//     const resetSelection = () => {
//         setCountryA("United States of America");
//         setCountryB("India");
//     };

//     const startTour = () => {
//         setShowTour(true);
//         setTourStep(0);
//         setIsPlaying(true);
//     };

//     const nextTourStep = () => {
//         setTourStep(prevStep => (prevStep + 1) % tourSteps.length);
//         if ((tourStep + 1) % tourSteps.length === 0) {
//             setIsPlaying(false);
//         }
//     };

//     const prevTourStep = () => {
//         setTourStep(prevStep => (prevStep - 1 + tourSteps.length) % tourSteps.length);
//     };

//     const togglePlay = () => {
//         setIsPlaying(prev => !prev);
//     };

//     const InfoModal = () => (
//         <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4"
//             onClick={() => setShowInfo(false)}
//         >
//             <motion.div
//                 initial={{ y: -50, opacity: 0 }}
//                 animate={{ y: 0, opacity: 1 }}
//                 exit={{ y: -50, opacity: 0 }}
//                 className="bg-white rounded-lg p-8 max-w-2xl w-full relative shadow-xl"
//                 onClick={e => e.stopPropagation()} // Prevent closing when clicking inside
//             >
//                 <button
//                     onClick={() => setShowInfo(false)}
//                     className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
//                 >
//                     <FiX size={24} />
//                 </button>
//                 <h2 className="text-2xl font-bold text-violet-800 mb-4">About This Dashboard</h2>
//                 <p className="text-gray-700 mb-4">
//                     This dashboard visualizes global mental health data, allowing you to explore mental health ratings across countries and compare various demographic and health factors.
//                 </p>
//                 <h3 className="text-xl font-semibold text-violet-700 mb-2">Data Sources:</h3>
//                 <ul className="list-disc list-inside text-gray-600 mb-4">
//                     <li>Mental Health Survey Data (simulated/example data)</li>
//                     <li>World Bank Indicators (for demographic context)</li>
//                 </ul>
//                 <h3 className="text-xl font-semibold text-violet-700 mb-2">How to Use:</h3>
//                 <ul className="list-disc list-inside text-gray-600 mb-4">
//                     <li>
//                         <strong>Map View:</strong> Hover over countries to see their mental health rating.
//                     </li>
//                     <li>
//                         <strong>Comparison View:</strong> Select two countries from the dropdowns to generate a radar chart comparing factors like social media usage, sleep hours, outdoor activity, caretaker options, family history of mental illness, and coping struggles.
//                     </li>
//                 </ul>
//                 <p className="text-gray-700 italic">
//                     Disclaimer: This dashboard is for informational purposes only and should not be used as a substitute for professional medical advice.
//                 </p>
//             </motion.div>
//         </motion.div>
//     );

//     const TourModal = () => (
//         <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4"
//             onClick={() => setShowTour(false)}
//         >
//             <motion.div
//                 initial={{ y: -50, opacity: 0 }}
//                 animate={{ y: 0, opacity: 1 }}
//                 exit={{ y: -50, opacity: 0 }}
//                 className="bg-white rounded-lg p-8 max-w-xl w-full relative shadow-xl"
//                 onClick={e => e.stopPropagation()}
//             >
//                 <button
//                     onClick={() => { setShowTour(false); setIsPlaying(false); }}
//                     className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
//                 >
//                     <FiX size={24} />
//                 </button>
//                 <h2 className="text-2xl font-bold text-violet-800 mb-4">Dashboard Tour</h2>
//                 <p className="text-gray-700 mb-6 text-center text-lg">
//                     {tourSteps[tourStep]}
//                 </p>
//                 <div className="flex justify-center items-center gap-4 mt-6">
//                     <button
//                         onClick={prevTourStep}
//                         className="px-4 py-2 bg-violet-200 text-violet-700 rounded-lg hover:bg-violet-300 transition-colors"
//                     >
//                         Previous
//                     </button>
//                     <button
//                         onClick={togglePlay}
//                         className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors flex items-center"
//                     >
//                         {isPlaying ? <FiPause className="mr-2" /> : <FiPlay className="mr-2" />}
//                         {isPlaying ? "Pause" : "Play"}
//                     </button>
//                     <button
//                         onClick={nextTourStep}
//                         className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
//                     >
//                         {tourStep === tourSteps.length - 1 ? "Finish" : "Next"}
//                     </button>
//                 </div>
//                 <div className="text-center text-sm text-gray-500 mt-4">
//                     Step {tourStep + 1} of {tourSteps.length}
//                 </div>
//             </motion.div>
//         </motion.div>
//     );

//     return (
//         <div className="bg-gradient-to-br from-violet-50 to-red-50 min-h-screen px-4 py-6 font-sans relative">
//             <header className="flex flex-col sm:flex-row justify-between items-center mb-8 px-2">
//                 <h1 className="text-3xl font-extrabold text-violet-900 mb-4 sm:mb-0">
//                     🌍 Global Mental Health Dashboard
//                 </h1>
//                 <div className="flex gap-3">
//                     <button
//                         onClick={resetSelection}
//                         className="p-2 rounded-full bg-violet-100 text-violet-600 hover:bg-violet-200 transition-colors flex items-center justify-center shadow-md"
//                         title="Reset Country Selection"
//                     >
//                         <FiRefreshCw size={20} />
//                     </button>
//                     <button
//                         onClick={startTour}
//                         className="p-2 rounded-full bg-violet-100 text-violet-600 hover:bg-violet-200 transition-colors flex items-center justify-center shadow-md"
//                         title="Start Tour"
//                     >
//                         <FiPlay size={20} />
//                     </button>
//                     <button
//                         onClick={() => setShowInfo(true)}
//                         className="p-2 rounded-full bg-violet-100 text-violet-600 hover:bg-violet-200 transition-colors flex items-center justify-center shadow-md"
//                         title="Information"
//                     >
//                         <FiInfo size={20} />
//                     </button>
//                 </div>
//             </header>

//             <AnimatePresence mode="wait">
//                 <motion.div
//                     key={activeTab}
//                     initial={{ opacity: 0, y: 10 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     exit={{ opacity: 0, y: -10 }}
//                     transition={{ duration: 0.2 }}
//                 >
//                     <nav className="mb-8 flex justify-center bg-violet-100 rounded-full p-1 shadow-inner">
//                         <button
//                             onClick={() => setActiveTab("map")}
//                             className={`px-6 py-2 rounded-full text-lg font-medium transition-all duration-300 ${activeTab === "map" ? "bg-violet-600 text-white shadow-md" : "text-violet-700 hover:text-violet-900"}`}
//                         >
//                             <FiGlobe className="inline-block mr-2" /> Map View
//                         </button>
//                         <button
//                             onClick={() => setActiveTab("comparison")}
//                             className={`px-6 py-2 rounded-full text-lg font-medium transition-all duration-300 ${activeTab === "comparison" ? "bg-violet-600 text-white shadow-md" : "text-violet-700 hover:text-violet-900"}`}
//                         >
//                             <FiBarChart2 className="inline-block mr-2" /> Comparison View
//                         </button>
//                     </nav>

//                     {activeTab === "map" && (
//                         <div className="bg-white p-6 rounded-2xl shadow-xl border border-violet-200">
//                             <h2 className="text-2xl font-bold text-violet-800 mb-4 flex items-center">
//                                 Mental Health Ratings by Country
//                                 {isLoading && <span className="ml-3 text-gray-500 text-sm animate-pulse">Loading data...</span>}
//                             </h2>
//                             <div className="relative mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 text-sm flex items-center">
//                                 <FiHeart className="mr-2 text-blue-600" />
//                                 <span className="italic">{mentalHealthFact}</span>
//                             </div>
//                             <div className="flex justify-center items-center h-[500px] w-full overflow-hidden">
//                                 <svg width={width} height={height}>
//                                     <g className="countries">
//                                         {geoCountries.map((d) => (
//                                             <path
//                                                 key={d.id}
//                                                 d={pathGenerator(d)}
//                                                 fill={data.find((c) => c.id === d.id) ? colorScale(getRating(d.properties.name)) : "#ccc"}
//                                                 stroke="#FFFFFF"
//                                                 strokeWidth="0.5"
//                                                 onMouseEnter={(event) => {
//                                                     const rating = getRating(d.properties.name);
//                                                     setTooltip({
//                                                         visible: true,
//                                                         x: event.pageX + 10,
//                                                         y: event.pageY + 10,
//                                                         content: `
//                                                             <div class="font-bold text-base">${d.properties.name}</div>
//                                                             <div class="text-xs">Rating: ${rating} ${rating !== "N/A" ? "/ 5" : ""}</div>
//                                                         `
//                                                     });
//                                                 }}
//                                                 onMouseLeave={() => setTooltip({ ...tooltip, visible: false })}
//                                             />
//                                         ))}
//                                     </g>
//                                 </svg>
//                             </div>
//                             <div className="flex justify-center mt-4">
//                                 <div className="flex items-center space-x-2">
//                                     <span className="text-gray-600 text-sm">Rating:</span>
//                                     {d3.range(1, 6).map((d) => (
//                                         <div key={d} className="flex items-center">
//                                             <span
//                                                 className="w-4 h-4 rounded-full mr-1"
//                                                 style={{ backgroundColor: colorScale(d) }}
//                                             ></span>
//                                             <span className="text-gray-700 text-sm">{d}</span>
//                                         </div>
//                                     ))}
//                                 </div>
//                             </div>
//                         </div>
//                     )}

//                     {activeTab === "comparison" && (
//                         <div className="space-y-8">
//                             <div className="bg-gradient-to-r from-violet-100 to-red-100 p-6 rounded-2xl">
//                                 <h2 className="text-2xl font-bold text-violet-800 mb-4">Country Comparison</h2>
//                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
//                                     <div>
//                                         <label htmlFor="countryA" className="block text-violet-700 text-sm font-bold mb-2">
//                                             Select Country A:
//                                         </label>
//                                         <select
//                                             id="countryA"
//                                             value={countryA}
//                                             onChange={(e) => setCountryA(e.target.value)}
//                                             className="block w-full px-4 py-2 border border-violet-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-white text-violet-800"
//                                         >
//                                             {countriesDataList.map((country) => (
//                                                 <option key={country} value={country}>
//                                                     {country}
//                                                 </option>
//                                             ))}
//                                         </select>
//                                     </div>
//                                     <div>
//                                         <label htmlFor="countryB" className="block text-violet-700 text-sm font-bold mb-2">
//                                             Select Country B:
//                                         </label>
//                                         <select
//                                             id="countryB"
//                                             value={countryB}
//                                             onChange={(e) => setCountryB(e.target.value)}
//                                             className="block w-full px-4 py-2 border border-violet-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-white text-violet-800"
//                                         >
//                                             {countriesDataList.map((country) => (
//                                                 <option key={country} value={country}>
//                                                     {country}
//                                                 </option>
//                                             ))}
//                                         </select>
//                                     </div>
//                                 </div>

//                                 <div className="flex flex-col md:flex-row gap-6">
//                                     {countryA && (
//                                         <div className="flex-1 bg-white p-4 rounded-xl shadow-md border border-violet-200">
//                                             <h3 className="text-lg font-bold text-violet-800 mb-2">
//                                                 {countryA} Rating:{" "}
//                                                 <span className="text-red-600">
//                                                     {getRating(countryA)}
//                                                 </span>
//                                             </h3>
//                                             {radarChartData.find(d => d.country === countryA) ? (
//                                                 <RadarChart
//                                                     data={[radarChartData.find(d => d.country === countryA)]}
//                                                     width={500} // Increased width
//                                                     height={500} // Increased height
//                                                     outerRadius={100} // Increased outerRadius
//                                                     colorScale={radarChartColors}
//                                                     axisDomains={axisDomains}
//                                                 />
//                                             ) : (
//                                                 <p className="text-gray-500">No detailed data for {countryA}</p>
//                                             )}
//                                         </div>
//                                     )}
//                                     {countryB && (
//                                         <div className="flex-1 bg-white p-4 rounded-xl shadow-md border border-violet-200">
//                                             <h3 className="text-lg font-bold text-violet-800 mb-2">
//                                                 {countryB} Rating:{" "}
//                                                 <span className="text-blue-600">
//                                                     {getRating(countryB)}
//                                                 </span>
//                                             </h3>
//                                             {radarChartData.find(d => d.country === countryB) ? (
//                                                 <RadarChart
//                                                     data={[radarChartData.find(d => d.country === countryB)]}
//                                                     width={500} // Increased width
//                                                     height={500} // Increased height
//                                                     outerRadius={100} // Increased outerRadius
//                                                     colorScale={radarChartColors}
//                                                     axisDomains={axisDomains}
//                                                 />
//                                             ) : (
//                                                 <p className="text-gray-500">No detailed data for {countryB}</p>
//                                             )}
//                                         </div>
//                                     )}
//                                     {!countryA && !countryB && (
//                                         <div className="flex-1 p-4 text-center text-gray-500 italic">
//                                             Select two countries above to see a comparison.
//                                         </div>
//                                     )}
//                                 </div>
//                             </div>

//                             {/* Combined Radar Chart for Comparison */}
//                             {(countryA && countryB && radarChartData.length === 2) && (
//                                 <div className="bg-white p-6 rounded-2xl shadow-xl border border-violet-200">
//                                     <h3 className="text-xl font-bold text-violet-900 mb-4">
//                                         Combined Demographic Comparison
//                                     </h3>
//                                     <div className="flex justify-center">
//                                         <RadarChart
//                                             data={radarChartData}
//                                             width={700} // Increased width
//                                             height={700} // Increased height
//                                             outerRadius={160} // Increased outerRadius
//                                             colorScale={radarChartColors}
//                                             axisDomains={axisDomains}
//                                         />
//                                     </div>
//                                     <div className="flex justify-center gap-8 mt-4 text-sm font-medium">
//                                         <span className="flex items-center">
//                                             <span className="inline-block w-3 h-3 rounded-full mr-2" style={{ backgroundColor: radarChartColors(0) }}></span>
//                                             {countryA}
//                                         </span>
//                                         <span className="flex items-center">
//                                             <span className="inline-block w-3 h-3 rounded-full mr-2" style={{ backgroundColor: radarChartColors(1) }}></span>
//                                             {countryB}
//                                         </span>
//                                     </div>
//                                 </div>
//                             )}
//                         </div>
//                     )}
//                 </motion.div>
//             </AnimatePresence>

//             <footer className="text-center text-violet-700 text-sm mt-8">
//                 <p>&copy; {new Date().getFullYear()} Global Mental Health Dashboard. All rights reserved.</p>
//             </footer>

//             {tooltip.visible && (
//                 <motion.div
//                     className="absolute bg-gray-800 text-white text-xs px-3 py-2 rounded shadow-lg pointer-events-none z-50"
//                     initial={{ opacity: 0 }}
//                     animate={{ opacity: 1 }}
//                     exit={{ opacity: 0 }}
//                     style={{ left: tooltip.x, top: tooltip.y }}
//                 >
//                     <div dangerouslySetInnerHTML={{ __html: tooltip.content }} />
//                 </motion.div>
//             )}

//             {showInfo && <InfoModal />}
//             {showTour && <TourModal />}
//         </div>
//     );
// };

// export default Map;


import React, { useEffect, useState, useMemo, useRef, useCallback } from "react";
import * as d3 from "d3";
import { feature } from "topojson-client";
import { FiRefreshCw, FiInfo, FiGlobe, FiBarChart2, FiX, FiHeart, FiPlay, FiPause } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

const countriesDataList = [
    "Poland", "Australia", "United States of America", "Canada", "United Kingdom",
    "South Africa", "Sweden", "New Zealand", "Netherlands", "India",
    "Belgium", "Ireland", "France", "Portugal", "Brazil", "Costa Rica",
    "Russia", "Germany", "Switzerland", "Finland", "Israel", "Italy",
    "Bosnia and Herzegovina", "Singapore", "Nigeria", "Croatia",
    "Thailand", "Denmark", "Mexico", "Greece", "Moldova", "Colombia",
    "Georgia", "Czech Republic", "Philippines"
];

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// Radar Chart Component (No changes needed here for the tooltip issue)
const RadarChart = ({ data, width, height, outerRadius, colorScale, axisDomains }) => {
    const svgRef = useRef();
    const margin = { top: 40, right: 40, bottom: 40, left: 40 };

    useEffect(() => {
        if (!data || data.length === 0 || !data[0].axes || data[0].axes.length === 0) {
            d3.select(svgRef.current).selectAll("*").remove();
            return;
        }

        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove(); // Clear previous drawings

        // Create a radial scale for each axis based on its specific domain
        const radialScale = (axisName, value) => {
            const domain = axisDomains[axisName] || [0, 100]; // Default to 0-100 if no specific domain
            return d3.scaleLinear().domain(domain).range([0, outerRadius])(value);
        };

        const allAxes = data[0].axes.map(d => d.axis);
        const angleSlice = Math.PI * 2 / allAxes.length;

        const radarLine = d3.lineRadial()
            .curve(d3.curveLinearClosed)
            .radius(d => radialScale(d.axis, d.value)) // Use axis-specific radial scale
            .angle((d, i) => i * angleSlice);

        const g = svg.append("g")
            .attr("transform", `translate(${width / 2},${height / 2})`);

        // Draw grid circles (using a common max for visual consistency, or adjust per axis if needed)
        const numCircles = 5;
        // The grid circles provide a general background. Specific numerical labels will be added per axis.
        g.selectAll(".grid-circle")
            .data(d3.range(1, numCircles + 1).map(i => i * outerRadius / numCircles))
            .join("circle")
            .attr("class", "grid-circle")
            .attr("r", d => d)
            .style("fill", "#CDCDCD")
            .style("stroke", "#CDCDCD")
            .style("fill-opacity", 0.1)
            .style("stroke-width", 0.5);

        // Remove the old grid labels (labels for concentric circles)
        g.selectAll(".grid-label").remove();


        // Draw axes
        const axis = g.selectAll(".axis")
            .data(allAxes)
            .join("g")
            .attr("class", "axis");

        axis.append("line")
            .attr("x1", 0)
            .attr("y1", 0)
            .attr("x2", (d, i) => radialScale(d, axisDomains[d]?.[1] || 100) * Math.cos(angleSlice * i - Math.PI / 2)) // Use axis-specific max value for line length
            .attr("y2", (d, i) => radialScale(d, axisDomains[d]?.[1] || 100) * Math.sin(angleSlice * i - Math.PI / 2)) // Use axis-specific max value for line length
            .attr("stroke", "#CDCDCD")
            .attr("stroke-width", 1);

        // Axis name labels (e.g., "Avg Social Media Hours (hours)")
        axis.append("text")
            .attr("class", "legend")
            .style("font-size", "12px")
            // Adjusted text-anchor and position for axis names more dynamically
            .attr("text-anchor", (d, i) => {
                // Adjust text-anchor based on axis index
                if (i === 0) return "middle"; // % Caretaker Options (Top)
                if (i === 1) return "start";  // Avg Outdoor Days (Top-right)
                if (i === 2) return "start";  // Avg Sleep Hours (Bottom-right)
                if (i === 3) return "middle"; // Avg Social Media Hours (Bottom)
                if (i === 4) return "end";    // % Family History (Bottom-left)
                if (i === 5) return "end";    // % Coping Struggle (Top-left)
                return "middle";
            })
            .attr("dy", (d, i) => {
                // Adjust dy based on axis index
                if (i === 0) return "-1.2em"; // Top: higher above
                if (i === 1) return "-0.5em"; // Top-right: above
                if (i === 2) return "0.5em"; // Bottom-right: below
                if (i === 3) return "2em"; // Bottom: much further below
                if (i === 4) return "0.5em"; // Bottom-left: below
                if (i === 5) return "-0.5em"; // Top-left: above
                return "0.35em";
            })
            .attr("x", (d, i) => radialScale(d, (axisDomains[d]?.[1] || 100) * 1.35) * Math.cos(angleSlice * i - Math.PI / 2)) // Increased multiplier further
            .attr("y", (d, i) => radialScale(d, (axisDomains[d]?.[1] || 100) * 1.35) * Math.sin(angleSlice * i - Math.PI / 2)) // Increased multiplier further
            .text(d => {
                // Add units to specific axis labels
                if (d === "Avg Social Media Hours" || d === "Avg Sleep Hours") {
                    return `${d} (hours)`;
                } else if (d === "Avg Outdoor Days") {
                    return `${d} (days)`;
                }
                return d;
            })
            .attr("fill", "#333");

        // Add numerical tick labels along each axis
        axis.each(function(axisName, i) {
            const axisGroup = d3.select(this);

            let tickValues;
            let tickSuffix = '';

            if (axisName === "Avg Social Media Hours" || axisName === "Avg Sleep Hours") {
                tickValues = [4, 6, 8, 10, 12]; // Added 10 for more ticks
                tickSuffix = 'h';
            } else if (axisName === "Avg Outdoor Days") {
                tickValues = [30, 60, 90]; // Explicit ticks for days
                tickSuffix = 'd';
            } else { // For percentage axes
                tickValues = [25, 50, 75, 100];
                tickSuffix = '%';
            }

            // Calculate angle for current axis
            const angleRad = angleSlice * i - Math.PI / 2;

            axisGroup.selectAll(".axis-tick-value")
                .data(tickValues)
                .join("text")
                .attr("class", "axis-tick-value")
                .attr("x", (tickVal) => {
                    const r = radialScale(axisName, tickVal);
                    return r * Math.cos(angleRad);
                })
                .attr("y", (tickVal) => {
                    const r = radialScale(axisName, tickVal);
                    return r * Math.sin(angleRad);
                })
                .attr("dx", () => {
                    // Adjust dx based on axis index for better separation
                    if (i === 0) return "0em"; // % Caretaker Options (Top): no horizontal offset
                    if (i === 1) return "0.6em"; // Avg Outdoor Days (Top-right): more to the right
                    if (i === 2) return "0.6em"; // Avg Sleep Hours (Bottom-right: more to the right
                    if (i === 3) return "0em"; // Avg Social Media Hours (Bottom): no horizontal offset
                    if (i === 4) return "-0.6em"; // % Family History (Bottom-left): more to the left
                    if (i === 5) return "-0.6em"; // % Coping Struggle (Top-left): more to the left
                    return "0em";
                })
                .attr("dy", () => {
                    // Adjust dy based on axis index
                    if (i === 0) return "-0.5em"; // % Caretaker Options (Top): above
                    if (i === 1) return "-0.2em"; // Avg Outdoor Days (Top-right): slight above
                    if (i === 2) return "0.8em"; // Avg Sleep Hours (Bottom-right): below
                    if (i === 3) return "1.2em"; // Avg Social Media Hours (Bottom): far below
                    if (i === 4) return "0.8em"; // % Family History (Bottom-left): below
                    if (i === 5) return "-0.2em"; // % Coping Struggle (Top-left): slight above
                    return "0em";
                })
                .style("font-size", "9px")
                .attr("text-anchor", () => {
                    // Adjust text-anchor based on axis index for better alignment
                    if (i === 0) return "middle"; // Top
                    if (i === 1) return "start"; // Top-right
                    if (i === 2) return "start"; // Bottom-right
                    if (i === 3) return "middle"; // Bottom
                    if (i === 4) return "end";   // Bottom-left
                    if (i === 5) return "end";   // Top-left
                    return "middle";
                })
                .attr("fill", "#555")
                .text(tickVal => `${tickVal}${tickSuffix}`);
        });


        // Draw radar areas and paths
        const countryPaths = g.selectAll(".radarArea")
            .data(data)
            .join("path")
            .attr("class", "radarArea")
            .attr("fill", (d, i) => colorScale(i))
            .attr("fill-opacity", 0.1)
            .attr("stroke-width", 2)
            .attr("stroke", (d, i) => colorScale(i))
            .attr("d", d => radarLine(d.axes))
            .style("pointer-events", "all")
            .on("mouseover", function(event, d) {
                d3.select(this).attr("fill-opacity", 0.7);
            })
            .on("mouseout", function() {
                d3.select(this).attr("fill-opacity", 0.1);
            });

        // Draw circles for points
        data.forEach((d, i) => {
            g.selectAll(`.radarCircle-${i}`)
                .data(d.axes)
                .join("circle")
                .attr("class", `radarCircle-${i}`)
                .attr("r", 5)
                .attr("cx", (p, j) => radialScale(p.axis, p.value) * Math.cos(angleSlice * j - Math.PI / 2)) // Use axis-specific radial scale
                .attr("cy", (p, j) => radialScale(p.axis, p.value) * Math.sin(angleSlice * j - Math.PI / 2)) // Use axis-specific radial scale
                .attr("fill", colorScale(i))
                .attr("fill-opacity", 0.8);
        });

    }, [data, width, height, outerRadius, colorScale, axisDomains]);

    return <svg ref={svgRef} width={width} height={height}></svg>;
};

const Map = () => {
    const [geoCountries, setGeoCountries] = useState([]);
    const [data, setData] = useState([]);
    const [rawRows, setRawRows] = useState([]);
    const [nameToId, setNameToId] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [countryA, setCountryA] = useState("United States of America");
    const [countryB, setCountryB] = useState("India");
    const [activeTab, setActiveTab] = useState("map"); // "map" or "comparison"
    const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, content: "" });

    const [mentalHealthFact, setMentalHealthFact] = useState("");
    const [showInfo, setShowInfo] = useState(false);
    const [showTour, setShowTour] = useState(false);
    const [tourStep, setTourStep] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const playTimerRef = useRef(null);
    const factTimer = useRef(null);

    const mentalHealthFacts = useMemo(() => [
        "Globally, more than 450 million people currently suffer from mental or neurological conditions.",
        "Depression is a leading cause of disability worldwide, affecting over 280 million people.",
        "Around 1 in 7 people aged 10-19 years worldwide experience a mental disorder.",
        "Stigma and discrimination continue to be a barrier to mental health care worldwide.",
        "An estimated 700,000 people die by suicide each year, making it a leading cause of death globally.",
        "Investment in mental health remains low, with many countries spending less than 2% of their health budgets on it.",
        "Early intervention in mental health can prevent more severe conditions and improve outcomes.",
        "Access to mental health services varies greatly across countries, with many lacking adequate resources.",
        "Digital mental health interventions are emerging as a way to increase access to care.",
        "Promoting mental well-being is as important as treating mental illness."
    ], []);

    const tourSteps = useMemo(() => [
        "Welcome to the Global Mental Health Dashboard! Here you can explore mental health data across various countries.",
        "Use the 'Map View' tab to see an overview of mental health ratings across the world. Hover over countries for details.",
        "Switch to the 'Comparison View' tab to compare mental health factors between two selected countries using a radar chart.",
        "Select countries using the dropdowns in the 'Comparison View' to see their detailed demographic and health comparisons.",
        "The radar chart visualizes various factors. The further a point is from the center, the higher the value for that factor.",
        "You can refresh the data or get more information using the buttons at the top right.",
        "Enjoy exploring the data and gaining insights into global mental health!"
    ], []);

    useEffect(() => {
        // Mental health fact updater
        factTimer.current = setInterval(() => {
            const randomIndex = Math.floor(Math.random() * mentalHealthFacts.length);
            setMentalHealthFact(mentalHealthFacts[randomIndex]);
        }, 8000); // Change fact every 8 seconds

        return () => clearInterval(factTimer.current);
    }, [mentalHealthFacts]);

    useEffect(() => {
        if (isPlaying) {
            playTimerRef.current = setInterval(() => {
                setTourStep(prevStep => (prevStep + 1) % tourSteps.length);
            }, 5000); // Change tour step every 5 seconds
        } else {
            clearInterval(playTimerRef.current);
        }
        return () => clearInterval(playTimerRef.current);
    }, [isPlaying, tourSteps]);

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);

            try {
                const topoRes = await fetch(geoUrl);
                const topoJson = await topoRes.json();
                const geoData = feature(topoJson, topoJson.objects.countries).features;

                setGeoCountries(geoData);

                const mapping = {};
                geoData.forEach((d) => {
                    const name = d.properties.name;
                    const id = d.id?.toString().padStart(3, "0");
                    if (name && id) mapping[name] = id;
                });
                setNameToId(mapping);

                const rows = await d3.csv("data_trimmed.csv", d3.autoType);
                // const res = await fetch("http://localhost:5051/api/ratings"); // Keep this commented or remove if not in use
                // const rows = await res.json();
                const filteredRows = rows.filter(d => countriesDataList.includes(d.country));
                setRawRows(filteredRows);
                console.log("Raw rows loaded:", filteredRows);

                const grouped = d3.groups(filteredRows, (d) => d.country);
                const averaged = grouped.map(([country, records]) => {
                    const scores = records.map((r) => +r.ratings).filter((s) => !isNaN(s));
                    const avg = d3.mean(scores);
                    const id = mapping[country];
                    if (!id || isNaN(avg)) return null;
                    return { id, country, rating: +avg.toFixed(2) };
                });
                setData(averaged.filter((d) => d !== null));
            } catch (error) {
                console.error("Error loading data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, []);

    const width = 960;
    const height = 500;
    const projection = d3.geoMercator().scale(120).translate([width / 2, height / 2]);
    const pathGenerator = d3.geoPath().projection(projection);

    const colorScale = useMemo(() =>
        d3.scaleSequential()
            .domain([1, 5])
            .interpolator(d3.interpolateYlOrRd),
        []
    );

    const getRating = (name) => {
        const entry = data.find((d) => d.country === name);
        return entry ? entry.rating : "N/A";
    };

    const prepareSpiderData = useCallback(() => {
        const selectedCountries = new Set([countryA, countryB].filter(Boolean));
        if (selectedCountries.size === 0) return [];

        const spiderData = [];

        const newAxes = [
            "% Caretaker Options",
            "Avg Outdoor Days",
            "Avg Sleep Hours",
            "Avg Social Media Hours",
            "% Family History",
            "% Coping Struggle"
        ];

        for (const country of selectedCountries) {
            const countryRecords = rawRows.filter(d => d.country === country);
            if (countryRecords.length === 0) continue;

            const axes = [];

            // 1. % people that have caretaker options
            const caretakerYes = countryRecords.filter(r => r.care_options === 0).length; // 0 means yes
            const percentCaretaker = countryRecords.length > 0 ? (caretakerYes / countryRecords.length) * 100 : 0;
            axes.push({ axis: "% Caretaker Options", value: percentCaretaker });

            // 2. Average of outdoor days (Keep raw value in days - scale 0-90)
            const outdoorDayScores = countryRecords.map(r => {
                switch (r.days_indoors) {
                    case 0: return 90; // Goes out every day (max outdoor score = 90 days outdoor)
                    case 0.25: return 75; // 1-14 days indoor (approx 75 days outdoor)
                    case 0.5: return 45; // 15-30 days indoor (approx 45 days outdoor)
                    case 0.75: return 15; // 31-60 days indoor (approx 15 days outdoor)
                    case 1: return 0; // more than 2 months indoor (min outdoor score = 0 days outdoor)
                    default: return 0;
                }
            }).filter(v => !isNaN(v));
            const avgOutdoorDays = outdoorDayScores.length > 0 ? d3.mean(outdoorDayScores) : 0;
            axes.push({ axis: "Avg Outdoor Days", value: avgOutdoorDays });


            // 3. Average sleep hour (Keep raw value in hours - scale 0-12)
            const sleepHours = countryRecords.map(r => +r.sleep_hours).filter(s => !isNaN(s));
            const avgSleepHours = sleepHours.length > 0 ? d3.mean(sleepHours) : 0;
            axes.push({ axis: "Avg Sleep Hours", value: avgSleepHours });

            // 4. Average social media hour (Keep raw value in hours - scale 0-12)
            const socialMediaHours = countryRecords.map(r => +r.social_media_usage).filter(s => !isNaN(s));
            const avgSocialMediaHours = socialMediaHours.length > 0 ? d3.mean(socialMediaHours) : 0;
            axes.push({ axis: "Avg Social Media Hours", value: avgSocialMediaHours });

            // 5. % of people that family history
            const familyHistoryYes = countryRecords.filter(r => r.family_history === 1).length; // 1 means yes
            const percentFamilyHistory = countryRecords.length > 0 ? (familyHistoryYes / countryRecords.length) * 100 : 0;
            axes.push({ axis: "% Family History", value: percentFamilyHistory });

            // 6. % of people that has coping struggle
            const copingStruggleYes = countryRecords.filter(r => r.coping_struggles === 1).length; // 1 means yes
            const percentCopingStruggle = countryRecords.length > 0 ? (copingStruggleYes / countryRecords.length) * 100 : 0;
            axes.push({ axis: "% Coping Struggle", value: percentCopingStruggle });

            spiderData.push({ country, axes });
        }

        if (spiderData.length > 0) {
            spiderData.forEach(countryData => {
                const existingAxes = new Set(countryData.axes.map(a => a.axis));
                for (const axisName of newAxes) {
                    if (!existingAxes.has(axisName)) {
                        countryData.axes.push({ axis: axisName, value: 0 });
                    }
                }
                countryData.axes.sort((a, b) => newAxes.indexOf(a.axis) - newAxes.indexOf(b.axis));
            });
        }

        return spiderData;
    }, [countryA, countryB, rawRows]);


    const radarChartData = prepareSpiderData();

    // Define specific domains for each axis
    const axisDomains = useMemo(() => ({
        "% Caretaker Options": [0, 100],
        "Avg Outdoor Days": [0, 90], // Customized to 0-90 days
        "Avg Sleep Hours": [0, 12],   // Customized to 0-12 hours
        "Avg Social Media Hours": [0, 12], // Customized to 0-12 hours
        "% Family History": [0, 100],
        "% Coping Struggle": [0, 100]
    }), []);

    const radarChartColors = useMemo(() => d3.scaleOrdinal(d3.schemeCategory10), []);

    const resetSelection = () => {
        setCountryA("United States of America");
        setCountryB("India");
    };

    const startTour = () => {
        setShowTour(true);
        setTourStep(0);
        setIsPlaying(true);
    };

    const nextTourStep = () => {
        setTourStep(prevStep => (prevStep + 1) % tourSteps.length);
        if ((tourStep + 1) % tourSteps.length === 0) {
            setIsPlaying(false);
        }
    };

    const prevTourStep = () => {
        setTourStep(prevStep => (prevStep - 1 + tourSteps.length) % tourSteps.length);
    };

    const togglePlay = () => {
        setIsPlaying(prev => !prev);
    };

    const InfoModal = () => (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowInfo(false)}
        >
            <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -50, opacity: 0 }}
                className="bg-white rounded-lg p-8 max-w-2xl w-full relative shadow-xl"
                onClick={e => e.stopPropagation()} // Prevent closing when clicking inside
            >
                <button
                    onClick={() => setShowInfo(false)}
                    className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                >
                    <FiX size={24} />
                </button>
                <h2 className="text-2xl font-bold text-violet-800 mb-4">About This Dashboard</h2>
                <p className="text-gray-700 mb-4">
                    This dashboard visualizes global mental health data, allowing you to explore mental health ratings across countries and compare various demographic and health factors.
                </p>
                <h3 className="text-xl font-semibold text-violet-700 mb-2">Data Sources:</h3>
                <ul className="list-disc list-inside text-gray-600 mb-4">
                    <li>Mental Health Survey Data (simulated/example data)</li>
                    <li>World Bank Indicators (for demographic context)</li>
                </ul>
                <h3 className="text-xl font-semibold text-violet-700 mb-2">How to Use:</h3>
                <ul className="list-disc list-inside text-gray-600 mb-4">
                    <li>
                        <strong>Map View:</strong> Hover over countries to see their mental health rating.
                    </li>
                    <li>
                        <strong>Comparison View:</strong> Select two countries from the dropdowns to generate a radar chart comparing factors like social media usage, sleep hours, outdoor activity, caretaker options, family history of mental illness, and coping struggles.
                    </li>
                </ul>
                <p className="text-gray-700 italic">
                    Disclaimer: This dashboard is for informational purposes only and should not be used as a substitute for professional medical advice.
                </p>
            </motion.div>
        </motion.div>
    );

    const TourModal = () => (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowTour(false)}
        >
            <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -50, opacity: 0 }}
                className="bg-white rounded-lg p-8 max-w-xl w-full relative shadow-xl"
                onClick={e => e.stopPropagation()}
            >
                <button
                    onClick={() => { setShowTour(false); setIsPlaying(false); }}
                    className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                >
                    <FiX size={24} />
                </button>
                <h2 className="text-2xl font-bold text-violet-800 mb-4">Dashboard Tour</h2>
                <p className="text-gray-700 mb-6 text-center text-lg">
                    {tourSteps[tourStep]}
                </p>
                <div className="flex justify-center items-center gap-4 mt-6">
                    <button
                        onClick={prevTourStep}
                        className="px-4 py-2 bg-violet-200 text-violet-700 rounded-lg hover:bg-violet-300 transition-colors"
                    >
                        Previous
                    </button>
                    <button
                        onClick={togglePlay}
                        className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors flex items-center"
                    >
                        {isPlaying ? <FiPause className="mr-2" /> : <FiPlay className="mr-2" />}
                        {isPlaying ? "Pause" : "Play"}
                    </button>
                    <button
                        onClick={nextTourStep}
                        className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
                    >
                        {tourStep === tourSteps.length - 1 ? "Finish" : "Next"}
                    </button>
                </div>
                <div className="text-center text-sm text-gray-500 mt-4">
                    Step {tourStep + 1} of {tourSteps.length}
                </div>
            </motion.div>
        </motion.div>
    );

    return (
        <div className="bg-gradient-to-br from-violet-50 to-red-50 min-h-screen px-4 py-6 font-sans relative">
            <header className="flex flex-col sm:flex-row justify-between items-center mb-8 px-2">
                <h1 className="text-3xl font-extrabold text-violet-900 mb-4 sm:mb-0">
                    🌍 Global Mental Health Dashboard
                </h1>
                <div className="flex gap-3">
                    <button
                        onClick={resetSelection}
                        className="p-2 rounded-full bg-violet-100 text-violet-600 hover:bg-violet-200 transition-colors flex items-center justify-center shadow-md"
                        title="Reset Country Selection"
                    >
                        <FiRefreshCw size={20} />
                    </button>
                    <button
                        onClick={startTour}
                        className="p-2 rounded-full bg-violet-100 text-violet-600 hover:bg-violet-200 transition-colors flex items-center justify-center shadow-md"
                        title="Start Tour"
                    >
                        <FiPlay size={20} />
                    </button>
                    <button
                        onClick={() => setShowInfo(true)}
                        className="p-2 rounded-full bg-violet-100 text-violet-600 hover:bg-violet-200 transition-colors flex items-center justify-center shadow-md"
                        title="Information"
                    >
                        <FiInfo size={20} />
                    </button>
                </div>
            </header>

            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                >
                    <nav className="mb-8 flex justify-center bg-violet-100 rounded-full p-1 shadow-inner">
                        <button
                            onClick={() => setActiveTab("map")}
                            className={`px-6 py-2 rounded-full text-lg font-medium transition-all duration-300 ${activeTab === "map" ? "bg-violet-600 text-white shadow-md" : "text-violet-700 hover:text-violet-900"}`}
                        >
                            <FiGlobe className="inline-block mr-2" /> Map View
                        </button>
                        <button
                            onClick={() => setActiveTab("comparison")}
                            className={`px-6 py-2 rounded-full text-lg font-medium transition-all duration-300 ${activeTab === "comparison" ? "bg-violet-600 text-white shadow-md" : "text-violet-700 hover:text-violet-900"}`}
                        >
                            <FiBarChart2 className="inline-block mr-2" /> Comparison View
                        </button>
                    </nav>

                    {activeTab === "map" && (
                        <div className="bg-white p-6 rounded-2xl shadow-xl border border-violet-200">
                            <h2 className="text-2xl font-bold text-violet-800 mb-4 flex items-center">
                                Mental Health Ratings by Country
                                {isLoading && <span className="ml-3 text-gray-500 text-sm animate-pulse">Loading data...</span>}
                            </h2>
                            <div className="relative mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 text-sm flex items-center">
                                <FiHeart className="mr-2 text-blue-600" />
                                <span className="italic">{mentalHealthFact}</span>
                            </div>
                            <div className="flex justify-center items-center h-[500px] w-full overflow-hidden">
                                <svg width={width} height={height}>
                                    <g className="countries">
                                        {geoCountries.map((d) => (
                                            <path
                                                key={d.id}
                                                d={pathGenerator(d)}
                                                fill={data.find((c) => c.id === d.id) ? colorScale(getRating(d.properties.name)) : "#ccc"}
                                                stroke="#FFFFFF"
                                                strokeWidth="0.5"
                                                onMouseEnter={(event) => {
                                                    const rating = getRating(d.properties.name);
                                                    setTooltip({
                                                        visible: true,
                                                        x: event.clientX + 10, // Changed from event.pageX to event.clientX
                                                        y: event.clientY + 10, // Changed from event.pageY to event.clientY
                                                        content: `
                                                            <div class="font-bold text-base">${d.properties.name}</div>
                                                            <div class="text-xs">Rating: ${rating} ${rating !== "N/A" ? "/ 5" : ""}</div>
                                                        `
                                                    });
                                                }}
                                                onMouseLeave={() => setTooltip({ ...tooltip, visible: false })}
                                            />
                                        ))}
                                    </g>
                                </svg>
                            </div>
                            <div className="flex justify-center mt-4">
                                <div className="flex items-center space-x-2">
                                    <span className="text-gray-600 text-sm">Rating:</span>
                                    {d3.range(1, 6).map((d) => (
                                        <div key={d} className="flex items-center">
                                            <span
                                                className="w-4 h-4 rounded-full mr-1"
                                                style={{ backgroundColor: colorScale(d) }}
                                            ></span>
                                            <span className="text-gray-700 text-sm">{d}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "comparison" && (
                        <div className="space-y-8">
                            <div className="bg-gradient-to-r from-violet-100 to-red-100 p-6 rounded-2xl">
                                <h2 className="text-2xl font-bold text-violet-800 mb-4">Country Comparison</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    <div>
                                        <label htmlFor="countryA" className="block text-violet-700 text-sm font-bold mb-2">
                                            Select Country A:
                                        </label>
                                        <select
                                            id="countryA"
                                            value={countryA}
                                            onChange={(e) => setCountryA(e.target.value)}
                                            className="block w-full px-4 py-2 border border-violet-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-white text-violet-800"
                                        >
                                            {countriesDataList.map((country) => (
                                                <option key={country} value={country}>
                                                    {country}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label htmlFor="countryB" className="block text-violet-700 text-sm font-bold mb-2">
                                            Select Country B:
                                        </label>
                                        <select
                                            id="countryB"
                                            value={countryB}
                                            onChange={(e) => setCountryB(e.target.value)}
                                            className="block w-full px-4 py-2 border border-violet-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-white text-violet-800"
                                        >
                                            {countriesDataList.map((country) => (
                                                <option key={country} value={country}>
                                                    {country}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="flex flex-col md:flex-row gap-6">
                                    {countryA && (
                                        <div className="flex-1 bg-white p-4 rounded-xl shadow-md border border-violet-200">
                                            <h3 className="text-lg font-bold text-violet-800 mb-2">
                                                {countryA} Rating:{" "}
                                                <span className="text-red-600">
                                                    {getRating(countryA)}
                                                </span>
                                            </h3>
                                            {radarChartData.find(d => d.country === countryA) ? (
                                                <RadarChart
                                                    data={[radarChartData.find(d => d.country === countryA)]}
                                                    width={500} // Increased width
                                                    height={500} // Increased height
                                                    outerRadius={100} // Increased outerRadius
                                                    colorScale={radarChartColors}
                                                    axisDomains={axisDomains}
                                                />
                                            ) : (
                                                <p className="text-gray-500">No detailed data for {countryA}</p>
                                            )}
                                        </div>
                                    )}
                                    {countryB && (
                                        <div className="flex-1 bg-white p-4 rounded-xl shadow-md border border-violet-200">
                                            <h3 className="text-lg font-bold text-violet-800 mb-2">
                                                {countryB} Rating:{" "}
                                                <span className="text-blue-600">
                                                    {getRating(countryB)}
                                                </span>
                                            </h3>
                                            {radarChartData.find(d => d.country === countryB) ? (
                                                <RadarChart
                                                    data={[radarChartData.find(d => d.country === countryB)]}
                                                    width={500} // Increased width
                                                    height={500} // Increased height
                                                    outerRadius={100} // Increased outerRadius
                                                    colorScale={radarChartColors}
                                                    axisDomains={axisDomains}
                                                />
                                            ) : (
                                                <p className="text-gray-500">No detailed data for {countryB}</p>
                                            )}
                                        </div>
                                    )}
                                    {!countryA && !countryB && (
                                        <div className="flex-1 p-4 text-center text-gray-500 italic">
                                            Select two countries above to see a comparison.
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Combined Radar Chart for Comparison */}
                            {(countryA && countryB && radarChartData.length === 2) && (
                                <div className="bg-white p-6 rounded-2xl shadow-xl border border-violet-200">
                                    <h3 className="text-xl font-bold text-violet-900 mb-4">
                                        Combined Demographic Comparison
                                    </h3>
                                    <div className="flex justify-center">
                                        <RadarChart
                                            data={radarChartData}
                                            width={700} // Increased width
                                            height={700} // Increased height
                                            outerRadius={160} // Increased outerRadius
                                            colorScale={radarChartColors}
                                            axisDomains={axisDomains}
                                        />
                                    </div>
                                    <div className="flex justify-center gap-8 mt-4 text-sm font-medium">
                                        <span className="flex items-center">
                                            <span className="inline-block w-3 h-3 rounded-full mr-2" style={{ backgroundColor: radarChartColors(0) }}></span>
                                            {countryA}
                                        </span>
                                        <span className="flex items-center">
                                            <span className="inline-block w-3 h-3 rounded-full mr-2" style={{ backgroundColor: radarChartColors(1) }}></span>
                                            {countryB}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>

            <footer className="text-center text-violet-700 text-sm mt-8">
                <p>&copy; {new Date().getFullYear()} Global Mental Health Dashboard. All rights reserved.</p>
            </footer>

            {tooltip.visible && (
                <motion.div
                    className="absolute bg-gray-800 text-white text-xs px-3 py-2 rounded shadow-lg pointer-events-none z-50"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    // Fix applied here: Use clientX and clientY
                    style={{ left: tooltip.x, top: tooltip.y }} 
                >
                    <div dangerouslySetInnerHTML={{ __html: tooltip.content }} />
                </motion.div>
            )}

            {showInfo && <InfoModal />}
            {showTour && <TourModal />}
        </div>
    );
};

export default Map;