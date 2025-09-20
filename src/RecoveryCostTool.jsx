import { useState } from 'react';
import { Input } from "./components/ui/input";
import { Card, CardContent } from "./components/ui/card";

const agents = {
  "Twigg Bros (S10 1HH)": { callOut: 45, freeMiles: 20, rate: 1.1, skates: 50, winching: 45, holidayCallOut: 50, baseMiles: 20.6 },
  "Mount Pleasant (S3 8FN)": { callOut: 50, freeMiles: 10, rate: 1.15, skates: 50, winching: 45, holidayCallOut: 60, baseMiles: 23.4 },
  "Mount Pleasant (S32 2JN)": { callOut: 50, freeMiles: 10, rate: 1.15, skates: 50, winching: 45, holidayCallOut: 60, baseMiles: 42.2 },
  "VRC (S26 4RR)": { callOut: 45, freeMiles: 20, rate: 1.05, skates: 50, winching: 45, holidayCallOut: 50, baseMiles: 53.6 },
  "Red House (S41 7JL)": { callOut: 50, freeMiles: 10, rate: 1.1, skates: 50, winching: 45, holidayCallOut: 50, baseMiles: 36.4 },
};

export default function RecoveryCostTool() {
  const [skates, setSkates] = useState(0);
  const [winching, setWinching] = useState(0);
  const [isHoliday, setIsHoliday] = useState(false);
  const [passengers, setPassengers] = useState(1);

  const calculateAgentCosts = () => {
    return Object.entries(agents).map(([name, agent]) => {
      const chargeableMiles = Math.max(agent.baseMiles - agent.freeMiles, 0);
      const callOutCost = isHoliday ? agent.holidayCallOut : agent.callOut;
      const mileageCost = chargeableMiles * agent.rate;
      const skatesCost = skates * agent.skates;
      const winchCost = (winching / 60) * agent.winching;
      const subtotal = callOutCost + mileageCost + skatesCost + winchCost;
      const vat = subtotal * 0.2;
      const total = subtotal + vat;
      return { name, total: total.toFixed(2) };
    }).sort((a, b) => parseFloat(a.total) - parseFloat(b.total));
  };

  const bestAgents = calculateAgentCosts();
  const onwardTravelOptions = {
    taxi: 40,
    hireCar: 50,
    accommodation: Math.min(passengers * 40, 280),
  };
  const cheapestOnward = Math.min(onwardTravelOptions.taxi, onwardTravelOptions.hireCar, onwardTravelOptions.accommodation);

  return (
    <div className="grid gap-4 max-w-xl mx-auto p-4">
      <h2 className="text-xl font-bold">Recovery Cost Estimator</h2>

      <Input type="number" placeholder="Skates used (pairs)" value={skates} onChange={e => setSkates(Number(e.target.value))} />
      <Input type="number" placeholder="Winching time (mins)" value={winching} onChange={e => setWinching(Number(e.target.value))} />
      <Input type="number" placeholder="Passengers (for onward travel)" value={passengers} onChange={e => setPassengers(Number(e.target.value))} />

      <label className="flex items-center gap-2">
        <input type="checkbox" checked={isHoliday} onChange={e => setIsHoliday(e.target.checked)} /> Public Holiday?
      </label>

      <Card>
        <CardContent className="p-4 space-y-2">
          <h3 className="font-semibold">Agent Cost Comparison</h3>
          {bestAgents.map(agent => (
            <div key={agent.name}>{agent.name}: £{agent.total}</div>
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
          <div><strong>Is Recovery Cheaper?</strong> {parseFloat(bestAgents[0].total) < cheapestOnward ? "✅ Yes" : "❌ No"}</div>
        </CardContent>
      </Card>
    </div>
  );
}