import React, { useEffect, useState } from "react";
import Plot from "react-plotly.js";
import Papa from "papaparse";

const MentalHealth3DPlot = () => {
  const [plotData, setPlotData] = useState([]);

  useEffect(() => {
    Papa.parse("/data_trimmed.csv", {
      download: true,
      header: true,
      complete: (results) => {
        const raw = results.data;

        const ratingMap = new Map();

        // Define the mapping from numeric to string for days_indoors
        const daysIndoorsMap = {
          0: "Goes out every day",
          0.25: "1-14 days",
          0.5: "15-30 days",
          0.75: "31-60 days",
          1: "more than 2 months",
        };

        raw.forEach((row) => {
          const sleep = parseFloat(row.sleep_hours);
          const social = parseInt(row.social_media_usage);
          const ratings = parseFloat(row.ratings);
          const daysIndoorsNumeric = parseFloat(row.days_indoors); // Read as numeric

          if (
            !isNaN(sleep) &&
            !isNaN(social) &&
            !isNaN(ratings) &&
            daysIndoorsMap[daysIndoorsNumeric] !== undefined && // Ensure it's a valid mapped value
            sleep >= 2 &&
            sleep <= 12 &&
            social >= 1 &&
            social <= 9 &&
            ratings >= 0 &&
            ratings <= 5
          ) {
            const key = `${sleep}-${social}-${daysIndoorsNumeric}`;
            if (!ratingMap.has(key)) {
              ratingMap.set(key, []);
            }
            ratingMap.get(key).push(ratings);
          }
        });

        const x = [];
        const y = [];
        const z = [];
        const color = [];
        const size = [];
        const text = [];

        ratingMap.forEach((ratingsArray, key) => {
          const [sleep, social, daysIndoorsNumeric] = key.split("-").map(Number);
          const count = ratingsArray.length;
          const avgRating =
            ratingsArray.reduce((sum, r) => sum + r, 0) / count;

          x.push(sleep);
          y.push(social);
          z.push(daysIndoorsNumeric); // Use the numeric value for Z positioning

          color.push(avgRating);

          const bubbleSize = Math.max(Math.log1p(count) * 3, 4);
          size.push(bubbleSize);

          // Get the original string for display in hover text
          const daysIndoorsText = daysIndoorsMap[daysIndoorsNumeric];

          text.push(
            `Sleep: ${sleep} hrs<br>Social: ${social} hrs<br>Days Indoors: ${daysIndoorsText}<br>Avg Rating: ${avgRating.toFixed(2)}<br>Count: ${count}`
          );
        });

        setPlotData([
          {
            x,
            y,
            z,
            text,
            mode: "markers",
            type: "scatter3d",
            marker: {
              size,
              sizemode: "diameter",
              color,
              cmin: 0,
              cmax: 5,
              colorscale: "YlOrRd",
              colorbar: {
                title: "Avg. Rating (0 = Best, 5 = Worst)",
                tickvals: [0, 1, 2, 3, 4, 5],
                ticktext: ["0", "1", "2", "3", "4", "5"],
                thickness: 14,
                len: 0.75,
              },
              opacity: 0.85,
            },
            hovertemplate: "%{text}<extra></extra>",
          },
        ]);
      },
    });
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-gray-50">
      <div className="bg-white shadow-xl rounded-xl p-6 w-full max-w-6xl">
        <h1 className="text-3xl font-semibold text-center mb-6">
          3D Bubble Plot: Sleep, Social Media & Mental Health
        </h1>
        <div className="flex justify-center">
          <Plot
            data={plotData}
            layout={{
              height: 700,
              width: 1000,
              paper_bgcolor: "#ffffff",
              plot_bgcolor: "#ffffff",
              font: {
                color: "#1f2937",
                family: "Segoe UI, sans-serif",
                size: 14,
              },
              scene: {
                xaxis: {
                  title: {
                    text: "Sleep Hours",
                    font: { size: 14, color: "#1f2937" },
                  },
                  range: [2, 12],
                  color: "#1f2937",
                },
                yaxis: {
                  title: {
                    text: "Social Media Usage (hrs)",
                    font: { size: 14, color: "#1f2937" },
                  },
                  range: [1, 9],
                  color: "#1f2937",
                },
                zaxis: {
                  title: {
                    text: "Days Indoors",
                    font: { size: 14, color: "#1f2937" },
                    standoff: 45,
                  },
                  range: [0, 1],
                  tickvals: [0, 0.25, 0.5, 0.75, 1],
                  ticktext: [
                    "Goes out every day",
                    "1-14 days",
                    "15-30 days",
                    "31-60 days",
                    "more than 2 months",
                  ],
                  color: "#1f2937",
                  automargin: true,
                  // --- NEW ADDITION BELOW ---
                  tickfont: {
                    size: 10, // Reduce the font size for the tick labels (e.g., from 12 to 10)
                  },
                  // --- NEW ADDITION ABOVE ---
                },
                camera: {
                  eye: { x: 1.6, y: 1.6, z: 1.2 },
                },
              },
              margin: { l: 80, r: 80, b: 80, t: 30 },
            }}
            config={{ responsive: true }}
          />
        </div>
      </div>
    </div>
  );
};

export default MentalHealth3DPlot;