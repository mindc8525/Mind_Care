import React from "react";

const ParallelPlot = () => {
  return (
    <div style={{ padding: "1rem" }}>
      <iframe
        src="http://localhost:8050"
        width="100%"
        height="1000"
        style={{ border: "none", borderRadius: "10px" }}
        title="Dash Parallel Plot"
      />
    </div>
  );
};

export default ParallelPlot;
