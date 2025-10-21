import React, { useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "./App.css";

export default function App() {
  const [projectName, setProjectName] = useState("");
  const [projectAddress, setProjectAddress] = useState("");
  const [projectEmail, setProjectEmail] = useState("");
  const [rooms, setRooms] = useState([]);

  // Dämmstandard-Auswahl
  const insulationOptions = [
    { label: "Sehr gut (20 W/m³)", value: "20" },
    { label: "Gut (25 W/m³)", value: "25" },
    { label: "Durchschnittlich (30 W/m³)", value: "30" },
    { label: "Altbau (35 W/m³)", value: "35" },
  ];

  // Heizplatten je Montageart
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

  const getReceiver = (code) =>
    code === "R02" ? "IPP-R02 (Aufputz)" : "IPP-R01 (Unterputz)";
  const getThermostat = (code) => {
    if (code === "BT010") return "BT010 (einfach)";
    if (code === "BT003") return "BT003 (Funk)";
    return "IPP-FT01 (digital)";
  };

  // Heizbedarf + Vorschläge berechnen
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
→ ${s1.count} × ${getReceiver(room.receiver)}, 1 × ${getThermostat(room.thermostat)}`,
    ];
    if (s2)
      txt.push(
        `\nVorschlag 2: ${s2.count} × ${s2.model.name} (${s2.model.power} W)
→ ${s2.count} × ${getReceiver(room.receiver)}, 1 × ${getThermostat(room.thermostat)}`
      );

    return { need, text: txt.join("\n"), warning: warn };
  }

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

  /* ---------------- PDF-Export (Version 2.0) ---------------- */
  const exportPDF = async () => {
    const node = document.getElementById("pdfPage");

    const canvas = await html2canvas(node, {
      scale: 2,
      backgroundColor: "#ffffff",
      scrollY: 0,
      windowWidth: document.documentElement.clientWidth,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 10; // mm
    const usableWidth = pageWidth - margin * 2;
    const imgHeight = (canvas.height * usableWidth) / canvas.width;
    const usableHeight = pageHeight - margin * 2;
    const totalPages =
      imgHeight <= usableHeight
        ? 1
        : 1 + Math.ceil((imgHeight - usableHeight) / usableHeight);

    // Seite 1
    pdf.addImage(imgData, "PNG", margin, margin, usableWidth, imgHeight);
    pdf.setFontSize(9);
    pdf.text(`Seite 1 von ${totalPages}`, pageWidth / 2, pageHeight - 5, {
      align: "center",
    });

    // weitere Seiten
    let printedHeight = usableHeight;
    for (let page = 2; page <= totalPages; page++) {
      pdf.addPage();
      const y = margin - printedHeight;
      pdf.addImage(imgData, "PNG", margin, y, usableWidth, imgHeight);
      pdf.setFontSize(9);
      pdf.text(`Seite ${page} von ${totalPages}`, pageWidth / 2, pageHeight - 5, {
        align: "center",
      });
      printedHeight += usableHeight;
    }

    const filename = projectName
      ? `SIKU_${projectName.replace(/\s+/g, "_")}.pdf`
      : "SIKU_Kalkulation.pdf";
    pdf.save(filename);
  };

  return (
    <div className="container">
      <div id="pdfPage" className="pdf-wrapper">
        <header className="pdf-header">
          <div className="pdf-header-left">
            <img src="/siku_logo.svg" alt="SIKU Logo" />
          </div>
          <div className="pdf-header-right">
            <h1>Infrarot-Heizplatten Kalkulator</h1>
            {projectName && <p><strong>Projekt:</strong> {projectName}</p>}
            {projectAddress && <p><strong>Adresse:</strong> {projectAddress}</p>}
            {projectEmail && <p><strong>E-Mail:</strong> {projectEmail}</p>}
          </div>
        </header>

        <hr className="header-line" />

        <div className="project-form no-print">
          <label>Projektname</label>
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
          />
          <label>Adresse</label>
          <input
            type="text"
            value={projectAddress}
            onChange={(e) => setProjectAddress(e.target.value)}
          />
          <label>E-Mail</label>
          <input
            type="email"
            value={projectEmail}
            onChange={(e) => setProjectEmail(e.target.value)}
          />
        </div>

        <div className="card">
          <h2>Räume</h2>
          {rooms.length === 0 && (
            <p className="placeholder">Noch kein Raum hinzugefügt.</p>
          )}
          {rooms.map((room, i) => {
            const r = calculateRoom(room);
            return (
              <div key={i} className="room">
                <button
                  type="button"
                  className="delete-room-btn no-print"
                  onClick={() =>
                    setRooms(rooms.filter((_, index) => index !== i))
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