import React, { useState } from "react";
import jsPDF from "jspdf";
import "./App.css";

export default function App() {
  const [projectName, setProjectName] = useState("");
  const [projectAddress, setProjectAddress] = useState("");
  const [projectEmail, setProjectEmail] = useState("");
  const [rooms, setRooms] = useState([]);

  /* ----------------------------------
     Dämmstandard & Geräteoptionen
  ---------------------------------- */
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

  /* ----------------------------------
     Logik: Max. Plattenzahl je Fläche
  ---------------------------------- */
  function getMaxPlates(area) {
    if (area <= 10) return 1;
    if (area <= 15) return 2;
    if (area <= 25) return 4;
    if (area <= 40) return 5;
    if (area <= 50) return 6;
    if (area <= 60) return 7;
    return 8;
  }

  const getReceiver = (code) =>
    code === "R02" ? "IPP-R02 (Aufputz)" : "IPP-R01 (Unterputz)";
  const getThermostat = (code) => {
    if (code === "BT010") return "BT010 (einfach)";
    if (code === "BT003") return "BT003 (Funk)";
    return "IPP-FT01 (digital)";
  };

  /* ----------------------------------
     Berechnung pro Raum
  ---------------------------------- */
  function calculateRoom(room) {
    const factor = parseInt(room.insulation, 10);
    const volume = room.area * room.height;
    let windowFactor = room.windows === "hoch" ? 1.1 : 1.0;
    const name = room.name.toLowerCase();
    if (name.includes("bad") || name.includes("wc") || name.includes("dusche"))
      windowFactor *= 1.15;

    const need = Math.round(volume * factor * windowFactor);
    const models = plateOptions[room.mounting] || [];
    if (!models.length) return { need, text: "Keine Modelle verfügbar" };

    const sorted = [...models].sort((a, b) => b.power - a.power);
    const combos = sorted.map((m) => ({
      model: m,
      count: Math.ceil(need / m.power),
      total: Math.ceil(need / m.power) * m.power,
    }));

    const valid = combos.filter((c) => c.total >= need);
    if (!valid.length) return { need, text: "Keine passende Kombination" };

    valid.sort((a, b) =>
      a.count === b.count ? a.total - b.total : a.count - b.count
    );

    const s1 = valid[0];
    const s2 = valid.length > 1 ? valid[1] : null;
    const max = getMaxPlates(room.area);

    const warn =
      s1.count > max
        ? `⚠️ Achtung: Maximal ${max} Platten empfohlen, benötigt wären ${s1.count}.`
        : "";

    const txt = [
      `Vorschlag 1: ${s1.count} × ${s1.model.name} (${s1.model.power} W)
-> ${s1.count} × ${getReceiver(room.receiver)}, 1 × ${getThermostat(room.thermostat)}`,
    ];
    if (s2)
      txt.push(
        `\nVorschlag 2: ${s2.count} × ${s2.model.name} (${s2.model.power} W)
-> ${s2.count} × ${getReceiver(room.receiver)}, 1 × ${getThermostat(room.thermostat)}`
      );

    return { need, text: txt.join("\n"), warning: warn };
  }

  /* ----------------------------------
     Raumverwaltung
  ---------------------------------- */
  const addRoom = () =>
    setRooms([
      ...rooms,
      {
        name: `Raum ${rooms.length + 1}`,
        area: 0,
        height: 2.5,
        insulation: "30",
        windows: "normal",
        thermostat: "FT01",
        receiver: "R01",
        mounting: "WW",
      },
    ]);

  /* ----------------------------------
     PDF-Export
  ---------------------------------- */
  const exportPDF = async () => {
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 15;
    let yPos = margin;

    const header = () => {
      // Logo
      pdf.addImage("/siku_logo.png", "PNG", pageWidth / 2 - 22, yPos, 44, 15);

      // Titel
      yPos += 22;
      pdf.setFontSize(16);
      pdf.setTextColor(37, 89, 161);
      pdf.text("Infrarot-Heizplatten Kalkulator", pageWidth / 2, yPos, {
        align: "center",
      });

      // Projektinfos
      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);
      yPos += 8;
      if (projectName)
        pdf.text(`Projekt: ${projectName}`, margin, yPos + 4);
      if (projectAddress)
        pdf.text(`Adresse: ${projectAddress}`, margin, yPos + 9);
      if (projectEmail)
        pdf.text(`E-Mail: ${projectEmail}`, margin, yPos + 14);
      yPos += 25;

      // Linie
      pdf.setDrawColor(37, 89, 161);
      pdf.setLineWidth(0.4);
      pdf.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 10;
    };

    header();

    pdf.setFont("Helvetica", "");
    pdf.setFontSize(11);

    rooms.forEach((room, index) => {
      const r = calculateRoom(room);
      const lines = [
        `${room.name}`,
        `Bedarf: ${r.need} W`,
        "",
        r.text,
        r.warning ? r.warning : "",
      ];
      const block = pdf.splitTextToSize(lines.join("\n"), pageWidth - 2 * margin);
      const blockHeight = block.length * 5 + 8;

      if (yPos + blockHeight > pageHeight - margin) {
        pdf.text(
          `Seite ${pdf.internal.getNumberOfPages()}`,
          pageWidth / 2,
          pageHeight - 5,
          { align: "center" }
        );
        pdf.addPage();
        yPos = margin;
        header();
      }

      pdf.setFontSize(12);
      pdf.setTextColor(37, 89, 161);
      pdf.text(room.name, margin, yPos);
      yPos += 6;

      pdf.setFontSize(11);
      pdf.setTextColor(0, 0, 0);
      pdf.text(`Bedarf: ${r.need} W`, margin, yPos);
      yPos += 6;

      pdf.setFontSize(10);
      pdf.text(r.text, margin, yPos);
      if (r.warning) {
        yPos += 10;
        pdf.setTextColor(200, 0, 0);
        pdf.text(r.warning, margin, yPos);
        pdf.setTextColor(0, 0, 0);
      }

      yPos += 15;
      if (index < rooms.length - 1) {
        pdf.setDrawColor(200);
        pdf.line(margin, yPos - 4, pageWidth - margin, yPos - 4);
      }
    });

    pdf.text(
      `Seite ${pdf.internal.getNumberOfPages()}`,
      pageWidth / 2,
      pageHeight - 5,
      { align: "center" }
    );

    const filename = projectName
      ? `SIKU_${projectName.replace(/\s+/g, "_")}.pdf`
      : "SIKU_Kalkulation.pdf";
    pdf.save(filename);
  };

  /* ----------------------------------
     Rendering
  ---------------------------------- */
  return (
    <div className="container">
      <header>
        <img src="/siku_logo.png" alt="SIKU Logo" />
        <h1>Infrarot-Heizplatten Kalkulator</h1>
      </header>

      <div className="card no-print">
        <h2>Projekt-Daten</h2>
        <input
          type="text"
          placeholder="Projektname"
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

        {rooms.length === 0 && (
          <p>🔹 Noch keine Räume hinzugefügt.</p>
        )}

        {rooms.map((room, index) => {
          const r = calculateRoom(room);
          return (
            <div key={index} className="room">
              <button
                type="button"
                className="delete-room-btn no-print"
                onClick={() =>
                  setRooms(rooms.filter((_, i) => i !== index))
                }
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
                    n[index].name = e.target.value;
                    setRooms(n);
                  }}
                />
                <label>Fläche (m²)</label>
                <input
                  type="number"
                  value={room.area}
                  onChange={(e) => {
                    const n = [...rooms];
                    n[index].area = parseFloat(e.target.value);
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
                    n[index].height = parseFloat(e.target.value);
                    setRooms(n);
                  }}
                />
                <label>Dämmstandard</label>
                <select
                  value={room.insulation}
                  onChange={(e) => {
                    const n = [...rooms];
                    n[index].insulation = e.target.value;
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
                    n[index].windows = e.target.value;
                    setRooms(n);
                  }}
                >
                  <option value="normal">Normal</option>
                  <option value="hoch">Hoch</option>
                </select>
                <label>Thermostat (pro Raum)</label>
                <select
                  value={room.thermostat}
                  onChange={(e) => {
                    const n = [...rooms];
                    n[index].thermostat = e.target.value;
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
                    n[index].receiver = e.target.value;
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
                    n[index].mounting = e.target.value;
                    setRooms(n);
                  }}
                >
                  <option value="WW">Wand (WW)</option>
                  <option value="DW">Decke abgehängt (DW)</option>
                  <option value="DC">Decke direkt (DC)</option>
                </select>
              </div>

              <div className="result">
                <strong>{room.name}</strong>
                <p>
                  <strong>Bedarf:</strong> <strong>{r.need} W</strong>
                </p>
                <pre>{r.text}</pre>
                {r.warning && (
                  <p style={{ color: "red", fontWeight: "bold" }}>
                    {r.warning}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="no-print">
        <button onClick={addRoom} className="add-room-btn">
          + Raum hinzufügen
        </button>
        <button onClick={exportPDF} className="pdf-btn">
          📄 PDF erstellen
        </button>
      </div>
    </div>
  );
}