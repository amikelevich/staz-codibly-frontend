import { useState, useEffect } from "react";
import axios from "axios";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import "./App.css";

type EnergyMixEntry = {
  fuel: string;
  perc: number;
};

type EnergyDay = {
  date: string;
  mix: EnergyMixEntry[];
  result: number;
};

const CHART_COLORS = [
  "red",
  "green",
  "yellow",
  "blue",
  "purple",
  "orange",
  "pink",
  "gray",
  "brown",
];

function App() {
  const [energyData, setEnergyData] = useState<EnergyDay[]>([]);
  useEffect(() => {
    const fetchEnergyMix = async () => {
      try {
        const response = await axios.get(
          "https://staz-codibly-backend.onrender.com/energy-mix",
        );
        setEnergyData(response.data);
      } catch (error) {
        console.error("Błąd pobierania danych:", error);
      }
    };
    fetchEnergyMix();
  }, []);
  return (
    <>
      <section>
        <h2>Miks eneregetyczny, 3 dni</h2>
        <div className="charts-grid">
          {energyData.map((day, index) => (
            <div key={index} className="chart-container">
              <h3>{day.date}</h3>
              <div className="chart-wrapper" style={{ minHeight: "220px" }}>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={day.mix}
                      dataKey="perc"
                      nameKey="fuel"
                      cx="50%"
                      cy="40%"
                      innerRadius={45}
                      outerRadius={75}
                      paddingAngle={2}
                    >
                      {day.mix.map((entry, cellIndex) => (
                        <Cell
                          key={`cell-${cellIndex}`}
                          fill={CHART_COLORS[cellIndex % CHART_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => `${Number(value).toFixed(2)}%`}
                      itemStyle={{
                        color: "black",
                      }}
                    />
                    <Legend color="black" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <p>Udział czystej energii: {day.result.toFixed(2)}%</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

export default App;
