import React, { useState } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import "./App.css";

// --- Alle verfügbaren Plattenmodelle ---
const plates = {
  WW: [
    { model: "SIKU IPP 160 WW", power: 160 },
    { model: "SIKU IPP 330 WW", power: 330 },
    { model: "SIKU IPP 350 WW", power: 350 },
    { model: "SIKU IPP 580 WW", power: 580 },
    { model: "SIKU IPP 700 WW", power: 700 },
    { model: "SIKU IPP 900 WW", power: 900 },
  ],
  DW: [
    { model: "SIKU IPP 280 DW", power: 280 },
    { model: "SIKU IPP 450 DW", power: 450 },
    { model: "SIKU IPP 550 DW", power: 550 },
    { model: "SIKU IPP 700 DW", power: 700 },
  ],
  DC: [
    { model: "SIKU IPP 450 DC", power: 450 },
    { model: "SIKU IPP 700 DC", power: 700 },
    { model: "SIKU IPP 900 DC", power: 900 },
    { model: "SIKU IPP 1400 DC", power: 1400 },
  ],
};

// --- Maximale Plattenanzahl nach Raumgröße ---
const maxPlatesForArea = (area) => {
  if (area <= 10) return 1;
  if (area <= 20) return 2;
  if (area <= 25) return 3;
  if (area <= 40) return 4;
  if (area <= 50) return 5;
  if (area <= 60) return 6;
  return Math.ceil(area / 10); // ab 60 m² linear weiter
};

// --- Funktion zur Berechnung der Vorschläge ---
const calculateSuggestions = (wattNeed, type, area) => {
  const available = plates[type];
  if (!available) return [];

  let suggestions = [];

  // Vorschlag 1: kleinste Platten, so knapp wie möglich über Bedarf
  let bestOption = null;
  for (let plate of available) {
    let count = Math.ceil(wattNeed / plate.power);
    let total = count * plate.power;
    if (!bestOption || total < bestOption.total) {
      bestOption = { count, plate, total };
    }
  }
  if (bestOption) suggestions.push(bestOption);

  // Vorschlag 2: möglichst wenig Platten, auch wenn größer
  let biggestPlate = available[available.length - 1];
  let count2 = Math.ceil(wattNeed / biggestPlate.power);
  let total2 = count2 * biggestPlate.power;
  let secondOption = { count: count2, plate: biggestPlate, total: total2 };

  if (
    secondOption.plate.model !== bestOption.plate.model ||
    secondOption.count !== bestOption.count
  ) {
    suggestions.push(secondOption);
  }

  // Maximal empfohlene Plattenanzahl prüfen
  const maxAllowed = maxPlatesForArea(area);
  suggestions = suggestions.map((s) => {
    if (s.count > maxAllowed) {
      return {
        ...s,
        warning: `⚠️ Achtung: Maximal ${maxAllowed} Platten empfohlen, benötigt wären ${s.count}.`,
      };
    }
    return s;
  });

  return suggestions.slice(0, 2); // max. 2 Vorschläge
};

function App() {
  const [rooms, setRooms] = useState([
    {
      name: "Wohnzimmer",
      area: 20,
      height: 2.5,
      insulation: 30,
      window: "Normal",
      usage: "Dauerbetrieb",
      thermostat: "IPP-FT01 (digital)",
      receiver: "IPP-R01 (Unterputz)",
      type: "DW",
    },
  ]);
  const [project, setProject] = useState({
    name: "Testprojekt",
    address: "Sandstrasse",
    email: "office@siku.at",
  });

  const handleRoomChange = (index, field, value) => {
    const newRooms = [...rooms];
    newRooms[index][field] = value;
    setRooms(newRooms);
  };

  const addRoom = () => {
    setRooms([
      ...rooms,
      {
        name: "Neuer Raum",
        area: 10,
        height: 2.5,
        insulation: 30,
        window: "Normal",
        usage: "Dauerbetrieb",
        thermostat: "IPP-FT01 (digital)",
        receiver: "IPP-R01 (Unterputz)",
        type: "WW",
      },
    ]);
  };

  const deleteRoom = (index) => {
    setRooms(rooms.filter((_, i) => i !== index));
  };

  const generatePDF = () => {
    const doc = new jsPDF("p", "mm", "a4");
    doc.setFont("helvetica", "normal");

    // Logo aus public laden
    doc.addImage("/siku_logo.svg", "SVG", 15, 10, 40, 15);

    doc.setFontSize(18);
    doc.text("Infrarot-Heizplatten Kalkulator", 60, 20);

    doc.setFontSize(12);
    doc.text(`Projekt: ${project.name}`, 15, 40);
    doc.text(`Adresse: ${project.address}`, 15, 46);
    doc.text(`E-Mail: ${project.email}`, 15, 52);

    let y = 70;
    rooms.forEach((room) => {
      const wattNeed = Math.round(room.area * room.height * room.insulation);
      const suggestions = calculateSuggestions(wattNeed, room.type, room.area);

      doc.setFont("helvetica", "bold");
      doc.text(room.name, 15, y);
      y += 6;

      doc.setFont("helvetica", "normal");
      doc.text(`Bedarf: ${wattNeed} W`, 15, y);
      y += 6;

      suggestions.forEach((s, idx) => {
        doc.text(
          `Vorschlag ${idx + 1}: ${s.count} × ${s.plate.model} (${s.plate.power} W)`,
          15,
          y
        );
        y += 6;
        if (s.warning) {
          doc.setTextColor(200, 0, 0);
          doc.text(s.warning, 15, y);
          doc.setTextColor(0, 0, 0);
          y += 6;
        }
      });

      y += 10;
    });

    doc.save("heizplatten_kalkulation.pdf");
  };

  return (
    <div className="container">
      <header>
        <img src="/siku_logo.svg" alt="SIKU Logo" />
        <h1>Infrarot-Heizplatten Kalkulator</h1>
      </header>

      <div className="card">
        <h2>Projekt-Daten (optional)</h2>
        <input
          type="text"
          placeholder="Projektname"
          value={project.name}
          onChange={(e) => setProject({ ...project, name: e.target.value })}
        />
        <input
          type="text"
          placeholder="Adresse"
          value={project.address}
          onChange={(e) => setProject({ ...project, address: e.target.value })}
        />
        <input
          type="email"
          placeholder="E-Mail"
          value={project.email}
          onChange={(e) => setProject({ ...project, email: e.target.value })}
        />
      </div>

      <h2>Räume</h2>
      {rooms.map((room, index) => {
        const wattNeed = Math.round(room.area * room.height * room.insulation);
        const suggestions = calculateSuggestions(wattNeed, room.type, room.area);

        return (
          <div className="room" key={index}>
            <div className="inputs">
              <label>Raumname</label>
              <input
                type="text"
                value={room.name}
                onChange={(e) =>
                  handleRoomChange(index, "name", e.target.value)
                }
              />
              <label>Fläche (m²)</label>
              <input
                type="number"
                value={room.area}
                onChange={(e) =>
                  handleRoomChange(index, "area", parseFloat(e.target.value))
                }
              />
              <label>Deckenhöhe (m)</label>
              <input
                type="number"
                value={room.height}
                onChange={(e) =>
                  handleRoomChange(index, "height", parseFloat(e.target.value))
                }
              />
              <label>Dämmstandard</label>
              <select
                value={room.insulation}
                onChange={(e) =>
                  handleRoomChange(index, "insulation", parseFloat(e.target.value))
                }
              >
                <option value={20}>Sehr gut (20 W/m³)</option>
                <option value={30}>Durchschnittlich (30 W/m³)</option>
                <option value={40}>Schlecht (40 W/m³)</option>
              </select>
              <label>Fensteranteil</label>
              <select
                value={room.window}
                onChange={(e) => handleRoomChange(index, "window", e.target.value)}
              >
                <option>Normal</option>
                <option>Groß</option>
              </select>
              <label>Nutzungsart</label>
              <select
                value={room.usage}
                onChange={(e) => handleRoomChange(index, "usage", e.target.value)}
              >
                <option>Dauerbetrieb</option>
                <option>Gelegentlich</option>
              </select>
              <label>Thermostat (pro Raum)</label>
              <select
                value={room.thermostat}
                onChange={(e) =>
                  handleRoomChange(index, "thermostat", e.target.value)
                }
              >
                <option>IPP-FT01 (digital)</option>
                <option>IPP-FT02 (analog)</option>
              </select>
              <label>Empfänger (pro Platte)</label>
              <select
                value={room.receiver}
                onChange={(e) =>
                  handleRoomChange(index, "receiver", e.target.value)
                }
              >
                <option>IPP-R01 (Unterputz)</option>
                <option>IPP-R02 (Aufputz)</option>
              </select>
              <label>Montageart</label>
              <select
                value={room.type}
                onChange={(e) => handleRoomChange(index, "type", e.target.value)}
              >
                <option value="WW">Wand (WW)</option>
                <option value="DW">Decke abgehängt (DW)</option>
                <option value="DC">Decke direkt (DC)</option>
              </select>
            </div>

            <div className="result">
              <strong>{room.name}</strong>
              Bedarf: {wattNeed} W
              {suggestions.map((s, idx) => (
                <div key={idx} className="suggestion">
                  <strong>Vorschlag {idx + 1}:</strong> {s.count} × {s.plate.model} (
                  {s.plate.power} W)
                  {s.warning && (
                    <div className="warning">{s.warning}</div>
                  )}
                </div>
              ))}
            </div>

            <button className="delete-room-btn" onClick={() => deleteRoom(index)}>
              X
            </button>
          </div>
        );
      })}

      <button className="add-room-btn" onClick={addRoom}>
        + Raum hinzufügen
      </button>
      <button className="pdf-btn" onClick={generatePDF}>
        PDF erstellen
      </button>
    </div>
  );
}

export default App;