import React, { useEffect, useState } from "react";
import Plot from "react-plotly.js";
import Papa from "papaparse";

const MentalHealthDashboard = () => {
  const [data, setData] = useState([]);
  const [incomeRange, setIncomeRange] = useState([0, 80000]);
  const [minIncome, setMinIncome] = useState(0);
  const [maxIncome, setMaxIncome] = useState(80000);

  useEffect(() => {
    Papa.parse("/data_trimmed.csv", {
      download: true,
      header: true,
      complete: (results) => {
        const parsed = results.data.filter(
          (row) =>
            !isNaN(parseFloat(row.income)) &&
            !isNaN(parseFloat(row.ratings)) &&
            parseFloat(row.income) >= 0 &&
            parseFloat(row.ratings) >= 0 &&
            parseFloat(row.ratings) <= 5
        );
        setData(parsed);

        const incomes = parsed.map((row) => parseFloat(row.income));
        const minVal = Math.min(...incomes);
        const maxVal = Math.max(...incomes);
        setMinIncome(minVal);
        setMaxIncome(maxVal);
        setIncomeRange([minVal, maxVal]);
      },
    });
  }, []);

  const bucketAge = (age) => {
    const a = parseInt(age);
    return `${Math.floor(a / 5) * 5}-${Math.floor(a / 5) * 5 + 4}`;
  };

  const processKey = (key, val) => {
    if (key === "age") {
      return bucketAge(val);
    }
    return val;
  };

  const filterAndGroupAvg = (key) => {
    const grouped = {};
    const count = {};
    data.forEach((row) => {
      const income = parseFloat(row.income);
      const rating = parseFloat(row.ratings);
      const val = processKey(key, row[key]);

      if (
        income >= incomeRange[0] &&
        income <= incomeRange[1] &&
        val !== "" &&
        !isNaN(rating)
      ) {
        if (!grouped[val]) {
          grouped[val] = 0;
          count[val] = 0;
        }
        grouped[val] += rating;
        count[val] += 1;
      }
    });

    const keys = Object.keys(grouped).sort();
    const x = keys.map((k) => (count[k] ? grouped[k] / count[k] : 0));
    const y = keys;
    return { x, y };
  };

  const renderBarChart = (title, yKey, yLabel) => {
    const { x, y } = filterAndGroupAvg(yKey);
    return (
      <Plot
        data={[
          {
            x,
            y,
            type: "bar",
            orientation: "h",
            marker: {
              color: "#3b82f6",
            },
          },
        ]}
        layout={{
          title: { text: title, font: { size: 16 } },
          xaxis: {
            title: "Average Mental Health Rating",
            range: [0, 5],
            titlefont: { size: 12 },
          },
          yaxis: {
            title: yLabel,
            automargin: true,
            titlefont: { size: 12 },
          },
          height: 350,
          margin: { l: 100, r: 40, t: 40, b: 40 },
        }}
        config={{ responsive: true }}
        style={{ width: "100%" }}
      />
    );
  };

  return (
    <div className="flex flex-col items-center p-8 space-y-10 bg-gray-100 text-gray-900 min-h-screen">
      <div className="w-full max-w-7xl bg-white shadow-lg rounded-xl p-6">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Mental Health Ratings by Factors (Filtered by Income)
        </h2>

        {/* Income Range Slider */}
        <div className="w-full mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Income Range: {Math.round(incomeRange[0])} –{" "}
            {Math.round(incomeRange[1])}
          </label>
          <div className="space-y-1">
            <input
              type="range"
              min={minIncome}
              max={maxIncome}
              step={100}
              value={incomeRange[0]}
              onChange={(e) =>
                setIncomeRange([+e.target.value, incomeRange[1]])
              }
              className="w-full accent-purple-700"
            />
            <input
              type="range"
              min={minIncome}
              max={maxIncome}
              step={100}
              value={incomeRange[1]}
              onChange={(e) =>
                setIncomeRange([incomeRange[0], +e.target.value])
              }
              className="w-full accent-purple-700"
            />
          </div>
        </div>

        {/* Grid of Plots */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {renderBarChart("Rating by Sleep Hours", "sleep_hours", "Sleep Hours")}
          {renderBarChart(
            "Rating by Age Group",
            "age",
            "Age Group (5-year bins)"
          )}
        </div>
      </div>
    </div>
  );
};

export default MentalHealthDashboard;
