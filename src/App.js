import React, { useState } from "react";
import jsPDF from "jspdf";
import "./App.css";

/* ============================================================
   SPRACHEN & ÜBERSETZUNGEN
============================================================ */
const LANGS = [
  { code: "de", label: "DE" },
  { code: "en", label: "EN" },
  { code: "da", label: "DA" },
  { code: "hr", label: "HR" },
  { code: "sl", label: "SL" },
];

const translations = {
  /* ======================== DEUTSCH ======================== */
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

    insulation_20: "Sehr gut (20 W/m³)",
    insulation_25: "Gut (25 W/m³)",
    insulation_30: "Durchschnittlich (30 W/m³)",
    insulation_35: "Altbau (35 W/m³)",

    windowShare: "Fensteranteil",
    windowNormal: "Normal",
    windowHigh: "Hoch",

    thermostat: "Thermostat (pro Raum)",
    th_digital: "(digital)",
    th_basic: "(einfach)",

    receiverLabel: "Empfänger (pro Platte)",
    rc_flush: "(Unterputz-Funkempfänger)",
    rc_surface: "(Aufputz-Funkempfänger)",

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

    summaryTitle: "Artikel-Zusammenfassung",
    summarySuggestion1: "Vorschlag 1 – Gesamt",
    summarySuggestion2: "Vorschlag 2 – Gesamt",
  },

  /* ======================== ENGLISH ======================== */
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

    insulation_20: "Very good (20 W/m³)",
    insulation_25: "Good (25 W/m³)",
    insulation_30: "Average (30 W/m³)",
    insulation_35: "Old building (35 W/m³)",

    windowShare: "Window share",
    windowNormal: "Normal",
    windowHigh: "High",

    thermostat: "Thermostat (per room)",
    th_digital: "(digital)",
    th_basic: "(basic)",

    receiverLabel: "Receiver (per panel)",
    rc_flush: "(flush-mount receiver)",
    rc_surface: "(surface-mount receiver)",

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

    summaryTitle: "Article Summary",
    summarySuggestion1: "Option 1 – Total",
    summarySuggestion2: "Option 2 – Total",
  },

  /* ======================== DÄNISCH ======================== */
  da: {
    appTitle: "Infrarød panel beregner",
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

    insulation_20: "Meget godt (20 W/m³)",
    insulation_25: "Godt (25 W/m³)",
    insulation_30: "Gennemsnitlig (30 W/m³)",
    insulation_35: "Ældre byggeri (35 W/m³)",

    windowShare: "Vinduesandel",
    windowNormal: "Normal",
    windowHigh: "Stor",

    thermostat: "Termostat (pr. rum)",
    th_digital: "(digital)",
    th_basic: "(simpel)",

    receiverLabel: "Modtager (pr. panel)",
    rc_flush: "(indbygget modtager)",
    rc_surface: "(påbygget modtager)",

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

    summaryTitle: "Artikeloversigt",
    summarySuggestion1: "Forslag 1 – I alt",
    summarySuggestion2: "Forslag 2 – I alt",
  },

  /* ======================== KROATISCH ======================== */
  hr: {
    appTitle: "Kalkulator preporuke IC panela",
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

    insulation_20: "Vrlo dobro (20 W/m³)",
    insulation_25: "Dobro (25 W/m³)",
    insulation_30: "Prosječno (30 W/m³)",
    insulation_35: "Stara gradnja (35 W/m³)",

    windowShare: "Udio prozora",
    windowNormal: "Normalan",
    windowHigh: "Velik",

    thermostat: "Termostat (po prostoriji)",
    th_digital: "(digitalni)",
    th_basic: "(osnovni)",

    receiverLabel: "Prijamnik (po panelu)",
    rc_flush: "(ugradbeni prijamnik)",
    rc_surface: "(nadžbukni prijamnik)",

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

    summaryTitle: "Sažetak artikala",
    summarySuggestion1: "Prijedlog 1 – Ukupno",
    summarySuggestion2: "Prijedlog 2 – Ukupno",
  },

  /* ======================== SLOWENISCH ======================== */
  sl: {
    appTitle: "Kalkulator IR grelnih plošč",
    projectData: "Podatki o projektu",
    roomsTitle: "Prostori",
    projectNamePlaceholder: "Projekt / stranka",
    addressPlaceholder: "Naslov",
    emailPlaceholder: "E-pošta",
    noRooms: "🔹 Ni dodanih prostorov.",
    roomName: "Ime prostora",
    area: "Površina (m²)",
    height: "Višina stropa (m)",
    insulation: "Stopnja izolacije",

    insulation_20: "Zelo dobro (20 W/m³)",
    insulation_25: "Dobro (25 W/m³)",
    insulation_30: "Povprečno (30 W/m³)",
    insulation_35: "Stara gradnja (35 W/m³)",

    windowShare: "Delež oken",
    windowNormal: "Običajen",
    windowHigh: "Velik",

    thermostat: "Termostat (na prostor)",
    th_digital: "(digitalni)",
    th_basic: "(osnovni)",

    receiverLabel: "Sprejemnik (na ploščo)",
    rc_flush: "(vgrajen sprejemnik)",
    rc_surface: "(nadometni sprejemnik)",

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

    summaryTitle: "Povzetek artiklov",
    summarySuggestion1: "Predlog 1 – Skupaj",
    summarySuggestion2: "Predlog 2 – Skupaj",
  },
};

/* ============================================================
   WARNUNGEN MEHRSPRACHIG
============================================================ */
function getWarningText(lang, max, count) {
  switch (lang) {
    case "en":
      return `⚠️ Attention: Maximum ${max} panels recommended, but ${count} required.`;
    case "da":
      return `⚠️ Bemærk: Maksimalt ${max} paneler anbefales, beregningen kræver ${count}.`;
    case "hr":
      return `⚠️ Pažnja: Preporuča se najviše ${max} panela, potrebno ${count}.`;
    case "sl":
      return `⚠️ Pozor: Priporočeno največ ${max} plošč, potrebno ${count}.`;
    case "de":
    default:
      return `⚠️ Achtung: Maximal ${max} Platten empfohlen, benötigt wären ${count}.`;
  }
}

/* ============================================================
   URL-SPRACHE ERKENNEN
============================================================ */
function getInitialLang() {
  if (typeof window === "undefined") return "de";

  const params = new URLSearchParams(window.location.search);
  const urlLang = params.get("lang");

  const allowed = ["de", "en", "da", "hr", "sl"];

  if (urlLang && allowed.includes(urlLang.toLowerCase())) {
    return urlLang.toLowerCase();
  }

  return "de";
}

/* ============================================================
   HAUPTKOMPONENTE
============================================================ */
export default function App() {
  const [lang, setLang] = useState(getInitialLang());

  const [projectName, setProjectName] = useState("");
  const [projectAddress, setProjectAddress] = useState("");
  const [projectEmail, setProjectEmail] = useState("");
  const [rooms, setRooms] = useState([]);

  const t = (key) =>
    translations[lang][key] ?? translations.de[key] ?? key;

  /* ============================================================
     DÄMMSTANDARD
  ============================================================= */
  const insulationOptions = [
    { label: t("insulation_20"), value: "20" },
    { label: t("insulation_25"), value: "25" },
    { label: t("insulation_30"), value: "30" },
    { label: t("insulation_35"), value: "35" },
  ];

  /* ============================================================
     PRODUKTOPTIONS
  ============================================================= */
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

  /* ============================================================
     EMPFÄNGER
  ============================================================= */
  const getReceiver = (code) =>
    code === "BT003"
      ? `50437 - BT003 ${t("rc_surface")}`
      : `50648 - IPP-R01 ${t("rc_flush")}`;

  /* ============================================================
     THERMOSTATE
  ============================================================= */
  const getThermostat = (code) =>
    code === "BT010"
      ? `50435 - BT010 ${t("th_basic")}`
      : `50815 - IPP-FT01 ${t("th_digital")}`;

  /* ============================================================
     MAX PLATTEN
  ============================================================= */
  function getMaxPlates(area) {
    if (area <= 10) return 1;
    if (area <= 15) return 2;
    if (area <= 25) return 4;
    if (area <= 40) return 5;
    if (area <= 50) return 6;
    if (area <= 60) return 7;
    return 8;
  }

  /* ============================================================
     BERECHNUNG PRO RAUM
  ============================================================= */
  function calculateRoom(room, langCode) {
    const factor = parseInt(room.insulation, 10);
    const volume = room.area * room.height;

    let windowFactor = room.windows === "hoch" ? 1.1 : 1.0;

    if (room.name.toLowerCase().includes("bad")) {
      windowFactor *= 1.15;
    }

    const need = Math.round(volume * factor * windowFactor);
    const models = plateOptions[room.mounting] ?? [];

    if (!models.length) {
      return {
        need,
        text: "N/A",
        warning: "",
        summary1: [],
        summary2: [],
      };
    }

    const sorted = [...models].sort((a, b) => b.power - a.power);

    const combos = sorted.map((m) => ({
      model: m,
      count: Math.ceil(need / m.power),
      total: Math.ceil(need / m.power) * m.power,
    }));

    const valid = combos.filter((c) => c.total >= need);

    valid.sort((a, b) =>
      a.count === b.count ? a.total - b.total : a.count - b.count
    );

    const s1 = valid[0];
    const s2 = valid[1] ?? null;

    const max = getMaxPlates(room.area);

    const warning =
      s1.count > max
        ? getWarningText(langCode, max, s1.count)
        : "";

    const sug1 = translations[langCode].suggestion1;
    const sug2 = translations[langCode].suggestion2;

    /* ------------------------------------------------------------
       DW → automatisch Deckenabhängeset
    ------------------------------------------------------------ */
    const extra1 =
      room.mounting === "DW"
        ? `, ${s1.count} × 50432 - IPP-DAS Deckenabhängeset`
        : "";

    const lines = [
      `${sug1}: ${s1.count} × ${s1.model.name} (${s1.model.power} W)
-> ${s1.count} × ${getReceiver(room.receiver)}, 1 × ${getThermostat(
        room.thermostat
      )}${extra1}`,
    ];

    if (s2) {
      const extra2 =
        room.mounting === "DW"
          ? `, ${s2.count} × 50432 - IPP-DAS Deckenabhängeset`
          : "";

      lines.push(
        `\n${sug2}: ${s2.count} × ${s2.model.name} (${s2.model.power} W)
-> ${s2.count} × ${getReceiver(room.receiver)}, 1 × ${getThermostat(
          room.thermostat
        )}${extra2}`
      );
    }

    /* ------------------------------------------------------------
       Strukturierte Artikellisten für PDF-Zusammenfassung
    ------------------------------------------------------------ */
    const summary1 = [
      {
        article: s1.model.name,
        count: s1.count,
      },
      {
        article: getReceiver(room.receiver),
        count: s1.count,
      },
      {
        article: getThermostat(room.thermostat),
        count: 1,
      },
    ];

    if (room.mounting === "DW") {
      summary1.push({
        article: "50432 - IPP-DAS Deckenabhängeset",
        count: s1.count,
      });
    }

    const summary2 = [];

    if (s2) {
      summary2.push(
        {
          article: s2.model.name,
          count: s2.count,
        },
        {
          article: getReceiver(room.receiver),
          count: s2.count,
        },
        {
          article: getThermostat(room.thermostat),
          count: 1,
        }
      );

      if (room.mounting === "DW") {
        summary2.push({
          article: "50432 - IPP-DAS Deckenabhängeset",
          count: s2.count,
        });
      }
    }

    return {
      need,
      text: lines.join("\n"),
      warning,
      summary1,
      summary2,
    };
  }

  /* ============================================================
     RÄUME VERWALTUNG
  ============================================================= */
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

  /* ============================================================
     PDF EXPORT
  ============================================================= */
  const exportPDF = () => {
    const pdf = new jsPDF("p", "mm", "a4");

    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 15;

    let yPos = margin;

    /* ------------------------------------------------------------
       HEADER
    ------------------------------------------------------------ */
    const header = () => {
      pdf.addImage(
        "/siku_logo.png",
        "PNG",
        pageWidth / 2 - 22,
        yPos,
        44,
        15
      );

      yPos += 23;

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(16);
      pdf.setTextColor(37, 89, 161);

      pdf.text(t("appTitle"), pageWidth / 2, yPos, {
        align: "center",
      });

      yPos += 10;

      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);

      if (projectName) {
        pdf.text(
          `${t("projectLabel")} ${projectName}`,
          margin,
          yPos
        );
      }

      if (projectAddress) {
        pdf.text(
          `${t("addressLabel")} ${projectAddress}`,
          margin,
          yPos + 5
        );
      }

      if (projectEmail) {
        pdf.text(
          `${t("emailLabel")} ${projectEmail}`,
          margin,
          yPos + 10
        );
      }

      yPos += 20;

      pdf.setDrawColor(37, 89, 161);
      pdf.line(margin, yPos, pageWidth - margin, yPos);

      yPos += 8;
    };

    /* ------------------------------------------------------------
       FOOTER
    ------------------------------------------------------------ */
    const footer = () => {
      const n = pdf.internal.getNumberOfPages();

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);
      pdf.setTextColor(0, 0, 0);

      pdf.text(
        `${t("pageLabel")} ${n}`,
        pageWidth / 2,
        pageHeight - 6,
        {
          align: "center",
        }
      );
    };

    header();

    /* ============================================================
       EINZELNE RÄUME
    ============================================================= */
    rooms.forEach((room, idx) => {
      const r = calculateRoom(room, lang);

      const blockText = [
        room.name,
        `${t("demandLabel")}: ${r.need} W`,
        "",
        r.text,
        r.warning ? `\n${r.warning}` : "",
      ].join("\n");

      const lines = pdf.splitTextToSize(
        blockText,
        pageWidth - 2 * margin
      );

      const heightNeeded = lines.length * 5 + 12;

      if (yPos + heightNeeded > pageHeight - margin) {
        footer();

        pdf.addPage();

        yPos = margin;
        header();
      }

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(12);
      pdf.setTextColor(37, 89, 161);

      pdf.text(room.name, margin, yPos);

      yPos += 6;

      pdf.setFontSize(11);
      pdf.setTextColor(0, 0, 0);

      pdf.text(
        `${t("demandLabel")}: ${r.need} W`,
        margin,
        yPos
      );

      yPos += 6;

      pdf.setFontSize(10);

      pdf.text(lines, margin, yPos);

      yPos += lines.length * 5 + 5;

      if (r.warning) {
        pdf.setTextColor(200, 0, 0);

        pdf.text(r.warning, margin, yPos);

        pdf.setTextColor(0, 0, 0);

        yPos += 8;
      }

      if (idx < rooms.length - 1) {
        pdf.setDrawColor(37, 89, 161);

        pdf.line(
          margin,
          yPos,
          pageWidth - margin,
          yPos
        );

        yPos += 10;
      }
    });

    footer();

    /* ============================================================
       ARTIKEL-ZUSAMMENFASSUNG
    ============================================================= */
    if (rooms.length > 0) {
      const totals1 = {};
      const totals2 = {};

      /* ----------------------------------------------------------
         Gleiche Artikel summieren
      ---------------------------------------------------------- */
      const addToTotals = (totals, items) => {
        items.forEach((item) => {
          if (!totals[item.article]) {
            totals[item.article] = 0;
          }

          totals[item.article] += item.count;
        });
      };

      rooms.forEach((room) => {
        const r = calculateRoom(room, lang);

        addToTotals(totals1, r.summary1 || []);
        addToTotals(totals2, r.summary2 || []);
      });

      /* ----------------------------------------------------------
         Neue Seite
      ---------------------------------------------------------- */
      pdf.addPage();

      yPos = margin;

      header();

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(15);
      pdf.setTextColor(37, 89, 161);

      pdf.text(
        t("summaryTitle"),
        margin,
        yPos
      );

      yPos += 11;

      /* ==========================================================
         VORSCHLAG 1
      ========================================================== */
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(12);
      pdf.setTextColor(37, 89, 161);

      pdf.text(
        t("summarySuggestion1"),
        margin,
        yPos
      );

      yPos += 6;

      pdf.setDrawColor(37, 89, 161);
      pdf.setLineWidth(0.3);

      pdf.line(
        margin,
        yPos,
        pageWidth - margin,
        yPos
      );

      yPos += 7;

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);

      Object.entries(totals1).forEach(
        ([article, count]) => {
          const articleLines =
            pdf.splitTextToSize(
              `${count} × ${article}`,
              pageWidth - 2 * margin
            );

          if (
            yPos + articleLines.length * 5 >
            pageHeight - 15
          ) {
            footer();

            pdf.addPage();

            yPos = margin;
            header();
          }

          pdf.text(
            articleLines,
            margin,
            yPos
          );

          yPos +=
            articleLines.length * 5 + 2;
        }
      );

      yPos += 9;

      /* ==========================================================
         VORSCHLAG 2
      ========================================================== */
      if (Object.keys(totals2).length > 0) {
        if (yPos > pageHeight - 50) {
          footer();

          pdf.addPage();

          yPos = margin;
          header();
        }

        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(12);
        pdf.setTextColor(37, 89, 161);

        pdf.text(
          t("summarySuggestion2"),
          margin,
          yPos
        );

        yPos += 6;

        pdf.setDrawColor(37, 89, 161);
        pdf.setLineWidth(0.3);

        pdf.line(
          margin,
          yPos,
          pageWidth - margin,
          yPos
        );

        yPos += 7;

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(10);
        pdf.setTextColor(0, 0, 0);

        Object.entries(totals2).forEach(
          ([article, count]) => {
            const articleLines =
              pdf.splitTextToSize(
                `${count} × ${article}`,
                pageWidth - 2 * margin
              );

            if (
              yPos + articleLines.length * 5 >
              pageHeight - 15
            ) {
              footer();

              pdf.addPage();

              yPos = margin;
              header();
            }

            pdf.text(
              articleLines,
              margin,
              yPos
            );

            yPos +=
              articleLines.length * 5 + 2;
          }
        );
      }

      footer();
    }

    /* ============================================================
       DATEINAME
    ============================================================= */
    const filename = projectName
      ? `SIKU_${projectName.replace(/\s+/g, "_")}.pdf`
      : "SIKU_Empfehlungs_Kalkulation.pdf";

    pdf.save(filename);
  };

  /* ============================================================
     UI RENDERING
  ============================================================= */
  return (
    <div className="container">
      <header>
        <div className="header-left">
          <img
            src="/siku_logo.png"
            alt="SIKU Logo"
          />

          <h1>{t("appTitle")}</h1>
        </div>

        <div className="lang-switch no-print">
          {LANGS.map((l) => (
            <button
              key={l.code}
              className={
                "lang-btn" +
                (lang === l.code
                  ? " active"
                  : "")
              }
              onClick={() =>
                setLang(l.code)
              }
            >
              {l.label}
            </button>
          ))}
        </div>
      </header>

      {/* ========================================================
          PROJEKTDATEN
      ======================================================== */}
      <div className="card no-print">
        <h2>{t("projectData")}</h2>

        <input
          type="text"
          placeholder={t(
            "projectNamePlaceholder"
          )}
          value={projectName}
          onChange={(e) =>
            setProjectName(e.target.value)
          }
        />

        <input
          type="text"
          placeholder={t(
            "addressPlaceholder"
          )}
          value={projectAddress}
          onChange={(e) =>
            setProjectAddress(e.target.value)
          }
        />

        <input
          type="email"
          placeholder={t(
            "emailPlaceholder"
          )}
          value={projectEmail}
          onChange={(e) =>
            setProjectEmail(e.target.value)
          }
        />
      </div>

      {/* ========================================================
          RÄUME
      ======================================================== */}
      <div className="card">
        <h2>{t("roomsTitle")}</h2>

        {rooms.length === 0 && (
          <p>{t("noRooms")}</p>
        )}

        {rooms.map((room, index) => {
          const r = calculateRoom(
            room,
            lang
          );

          return (
            <div
              key={index}
              className="room"
            >
              <button
                className="delete-room-btn no-print"
                onClick={() =>
                  setRooms(
                    rooms.filter(
                      (_, i) =>
                        i !== index
                    )
                  )
                }
              >
                ❌
              </button>

              <div className="inputs no-print">
                <label>
                  {t("roomName")}
                </label>

                <input
                  type="text"
                  value={room.name}
                  onChange={(e) => {
                    const n = [...rooms];

                    n[index].name =
                      e.target.value;

                    setRooms(n);
                  }}
                />

                <label>
                  {t("area")}
                </label>

                <input
                  type="number"
                  value={room.area}
                  onChange={(e) => {
                    const n = [...rooms];

                    n[index].area =
                      parseFloat(
                        e.target.value || 0
                      );

                    setRooms(n);
                  }}
                />

                <label>
                  {t("height")}
                </label>

                <input
                  type="number"
                  step="0.1"
                  value={room.height}
                  onChange={(e) => {
                    const n = [...rooms];

                    n[index].height =
                      parseFloat(
                        e.target.value || 0
                      );

                    setRooms(n);
                  }}
                />

                <label>
                  {t("insulation")}
                </label>

                <select
                  value={
                    room.insulation
                  }
                  onChange={(e) => {
                    const n = [...rooms];

                    n[index].insulation =
                      e.target.value;

                    setRooms(n);
                  }}
                >
                  {insulationOptions.map(
                    (o) => (
                      <option
                        key={o.value}
                        value={o.value}
                      >
                        {o.label}
                      </option>
                    )
                  )}
                </select>

                <label>
                  {t("windowShare")}
                </label>

                <select
                  value={room.windows}
                  onChange={(e) => {
                    const n = [...rooms];

                    n[index].windows =
                      e.target.value;

                    setRooms(n);
                  }}
                >
                  <option value="normal">
                    {t("windowNormal")}
                  </option>

                  <option value="hoch">
                    {t("windowHigh")}
                  </option>
                </select>

                <label>
                  {t("thermostat")}
                </label>

                <select
                  value={
                    room.thermostat
                  }
                  onChange={(e) => {
                    const n = [...rooms];

                    n[index].thermostat =
                      e.target.value;

                    setRooms(n);
                  }}
                >
                  <option value="FT01">
                    50815 - IPP-FT01{" "}
                    {t("th_digital")}
                  </option>

                  <option value="BT010">
                    50435 - BT010{" "}
                    {t("th_basic")}
                  </option>
                </select>

                <label>
                  {t("receiverLabel")}
                </label>

                <select
                  value={room.receiver}
                  onChange={(e) => {
                    const n = [...rooms];

                    n[index].receiver =
                      e.target.value;

                    setRooms(n);
                  }}
                >
                  <option value="R01">
                    50648 - IPP-R01{" "}
                    {t("rc_flush")}
                  </option>

                  <option value="BT003">
                    50437 - BT003{" "}
                    {t("rc_surface")}
                  </option>
                </select>

                <label>
                  {t("mounting")}
                </label>

                <select
                  value={room.mounting}
                  onChange={(e) => {
                    const n = [...rooms];

                    n[index].mounting =
                      e.target.value;

                    setRooms(n);
                  }}
                >
                  <option value="WW">
                    {t("mountWW")}
                  </option>

                  <option value="DW">
                    {t("mountDW")}
                  </option>

                  <option value="DC">
                    {t("mountDC")}
                  </option>
                </select>
              </div>

              {/* ==================================================
                  ERGEBNIS
              ================================================== */}
              <div className="result">
                <strong>
                  {room.name}
                </strong>

                <p>
                  <strong>
                    {t("demandLabel")}:
                  </strong>{" "}
                  <strong>
                    {r.need} W
                  </strong>
                </p>

                <pre>{r.text}</pre>

                {r.warning && (
                  <p
                    style={{
                      color: "red",
                      fontWeight: "bold",
                    }}
                  >
                    {r.warning}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ========================================================
          BUTTONS
      ======================================================== */}
      <div className="no-print">
        <button
          onClick={addRoom}
          className="add-room-btn"
        >
          {t("addRoomBtn")}
        </button>

        <button
          onClick={exportPDF}
          className="pdf-btn"
        >
          {t("pdfBtn")}
        </button>
      </div>
    </div>
  );
}