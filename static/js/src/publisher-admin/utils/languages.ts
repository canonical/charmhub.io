interface Languages {
  [key: string]: {
    title: string;
    text: string;
  };
}

const languages: Languages = {
  ar: { title: "العربية", text: "احصل عليه من Charmhub" },
  bg: { title: "български", text: "Инсталирайте го от Charmhub" },
  bn: { title: "বাংলা", text: "Charmhub থেকে ইনস্টল করুন" },
  de: { title: "Deutsch", text: "Installieren vom Charmhub" },
  en: { title: "English", text: "Get it from the Charmhub" },
  es: { title: "Español", text: "Instalar desde Charmhub" },
  fr: {
    title: "Français",
    text: "Installer à partir du Charmhub",
  },
  it: { title: "Italiano", text: "Scarica dallo Charmhub" },
  jp: { title: "日本語", text: "Charmhub から入手ください" },
  pl: { title: "Polski", text: "Pobierz w Charmhub" },
  pt: { title: "Português", text: "Disponível na Charmhub" },
  ro: { title: "Română", text: "Instalează din Charmhub" },
  ru: { title: "русский язык", text: "Загрузите из Charmhub" },
  tw: { title: "中文（台灣）", text: "安裝軟體敬請移駕 Charmhub" },
  ua: { title: "українськa мовa", text: "Завантажте з Charmhub" },
};

export default languages;
