import React, { useEffect, useState } from "react";
import Plot from "react-plotly.js";
import Papa from "papaparse";

// Map numeric codes → occupation labels
const occupationMapping = {
  0.2: "Student",
  0.3: "House wife",
  0.5: "Others",
  0.65: "Business",
  0.8: "Corporate",
};

// Map numeric codes → work interest labels
const workInterestMapping = {
  0: "Yes",
  1: "No",
  0.5: "maybe",
};

const BubblePlot = () => {
  const [data, setData] = useState([]);
  const [yCategoryArray, setYCategoryArray] = useState([]);

  useEffect(() => {
    Papa.parse("data_trimmed.csv", {
      download: true,
      header: true,
      complete: (results) => {
        const countMap = new Map(); // key: sleep-occupation-workInterest → count
        const scoreMap = new Map(); // key: sleep-occupation-workInterest → total score
        const uniqueYLabels = new Set();

        // Step 1: Filter rows
        const filtered = results.data.filter((row, index) => {
          const occCode = parseFloat(row.occupation);
          const occupationLabel = occupationMapping[occCode];
          const workInterestCode = parseFloat(row.work_interest);
          const mappedInterest = mapWorkInterest(workInterestCode);

          return (
            occupationLabel &&
            mappedInterest &&
            !isNaN(parseFloat(row.sleep_hours)) &&
            !isNaN(parseFloat(row.score)) &&
            index % 100 === 0
          );
        });

        // Step 2: Count occurrences and accumulate scores
        filtered.forEach((row) => {
          const sleep = parseFloat(row.sleep_hours).toFixed(1);
          const occCode = parseFloat(row.occupation);
          const occupation = occupationMapping[occCode];
          const workInterestCode = parseFloat(row.work_interest);
          const workInterest = mapWorkInterest(workInterestCode);
          const score = parseFloat(row.score);

          const key = `${sleep}-${occupation}-${workInterest}`;
          countMap.set(key, (countMap.get(key) || 0) + 1);
          scoreMap.set(key, (scoreMap.get(key) || 0) + score);
        });

        // Step 3: Prepare bubble data
        const x = [];
        const y = [];
        const size = [];
        const color = [];
        const text = [];
        // const uniqueYLabels = new Set();

        countMap.forEach((count, key) => {
          const [sleep, occupation, workInterest] = key.split("-");
          const yLabel = `${occupation} | ${workInterest}`;
          uniqueYLabels.add(yLabel);

          const totalScore = scoreMap.get(key);
          const avgScore = totalScore / count;

          x.push(parseFloat(sleep));
          y.push(yLabel);
          size.push(count * 4);
          color.push(avgScore);
          text.push(
            `Sleep Hour: ${sleep}<br>Occupation: ${occupation}<br>Work Interest: ${workInterest}<br>Count: ${count}<br>Avg. Score: ${avgScore.toFixed(2)}`
          );
        });

        // Step 4: Create custom y-axis order
        const occupationOrder = [
          "Others",
          "Student",
          "Business",
          "Corporate",
          "House wife",
          
        ];

        const workInterestOrder = ["Yes", "No"];

        const yCategories = [];

        for (const occ of occupationOrder) {
          for (const wi of workInterestOrder) {
            const label = `${occ} | ${wi}`;
            if (uniqueYLabels.has(label)) {
              yCategories.push(label);
            }
          }
        }

        setData([
          {
            x,
            y,
            text,
            mode: "markers",
            type: "scatter",
            marker: {
              size,
              sizemode: "area",
              sizeref:
                size.length > 0
                  ? (2.0 * Math.max(...size)) / (100 ** 2)
                  : 1,
              sizemin: 4,
              color,
              colorscale: "RdYlGn",
              colorbar: {
                title: "Avg. Mental Health Score",
              },
            },
          },
        ]);

        setYCategoryArray(yCategories);
      },
    });
  }, []);

  // helper to handle mapping maybe → yes
  const mapWorkInterest = (workInterestCode) => {
    if (isNaN(workInterestCode)) return null;

    const label = workInterestMapping[workInterestCode];
    if (!label) return null;

    if (label === "maybe") return "Yes";
    return label;
  };

  return (
    <div className="flex flex-col items-center p-6 bg-white text-white min-h-screen">
      <h1 className="text-2xl font-bold mb-4">
        Occupation + Work Interest vs Sleep Hour – Bubble Plot
      </h1>
      <Plot
        data={data}
        layout={{
          title: {
            text: "Bubble Plot: Avg. Mental Health Score by Sleep Hour, Occupation & Work Interest",
            font: { color: "black" },
          },
          xaxis: {
            title: "Sleep Hours (2 to 12)",
            color: "black",
            tickmode: "linear",
            tick0: 1,
            dtick: 1,
            range: [2, 12],
          },
          yaxis: {
            title: "Occupation + Work Interest",
            type: "category",
            color: "black",
            categoryorder: "array",
            categoryarray: yCategoryArray,
            tickmode: "array",
            tickvals: yCategoryArray,
            tickfont: { size: 14 },
            automargin: true,
          },
          plot_bgcolor: "#ffffff",
          paper_bgcolor: "#ffffff",
          hovermode: "closest",
          showlegend: false,
          height: 700,
          width: 900,
        }}
      />
    </div>
  );
};

export default BubblePlot;
