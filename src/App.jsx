import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Predictor from "./pages/Predictor";
import Comparison from "./pages/Comparison";
import RiskFactors from "./pages/RiskFactors";
import Resources from "./pages/Resources";
import MainLayout from "./pages/Main_Layout";
import BoxPlotChart from "./pages/BoxPlotChart";
import BubblePlot from "./pages/BubblePlot";
import Map from "./pages/Comparison";
import MentalHealth3DPlot from "./pages/MentalHealth3DPlot";
import MentalHealthDashboard from "./pages/MentalHealthDashboard";
import ParallelPlot from "./pages/ParallelPlot";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Home Route */}
        <Route path="/" element={<Home />} />

        {/* Sidebar Layout Routes */}
        <Route element={<MainLayout />}> 
          <Route path="/predictor" element={<Predictor />} />
          <Route path="/country-comparison" element={<Map/>} />
          <Route path="/violin-plot" element={<BoxPlotChart />} />
          <Route path="/bubble-plot" element={<BubblePlot />} />
          <Route path="/3d-bubble-plot" element={<MentalHealth3DPlot />} />
          <Route path="/trend-analysis" element={<MentalHealthDashboard />} />
          <Route path="/parallel-plot" element={<ParallelPlot/>}/>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
