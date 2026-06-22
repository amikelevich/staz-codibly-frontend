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
  const [hours, setHours] = useState("");
  const [optimalWindow, setOptimalWindow] = useState<{
    from: string;
    to: string;
    averageCleanEnergy: number;
  } | null>(null);
  const [windowError, setWindowError] = useState("");

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

  const handleFindWindow = async () => {
    const hrs = Number(hours);
    if (hrs < 1 || hrs > 6) {
      setWindowError("Proszę podać wartość od 1 do 6 godzin.");
      setOptimalWindow(null);
      return;
    }
    setWindowError("");
    setOptimalWindow(null);

    try {
      const response = await axios.get(
        `https://staz-codibly-backend.onrender.com/optimal-window/${hrs}`,
      );
      setOptimalWindow(response.data);
    } catch (error) {
      setWindowError("Spróbuj ponownie");
    }
  };

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
                      {day.mix.map((_, cellIndex) => (
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
      <section
        className="card"
        style={{
          borderTopWidth: "1px",
          borderTopStyle: "solid",
          borderColor: "white",
          marginTop: "50px",
        }}
      >
        <h2 style={{ marginTop: "10px" }}>Optymalne okno ładowania</h2>
        <p>Podaj liczbę godzin (1-6h)</p>
        <div className="input-group">
          <input
            type="number"
            min="1"
            max="6"
            placeholder="np. 1"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            className="custom-input"
          />
          <button className="custom-btn" onClick={handleFindWindow}>
            Submit
          </button>
        </div>
        {windowError && (
          <p style={{ color: "red", marginTop: "16px", fontWeight: "bold" }}>
            {windowError}
          </p>
        )}
        {optimalWindow && (
          <div
            style={{
              marginTop: "24px",
              padding: "20px",
              borderRadius: "12px",
            }}
          >
            <h3> Najlepszy czas na łądowanie: </h3>
            <div>
              <strong>Start:</strong>{" "}
              {optimalWindow.from.replace("T", " ").substring(0, 16)}
            </div>
            <div>
              <strong>Koniec:</strong>
              {optimalWindow.to.replace("T", " ").substring(0, 16)}
            </div>
            <div>
              Czysta energia:{" "}
              <strong style={{ color: "green" }}>
                {optimalWindow.averageCleanEnergy.toFixed(2)}%
              </strong>
            </div>
          </div>
        )}
      </section>
    </>
  );
}

export default App;
