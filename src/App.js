import React, { useMemo, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// -----------------------------
// Produktliste
// -----------------------------
const PRODUCTS = [
  // WW
  { id: "IPP160WW", name: "SIKU IPP 160 WW", watt: 160, size: "905×205×22 mm", type: "WW" },
  { id: "IPP330WW", name: "SIKU IPP 330 WW", watt: 350, size: "1205×305×22 mm", type: "WW" },
  { id: "IPP350WW", name: "SIKU IPP 350 WW", watt: 350, size: "605×605×22 mm", type: "WW" },
  { id: "IPP580WW", name: "SIKU IPP 580 WW", watt: 580, size: "1005×605×22 mm", type: "WW" },
  { id: "IPP700WW", name: "SIKU IPP 700 WW", watt: 700, size: "1205×605×22 mm", type: "WW" },
  { id: "IPP900WW", name: "SIKU IPP 900 WW", watt: 900, size: "1205×755×22 mm", type: "WW" },

  // DW
  { id: "IPP280DW", name: "SIKU IPP 280 DW", watt: 280, size: "605×605×22 mm", type: "DW", accessoryNeeded: "IPP-DAS" },
  { id: "IPP450DW", name: "SIKU IPP 450 DW", watt: 450, size: "1005×605×22 mm", type: "DW", accessoryNeeded: "IPP-DAS" },
  { id: "IPP550DW", name: "SIKU IPP 550 DW", watt: 550, size: "1205×605×22 mm", type: "DW", accessoryNeeded: "IPP-DAS" },
  { id: "IPP700DW", name: "SIKU IPP 700 DW", watt: 700, size: "1205×755×22 mm", type: "DW", accessoryNeeded: "IPP-DAS" },

  // DC
  { id: "IPP450DC", name: "SIKU IPP 450 DC", watt: 450, size: "630×630×21 mm", type: "DC" },
  { id: "IPP700DC", name: "SIKU IPP 700 DC", watt: 700, size: "1030×630×21 mm", type: "DC" },
  { id: "IPP900DC", name: "SIKU IPP 900 DC", watt: 900, size: "1230×630×21 mm", type: "DC" },
  { id: "IPP1400DC", name: "SIKU IPP 1400 DC", watt: 1400, size: "1830×630×21 mm", type: "DC" },

  // Zubehör
  { id: "IPP-DAS", name: "SIKU IPP-DAS Deckenabhängeset (für DW-Modelle)", watt: 0, type: "Zubehör" },

  // Empfänger
  { id: "IPP-R01", name: "SIKU IPP-R01 Funkempfänger Unterputz", watt: 0, type: "Empfänger" },
  { id: "BT003", name: "SIKU BT003 Funkempfänger Steckdose", watt: 0, type: "Empfänger" },

  // Thermostate
  { id: "BT010", name: "SIKU BT010 Funk-Raumthermostat", watt: 0, type: "Thermostat" },
  { id: "IPP-FT01", name: "SIKU IPP-FT01 Digitales Funk-Raumthermostat", watt: 0, type: "Thermostat" },
];

// Dämmwerte
const INSULATION_PRESETS = [
  { key: "passiv", label: "Passivhaus/Neubau sehr gut (18 W/m³)", wpm3: 18 },
  { key: "gut", label: "Gut gedämmt (24 W/m³)", wpm3: 24 },
  { key: "mittel", label: "Durchschnittlich (30 W/m³)", wpm3: 30 },
  { key: "schlecht", label: "Altbau mäßig (36 W/m³)", wpm3: 36 },
  { key: "sehrschlecht", label: "Altbau/ungedämmt (42 W/m³)", wpm3: 42 },
];

const WINDOW_FACTORS = [
  { key: "wenig", label: "Wenig Fenster", factor: 0.98 },
  { key: "mittel", label: "Normal", factor: 1.0 },
  { key: "viel", label: "Viele Fenster", factor: 1.07 },
  { key: "sehrviel", label: "Sehr viele Fenster", factor: 1.12 },
];

const USAGE_FACTORS = [
  { key: "dauer", label: "Dauerbetrieb", factor: 1.0 },
  { key: "zeitweise", label: "Zeitweise", factor: 1.05 },
  { key: "selten", label: "Selten genutzt", factor: 1.1 },
];

// -----------------------------
// Berechnung pro Raum
// -----------------------------
function recommendForRoom(room, catalog) {
  const volume = room.area * room.height;
  const baseWpm3 = INSULATION_PRESETS.find(x => x.key === room.insulation)?.wpm3 ?? 30;
  const winF = WINDOW_FACTORS.find(x => x.key === room.windowKey)?.factor ?? 1;
  const useF = USAGE_FACTORS.find(x => x.key === room.usageKey)?.factor ?? 1;
  const required = volume * baseWpm3 * winF * useF;

  // Filter nach Montageart
  const sorted = [...catalog.filter(p => p.type === room.mountType)].sort((a,b)=>a.watt-b.watt);

  let candidate = sorted.find(p => p.watt >= required) || sorted[sorted.length-1];
  if (!candidate) return { panels: [], accessories: [], receivers: [], thermostats: [], required };

  let qty = Math.ceil(required / candidate.watt);

  const panels = [{ product: candidate, qty }];

  const accessories = [];
  if (candidate.accessoryNeeded) {
    const acc = catalog.find(x => x.id === candidate.accessoryNeeded);
    if (acc) accessories.push({ product: acc, qty });
  }

  const receivers = [];
  const rcv = catalog.find(p => p.id === room.receiver);
  if (rcv) receivers.push({ product: rcv, qty });

  const thermo = catalog.find(p => p.id === room.thermostat);
  const thermostats = thermo ? [{ product: thermo, qty: 1 }] : [];

  return { panels, accessories, receivers, thermostats, required };
}

// -----------------------------
// Main Component
// -----------------------------
export default function App() {
  const [rooms, setRooms] = useState([]);
  const [projectName, setProjectName] = useState("");
  const [projectAddress, setProjectAddress] = useState("");
  const [projectMail, setProjectMail] = useState("");
  const [calculate, setCalculate] = useState(false);

  const results = useMemo(() => {
    if (!calculate) return [];
    return rooms.map(r => ({ room: r, rec: recommendForRoom(r, PRODUCTS) }));
  }, [rooms, calculate]);

  const totals = {};
  results.forEach(({ rec }) => {
    [...rec.panels, ...rec.accessories, ...rec.receivers, ...rec.thermostats].forEach(({ product, qty }) => {
      totals[product.name] = (totals[product.name] || 0) + qty;
    });
  });

  const exportPDF = () => {
    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    doc.setFontSize(16);
    doc.text("SIKU Infrarot-Heizplatten Kalkulator", 14, 15);

    doc.setFontSize(10);
    if (projectName) doc.text(`Projekt: ${projectName}`, 14, 25);
    if (projectAddress) doc.text(`Adresse: ${projectAddress}`, 14, 30);
    if (projectMail) doc.text(`E-Mail: ${projectMail}`, 14, 35);

    let yPos = projectMail || projectAddress || projectName ? 45 : 25;

    results.forEach(({ room, rec }) => {
      doc.setFontSize(12);
      doc.text(`${room.name} (Bedarf: ${Math.round(rec.required)} W)`, 14, yPos);
      autoTable(doc, {
        startY: yPos + 5,
        head: [["Menge", "Produkt"]],
        body: [
          ...rec.panels.map(({ product, qty }) => [qty, product.name]),
          ...rec.accessories.map(({ product, qty }) => [qty, product.name]),
          ...rec.receivers.map(({ product, qty }) => [qty, product.name]),
          ...rec.thermostats.map(({ product, qty }) => [qty, product.name]),
        ],
        theme: "grid",
        styles: { fontSize: 9 },
      });
      yPos = (doc).lastAutoTable.finalY + 10;
    });

    doc.setFontSize(12);
    doc.text("Gesamtübersicht", 14, yPos);
    autoTable(doc, {
      startY: yPos + 5,
      head: [["Menge", "Produkt"]],
      body: Object.entries(totals).map(([name, qty]) => [qty, name]),
      theme: "grid",
      styles: { fontSize: 9 },
    });

    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setFontSize(8);
    doc.text("© SIKU – Heizplattenkalkulator – ohne Gewähr", 14, pageHeight - 10);

    doc.save("SIKU-Kalkulation.pdf");
  };

  const addRoom = () => {
    setRooms([...rooms, { 
      id: Date.now().toString(), 
      name: "Wohnzimmer", 
      area: 20, height: 2.6, 
      insulation: "mittel", 
      windowKey: "mittel", 
      usageKey: "dauer", 
      thermostat: "BT010",
      receiver: "IPP-R01",
      mountType: "WW"
    }]);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">SIKU Infrarot-Heizplatten Kalkulator</h1>

      {/* Projekt-Daten */}
      <div className="mb-6 p-4 border rounded bg-gray-50">
        <h2 className="text-lg font-semibold mb-2">Projekt-Daten (optional)</h2>
        <input value={projectName} onChange={e => setProjectName(e.target.value)} placeholder="Projektname / Kunde" className="border p-2 rounded w-full mb-2" />
        <input value={projectAddress} onChange={e => setProjectAddress(e.target.value)} placeholder="Adresse" className="border p-2 rounded w-full mb-2" />
        <input value={projectMail} onChange={e => setProjectMail(e.target.value)} placeholder="E-Mail" className="border p-2 rounded w-full" />
      </div>

      {/* Räume */}
      <h2 className="text-lg font-semibold mb-2">Räume</h2>
      {rooms.map((room, idx) => (
        <div key={room.id} className="mb-4 p-4 border rounded bg-white">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs mb-1">Raumname</label>
              <input value={room.name} onChange={e => { const v=[...rooms]; v[idx].name=e.target.value; setRooms(v); }} className="border p-2 rounded w-full" />
            </div>
            <div>
              <label className="block text-xs mb-1">Fläche (m²)</label>
              <input type="number" value={room.area} onChange={e => { const v=[...rooms]; v[idx].area=parseFloat(e.target.value); setRooms(v); }} className="border p-2 rounded w-full" />
            </div>
            <div>
              <label className="block text-xs mb-1">Deckenhöhe (m)</label>
              <input type="number" value={room.height} onChange={e => { const v=[...rooms]; v[idx].height=parseFloat(e.target.value); setRooms(v); }} className="border p-2 rounded w-full" />
            </div>
            <div>
              <label className="block text-xs mb-1">Dämmstandard</label>
              <select value={room.insulation} onChange={e => { const v=[...rooms]; v[idx].insulation=e.target.value; setRooms(v); }} className="border p-2 rounded w-full">
                {INSULATION_PRESETS.map(x => (<option key={x.key} value={x.key}>{x.label}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-xs mb-1">Fensteranteil</label>
              <select value={room.windowKey} onChange={e => { const v=[...rooms]; v[idx].windowKey=e.target.value; setRooms(v); }} className="border p-2 rounded w-full">
                {WINDOW_FACTORS.map(x => (<option key={x.key} value={x.key}>{x.label}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-xs mb-1">Nutzungsart</label>
              <select value={room.usageKey} onChange={e => { const v=[...rooms]; v[idx].usageKey=e.target.value; setRooms(v); }} className="border p-2 rounded w-full">
                {USAGE_FACTORS.map(x => (<option key={x.key} value={x.key}>{x.label}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-xs mb-1">Thermostat (pro Raum)</label>
              <select value={room.thermostat} onChange={e => { const v=[...rooms]; v[idx].thermostat=e.target.value; setRooms(v); }} className="border p-2 rounded w-full">
                <option value="BT010">BT010 (einfach)</option>
                <option value="IPP-FT01">IPP-FT01 (digital)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs mb-1">Empfänger (pro Platte)</label>
              <select value={room.receiver} onChange={e => { const v=[...rooms]; v[idx].receiver=e.target.value; setRooms(v); }} className="border p-2 rounded w-full">
                <option value="IPP-R01">IPP-R01 (Unterputz)</option>
                <option value="BT003">BT003 (Steckdose)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs mb-1">Montageart</label>
              <select value={room.mountType} onChange={e => { const v=[...rooms]; v[idx].mountType=e.target.value; setRooms(v); }} className="border p-2 rounded w-full">
                <option value="WW">Wand (WW)</option>
                <option value="DW">Decke abgehängt (DW)</option>
                <option value="DC">Decke direkt (DC)</option>
              </select>
            </div>
          </div>

          {/* Ausgabe pro Raum */}
          {calculate && (
            <div className="mt-3 text-sm bg-gray-50 p-2 rounded">
              <strong>Berechnung:</strong><br/>
              Bedarf: {Math.round(recommendForRoom(room, PRODUCTS).required)} W<br/>
              {recommendForRoom(room, PRODUCTS).panels.map(({product,qty}) => (
                <div key={product.id}>{qty} × {product.name} ({product.watt} W)</div>
              ))}
            </div>
          )}
        </div>
      ))}
      <button onClick={addRoom} className="bg-black text-white px-4 py-2 rounded">+ Raum hinzufügen</button>
      <button onClick={() => setCalculate(true)} className="bg-blue-600 text-white px-4 py-2 rounded ml-2">Berechnen</button>

      {calculate && (
        <div className="mt-6">
          <button onClick={exportPDF} className="bg-green-600 text-white px-4 py-2 rounded">PDF exportieren</button>
        </div>
      )}
    </div>
  );
}