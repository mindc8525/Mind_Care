import React, { useEffect, useState } from "react";
import Plot from "react-plotly.js";

const occupationMapping = {
  0.2: "Student",
  0.65: "Business",
  0.3: "House wife",
  0.8: "Corporate",
  0.5: "Others",
};

const BoxPlotChart = () => {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    fetch("http://localhost:5051/api/ratings")
      .then((res) => res.json())
      .then((rows) => {
        // Group scores by occupation AND gender
        const grouped = {};
        const genders = ["Male", "Female"]; // Assuming these are the string values in your 'gender' field

        rows.forEach((row) => {
          const occNum = parseFloat(row.occupation);
          const occupation = occupationMapping[occNum];
          const score = parseFloat(row.ratings);
          const gender = row.gender?.trim();

          if (
            !isNaN(occNum) &&
            !isNaN(score) &&
            occupation &&
            genders.includes(gender)
          ) {
            if (!grouped[occupation]) {
              grouped[occupation] = { Male: [], Female: [] };
            }
            grouped[occupation][gender].push(score);
          }
        });

        const occupations = Object.values(occupationMapping);
        const traces = [];
        let maleLegendShown = false;
        let femaleLegendShown = false;

        occupations.forEach((occ) => {
          // Male Trace (left side)
          traces.push({
            type: "violin",
            name: "Male",
            legendgroup: "Male",
            showlegend: !maleLegendShown,
            x: Array(grouped[occ]?.Male.length || 0).fill(occ),
            y: grouped[occ]?.Male || [],
            orientation: "v",
            points: false,
            box: { visible: true },
            meanline: { visible: true },
            side: "negative", // left half of split violin
            scalemode: "count",
            width: 0.6,
            line: { width: 1, color: "rgb(56, 118, 189)" },
            fillcolor: "rgba(56, 118, 189, 0.6)",
          });
          if (!maleLegendShown) maleLegendShown = true;

          // Female Trace (right side)
          traces.push({
            type: "violin",
            name: "Female",
            legendgroup: "Female",
            showlegend: !femaleLegendShown,
            x: Array(grouped[occ]?.Female.length || 0).fill(occ),
            y: grouped[occ]?.Female || [],
            orientation: "v",
            points: false,
            box: { visible: true },
            meanline: { visible: true },
            side: "positive", // right half of split violin
            scalemode: "count",
            width: 0.6,
            line: { width: 1, color: "rgb(230, 85, 13)" },
            fillcolor: "rgba(230, 85, 13, 0.6)",
          });
          if (!femaleLegendShown) femaleLegendShown = true;
        });

        setChartData(traces);
      })
      .catch((error) => {
        console.error("Failed to load data from backend:", error);
      });
  }, []);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 p-8">
      <div className="w-full max-w-5xl bg-white p-8 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Mental Health Score by Occupation and Gender
        </h2>

        {chartData ? (
          <Plot
            data={chartData}
            layout={{
              title: "Mental Health Ratings by Occupation and Gender",
              xaxis: { title: "Occupation" },
              yaxis: { title: "Score (0-10)", range: [0, 10] },
              violinmode: "group",
              margin: { t: 50, l: 50, r: 50, b: 100 },
              autosize: true,
              showlegend: true,
              legend: { x: 1.05, y: 1, xanchor: "left" },
            }}
            style={{ width: "100%", height: "600px" }}
            config={{ responsive: true }}
          />
        ) : (
          <div className="text-center text-gray-500">Loading chart...</div>
        )}
      </div>
    </div>
  );
};

export default BoxPlotChart;
