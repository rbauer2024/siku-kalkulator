import React, { useState } from "react";
import jsPDF from "jspdf";
import "./App.css";

export default function App() {
  // ------------------------------------------------------------
  // Sprache
  // ------------------------------------------------------------
  const [lang, setLang] = useState("de");

  const translations = {
    de: {
      appTitle: "Infrarot-Heizplatten Empfehlungs-Kalkulator",
      projectData: "Projekt-Daten",
      project: "Projekt",
      address: "Adresse",
      email: "E-Mail",

      rooms: "Räume",
      noRooms: "🔹 Noch keine Räume hinzugefügt.",
      addRoom: "+ Raum hinzufügen",
      pdf: "📄 PDF erstellen",

      roomName: "Raumname",
      area: "Fläche (m²)",
      height: "Deckenhöhe (m)",
      insulation: "Dämmstandard",
      windows: "Fensteranteil",
      thermostat: "Thermostat (pro Raum)",
      receiver: "Empfänger (pro Platte)",
      mounting: "Montageart",

      windowNormal: "Normal",
      windowHigh: "Hoch",

      // Dämmstandard
      insulVeryGood: "Sehr gut (20 W/m³)",
      insulGood: "Gut (25 W/m³)",
      insulAvg: "Durchschnittlich (30 W/m³)",
      insulOld: "Altbau (35 W/m³)",

      // Thermostate
      thFT01: "50815 - IPP-FT01 (digital)",
      thBT010: "50435 - BT010 (einfach)",

      // Empfänger
      recvUP: "Unterputz-Funkempfänger",
      recvAP: "Aufputz-Funkempfänger",

      // Montage
      mountWW: "Wand (WW)",
      mountDW: "Decke abgehängt (DW)",
      mountDC: "Decke direkt (DC)",

      demand: "Bedarf",
      option: "Vorschlag",
      warningMax: "⚠️ Achtung: Maximal",
      page: "Seite",
    },

    en: {
      appTitle: "Infrared Panel Recommendation Calculator",
      projectData: "Project data",
      project: "Project",
      address: "Address",
      email: "Email",

      rooms: "Rooms",
      noRooms: "🔹 No rooms added yet.",
      addRoom: "+ Add room",
      pdf: "📄 Create PDF",

      roomName: "Room name",
      area: "Area (m²)",
      height: "Ceiling height (m)",
      insulation: "Insulation level",
      windows: "Window share",
      thermostat: "Thermostat (per room)",
      receiver: "Receiver (per panel)",
      mounting: "Mounting type",

      windowNormal: "Normal",
      windowHigh: "High",

      insulVeryGood: "Very good (20 W/m³)",
      insulGood: "Good (25 W/m³)",
      insulAvg: "Average (30 W/m³)",
      insulOld: "Old building (35 W/m³)",

      thFT01: "50815 - IPP-FT01 (digital)",
      thBT010: "50435 - BT010 (simple)",

      recvUP: "in-wall wireless receiver",
      recvAP: "surface wireless receiver",

      mountWW: "Wall (WW)",
      mountDW: "Suspended ceiling (DW)",
      mountDC: "Direct ceiling (DC)",

      demand: "Demand",
      option: "Option",
      warningMax: "⚠️ Warning: Maximum",
      page: "Page",
    },

    da: {
      appTitle: "Infrarød Panel Anbefalingsberegner",
      projectData: "Projektdata",
      project: "Projekt",
      address: "Adresse",
      email: "E-mail",

      rooms: "Rum",
      noRooms: "🔹 Ingen rum tilføjet endnu.",
      addRoom: "+ Tilføj rum",
      pdf: "📄 Opret PDF",

      roomName: "Rumnavn",
      area: "Areal (m²)",
      height: "Loftshøjde (m)",
      insulation: "Isoleringsniveau",
      windows: "Vinduesandel",
      thermostat: "Termostat (pr. rum)",
      receiver: "Modtager (pr. panel)",
      mounting: "Monteringstype",

      windowNormal: "Normal",
      windowHigh: "Høj",

      insulVeryGood: "Meget god (20 W/m³)",
      insulGood: "God (25 W/m³)",
      insulAvg: "Gennemsnitlig (30 W/m³)",
      insulOld: "Gammel bygning (35 W/m³)",

      thFT01: "50815 - IPP-FT01 (digital)",
      thBT010: "50435 - BT010 (simpel)",

      recvUP: "indbygget trådløs modtager",
      recvAP: "påbygget trådløs modtager",

      mountWW: "Væg (WW)",
      mountDW: "Nedsænket loft (DW)",
      mountDC: "Direkte loft (DC)",

      demand: "Effektbehov",
      option: "Forslag",
      warningMax: "⚠️ Advarsel: Maksimalt",
      page: "Side",
    },

    hr: {
      appTitle: "Kalkulator preporuke infracrvenih ploča",
      projectData: "Podaci o projektu",
      project: "Projekt",
      address: "Adresa",
      email: "E-mail",

      rooms: "Prostorije",
      noRooms: "🔹 Još nema dodanih prostorija.",
      addRoom: "+ Dodaj prostoriju",
      pdf: "📄 Izradi PDF",

      roomName: "Naziv prostorije",
      area: "Površina (m²)",
      height: "Visina stropa (m)",
      insulation: "Razina izolacije",
      windows: "Udio prozora",
      thermostat: "Termostat (po prostoriji)",
      receiver: "Prijamnik (po ploči)",
      mounting: "Vrsta montaže",

      windowNormal: "Normalno",
      windowHigh: "Visoko",

      insulVeryGood: "Vrlo dobro (20 W/m³)",
      insulGood: "Dobro (25 W/m³)",
      insulAvg: "Prosječno (30 W/m³)",
      insulOld: "Stara gradnja (35 W/m³)",

      thFT01: "50815 - IPP-FT01 (digitalni)",
      thBT010: "50435 - BT010 (jednostavni)",

      recvUP: "ugradbeni bežični prijamnik",
      recvAP: "nadgradni bežični prijamnik",

      mountWW: "Zid (WW)",
      mountDW: "Spušteni strop (DW)",
      mountDC: "Direktni strop (DC)",

      demand: "Potreba",
      option: "Prijedlog",
      warningMax: "⚠️ Upozorenje: Maksimalno",
      page: "Stranica",
    },

    sl: {
      appTitle: "Kalkulator priporočil za infrardeče plošče",
      projectData: "Podatki o projektu",
      project: "Projekt",
      address: "Naslov",
      email: "E-pošta",

      rooms: "Prostori",
      noRooms: "🔹 Ni dodanih prostorov.",
      addRoom: "+ Dodaj prostor",
      pdf: "📄 Ustvari PDF",

      roomName: "Ime prostora",
      area: "Površina (m²)",
      height: "Višina stropa (m)",
      insulation: "Stopnja izolacije",
      windows: "Razmerje oken",
      thermostat: "Termostat (na prostor)",
      receiver: "Sprejemnik (na ploščo)",
      mounting: "Način montaže",

      windowNormal: "Normalno",
      windowHigh: "Visoko",

      insulVeryGood: "Zelo dobro (20 W/m³)",
      insulGood: "Dobro (25 W/m³)",
      insulAvg: "Povprečno (30 W/m³)",
      insulOld: "Stara gradnja (35 W/m³)",

      thFT01: "50815 - IPP-FT01 (digitalni)",
      thBT010: "50435 - BT010 (enostaven)",

      recvUP: "vgradni brezžični sprejemnik",
      recvAP: "nadometni brezžični sprejemnik",

      mountWW: "Stena (WW)",
      mountDW: "Spuščen strop (DW)",
      mountDC: "Neposredni strop (DC)",

      demand: "Potreba",
      option: "Predlog",
      warningMax: "⚠️ Opozorilo: Največ",
      page: "Stran",
    },
  };

  const t = (key) => translations[lang][key];

  // ------------------------------------------------------------
  // Dämmstandard
  // ------------------------------------------------------------
  const insulationOptions = [
    { key: "insulVeryGood", value: "20" },
    { key: "insulGood", value: "25" },
    { key: "insulAvg", value: "30" },
    { key: "insulOld", value: "35" },
  ];

  // ------------------------------------------------------------
  // Heizplatten-Modelle
  // ------------------------------------------------------------
  const plateOptions = {
    WW: [
      { name: "50448 - SIKU IPP 160 WW", power: 160 },
      { name: "50477 - SIKU IPP 330 WW", power: 330 },
      { name: "50423 - SIKU IPP 350 WW", power: 350 },
      { name: "50427 - SIKU IPP 580 WW", power: 580 },
      { name: "50429 - SIKU IPP 700 WW", power: 700 },
      { name: "50425 - SIKU IPP 900 WW", power: 900 },
    ],
    DW: [
      { name: "50424 - SIKU IPP 280 DW", power: 280 },
      { name: "50428 - SIKU IPP 450 DW", power: 450 },
      { name: "50430 - SIKU IPP 550 DW", power: 550 },
      { name: "50426 - SIKU IPP 700 DW", power: 700 },
    ],
    DC: [
      { name: "50792 - SIKU IPP 450 DC", power: 450 },
      { name: "50793 - SIKU IPP 700 DC", power: 700 },
      { name: "50794 - SIKU IPP 900 DC", power: 900 },
      { name: "50795 - SIKU IPP 1400 DC", power: 1400 },
    ],
  };

  // ------------------------------------------------------------
  // Zubehör-Texte
  // ------------------------------------------------------------
  const getReceiver = (code) =>
    code === "BT003"
      ? `50437 - BT003 (${t("recvAP")})`
      : `50648 - IPP-R01 (${t("recvUP")})`;

  const getThermostat = (code) =>
    code === "BT010" ? t("thBT010") : t("thFT01");

  // ------------------------------------------------------------
  // Maximalanzahl
  // ------------------------------------------------------------
  function getMaxPlates(area) {
    if (area <= 10) return 1;
    if (area <= 15) return 2;
    if (area <= 25) return 4;
    if (area <= 40) return 5;
    if (area <= 50) return 6;
    if (area <= 60) return 7;
    return 8;
  }

  // ------------------------------------------------------------
  // Raumberechnung
  // ------------------------------------------------------------
  function calculateRoom(room) {
    const factor = parseInt(room.insulation, 10);
    const volume = room.area * room.height;

    let windowFactor = room.windows === "hoch" ? 1.1 : 1.0;

    const lower = room.name.toLowerCase();
    if (lower.includes("bad") || lower.includes("wc") || lower.includes("dusche"))
      windowFactor *= 1.15;

    const need = Math.round(volume * factor * windowFactor);

    const models = plateOptions[room.mounting] || [];
    if (!models.length) return { need, text: "N/A" };

    const sorted = [...models].sort((a, b) => b.power - a.power);

    const combos = sorted.map((m) => ({
      model: m,
      count: Math.ceil(need / m.power),
      total: Math.ceil(need / m.power) * m.power,
    }));

    const valid = combos.filter((c) => c.total >= need);
    if (!valid.length) return { need, text: "N/A" };

    valid.sort((a, b) =>
      a.count === b.count ? a.total - b.total : a.count - b.count
    );

    const s1 = valid[0];
    const s2 = valid[1];

    const max = getMaxPlates(room.area);

    const warn =
      s1.count > max
        ? `${t("warningMax")} ${max}`
        : "";

    const extra1 =
      room.mounting === "DW"
        ? `, ${s1.count} × 50432 - IPP-DAS Deckenabhängeset`
        : "";

    const extra2 =
      room.mounting === "DW" && s2
        ? `, ${s2.count} × 50432 - IPP-DAS Deckenabhängeset`
        : "";

    const txt = [
      `${t("option")} 1: ${s1.count} × ${s1.model.name} (${s1.model.power} W)
-> ${s1.count} × ${getReceiver(room.receiver)}, 1 × ${getThermostat(room.thermostat)}${extra1}`,
    ];

    if (s2) {
      txt.push(
        `\n${t("option")} 2: ${s2.count} × ${s2.model.name} (${s2.model.power} W)
-> ${s2.count} × ${getReceiver(room.receiver)}, 1 × ${getThermostat(room.thermostat)}${extra2}`
      );
    }

    return { need, text: txt.join("\n"), warning: warn };
  }

  // ------------------------------------------------------------
  // Raumverwaltung
  // ------------------------------------------------------------
  const [rooms, setRooms] = useState([]);

  const addRoom = () =>
    setRooms([
      ...rooms,
      {
        name: `${t("roomName")} ${rooms.length + 1}`,
        area: 0,
        height: 2.5,
        insulation: "30",
        windows: "normal",
        thermostat: "FT01",
        receiver: "R01",
        mounting: "WW",
      },
    ]);

  // ------------------------------------------------------------
  // PDF-Export
  // ------------------------------------------------------------
  const exportPDF = () => {
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 15;
    let yPos = margin;

    const drawHeader = () => {
      pdf.addImage("/siku_logo.png", "PNG", pageWidth / 2 - 22, yPos, 44, 15);
      yPos += 23;

      pdf.setFontSize(16);
      pdf.setTextColor(37, 89, 161);
      pdf.text(t("appTitle"), pageWidth / 2, yPos, { align: "center" });

      yPos += 10;

      if (projectName) pdf.text(`${t("project")}: ${projectName}`, margin, yPos);
      if (projectAddress) pdf.text(`${t("address")}: ${projectAddress}`, margin, yPos + 5);
      if (projectEmail) pdf.text(`${t("email")}: ${projectEmail}`, margin, yPos + 10);
      yPos += 20;

      pdf.setDrawColor(37, 89, 161);
      pdf.setLineWidth(0.4);
      pdf.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 8;
    };

    const drawFooter = () => {
      const page = pdf.internal.getNumberOfPages();
      pdf.setFontSize(9);
      pdf.text(`${t("page")} ${page}`, pageWidth / 2, pageHeight - 6, {
        align: "center",
      });
    };

    drawHeader();

    rooms.forEach((room, idx) => {
      const r = calculateRoom(room);

      const blockText = [
        room.name,
        `${t("demand")}: ${r.need} W`,
        "",
        r.text,
        r.warning ? `\n${r.warning}` : "",
      ].join("\n");

      const split = pdf.splitTextToSize(blockText, pageWidth - 2 * margin);
      const blockHeight = split.length * 5 + 12;

      if (yPos + blockHeight > pageHeight - margin) {
        drawFooter();
        pdf.addPage();
        yPos = margin;
        drawHeader();
      }

      pdf.setFontSize(12);
      pdf.setTextColor(37, 89, 161);
      pdf.text(room.name, margin, yPos);
      yPos += 6;

      pdf.setFontSize(11);
      pdf.setTextColor(0, 0, 0);
      pdf.text(`${t("demand")}: ${r.need} W`, margin, yPos);
      yPos += 6;

      pdf.setFontSize(10);
      pdf.text(split, margin, yPos);
      yPos += split.length * 5;

      if (r.warning) {
        yPos += 3;
        pdf.setTextColor(200, 0, 0);
        pdf.text(r.warning, margin, yPos);
        pdf.setTextColor(0, 0, 0);
      }

      yPos += 12;
    });

    drawFooter();

    pdf.save("SIKU_Kalkulation.pdf");
  };

  // ------------------------------------------------------------
  // RENDERING
  // ------------------------------------------------------------
  return (
    <div className="container">
      {/* LANGUAGE SWITCH */}
      <div style={{ textAlign: "right", marginBottom: 10 }}>
        <select
          value={lang}
          onChange={(e) => setLang(e.target.value)}
          style={{ padding: 6 }}
        >
          <option value="de">Deutsch</option>
          <option value="en">English</option>
          <option value="da">Dansk</option>
          <option value="hr">Hrvatski</option>
          <option value="sl">Slovensko</option>
        </select>
      </div>

      <header>
        <img src="/siku_logo.png" alt="SIKU Logo" />
        <h1>{t("appTitle")}</h1>
      </header>

      <div className="card no-print">
        <h2>{t("projectData")}</h2>
        <input
          type="text"
          placeholder={t("project")}
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
        />
        <input
          type="text"
          placeholder={t("address")}
          value={projectAddress}
          onChange={(e) => setProjectAddress(e.target.value)}
        />
        <input
          type="email"
          placeholder={t("email")}
          value={projectEmail}
          onChange={(e) => setProjectEmail(e.target.value)}
        />
      </div>

      <div className="card">
        <h2>{t("rooms")}</h2>

        {rooms.length === 0 && <p>{t("noRooms")}</p>}

        {rooms.map((room, index) => {
          const r = calculateRoom(room);
          return (
            <div key={index} className="room">
              <button
                className="delete-room-btn no-print"
                onClick={() =>
                  setRooms(rooms.filter((_, i) => i !== index))
                }
              >
                ❌
              </button>

              <div className="inputs no-print">
                <label>{t("roomName")}</label>
                <input
                  type="text"
                  value={room.name}
                  onChange={(e) => {
                    const n = [...rooms];
                    n[index].name = e.target.value;
                    setRooms(n);
                  }}
                />

                <label>{t("area")}</label>
                <input
                  type="number"
                  value={room.area}
                  onChange={(e) => {
                    const n = [...rooms];
                    n[index].area = parseFloat(e.target.value || 0);
                    setRooms(n);
                  }}
                />

                <label>{t("height")}</label>
                <input
                  type="number"
                  step="0.1"
                  value={room.height}
                  onChange={(e) => {
                    const n = [...rooms];
                    n[index].height = parseFloat(e.target.value || 0);
                    setRooms(n);
                  }}
                />

                <label>{t("insulation")}</label>
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
                      {t(o.key)}
                    </option>
                  ))}
                </select>

                <label>{t("windows")}</label>
                <select
                  value={room.windows}
                  onChange={(e) => {
                    const n = [...rooms];
                    n[index].windows = e.target.value;
                    setRooms(n);
                  }}
                >
                  <option value="normal">{t("windowNormal")}</option>
                  <option value="hoch">{t("windowHigh")}</option>
                </select>

                <label>{t("thermostat")}</label>
                <select
                  value={room.thermostat}
                  onChange={(e) => {
                    const n = [...rooms];
                    n[index].thermostat = e.target.value;
                    setRooms(n);
                  }}
                >
                  <option value="FT01">{t("thFT01")}</option>
                  <option value="BT010">{t("thBT010")}</option>
                </select>

                <label>{t("receiver")}</label>
                <select
                  value={room.receiver}
                  onChange={(e) => {
                    const n = [...rooms];
                    n[index].receiver = e.target.value;
                    setRooms(n);
                  }}
                >
                  <option value="R01">{`50648 - IPP-R01 (${t("recvUP")})`}</option>
                  <option value="BT003">{`50437 - BT003 (${t("recvAP")})`}</option>
                </select>

                <label>{t("mounting")}</label>
                <select
                  value={room.mounting}
                  onChange={(e) => {
                    const n = [...rooms];
                    n[index].mounting = e.target.value;
                    setRooms(n);
                  }}
                >
                  <option value="WW">{t("mountWW")}</option>
                  <option value="DW">{t("mountDW")}</option>
                  <option value="DC">{t("mountDC")}</option>
                </select>
              </div>

              <div className="result">
                <strong>{room.name}</strong>
                <p>
                  <strong>{t("demand")}:</strong> {r.need} W
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
          {t("addRoom")}
        </button>
        <button onClick={exportPDF} className="pdf-btn">
          {t("pdf")}
        </button>
      </div>
    </div>
  );
}