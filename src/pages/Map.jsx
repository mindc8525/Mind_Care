const countriesDataList = [
    "United States", "Poland", "Australia", "Canada", "United Kingdom",
    "South Africa", "Sweden", "New Zealand", "Netherlands", "India",
    "Belgium", "Ireland", "France", "Portugal", "Brazil", "Costa Rica",
    "Russia", "Germany", "Switzerland", "Finland", "Israel", "Italy",
    "Bosnia and Herzegovina", "Singapore", "Nigeria", "Croatia",
    "Thailand", "Denmark", "Mexico", "Greece", "Moldova", "Colombia",
    "Georgia", "Czech Republic", "Philippines"
];

import React, { useEffect, useState, useMemo, useRef, useCallback } from "react";
import * as d3 from "d3";
import { feature } from "topojson-client";
import { FiRefreshCw, FiInfo, FiGlobe, FiBarChart2, FiX, FiHeart, FiPlay, FiPause } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// Radar Chart Component
const RadarChart = ({ data, width, height, outerRadius, colorScale, valueDomain }) => {
    const svgRef = useRef();
    const margin = { top: 40, right: 40, bottom: 40, left: 40 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    useEffect(() => {
        if (!data || data.length === 0 || !data[0].axes || data[0].axes.length === 0) {
            d3.select(svgRef.current).selectAll("*").remove();
            return;
        }

        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove(); // Clear previous drawings

        const radialScale = d3.scaleLinear()
            .domain(valueDomain) // Use the dynamic value domain
            .range([0, outerRadius]);

        const allAxes = data[0].axes.map(d => d.axis);
        const angleSlice = Math.PI * 2 / allAxes.length;

        const radarLine = d3.lineRadial()
            .curve(d3.curveLinearClosed) // Changed to straight line
            .radius(d => radialScale(d.value))
            .angle((d, i) => i * angleSlice);

        const g = svg.append("g")
            .attr("transform", `translate(${width / 2},${height / 2})`);

        // Draw grid circles
        const numCircles = 5;
        const tickFormat = d3.format(".1f");

        g.selectAll(".grid-circle")
            .data(d3.range(1, numCircles + 1).map(i => i * outerRadius / numCircles))
            .join("circle")
            .attr("class", "grid-circle")
            .attr("r", d => d)
            .style("fill", "#CDCDCD")
            .style("stroke", "#CDCDCD")
            .style("fill-opacity", 0.1)
            .style("stroke-width", 0.5);

        // Draw grid labels
        g.selectAll(".grid-label")
            .data(d3.range(1, numCircles + 1).map(i => i * valueDomain[1] / numCircles))
            .join("text")
            .attr("class", "grid-label")
            .attr("x", 4)
            .attr("y", d => -radialScale(d))
            .attr("dy", "0.4em")
            .style("font-size", "10px")
            .attr("fill", "#737373")
            .text(d => tickFormat(d));

        // Draw axes
        const axis = g.selectAll(".axis")
            .data(allAxes)
            .join("g")
            .attr("class", "axis");

        axis.append("line")
            .attr("x1", 0)
            .attr("y1", 0)
            .attr("x2", (d, i) => radialScale(valueDomain[1]) * Math.cos(angleSlice * i - Math.PI / 2))
            .attr("y2", (d, i) => radialScale(valueDomain[1]) * Math.sin(angleSlice * i - Math.PI / 2))
            .attr("stroke", "#CDCDCD")
            .attr("stroke-width", 1);

        axis.append("text")
            .attr("class", "legend")
            .style("font-size", "12px")
            .attr("text-anchor", "middle")
            .attr("dy", "0.35em")
            .attr("x", (d, i) => radialScale(valueDomain[1] * 1.1) * Math.cos(angleSlice * i - Math.PI / 2))
            .attr("y", (d, i) => radialScale(valueDomain[1] * 1.1) * Math.sin(angleSlice * i - Math.PI / 2))
            .text(d => d)
            .attr("fill", "#333");

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
                // Show tooltip or highlight country
            })
            .on("mouseout", function() {
                d3.select(this).attr("fill-opacity", 0.1);
                // Hide tooltip
            });

        // Draw circles for points
        data.forEach((d, i) => {
            g.selectAll(`.radarCircle-${i}`)
                .data(d.axes)
                .join("circle")
                .attr("class", `radarCircle-${i}`)
                .attr("r", 5)
                .attr("cx", (p, j) => radialScale(p.value) * Math.cos(angleSlice * j - Math.PI / 2))
                .attr("cy", (p, j) => radialScale(p.value) * Math.sin(angleSlice * j - Math.PI / 2))
                .attr("fill", colorScale(i))
                .attr("fill-opacity", 0.8);
        });

    }, [data, width, height, outerRadius, colorScale, valueDomain]);

    return <svg ref={svgRef} width={width} height={height}></svg>;
};


const Map = () => {
    const [data, setData] = useState([]); // This will hold processed CSV data
    const [geoCountries, setGeoCountries] = useState([]); // This will hold TopoJSON geo features
    const [countryA, setCountryA] = useState("");
    const [countryB, setCountryB] = useState("");
    const [nameToId, setNameToId] = useState({});
    const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, content: "" });
    const [rawRows, setRawRows] = useState([]); // This will hold raw CSV data
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("map");
    const [showInfo, setShowInfo] = useState(false);
    const [currentFactIndex, setCurrentFactIndex] = useState(0);
    const [tourStep, setTourStep] = useState(0);
    const [showTour, setShowTour] = useState(false);
    const [year, setYear] = useState(2023);
    const [isPlaying, setIsPlaying] = useState(false);
    const playTimerRef = useRef(null);
    const [hoveredCountry, setHoveredCountry] = useState(null); // Added for better tooltip handling

    const mentalHealthFacts = [
        "1 in 4 people worldwide will be affected by mental disorders at some point in their lives",
        "Depression is the leading cause of disability worldwide",
        "Mental health conditions cost the global economy $1 trillion per year in lost productivity",
        "Suicide is the 4th leading cause of death among 15-29 year-olds globally",
        "People with severe mental disorders die 10-20 years earlier than the general population",
        "Only 2% of health budgets globally are allocated to mental health care",
        "Anxiety disorders affect 284 million people worldwide",
        "Women are nearly twice as likely as men to be diagnosed with depression",
        "75% of mental disorders begin before the age of 24",
        "Mental health conditions can increase the risk of physical health problems"
    ];

    const tourSteps = [
        {
            title: "Welcome to the Mental Health Dashboard",
            content: "This interactive visualization helps you explore global mental health trends. Let's take a quick tour!",
            position: "center"
        },
        {
            title: "World Map View",
            content: "This heatmap shows mental health ratings worldwide. Yellow indicates lower ratings, orange medium, and red higher ratings.",
            position: "top"
        },
        {
            title: "Country Comparison",
            content: "Select two countries to compare their mental health ratings across demographics",
            position: "top"
        },
        {
            title: "Demographic Insights",
            content: "This radar chart breaks down ratings by gender, occupation, and family history",
            position: "bottom"
        },
        {
            title: "Explore Mental Health Facts",
            content: "Discover important statistics and resources about mental health",
            position: "right"
        }
    ];

    useEffect(() => {
        const factTimer = setInterval(() => {
            setCurrentFactIndex((prev) => (prev + 1) % mentalHealthFacts.length);
        }, 8000);

        return () => clearInterval(factTimer);
    }, []);

    useEffect(() => {
        if (isPlaying) {
            playTimerRef.current = setInterval(() => {
                setYear(prev => {
                    const nextYear = prev + 1;
                    if (nextYear > 2023) {
                        setIsPlaying(false);
                        return 2023;
                    }
                    return nextYear;
                });
            }, 1500);
        }

        return () => {
            if (playTimerRef.current) {
                clearInterval(playTimerRef.current);
            }
        };
    }, [isPlaying]);

    // Keep OCC_MAP and FH_MAP if they are still relevant for other parts or for future expansion
    const OCC_MAP = {
        "0.2": "Student",
        "0.3": "Housecaretaker",
        "0.5": "Others",
        "0.65": "Business",
        "0.8": "Corporate",
    };

    const FH_MAP = {
        "0": "No",
        "0.5": "Maybe",
        "1": "Yes",
    };

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);

            try {
                // Load geography data
                const topoRes = await fetch(geoUrl);
                const topoJson = await topoRes.json();
                const geoData = feature(topoJson, topoJson.objects.countries).features;

                // Set all geographic countries from TopoJSON
                setGeoCountries(geoData);

                const mapping = {};
                geoData.forEach((d) => {
                    const name = d.properties.name;
                    const id = d.id?.toString().padStart(3, "0");
                    if (name && id) mapping[name] = id;
                });
                setNameToId(mapping);

                // Load CSV data
                const rows = await d3.csv("data_trimmed.csv", d3.autoType);

                // --- START Fix for United States (and other potential name mismatches) ---
                const countryNameCorrections = {
                    "United States of America": "United States",
                    "USA": "United States",
                    // Add any other specific corrections if your CSV uses different names
                    // e.g., "Korea, South": "South Korea",
                    // "Democratic Republic of the Congo": "Dem. Rep. Congo"
                };

                const processedRows = rows.map(d => ({
                    ...d,
                    country: countryNameCorrections[d.country] || d.country // Apply correction
                }));
                // --- END Fix for United States ---

                // Filter processed CSV rows by countriesDataList.
                // Countries not in countriesDataList will implicitly get "N/A" ratings on the map.
                const filteredRows = processedRows.filter(d => countriesDataList.includes(d.country));
                setRawRows(filteredRows); // This is used by the radar chart for specific country data

                const grouped = d3.groups(filteredRows, (d) => d.country);
                const averaged = grouped.map(([country, records]) => {
                    const scores = records.map((r) => +r.ratings).filter((s) => !isNaN(s));
                    const avg = d3.mean(scores);
                    const id = mapping[country];
                    // If no ID from geoData mapping OR average is NaN, return null.
                    if (!id || isNaN(avg)) return null;
                    return { id, country, rating: +avg.toFixed(2) };
                });
                setData(averaged.filter((d) => d !== null)); // setData will only contain countries with valid data and geo IDs
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

    // Fixed color scale from yellow to red
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

        // Define the new axes for the radar chart
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

            // Calculate values for each new axis
            // 1. % people that have caretaker options
            const caretakerYes = countryRecords.filter(r => r.care_options === 0).length; // 0 means yes
            const percentCaretaker = countryRecords.length > 0 ? (caretakerYes / countryRecords.length) * 100 : 0;
            axes.push({ axis: "% Caretaker Options", value: percentCaretaker });

            // 2. Average of outdoor days
            // Normalize days_indoor values to a 0-1 scale for 'outdoor-ness', then map to a higher range if needed.
            // Let's assume 0 days_indoor (goes out every day) is best, 1 (more than 2 months indoor) is worst.
            // We can invert this to get an "outdoor score".
            const outdoorDayScores = countryRecords.map(r => {
                switch (r.days_indoors) {
                    case 0: return 100; // Goes out every day - max outdoor score
                    case 0.25: return 75; // 1-14 days indoor
                    case 0.5: return 50; // 15-30 days indoor
                    case 0.75: return 25; // 31-60 days indoor
                    case 1: return 0; // more than 2 months indoor - min outdoor score
                    default: return 0;
                }
            }).filter(v => !isNaN(v));
            const avgOutdoorDays = outdoorDayScores.length > 0 ? d3.mean(outdoorDayScores) : 0;
            axes.push({ axis: "Avg Outdoor Days", value: avgOutdoorDays });


            // 3. Average sleep hour
            const sleepHours = countryRecords.map(r => +r.sleep_hours).filter(s => !isNaN(s));
            const avgSleepHours = sleepHours.length > 0 ? d3.mean(sleepHours) : 0;
            axes.push({ axis: "Avg Sleep Hours", value: avgSleepHours });

            // 4. Average social media hour
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

        // Ensure all countries have the same set of axes, even if some values are 0
        if (spiderData.length > 0) { // Changed condition to > 0 as we might only have one country selected
            spiderData.forEach(countryData => {
                const existingAxes = new Set(countryData.axes.map(a => a.axis));
                for (const axisName of newAxes) { // Iterate over the defined newAxes
                    if (!existingAxes.has(axisName)) {
                        countryData.axes.push({ axis: axisName, value: 0 }); // Add missing axes with value 0
                    }
                }
                countryData.axes.sort((a, b) => newAxes.indexOf(a.axis) - newAxes.indexOf(b.axis)); // Sort by the defined order
            });
        }

        return spiderData;
    }, [countryA, countryB, rawRows]);


    const radarChartData = prepareSpiderData();

    // Determine the domain for the radar chart values
    const radarValueDomain = useMemo(() => {
        const allValues = radarChartData.flatMap(d => d.axes.map(a => a.value));
        if (allValues.length === 0) return [0, 100]; // Default domain, suitable for percentages
        // Set a ceiling for the domain, considering max possible values for hours/percentages
        const maxVal = d3.max(allValues);
        // If maxVal is less than 1 (e.g. only averages of 0-1 scale), ensure the domain isn't too small.
        // Assuming percentages (0-100) are the largest values.
        return [0, Math.max(100, maxVal + (maxVal * 0.1) || 100)]; // Add a little padding to the max
    }, [radarChartData]);

    const radarChartColors = useMemo(() => d3.scaleOrdinal(d3.schemeCategory10), []);


    const resetSelection = () => {
        setCountryA("");
        setCountryB("");
    };

    const startTour = () => {
        setShowTour(true);
        setTourStep(0);
    };

    const nextTourStep = () => {
        if (tourStep < tourSteps.length - 1) {
            setTourStep(tourStep + 1);
        } else {
            setShowTour(false);
        }
    };

    const prevTourStep = () => {
        if (tourStep > 0) {
            setTourStep(tourStep - 1);
        }
    };

    const togglePlay = () => {
        setIsPlaying(!isPlaying);
    };

    const InfoModal = () => (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full p-6 relative max-h-[90vh] overflow-y-auto">
                <button
                    onClick={() => setShowInfo(false)}
                    className="absolute top-4 right-4 text-violet-700 hover:text-violet-900"
                >
                    <FiX size={24} />
                </button>

                <h2 className="text-2xl font-bold text-violet-800 mb-4 flex items-center">
                    <FiInfo className="mr-2" /> About This Visualization
                </h2>

                <div className="space-y-4 text-gray-700">
                    <p>
                        This interactive dashboard visualizes mental health ratings across different countries
                        and demographic groups. The data is sourced from a global survey of mental health indicators.
                    </p>

                    <h3 className="font-semibold text-lg text-violet-700">Features:</h3>
                    <ul className="list-disc pl-6 space-y-2">
                        <li><span className="font-medium">World Map:</span> Heatmap showing average mental health ratings per country</li>
                        <li><span className="font-medium">Country Comparison:</span> Select two countries to compare their ratings</li>
                        <li><span className="font-medium">Demographic Analysis:</span> Radar chart breakdown by several key indicators.</li>
                        <li><span className="font-medium">Data Storytelling:</span> Interactive tour and timeline visualization</li>
                    </ul>

                    <h3 className="font-semibold text-lg text-violet-700">Data Interpretation:</h3>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>Higher ratings (darker red) indicate better mental health outcomes</li>
                        <li>Lower ratings (yellow/orange) indicate areas needing more mental health support</li>
                        <li>Radar chart shows relative strengths/weaknesses across the selected features.</li>
                    </ul>
                </div>
            </div>
        </div>
    );

    const TourModal = () => (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full p-6 relative">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-violet-600 to-red-500 rounded-t-xl"></div>

                <div className="text-center mb-6">
                    <div className="text-sm text-violet-700 mb-2">Step {tourStep + 1} of {tourSteps.length}</div>
                    <h2 className="text-2xl font-bold text-violet-800">{tourSteps[tourStep].title}</h2>
                </div>

                <div className="text-gray-700 mb-8 text-center">
                    {tourSteps[tourStep].content}
                </div>

                <div className="flex justify-between">
                    <button
                        onClick={prevTourStep}
                        disabled={tourStep === 0}
                        className={`px-4 py-2 rounded-lg ${
                            tourStep === 0
                                ? "bg-gray-200 text-gray-500"
                                : "bg-violet-100 hover:bg-violet-200 text-violet-700"
                        }`}
                    >
                        Previous
                    </button>

                    <button
                        onClick={nextTourStep}
                        className="px-4 py-2 bg-violet-700 hover:bg-violet-800 text-white rounded-lg"
                    >
                        {tourStep === tourSteps.length - 1 ? "Finish Tour" : "Next"}
                    </button>
                </div>
            </div>
        </div>
    );

    if (isLoading) {
        return (
            <div className="fixed inset-0 bg-violet-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-violet-700 mx-auto"></div>
                    <p className="mt-4 text-lg text-violet-800 font-medium">Loading world data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-br from-violet-50 to-red-50 min-h-screen px-4 py-6 font-sans relative">
            <div className="max-w-7xl mx-auto">
                <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-violet-900 flex items-center">
                            <FiHeart className="mr-3 text-red-600" />
                            Global Mental Health Dashboard
                        </h1>
                        <p className="text-violet-700 mt-2">
                            Interactive visualization of mental health ratings worldwide
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={startTour}
                            className="flex items-center bg-violet-700 hover:bg-violet-800 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                            <FiPlay className="mr-2" /> Take Tour
                        </button>
                        <button
                            onClick={() => setShowInfo(true)}
                            className="flex items-center bg-violet-100 hover:bg-violet-200 text-violet-700 px-4 py-2 rounded-lg transition-colors"
                        >
                            <FiInfo className="mr-2" /> About
                        </button>
                    </div>
                </header>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8"
                    >
                        <div className="flex border-b">
                            <button
                                className={`flex-1 py-4 font-medium flex items-center justify-center gap-2 ${
                                    activeTab === "map"
                                        ? "text-violet-800 border-b-2 border-violet-800"
                                        : "text-gray-500 hover:text-violet-700"
                                }`}
                                onClick={() => setActiveTab("map")}
                            >
                                <FiGlobe /> World Map
                            </button>
                            <button
                                className={`flex-1 py-4 font-medium flex items-center justify-center gap-2 ${
                                    activeTab === "comparison"
                                        ? "text-violet-800 border-b-2 border-violet-800"
                                        : "text-gray-500 hover:text-violet-700"
                                }`}
                                onClick={() => setActiveTab("comparison")}
                            >
                                <FiBarChart2 /> Country Comparison
                            </button>
                        </div>

                        <div className="p-4 md:p-6">
                            {activeTab === "map" && (
                                <div className="flex flex-col lg:flex-row gap-6">
                                    <div className="lg:w-2/3">
                                        <div className="bg-violet-50 rounded-xl p-4 mb-6">
                                            <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
                                                <h2 className="text-xl font-bold text-violet-900">
                                                    🌍 Mental Health Rating Heatmap
                                                </h2>

                                                <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full border border-violet-200">
                                                    <span className="text-violet-800 text-sm">Timeline:</span>
                                                    <input
                                                        type="range"
                                                        min="2018"
                                                        max="2023"
                                                        value={year}
                                                        onChange={(e) => setYear(parseInt(e.target.value))}
                                                        className="w-32 accent-violet-700"
                                                    />
                                                    <span className="text-violet-800 font-medium w-12">{year}</span>
                                                    <button
                                                        onClick={togglePlay}
                                                        className="text-violet-700 hover:text-violet-900"
                                                    >
                                                        {isPlaying ? <FiPause /> : <FiPlay />}
                                                    </button>
                                                </div>
                                            </div>

                                            <p className="text-violet-800 mb-4">
                                                Color intensity represents average mental health rating (yellow = low, orange = medium, red = high)
                                            </p>

                                            <div className="bg-black rounded-xl shadow-inner mb-6 overflow-auto">
                                                <svg
                                                    width={width}
                                                    height={height}
                                                    onMouseMove={(e) => {
                                                        const rect = e.target.getBoundingClientRect();
                                                        setTooltip({
                                                            visible: hoveredCountry !== null,
                                                            x: e.clientX + 10,
                                                            y: e.clientY + 10,
                                                            content: hoveredCountry
                                                                ? `${hoveredCountry.name}: ${hoveredCountry.rating?.toFixed(2) ?? "N/A"}`
                                                                : ""
                                                        });
                                                    }}
                                                    onMouseLeave={() => {
                                                        setTooltip({ visible: false, x: 0, y: 0, content: "" });
                                                        setHoveredCountry(null);
                                                    }}
                                                >
                                                    {geoCountries.map((country) => {
                                                        const id = country.id?.toString().padStart(3, "0");
                                                        if (!id) return null;
                                                        const name = country.properties.name;
                                                        const datum = data.find((d) => d.country === name);
                                                        const rating = datum?.rating;
                                                        // Set fill to white if no rating is available
                                                        const fill = rating ? colorScale(rating) : "#FFFFFF";

                                                        return (
                                                            <motion.path
                                                                key={id}
                                                                d={pathGenerator(country)}
                                                                fill={fill}
                                                                stroke="#fff"
                                                                strokeWidth={0.5}
                                                                style={{ cursor: "pointer" }}
                                                                onMouseEnter={() => {
                                                                    setHoveredCountry({ name, rating });
                                                                    setTooltip({
                                                                        visible: true,
                                                                        x: tooltip.x, // These will be updated by onMouseMove
                                                                        y: tooltip.y, // These will be updated by onMouseMove
                                                                        content: `${name}: ${rating?.toFixed(2) ?? "N/A"}`
                                                                    });
                                                                }}
                                                                onMouseLeave={() => setHoveredCountry(null)}
                                                                whileHover={{ strokeWidth: 1.5, stroke: "#ff1a5e" }}
                                                            />
                                                        );
                                                    })}
                                                </svg>
                                            </div>

                                            {hoveredCountry && (
                                                <p className="text-center text-sm text-gray-600">
                                                    Hovering over: <span className="font-semibold">{hoveredCountry.name}</span>, Rating: <span className="font-semibold">{hoveredCountry.rating?.toFixed(2) ?? "N/A"}</span>
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="lg:w-1/3 space-y-6">
                                        <div className="bg-violet-50 rounded-xl p-4">
                                            <h3 className="text-lg font-bold text-violet-900 mb-3 flex items-center">
                                                💡 Mental Health Fact
                                            </h3>
                                            <p className="text-violet-800 text-md transition-opacity duration-700 ease-in-out">
                                                {mentalHealthFacts[currentFactIndex]}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === "comparison" && (
                                <div className="flex flex-col lg:flex-row gap-6">
                                    <div className="lg:w-1/2 bg-violet-50 rounded-xl p-4">
                                        <h2 className="text-xl font-bold text-violet-900 mb-4">
                                            📊 Compare Countries by Demographics
                                        </h2>
                                        <div className="mb-4 space-y-3">
                                            <div>
                                                <label htmlFor="countryA" className="block text-violet-700 text-sm font-medium mb-1">
                                                    Select Country A:
                                                </label>
                                                <select
                                                    id="countryA"
                                                    value={countryA}
                                                    onChange={(e) => setCountryA(e.target.value)}
                                                    className="w-full p-2 border border-violet-300 rounded-md bg-white text-violet-900 focus:ring-violet-500 focus:border-violet-500"
                                                >
                                                    <option value="">-- Select --</option>
                                                    {countriesDataList.map((country) => (
                                                        <option key={country} value={country}>
                                                            {country}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label htmlFor="countryB" className="block text-violet-700 text-sm font-medium mb-1">
                                                    Select Country B:
                                                </label>
                                                <select
                                                    id="countryB"
                                                    value={countryB}
                                                    onChange={(e) => setCountryB(e.target.value)}
                                                    className="w-full p-2 border border-violet-300 rounded-md bg-white text-violet-900 focus:ring-violet-500 focus:border-violet-500"
                                                >
                                                    <option value="">-- Select --</option>
                                                    {countriesDataList.map((country) => (
                                                        <option key={country} value={country}>
                                                            {country}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <button
                                                onClick={resetSelection}
                                                className="w-full bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                                            >
                                                <FiRefreshCw size={18} /> Reset Selection
                                            </button>
                                        </div>
                                    </div>
                                    <div className="lg:w-1/2 bg-white rounded-xl p-4 shadow-md flex flex-col items-center justify-center">
                                        {radarChartData.length > 0 ? (
                                            <RadarChart
                                                data={radarChartData}
                                                width={400}
                                                height={400}
                                                outerRadius={150}
                                                colorScale={radarChartColors}
                                                valueDomain={radarValueDomain}
                                            />
                                        ) : (
                                            <p className="text-gray-500 text-center">
                                                Select one or two countries to compare their demographic mental health patterns.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {(countryA || countryB) && activeTab === "comparison" && radarChartData.length > 0 && (
                                <div className="mt-6 p-4 bg-white rounded-xl shadow-md">
                                    <h3 className="text-xl font-bold text-violet-900 mb-3">Comparison Legend</h3>
                                    {countryA && (
                                        <div className="flex items-center text-gray-700 text-lg mb-2">
                                            <span className="flex items-center">
                                                <span className="inline-block w-3 h-3 rounded-full mr-2" style={{ backgroundColor: radarChartColors(0) }}></span>
                                                {countryA}
                                            </span>
                                        </div>
                                    )}
                                    {countryB && (
                                        <div className="flex items-center text-gray-700 text-lg">
                                            <span className="flex items-center">
                                                <span className="inline-block w-3 h-3 rounded-full mr-2" style={{ backgroundColor: radarChartColors(1) }}></span>
                                                {countryB}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </AnimatePresence>

                <footer className="text-center text-violet-700 text-sm mt-8">
                    <p>&copy; {new Date().getFullYear()} Global Mental Health Dashboard. All rights reserved.</p>
                </footer>
            </div>

            {tooltip.visible && (
                <motion.div
                    className="absolute bg-gray-800 text-white text-xs px-3 py-2 rounded shadow-lg pointer-events-none z-50"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{ left: tooltip.x, top: tooltip.y }}
                >
                    {tooltip.content}
                </motion.div>
            )}

            {showInfo && <InfoModal />}
            {showTour && <TourModal />}
        </div>
    );
};

export default Map;