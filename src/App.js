import React, { useState } from "react";
import "./App.css";

export default function App() {
  const [projectName, setProjectName] = useState("");
  const [projectAddress, setProjectAddress] = useState("");
  const [projectEmail, setProjectEmail] = useState("");
  const [rooms, setRooms] = useState([]);

  // Dämmoptionen
  const insulationOptions = [
    { label: "Sehr gut (20 W/m³)", value: "20" },
    { label: "Gut (25 W/m³)", value: "25" },
    { label: "Durchschnittlich (30 W/m³)", value: "30" },
    { label: "Altbau (35 W/m³)", value: "35" },
  ];

  // Modellübersicht
  const plateOptions = {
    WW: [
      { name: "SIKU IPP 160 WW", power: 160 },
      { name: "SIKU IPP 330 WW", power: 330 },
      { name: "SIKU IPP 350 WW", power: 350 },
      { name: "SIKU IPP 580 WW", power: 580 },
      { name: "SIKU IPP 700 WW", power: 700 },
      { name: "SIKU IPP 900 WW", power: 900 },
    ],
    DW: [
      { name: "SIKU IPP 280 DW", power: 280 },
      { name: "SIKU IPP 450 DW", power: 450 },
      { name: "SIKU IPP 550 DW", power: 550 },
      { name: "SIKU IPP 700 DW", power: 700 },
    ],
    DC: [
      { name: "SIKU IPP 450 DC", power: 450 },
      { name: "SIKU IPP 700 DC", power: 700 },
      { name: "SIKU IPP 900 DC", power: 900 },
      { name: "SIKU IPP 1400 DC", power: 1400 },
    ],
  };

  // Maximal empfohlene Platten
  function getMaxPlates(area) {
    if (area <= 10) return 1;
    if (area <= 15) return 2;
    if (area <= 25) return 4;
    if (area <= 40) return 5;
    if (area <= 50) return 6;
    if (area <= 60) return 7;
    return 8;
  }

  // Hilfsfunktionen
  const getReceiver = (code) =>
    code === "R02" ? "IPP-R02 (Aufputz)" : "IPP-R01 (Unterputz)";
  const getThermostat = (code) => {
    if (code === "BT010") return "BT010 (einfach)";
    if (code === "BT003") return "BT003 (Funk)";
    return "IPP-FT01 (digital)";
  };

  // Hauptberechnung
  function calculateRoom(room) {
    const factor = parseInt(room.insulation, 10);
    const volume = room.area * room.height;
    let windowFactor = room.windows === "hoch" ? 1.1 : 1.0;
    const need = Math.round(volume * factor * windowFactor);

    const models = plateOptions[room.mounting] || [];
    if (models.length === 0) return { need, text: "Keine Modelle verfügbar" };

    const sorted = [...models].sort((a, b) => a.power - b.power);
    const combos = [];

    // Alle möglichen Kombinationen
    for (const m of sorted) {
      const count = Math.ceil(need / m.power);
      combos.push({
        model: m,
        count,
        total: count * m.power,
      });
    }

    // Nur jene, die den Bedarf decken
    const valid = combos.filter((c) => c.total >= need);
    if (valid.length === 0) return { need, text: "Keine passende Kombination" };

    // Effizienteste Lösung: wenigste Platten, geringste Überdeckung
    valid.sort((a, b) =>
      a.count === b.count
        ? a.total - b.total
        : a.count - b.count
    );
    const suggestion1 = valid[0];
    const suggestion2 = valid.length > 1 ? valid[1] : null;

    const maxPlates = getMaxPlates(room.area);
    let warning = "";
    if (suggestion1.count > maxPlates) {
      warning = `⚠️ Achtung: Maximal ${maxPlates} Platten empfohlen, benötigt wären ${suggestion1.count}.`;
    }

    // Textausgabe
    const lines = [];
    lines.push(
      `Vorschlag 1: ${suggestion1.count} × ${suggestion1.model.name} (${suggestion1.model.power} W)\n→ ${suggestion1.count} × ${getReceiver(
        room.receiver
      )}, 1 × ${getThermostat(room.thermostat)}`
    );

    if (suggestion2) {
      lines.push(
        `\nVorschlag 2: ${suggestion2.count} × ${suggestion2.model.name} (${suggestion2.model.power} W)\n→ ${suggestion2.count} × ${getReceiver(
          room.receiver
        )}, 1 × ${getThermostat(room.thermostat)}`
      );
    }

    return { need, text: lines.join("\n"), warning };
  }

  // Raumsteuerung
  const addRoom = () =>
    setRooms([
      ...rooms,
      {
        name: `Raum ${rooms.length + 1}`,
        area: 0,
        height: 2.5,
        insulation: "30",
        windows: "normal",
        usage: "dauer",
        thermostat: "FT01",
        receiver: "R01",
        mounting: "WW",
      },
    ]);

  const deleteRoom = (i) => setRooms(rooms.filter((_, x) => x !== i));

  // Render
  return (
    <div className="container">
      <header>
        <img src="/siku_logo.svg" alt="SIKU Logo" />
        <h1>Infrarot-Heizplatten Kalkulator</h1>
      </header>

      <div className="card no-print">
        <h2>Projekt-Daten (optional)</h2>
        <input
          type="text"
          placeholder="Projektname / Kunde"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Adresse"
          value={projectAddress}
          onChange={(e) => setProjectAddress(e.target.value)}
        />
        <input
          type="email"
          placeholder="E-Mail"
          value={projectEmail}
          onChange={(e) => setProjectEmail(e.target.value)}
        />
      </div>

      <div className="card">
        <h2>Räume</h2>
        {rooms.length === 0 && <p>🔹 Noch keine Räume hinzugefügt.</p>}

        {rooms.map((room, i) => {
          const result = calculateRoom(room);
          return (
            <div key={i} className="room">
              <button
                type="button"
                className="delete-room-btn no-print"
                onClick={() => deleteRoom(i)}
              >
                ❌
              </button>

              <div className="inputs no-print">
                <label>Raumname</label>
                <input
                  type="text"
                  value={room.name}
                  onChange={(e) => {
                    const n = [...rooms];
                    n[i].name = e.target.value;
                    setRooms(n);
                  }}
                />

                <label>Fläche (m²)</label>
                <input
                  type="number"
                  value={room.area}
                  onChange={(e) => {
                    const n = [...rooms];
                    n[i].area = parseFloat(e.target.value);
                    setRooms(n);
                  }}
                />

                <label>Deckenhöhe (m)</label>
                <input
                  type="number"
                  step="0.1"
                  value={room.height}
                  onChange={(e) => {
                    const n = [...rooms];
                    n[i].height = parseFloat(e.target.value);
                    setRooms(n);
                  }}
                />

                <label>Dämmstandard</label>
                <select
                  value={room.insulation}
                  onChange={(e) => {
                    const n = [...rooms];
                    n[i].insulation = e.target.value;
                    setRooms(n);
                  }}
                >
                  {insulationOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>

                <label>Fensteranteil</label>
                <select
                  value={room.windows}
                  onChange={(e) => {
                    const n = [...rooms];
                    n[i].windows = e.target.value;
                    setRooms(n);
                  }}
                >
                  <option value="normal">Normal</option>
                  <option value="hoch">Hoch</option>
                </select>

                <label>Nutzungsart</label>
                <select
                  value={room.usage}
                  onChange={(e) => {
                    const n = [...rooms];
                    n[i].usage = e.target.value;
                    setRooms(n);
                  }}
                >
                  <option value="dauer">Dauerbetrieb</option>
                  <option value="zeitweise">Zeitweise</option>
                </select>

                <label>Thermostat (pro Raum)</label>
                <select
                  value={room.thermostat}
                  onChange={(e) => {
                    const n = [...rooms];
                    n[i].thermostat = e.target.value;
                    setRooms(n);
                  }}
                >
                  <option value="FT01">IPP-FT01 (digital)</option>
                  <option value="BT010">BT010 (einfach)</option>
                  <option value="BT003">BT003 (Funk)</option>
                </select>

                <label>Empfänger (pro Platte)</label>
                <select
                  value={room.receiver}
                  onChange={(e) => {
                    const n = [...rooms];
                    n[i].receiver = e.target.value;
                    setRooms(n);
                  }}
                >
                  <option value="R01">IPP-R01 (Unterputz)</option>
                  <option value="R02">IPP-R02 (Aufputz)</option>
                </select>

                <label>Montageart</label>
                <select
                  value={room.mounting}
                  onChange={(e) => {
                    const n = [...rooms];
                    n[i].mounting = e.target.value;
                    setRooms(n);
                  }}
                >
                  <option value="WW">Wand (WW)</option>
                  <option value="DW">Decke abgehängt (DW)</option>
                  <option value="DC">Decke direkt (DC)</option>
                </select>
              </div>

              <div className="result" style={{ maxWidth: "500px" }}>
                <strong>{room.name}</strong>
                <p>Bedarf: {result.need} W</p>
                <pre>{result.text}</pre>
                {result.warning && (
                  <p style={{ color: "red", fontWeight: "bold" }}>
                    {result.warning}
                  </p>
                )}
              </div>
            </div>
          );
        })}

        <div className="no-print">
          <button onClick={addRoom} className="add-room-btn">
            + Raum hinzufügen
          </button>
          <button onClick={() => window.print()} className="pdf-btn">
            📄 PDF erstellen
          </button>
        </div>
      </div>
    </div>
  );
}