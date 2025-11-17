import React, { useState } from "react";
import jsPDF from "jspdf";
import "./App.css";

/* ------------------------------------------------------------
   SPRACHEN & ÜBERSETZUNGEN
------------------------------------------------------------ */
const LANGS = [
  { code: "de", label: "DE" },
  { code: "en", label: "EN" },
  { code: "da", label: "DA" },
  { code: "hr", label: "HR" },
  { code: "sl", label: "SL" },
];

const translations = {
  de: {
    appTitle: "Infrarot-Heizplatten Empfehlungs-Kalkulator",
    projectData: "Projekt-Daten",
    roomsTitle: "Räume",
    projectNamePlaceholder: "Projektname / Kunde",
    addressPlaceholder: "Adresse",
    emailPlaceholder: "E-Mail",
    noRooms: "🔹 Noch keine Räume hinzugefügt.",
    roomName: "Raumname",
    area: "Fläche (m²)",
    height: "Deckenhöhe (m)",
    insulation: "Dämmstandard",
    windowShare: "Fensteranteil",
    windowNormal: "Normal",
    windowHigh: "Hoch",
    thermostat: "Thermostat (pro Raum)",
    receiverLabel: "Empfänger (pro Platte)",
    mounting: "Montageart",
    mountWW: "Wand (WW)",
    mountDW: "Decke abgehängt (DW)",
    mountDC: "Decke direkt (DC)",
    addRoomBtn: "+ Raum hinzufügen",
    pdfBtn: "📄 PDF erstellen",
    demandLabel: "Bedarf",
    projectLabel: "Projekt:",
    addressLabel: "Adresse:",
    emailLabel: "E-Mail:",
    pageLabel: "Seite",
    suggestion1: "Vorschlag 1",
    suggestion2: "Vorschlag 2",
    thermoDigital: "(digital)",
    thermoBasic: "(einfach)",
  },

  en: {
    appTitle: "Infrared Panel Recommendation Calculator",
    projectData: "Project data",
    roomsTitle: "Rooms",
    projectNamePlaceholder: "Project / customer",
    addressPlaceholder: "Address",
    emailPlaceholder: "E-mail",
    noRooms: "🔹 No rooms added yet.",
    roomName: "Room name",
    area: "Area (m²)",
    height: "Ceiling height (m)",
    insulation: "Insulation level",
    windowShare: "Window share",
    windowNormal: "Normal",
    windowHigh: "High",
    thermostat: "Thermostat (per room)",
    receiverLabel: "Receiver (per panel)",
    mounting: "Mounting type",
    mountWW: "Wall (WW)",
    mountDW: "Suspended ceiling (DW)",
    mountDC: "Direct ceiling (DC)",
    addRoomBtn: "+ Add room",
    pdfBtn: "📄 Create PDF",
    demandLabel: "Demand",
    projectLabel: "Project:",
    addressLabel: "Address:",
    emailLabel: "E-mail:",
    pageLabel: "Page",
    suggestion1: "Option 1",
    suggestion2: "Option 2",
    thermoDigital: "(digital)",
    thermoBasic: "(basic)",
  },

  da: {
    appTitle: "Infrarød panel beregningsværktøj",
    projectData: "Projektdata",
    roomsTitle: "Rum",
    projectNamePlaceholder: "Projekt / kunde",
    addressPlaceholder: "Adresse",
    emailPlaceholder: "E-mail",
    noRooms: "🔹 Ingen rum tilføjet endnu.",
    roomName: "Rumnavn",
    area: "Areal (m²)",
    height: "Loftshøjde (m)",
    insulation: "Isoleringsniveau",
    windowShare: "Vinduesandel",
    windowNormal: "Normal",
    windowHigh: "Stor",
    thermostat: "Termostat (pr. rum)",
    receiverLabel: "Modtager (pr. panel)",
    mounting: "Monteringstype",
    mountWW: "Væg (WW)",
    mountDW: "Nedsænket loft (DW)",
    mountDC: "Direkte i loft (DC)",
    addRoomBtn: "+ Tilføj rum",
    pdfBtn: "📄 Opret PDF",
    demandLabel: "Varmebehov",
    projectLabel: "Projekt:",
    addressLabel: "Adresse:",
    emailLabel: "E-mail:",
    pageLabel: "Side",
    suggestion1: "Forslag 1",
    suggestion2: "Forslag 2",
    thermoDigital: "(digital)",
    thermoBasic: "(simpel)",
  },

  hr: {
    appTitle: "Kalkulator preporuke infracrvenih panela",
    projectData: "Podaci o projektu",
    roomsTitle: "Prostorije",
    projectNamePlaceholder: "Projekt / kupac",
    addressPlaceholder: "Adresa",
    emailPlaceholder: "E-mail",
    noRooms: "🔹 Još nema dodanih prostorija.",
    roomName: "Naziv prostorije",
    area: "Površina (m²)",
    height: "Visina stropa (m)",
    insulation: "Razina izolacije",
    windowShare: "Udio prozora",
    windowNormal: "Normalan",
    windowHigh: "Velik",
    thermostat: "Termostat (po prostoriji)",
    receiverLabel: "Prijamnik (po panelu)",
    mounting: "Način montaže",
    mountWW: "Zid (WW)",
    mountDW: "Spušteni strop (DW)",
    mountDC: "Direktno na strop (DC)",
    addRoomBtn: "+ Dodaj prostoriju",
    pdfBtn: "📄 Izradi PDF",
    demandLabel: "Potrebna snaga",
    projectLabel: "Projekt:",
    addressLabel: "Adresa:",
    emailLabel: "E-mail:",
    pageLabel: "Stranica",
    suggestion1: "Prijedlog 1",
    suggestion2: "Prijedlog 2",
    thermoDigital: "(digitalni)",
    thermoBasic: "(osnovni)",
  },

  sl: {
    appTitle: "Kalkulator priporočil za infrardeče plošče",
    projectData: "Podatki o projektu",
    roomsTitle: "Prostori",
    projectNamePlaceholder: "Projekt / stranka",
    addressPlaceholder: "Naslov",
    emailPlaceholder: "E-pošta",
    noRooms: "🔹 Še ni dodanih prostorov.",
    roomName: "Ime prostora",
    area: "Površina (m²)",
    height: "Višina stropa (m)",
    insulation: "Stopnja izolacije",
    windowShare: "Delež oken",
    windowNormal: "Običajen",
    windowHigh: "Velik",
    thermostat: "Termostat (na prostor)",
    receiverLabel: "Sprejemnik (na ploščo)",
    mounting: "Način montaže",
    mountWW: "Stena (WW)",
    mountDW: "Spuščen strop (DW)",
    mountDC: "Neposredno na strop (DC)",
    addRoomBtn: "+ Dodaj prostor",
    pdfBtn: "📄 Ustvari PDF",
    demandLabel: "Potrebna moč",
    projectLabel: "Projekt:",
    addressLabel: "Naslov:",
    emailLabel: "E-pošta:",
    pageLabel: "Stran",
    suggestion1: "Predlog 1",
    suggestion2: "Predlog 2",
    thermoDigital: "(digitalno)",
    thermoBasic: "(osnovno)",
  },
};

/* WARN-TEXTE MEHRSPRACHIG */
function getWarningText(lang, max, count) {
  switch (lang) {
    case "en":
      return `⚠️ Attention: Maximum ${max} panels recommended, calculation would require ${count}.`;
    case "da":
      return `⚠️ Bemærk: Maksimalt ${max} paneler anbefales, beregningen kræver ${count}.`;
    case "hr":
      return `⚠️ Pažnja: Preporuča se najviše ${max} panela, izračun traži ${count}.`;
    case "sl":
      return `⚠️ Pozor: Priporočeno največ ${max} plošč, izračun potrebuje ${count}.`;
    default:
      return `⚠️ Achtung: Maximal ${max} Platten empfohlen, benötigt wären ${count}.`;
  }
}

export default function App() {
  const [lang, setLang] = useState("de");
  const [projectName, setProjectName] = useState("");
  const [projectAddress, setProjectAddress] = useState("");
  const [projectEmail, setProjectEmail] = useState("");
  const [rooms, setRooms] = useState([]);

  const t = (key) =>
    (translations[lang] && translations[lang][key]) ||
    translations["de"][key] ||
    key;
  /* ------------------------------------------------------------
     Heizplatten-Optionen (nicht übersetzen!)
  ------------------------------------------------------------ */
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

  /* ------------------------------------------------------------
     Maximal empfohlene Plattenzahl je Raumgröße
  ------------------------------------------------------------ */
  function getMaxPlates(area) {
    if (area <= 10) return 1;
    if (area <= 15) return 2;
    if (area <= 25) return 4;
    if (area <= 40) return 5;
    if (area <= 50) return 6;
    if (area <= 60) return 7;
    return 8;
  }

  /* Receiver – nicht übersetzen */
  const getReceiver = (code) =>
    code === "BT003"
      ? "50437 - BT003 (Aufputz-Funkempfänger)"
      : "50648 - IPP-R01 (Unterputz-Funkempfänger)";

  /* Thermostate — klammertexte werden übersetzt */
  const getThermostat = (code, langCode) => {
    const digital = translations[langCode].thermoDigital;
    const simple = translations[langCode].thermoBasic;

    if (code === "BT010") return `50435 - BT010 ${simple}`;
    return `50815 - IPP-FT01 ${digital}`;
  };

  /* ------------------------------------------------------------
     Berechnung pro Raum
  ------------------------------------------------------------ */
  function calculateRoom(room, langCode) {
    const factor = parseInt(room.insulation, 10);
    const volume = room.area * room.height;

    let windowFactor = room.windows === "hoch" ? 1.1 : 1.0;

    const nameLower = room.name.toLowerCase();
    if (nameLower.includes("bad") || nameLower.includes("wc")) {
      windowFactor *= 1.15;
    }

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
    const s2 = valid[1] || null;

    const max = getMaxPlates(room.area);
    const warning =
      s1.count > max ? getWarningText(langCode, max, s1.count) : "";

    const labelS1 = translations[langCode].suggestion1;
    const labelS2 = translations[langCode].suggestion2;

    const extra1 =
      room.mounting === "DW"
        ? `, ${s1.count} × 50432 - IPP-DAS Deckenabhängeset`
        : "";

    const textLines = [
      `${labelS1}: ${s1.count} × ${s1.model.name} (${s1.model.power} W)
-> ${s1.count} × ${getReceiver(room.receiver)}, 1 × ${getThermostat(
        room.thermostat,
        langCode
      )}${extra1}`,
    ];

    if (s2) {
      const extra2 =
        room.mounting === "DW"
          ? `, ${s2.count} × 50432 - IPP-DAS Deckenabhängeset`
          : "";

      textLines.push(
        `\n${labelS2}: ${s2.count} × ${s2.model.name} (${s2.model.power} W)
-> ${s2.count} × ${getReceiver(room.receiver)}, 1 × ${getThermostat(
          room.thermostat,
          langCode
        )}${extra2}`
      );
    }

    return { need, text: textLines.join("\n"), warning };
  }

  /* ------------------------------------------------------------
     Raum hinzufügen
  ------------------------------------------------------------ */
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

  /* ------------------------------------------------------------
     PDF Export (mehrsprachig)
  ------------------------------------------------------------ */
  const exportPDF = () => {
    const pdf = new jsPDF("p", "mm", "a4");
    const pageW = 210;
    const pageH = 297;
    const margin = 15;
    let y = margin;

    const drawHeader = () => {
      pdf.addImage("/siku_logo.png", "PNG", pageW / 2 - 22, y, 44, 15);
      y += 23;

      pdf.setFontSize(16);
      pdf.setTextColor(37, 89, 161);
      pdf.text(translations[lang].appTitle, pageW / 2, y, {
        align: "center",
      });

      y += 10;
      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);

      if (projectName)
        pdf.text(`${translations[lang].projectLabel} ${projectName}`, margin, y);
      if (projectAddress)
        pdf.text(`${translations[lang].addressLabel} ${projectAddress}`, margin, y + 5);
      if (projectEmail)
        pdf.text(`${translations[lang].emailLabel} ${projectEmail}`, margin, y + 10);

      y += 20;

      pdf.setDrawColor(37, 89, 161);
      pdf.line(margin, y, pageW - margin, y);
      y += 8;

      pdf.setFont("helvetica", "");
      pdf.setFontSize(11);
    };

    const drawFooter = () => {
      const nr = pdf.internal.getNumberOfPages();
      pdf.setFontSize(9);
      pdf.text(
        `${translations[lang].pageLabel} ${nr}`,
        pageW / 2,
        pageH - 6,
        { align: "center" }
      );
    };

    drawHeader();

    rooms.forEach((room, idx) => {
      const r = calculateRoom(room, lang);

      const blockText = [
        room.name,
        `${translations[lang].demandLabel}: ${r.need} W`,
        "",
        r.text,
        r.warning ? `\n${r.warning}` : "",
      ].join("\n");

      const lines = pdf.splitTextToSize(blockText, pageW - 2 * margin);
      const height = lines.length * 5 + 12;

      if (y + height > pageH - margin) {
        drawFooter();
        pdf.addPage();
        y = margin;
        drawHeader();
      }

      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(37, 89, 161);
      pdf.text(room.name, margin, y);
      y += 6;

      pdf.setFontSize(11);
      pdf.setTextColor(0, 0, 0);
      pdf.text(`${translations[lang].demandLabel}: ${r.need} W`, margin, y);
      y += 6;

      pdf.setFont("helvetica", "");
      pdf.setFontSize(10);
      pdf.text(lines, margin, y);
      y += lines.length * 5;

      if (r.warning) {
        y += 3;
        pdf.setTextColor(200, 0, 0);
        pdf.text(r.warning, margin, y);
        pdf.setTextColor(0, 0, 0);
      }

      y += 12;

      if (idx < rooms.length - 1) {
        pdf.setDrawColor(37, 89, 161);
        pdf.line(margin, y, pageW - margin, y);
        y += 8;
      }
    });

    drawFooter();

    const filename = projectName
      ? `SIKU_${projectName.replace(/\s+/g, "_")}.pdf`
      : "SIKU_Recommendation.pdf";

    pdf.save(filename);
  };

  /* ------------------------------------------------------------
     RENDERING
  ------------------------------------------------------------ */
  return (
    <div className="container">
      <header>
        <div className="header-left">
          <img src="/siku_logo.png" alt="SIKU Logo" />
          <h1>{t("appTitle")}</h1>
        </div>

        <div className="lang-switch no-print">
          {LANGS.map((l) => (
            <button
              key={l.code}
              className={"lang-btn" + (lang === l.code ? " active" : "")}
              onClick={() => setLang(l.code)}
            >
              {l.label}
            </button>
          ))}
        </div>
      </header>

      <div className="card no-print">
        <h2>{t("projectData")}</h2>
        <input
          type="text"
          placeholder={t("projectNamePlaceholder")}
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
        />
        <input
          type="text"
          placeholder={t("addressPlaceholder")}
          value={projectAddress}
          onChange={(e) => setProjectAddress(e.target.value)}
        />
        <input
          type="email"
          placeholder={t("emailPlaceholder")}
          value={projectEmail}
          onChange={(e) => setProjectEmail(e.target.value)}
        />
      </div>

      <div className="card">
        <h2>{t("roomsTitle")}</h2>

        {rooms.length === 0 && <p>{t("noRooms")}</p>}

        {rooms.map((room, index) => {
          const r = calculateRoom(room, lang);
          return (
            <div key={index} className="room">
              <button
                type="button"
                className="delete-room-btn no-print"
                onClick={() => setRooms(rooms.filter((_, i) => i !== index))}
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
                  <option value="20">Sehr gut (20 W/m³)</option>
                  <option value="25">Gut (25 W/m³)</option>
                  <option value="30">Durchschnittlich (30 W/m³)</option>
                  <option value="35">Altbau (35 W/m³)</option>
                </select>

                <label>{t("windowShare")}</label>
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
                  <option value="FT01">
                    50815 - IPP-FT01 {translations[lang].thermoDigital}
                  </option>
                  <option value="BT010">
                    50435 - BT010 {translations[lang].thermoBasic}
                  </option>
                </select>

                <label>{t("receiverLabel")}</label>
                <select
                  value={room.receiver}
                  onChange={(e) => {
                    const n = [...rooms];
                    n[index].receiver = e.target.value;
                    setRooms(n);
                  }}
                >
                  <option value="R01">
                    50648 - IPP-R01 (Unterputz-Funkempfänger)
                  </option>
                  <option value="BT003">
                    50437 - BT003 (Aufputz-Funkempfänger)
                  </option>
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
                  <strong>{t("demandLabel")}:</strong> <strong>{r.need} W</strong>
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
          {t("addRoomBtn")}
        </button>
        <button onClick={exportPDF} className="pdf-btn">
          {t("pdfBtn")}
        </button>
      </div>
    </div>
  );
}
