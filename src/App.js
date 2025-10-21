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

  // Modelle pro Montageart
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

  // Max. Plattenanzahl abhängig von Fläche
  function getMaxPlates(area) {
    if (area <= 10) return 1;
    if (area <= 15) return 2;
    if (area <= 25) return 4;
    if (area <= 40) return 5;
    if (area <= 50) return 6;
    if (area <= 60) return 7;
    return 8;
  }

  // Hauptberechnung
  function calculateRoom(room) {
    const factor = parseInt(room.insulation, 10);
    const volume = room.area * room.height;
    const need = Math.round(volume * factor);
    const models = plateOptions[room.mounting] || [];
    if (models.length === 0) return { need, text: "Keine Modelle verfügbar" };

    // Sortiere Modelle nach Leistung aufsteigend
    const sortedModels = [...models].sort((a, b) => a.power - b.power);

    let suggestion1 = null;
    let suggestion2 = null;

    // Vorschlag 1: kleinstmögliche Anzahl Platten über dem Bedarf
    for (let model of sortedModels) {
      const count = Math.ceil(need / model.power);
      const totalPower = count * model.power;

      // passt wenn >= Bedarf
      if (totalPower >= need) {
        suggestion1 = { model, count, totalPower };
        break;
      }
    }

    // Vorschlag 2: alternative Lösung mit weniger Platten, falls möglich
    // z. B. 1 starke Platte statt 2 schwächeren
    const maxPowerModel = sortedModels[sortedModels.length - 1];
    if (suggestion1 && maxPowerModel.power > suggestion1.model.power) {
      const count2 = Math.ceil(need / maxPowerModel.power);
      const total2 = count2 * maxPowerModel.power;

      // nur wenn total2 >= need und count2 < Vorschlag1.count
      if (total2 >= need && count2 < suggestion1.count) {
        suggestion2 = { model: maxPowerModel, count: count2, totalPower: total2 };
      }
    }

    // Max. empfohlene Platten
    const maxPlates = getMaxPlates(room.area);
    let warning = "";
    if (suggestion1 && suggestion1.count > maxPlates) {
      warning = `⚠️ Achtung: Maximal ${maxPlates} Platten empfohlen, benötigt wären ${suggestion1.count}.`;
    }

    // Textausgabe
    const lines = [];
    if (suggestion1) {
      lines.push(
        `Vorschlag 1: ${suggestion1.count} × ${suggestion1.model.name} (${suggestion1.model.power} W)\n→ ${suggestion1.count} × ${getReceiver(room.receiver)}, 1 × ${getThermostat(room.thermostat)}`
      );
    }

    if (suggestion2) {
      lines.push(
        `\nVorschlag 2: ${suggestion2.count} × ${suggestion2.model.name} (${suggestion2.model.power} W)\n→ ${suggestion2.count} × ${getReceiver(room.receiver)}, 1 × ${getThermostat(room.thermostat)}`
      );
    }

    return {
      need,
      text: lines.join("\n"),
      warning,
    };
  }

  // Helferfunktionen für Texte
  function getReceiver(code) {
    switch (code) {
      case "R01":
        return "IPP-R01 (Unterputz)";
      case "R02":
        return "IPP-R02 (Aufputz)";
      default:
        return "Empfänger";
    }
  }

  function getThermostat(code) {
    switch (code) {
      case "FT01":
        return "IPP-FT01 (digital)";
      case "BT010":
        return "BT010 (einfach)";
      case "BT003":
        return "BT003 (Funk)";
      default:
        return "Thermostat";
    }
  }

  // Raum hinzufügen / löschen
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

  // -------------------------------
  // Render-Bereich
  // -------------------------------
  return (
    <div className="container">
      {/* Header */}
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

              {/* Ergebnis rechts */}
              <div className="result">
                <strong>{room.name || `Raum ${index + 1}`}</strong>
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

        {/* Buttons */}
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