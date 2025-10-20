import React, { useState } from "react";
import "./App.css";

export default function App() {
  // Projekt-Infos
  const [projectName, setProjectName] = useState("");
  const [projectAddress, setProjectAddress] = useState("");
  const [projectEmail, setProjectEmail] = useState("");

  // Räume
  const [rooms, setRooms] = useState([]);

  // Dämmoptionen
  const insulationOptions = [
    { label: "Sehr gut (20 W/m³)", value: "20" },
    { label: "Gut (25 W/m³)", value: "25" },
    { label: "Durchschnittlich (30 W/m³)", value: "30" },
    { label: "Altbau (35 W/m³)", value: "35" },
  ];

  // Heizplatten-Optionen
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

  // Maximal erlaubte Plattenanzahl nach Fläche
  function getMaxPlates(area) {
    if (area <= 10) return 1;
    if (area <= 20) return 2;
    if (area <= 25) return 3;
    return Math.ceil(area / 10); // ab 40 m²: 4 Platten, ab 50 m²: 5 Platten usw.
  }

  // Berechnung pro Raum
  function calculateRoom(room) {
    const factor = parseInt(room.insulation, 10);
    const volume = room.area * room.height;
    const need = Math.ceil(volume * factor);

    const models = plateOptions[room.mounting] || [];
    if (models.length === 0) return { need, suggestions: ["Keine Modelle verfügbar"] };

    const suggestions = [];
    const maxPlates = getMaxPlates(room.area);
    let warning = "";

    // Vorschlag 1: kleinste Lösung, die den Bedarf deckt
    for (let model of models) {
      const count = Math.ceil(need / model.power);
      if (count <= maxPlates) {
        suggestions.push(`Vorschlag 1: ${count} × ${model.name} (${model.power} W)`);
        break;
      }
    }

    // Vorschlag 2: falls gleiche Abdeckung auch mit anderem Modell erreicht wird
    if (suggestions.length > 0) {
      const firstSolution = suggestions[0];
      const firstPower = parseInt(firstSolution.match(/\((\d+) W\)/)[1]) * parseInt(firstSolution.split("×")[1]);

      for (let model of models) {
        const count = Math.ceil(need / model.power);
        const totalPower = count * model.power;

        if (count <= maxPlates && totalPower === firstPower && !suggestions.some(s => s.includes(model.name))) {
          suggestions.push(`Vorschlag 2: ${count} × ${model.name} (${model.power} W)`);
          break;
        }
      }
    }

    // Warnung, falls Limit überschritten wird
    const chosen = suggestions[0];
    if (chosen) {
      const chosenCount = parseInt(chosen.split("×")[0].replace(/[^\d]/g, ""));
      if (chosenCount > maxPlates) {
        warning = `⚠️ Achtung: Maximal ${maxPlates} Platten erlaubt, benötigt wären ${chosenCount}.`;
      }
    }

    return { need, suggestions, warning };
  }

  // Neuen Raum hinzufügen
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

  // Raum löschen
  function deleteRoom(index) {
    const newRooms = [...rooms];
    newRooms.splice(index, 1);
    setRooms(newRooms);
  }

  return (
    <div className="container">
      {/* HEADER */}
      <header>
        <img src="/siku_logo.svg" alt="SIKU Logo" />
        <h1>Infrarot-Heizplatten Kalkulator</h1>
      </header>

      {/* Projekt-Daten */}
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

      {/* Räume */}
      <div className="card">
        <h2>Räume</h2>

        {rooms.length === 0 && <p>🔹 Noch keine Räume hinzugefügt.</p>}

        {rooms.map((room, index) => {
          const result = calculateRoom(room);

          return (
            <div key={index} className="room">
              {/* Löschen */}
              <button
                type="button"
                className="delete-room-btn no-print"
                onClick={() => deleteRoom(index)}
              >
                ❌
              </button>

              {/* Eingaben */}
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

              {/* Ergebnis */}
              <div className="result">
                <strong>{room.name || `Raum ${index + 1}`}</strong>
                <p>Bedarf: {result.need} W</p>
                {result.suggestions.map((s, i) => (
                  <p key={i}><strong>{s}</strong></p>
                ))}
                {result.warning && <p style={{ color: "red" }}>{result.warning}</p>}
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