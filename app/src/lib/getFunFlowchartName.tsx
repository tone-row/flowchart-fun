import { languages } from "../locales/i18n";

/**
 * Returns a fun flowchart name based on the language. Names should
 * work for temporary and persistent flowcharts so for languages
 * with a lot of non-url safe characters, defaults to English.
 */
export function getFunFlowchartName(language: keyof typeof languages) {
  const noun = getNoun(language);
  const firstLetter = noun[0].toUpperCase();
  const adjective = getAdjective(language, firstLetter);
  const digits = getRandomDigits();
  return `${adjective} ${noun} ${digits}`;
}

/**
 * Return 3 random digits. Don't include 0. ex: 123, 999, 321
 */
function getRandomDigits() {
  return Math.floor(Math.random() * 900 + 100);
}

function getNoun(language: keyof typeof languages) {
  switch (language) {
    case "fr":
      return ["diagramme", "organigramme", "structure", "processus"][
        Math.floor(Math.random() * 4)
      ];
    case "de":
      return ["Diagramm", "Organigramm", "Struktur", "Prozess"][
        Math.floor(Math.random() * 4)
      ];
    case "pt-br":
      return ["diagrama", "organograma", "gráfico", "processo"][
        Math.floor(Math.random() * 4)
      ];
    default:
      return ["flowchart", "diagram", "graph", "process"][
        Math.floor(Math.random() * 4)
      ];
  }
}

const adjectives = {
  fr: [
    "dingue",
    "drôle",
    "décalé",
    "déjanté",
    "délirant",
    "optimiste",
    "oblong",
    "orgueilleux",
    "océanique",
    "obtus",
    "sauvage",
    "sinueux",
    "svelte",
    "sociable",
    "sensible",
    "puissant",
    "pelucheux",
    "prédateur",
    "pacifique",
    "potelé",
  ],
  de: [
    "Dickköpfig",
    "Dunkel",
    "Drahtig",
    "Drollig",
    "Dominant",
    "Ohrig",
    "Orientierungslos",
    "Ominös",
    "Optimistisch",
    "Ordnungsliebend",
    "Schnell",
    "Schwarz",
    "Sanftmütig",
    "Schwächlich",
    "Selbstbewusst",
    "Pelzig",
    "Prächtig",
    "Pfiffig",
    "Plump",
    "Pirschend",
  ],
  "pt-br": [
    "delicioso",
    "divertidíssimo",
    "deslumbrante",
    "docinho",
    "doidão",
    "ousadíssimo",
    "oblongo",
    "otimista",
    "orgânico",
    "original",
    "gigantesco",
    "gracil",
    "gostosão",
    "generoso",
    "galhofeiro",
    "peludinho",
    "pequenino",
    "pacificador",
    "proativo",
    "poderosíssimo",
  ],
  en: [
    "fierce",
    "fluffy",
    "ferocious",
    "frisky",
    "friendly",
    "daring",
    "delightful",
    "dazzling",
    "dependable",
    "dapper",
    "glamorous",
    "goofy",
    "grateful",
    "glamorous",
    "grinning",
    "playful",
    "powerful",
    "precious",
    "positive",
    "peaceful",
  ],
};

/**
 * Return a random adjective whose first letter matches the first letter
 */
function getAdjective(language: keyof typeof languages, firstLetter: string) {
  const safeLanguage = language in adjectives ? language : "en";
  const words = adjectives[safeLanguage as keyof typeof adjectives];
  const matchingWords = words.filter(
    (word) => word[0].toUpperCase() === firstLetter
  );
  if (matchingWords.length === 0) {
    return words[Math.floor(Math.random() * words.length)];
  } else {
    return matchingWords[Math.floor(Math.random() * matchingWords.length)];
  }
}
