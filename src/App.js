import React, { useState, useEffect } from "react";
import "./App.css";

export default function App() {
  const [projectName, setProjectName] = useState("");
  const [projectAddress, setProjectAddress] = useState("");
  const [projectEmail, setProjectEmail] = useState("");
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    sessionStorage.clear();
  }, []);

  const insulationOptions = [
    { label: "Sehr gut (20 W/m³)", value: "20" },
    { label: "Gut (25 W/m³)", value: "25" },
    { label: "Durchschnittlich (30 W/m³)", value: "30" },
    { label: "Altbau (35 W/m³)", value: "35" },
  ];

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

  function getMaxPlates(area) {
    if (area <= 10) return 1;
    if (area <= 15) return 2;
    if (area <= 25) return 4;
    if (area <= 40) return 5;
    if (area <= 50) return 6;
    if (area <= 60) return 7;
    return 8;
  }

  function calculateRoom(room) {
    const factor = parseInt(room.insulation, 10);
    const volume = room.area * room.height;

    // Fensteranteil berücksichtigen
    let windowFactor = 1.0;
    if (room.windows === "hoch") windowFactor = 1.2;
    if (room.windows === "gering") windowFactor = 0.9;

    const need = Math.round(volume * factor * windowFactor);

    const models = plateOptions[room.mounting] || [];
    if (models.length === 0)
      return { need, text: "Keine Modelle verfügbar", warnings: [] };

    const maxPlates = getMaxPlates(room.area);
    const warnings = [];

    // Modelle absteigend nach Leistung sortieren
    const sortedModels = [...models].sort((a, b) => b.power - a.power);

    let best = null;
    let second = null;

    // 1️⃣ Beste Lösung: möglichst wenige Platten
    for (const model of sortedModels) {
      const count = Math.ceil(need / model.power);
      const total = count * model.power;
      if (total >= need) {
        best = { model, count, total };
        break;
      }
    }

    // 2️⃣ Zweiter Vorschlag: ähnliche Leistung (±15 %)
    if (best) {
      for (const model of sortedModels) {
        const count = Math.ceil(need / model.power);
        const total = count * model.power;
        const diffPercent = Math.abs(total - best.total) / best.total;

        if (
          total >= need &&
          diffPercent <= 0.15 &&
          model.name !== best.model.name
        ) {
          second = { model, count, total };
          break;
        }
      }
    }

    // 3️⃣ Warnung bei Flächenlimit
    if (best && best.count > maxPlates) {
      warnings.push(
        `⚠️ Achtung: Maximal ${maxPlates} Platten empfohlen, benötigt wären ${best.count}.`
      );
    }

    // 4️⃣ Vorschlagstexte inkl. Empfänger & Thermostat-Bezeichnungen
    const suggestions = [];
    const thermostatText =
      room.thermostat === "FT01"
        ? "IPP-FT01 (digital)"
        : room.thermostat === "BT010"
        ? "BT010 (einfach)"
        : "BT003 (Funk)";
    const receiverText =
      room.receiver === "R01"
        ? "IPP-R01 (Unterputz)"
        : "IPP-R02 (Aufputz)";

    if (best)
      suggestions.push(
        `Vorschlag 1: ${best.count} × ${best.model.name} (${best.model.power} W)\n→ ${best.count} × ${receiverText}, 1 × ${thermostatText}`
      );
    if (second)
      suggestions.push(
        `Vorschlag 2: ${second.count} × ${second.model.name} (${second.model.power} W)\n→ ${second.count} × ${receiverText}, 1 × ${thermostatText}`
      );

    return {
      need,
      text: suggestions.join("\n\n"),
      warnings,
    };
  }

  function addRoom() {
    const roomNumber = rooms.length + 1;
    const newRoom = {
      name: `Raum ${roomNumber}`,
      area: 0,
      height: 2.5,
      insulation: "30",
      windows: "normal",
      usage: "dauer",
      thermostat: "FT01",
      receiver: "R01",
      mounting: "WW",
    };
    setRooms([...rooms, newRoom]);
  }

  function deleteRoom(index) {
    const newRooms = [...rooms];
    newRooms.splice(index, 1);
    setRooms(newRooms);
  }

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

        {rooms.map((room, index) => {
          const result = calculateRoom(room);

          return (
            <div key={index} className="room">
              <button
                type="button"
                className="delete-room-btn no-print"
                onClick={() => deleteRoom(index)}
              >
                ❌
              </button>

              <div className="inputs no-print">
                <label>Raumname</label>
                <input
                  type="text"
                  value={room.name}
                  onChange={(e) => {
                    const newRooms = [...rooms];
                    newRooms[index].name = e.target.value;
                    setRooms(newRooms);
                  }}
                />

                <label>Fläche (m²)</label>
                <input
                  type="number"
                  value={room.area}
                  onChange={(e) => {
                    const newRooms = [...rooms];
                    newRooms[index].area = parseFloat(e.target.value);
                    setRooms(newRooms);
                  }}
                />

                <label>Deckenhöhe (m)</label>
                <input
                  type="number"
                  step="0.1"
                  value={room.height}
                  onChange={(e) => {
                    const newRooms = [...rooms];
                    newRooms[index].height = parseFloat(e.target.value);
                    setRooms(newRooms);
                  }}
                />

                <label>Dämmstandard</label>
                <select
                  value={room.insulation}
                  onChange={(e) => {
                    const newRooms = [...rooms];
                    newRooms[index].insulation = e.target.value;
                    setRooms(newRooms);
                  }}
                >
                  {insulationOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>

                <label>Fensteranteil</label>
                <select
                  value={room.windows}
                  onChange={(e) => {
                    const newRooms = [...rooms];
                    newRooms[index].windows = e.target.value;
                    setRooms(newRooms);
                  }}
                >
                  <option value="gering">Gering</option>
                  <option value="normal">Normal</option>
                  <option value="hoch">Hoch</option>
                </select>

                <label>Nutzungsart</label>
                <select
                  value={room.usage}
                  onChange={(e) => {
                    const newRooms = [...rooms];
                    newRooms[index].usage = e.target.value;
                    setRooms(newRooms);
                  }}
                >
                  <option value="dauer">Dauerbetrieb</option>
                  <option value="zeitweise">Zeitweise</option>
                </select>

                <label>Thermostat (pro Raum)</label>
                <select
                  value={room.thermostat}
                  onChange={(e) => {
                    const newRooms = [...rooms];
                    newRooms[index].thermostat = e.target.value;
                    setRooms(newRooms);
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
                    const newRooms = [...rooms];
                    newRooms[index].receiver = e.target.value;
                    setRooms(newRooms);
                  }}
                >
                  <option value="R01">IPP-R01 (Unterputz)</option>
                  <option value="R02">IPP-R02 (Aufputz)</option>
                </select>

                <label>Montageart</label>
                <select
                  value={room.mounting}
                  onChange={(e) => {
                    const newRooms = [...rooms];
                    newRooms[index].mounting = e.target.value;
                    setRooms(newRooms);
                  }}
                >
                  <option value="WW">Wand (WW)</option>
                  <option value="DW">Decke abgehängt (DW)</option>
                  <option value="DC">Decke direkt (DC)</option>
                </select>
              </div>

              <div className="result">
                <strong>{room.name || `Raum ${index + 1}`}</strong>
                <p>Bedarf: {result.need} W</p>
                <pre>{result.text}</pre>
                {result.warnings.map((w, i) => (
                  <p key={i} style={{ color: "red" }}>
                    {w}
                  </p>
                ))}
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