import { useState } from 'react';
import axios from 'axios';
import { Input } from "./components/ui/input";
import { Card, CardContent } from "./components/ui/card";

const agents = {
  "Twigg Bros (S10 1HH)": { callOut: 45, freeMiles: 20, rate: 1.1, skates: 50, winching: 45, holidayCallOut: 50, base: "S10 1HH" },
  "Mount Pleasant (S3 8FN)": { callOut: 50, freeMiles: 10, rate: 1.15, skates: 50, winching: 45, holidayCallOut: 60, base: "S3 8FN" },
  "Mount Pleasant (S32 2JN)": { callOut: 50, freeMiles: 10, rate: 1.15, skates: 50, winching: 45, holidayCallOut: 60, base: "S32 2JN" },
  "VRC (S26 4RR)": { callOut: 45, freeMiles: 20, rate: 1.05, skates: 50, winching: 45, holidayCallOut: 50, base: "S26 4RR" },
  "Red House (S41 7JL)": { callOut: 50, freeMiles: 10, rate: 1.1, skates: 50, winching: 45, holidayCallOut: 50, base: "S41 7JL" },
};

const API_KEY = "AIzaSyBqCqyfJNannFwjXYpOwdpszlh2KWt7wkE";

export default function RecoveryCostTool() {
  const [breakdown, setBreakdown] = useState("");
  const [destination, setDestination] = useState("");
  const [skates, setSkates] = useState(0);
  const [winching, setWinching] = useState(0);
  const [isHoliday, setIsHoliday] = useState(false);
  const [passengers, setPassengers] = useState(1);
  const [results, setResults] = useState([]);

  const fetchMileage = async () => {
    const all = await Promise.all(Object.entries(agents).map(async ([name, agent]) => {
      const origins = encodeURIComponent(agent.base);
      const destinations = encodeURIComponent(`${breakdown}|${destination}|${agent.base}`);
      const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origins}&destinations=${destinations}&key=${API_KEY}`;
      const proxy = "https://corsproxy.io/?";
      try {
        const res = await axios.get(proxy + url);
        const legs = res.data.rows[0].elements;
        const totalMiles = legs.reduce((acc, leg) => acc + (leg.distance.value / 1609.34), 0); // meters to miles
        const chargeableMiles = Math.max(totalMiles - agent.freeMiles, 0);
        const callOutCost = isHoliday ? agent.holidayCallOut : agent.callOut;
        const mileageCost = chargeableMiles * agent.rate;
        const skatesCost = skates * agent.skates;
        const winchCost = (winching / 60) * agent.winching;
        const subtotal = callOutCost + mileageCost + skatesCost + winchCost;
        const vat = subtotal * 0.2;
        const total = subtotal + vat;
        return { name, total: total.toFixed(2), miles: totalMiles.toFixed(1) };
      } catch (e) {
        return { name, total: "Error", miles: "Error" };
      }
    }));
    setResults(all.sort((a, b) => parseFloat(a.total) - parseFloat(b.total)));
  };

  const onwardTravelOptions = {
    taxi: 40,
    hireCar: 50,
    accommodation: Math.min(passengers * 40, 280),
  };
  const cheapestOnward = Math.min(onwardTravelOptions.taxi, onwardTravelOptions.hireCar, onwardTravelOptions.accommodation);

  return (
    <div className="grid gap-4 max-w-xl mx-auto p-4">
      <h2 className="text-xl font-bold">Recovery Cost Estimator (Live Mileage)</h2>

      <Input placeholder="Breakdown postcode" value={breakdown} onChange={e => setBreakdown(e.target.value)} />
      <Input placeholder="Destination postcode" value={destination} onChange={e => setDestination(e.target.value)} />
      <Input type="number" placeholder="Skates used (pairs)" value={skates} onChange={e => setSkates(Number(e.target.value))} />
      <Input type="number" placeholder="Winching time (mins)" value={winching} onChange={e => setWinching(Number(e.target.value))} />
      <Input type="number" placeholder="Passengers (for onward travel)" value={passengers} onChange={e => setPassengers(Number(e.target.value))} />

      <label className="flex items-center gap-2">
        <input type="checkbox" checked={isHoliday} onChange={e => setIsHoliday(e.target.checked)} /> Public Holiday?
      </label>

      <button onClick={fetchMileage} className="bg-blue-600 text-white px-4 py-2 rounded">
        Calculate Costs
      </button>

      {results.length > 0 && (
        <>
          <Card>
            <CardContent className="p-4 space-y-2">
              <h3 className="font-semibold">Agent Cost Comparison</h3>
              {results.map(agent => (
                <div key={agent.name}>{agent.name}: £{agent.total} ({agent.miles} miles)</div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 space-y-2">
              <h3 className="font-semibold">Onward Travel Comparison</h3>
              <div>Taxi / Public Travel: £{onwardTravelOptions.taxi}</div>
              <div>Hire Car: £{onwardTravelOptions.hireCar}</div>
              <div>Accommodation (max): £{onwardTravelOptions.accommodation}</div>
              <div><strong>Cheapest Option:</strong> £{cheapestOnward.toFixed(2)}</div>
              <div><strong>Is Recovery Cheaper?</strong> {parseFloat(results[0].total) < cheapestOnward ? "✅ Yes" : "❌ No"}</div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}