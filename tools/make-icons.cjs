// アプリのアイコン（icon-192.png・icon-512.png）を作る。紺の地に、黄色のねふだと % のしるし。
// 使い方: node tools/make-icons.cjs（qa/ の playwright を使う）
const path = require("path");
const { chromium } = require(path.join(__dirname, "..", "qa", "node_modules", "playwright"));
(async () => {
  const b = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
  for (const s of [192, 512]) {
    const p = await b.newPage({ viewport: { width: s, height: s } });
    await p.setContent(`<body style="margin:0"><svg width="${s}" height="${s}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" fill="#123554"/>
      <path d="M18 30 L40 14 H84 V86 H40 L18 70 Z" fill="#f6d77a"/>
      <circle cx="32" cy="50" r="6" fill="#123554"/>
      <circle cx="54" cy="36" r="7" fill="none" stroke="#123554" stroke-width="5"/>
      <circle cx="72" cy="64" r="7" fill="none" stroke="#123554" stroke-width="5"/>
      <path d="M74 30 L52 70" stroke="#123554" stroke-width="6" stroke-linecap="round"/></svg></body>`);
    await p.screenshot({ path: path.join(__dirname, "..", `icon-${s}.png`), clip: { x: 0, y: 0, width: s, height: s } });
  }
  await b.close();
})();
