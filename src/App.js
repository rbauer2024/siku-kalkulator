import React, { useState } from "react";
import "./App.css";

export default function App() {
  // Projekt-Infos
  const [projectName, setProjectName] = useState("");
  const [projectAddress, setProjectAddress] = useState("");
  const [projectEmail, setProjectEmail] = useState("");

  // Räume: Startet leer
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
      { name: "SIKU IPP 600 WW", power: 600 },
      { name: "SIKU IPP 900 WW", power: 900 },
    ],
    DW: [
      { name: "SIKU IPP 700 DW", power: 700 },
      { name: "SIKU IPP 1000 DW", power: 1000 },
    ],
    DC: [
      { name: "SIKU IPP 1000 DC", power: 1000 },
      { name: "SIKU IPP 1400 DC", power: 1400 },
    ],
  };

  // Berechnung pro Raum
  function calculateRoom(room) {
    const factor = parseInt(room.insulation, 10);
    const volume = room.area * room.height;
    const need = volume * factor;

    const models = plateOptions[room.mounting] || [];
    if (models.length === 0) return { need, text: "Keine Modelle verfügbar" };

    const best = models[models.length - 1];
    const count = Math.ceil(need / best.power);

    return {
      need,
      text: `${count} × ${best.name} (${best.power} W)`,
    };
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
        <img
          src="/SIKU_Air_Technologies_horizontal_CMYK - 2000_700.jpg"
          alt="SIKU Logo"
        />
        <h1>SIKU Infrarot-Heizplatten Kalkulator</h1>
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
              {/* Lösch-Button nur im Screen sichtbar */}
              <button
                type="button"
                className="delete-room-btn no-print"
                onClick={() => deleteRoom(index)}
              >
                ❌
              </button>

              {/* Eingaben links */}
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

              {/* Ergebnis rechts (immer sichtbar, auch im PDF) */}
              <div className="result">
                <strong>{room.name || `Raum ${index + 1}`}</strong>
                <p>Bedarf: {result.need} W</p>
                <p>{result.text}</p>
              </div>
            </div>
          );
        })}

        {/* Buttons nur im Screen sichtbar */}
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