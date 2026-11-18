// どっちがお得？の問題を作る（ブラウザと node の両方で使う）。
// 決まりは、下の SRC で確かめたことだけ（2026-11-17 に読んだ）。
//  - 1割 ＝ 10%。○割引・○%オフは、もとの値段 ×（1 − 割合）で計算する（小学校5年の算数「割合（百分率）」）
//  - 値段の表示は税込（総額表示）。標準税率は10%（国税庁）。税込の計算は10%の品物（飲食料品ではないもの）だけにする
//    （飲食料品の軽減税率8%は、令和9年4月から引き下げられるため問題にしない）
//  - 1円未満の端数の扱いは店しだいなので、端数が出ない値だけを使う
// 品物・店・値段は練習用の作り話。答えはコードで計算して決める。
// 1問は、買い物の場面を見て答えを選ぶ。正解したら2段目「どう計算した？」を選ぶ。
// 乱数 R は呼ぶ回数が毎回同じになるように使う（sort の比較の中では引かない）。同じ tag なら、どの端末でも同じ問題になる。
// KINDS・言い回しの並びは最後に足すだけにする（並べ替え・削除をすると過去の日の問題が変わる）。
(function (root) {
  "use strict";
  const LV = ["やさしい", "ふつう", "むずかしい"];

  // 出典（画面の「なぜ」に出す）
  const SRC = {
    mext: ["文部科学省「小学校学習指導要領（平成29年告示）解説 算数編」（第5学年 割合（百分率））", "https://www.mext.go.jp/a_menu/shotou/new-cs/1387014.htm"],
    sogaku: ["国税庁 タックスアンサー No.6902「総額表示」の義務付け", "https://www.nta.go.jp/taxes/shiraberu/taxanswer/shohi/6902.htm"],
    zeiritsu: ["国税庁「軽減税率制度の概要」（標準税率10%）", "https://www.nta.go.jp/taxes/shiraberu/zeimokubetsu/shohi/keigenzeiritsu/01.htm"],
  };
  const TAX = 10; // 標準税率（%）

  // 2段目「どう計算した？」
  const GROUPS = {
    kakeru: { name: "値段 × 倍率", sub: "引くときは（1 − 割合）、税込は 1.1 をかける" },
    sa: { name: "2つの差", sub: "2つの値段を出して、引き算する" },
    hitotsu: { name: "1つあたりにそろえる", sub: "100gあたり・1個あたりの値段にしてくらべる" },
    modoshi: { name: "わり算でもどる", sub: "値段から、もとの値段や割合を出す" },
  };

  const ri = (R, a, b) => a + Math.floor(R() * (b - a + 1));
  const pick = (R, a) => a[ri(R, 0, a.length - 1)];
  function shuffle(R, a) { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = ri(R, 0, i); [b[i], b[j]] = [b[j], b[i]]; } return b; }
  function pickN(R, a, n) { return shuffle(R, a).slice(0, n); }
  const fmt = (n) => { const [i, d] = String(Math.round(n * 1000) / 1000).split("."); return i.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + (d ? "." + d : ""); };
  const yen = (x) => `${fmt(x)}円`;
  const ok = (c) => c && !/^-|^約?0(\.0+)?[円%]|\.\d+円|が0円/.test(c); // 0・マイナス・1円未満の選び肢は出さない
  function optsOf(R, ans, cands, n) { const out = [ans]; for (const c of cands) { if (out.length >= n) break; if (ok(c) && !out.includes(c)) out.push(c); } return shuffle(R, out); }
  const MEDIA = ["スーパー", "ドラッグストア", "本屋", "家電の店", "文房具の店", "ネットの店", "チラシを見て"];
  // 品物（練習用の作り話）。g：量をはかって売るもの
  const ITEM = ["ノート", "シャツ", "スニーカー", "リュック", "かさ", "マグカップ", "ヘッドホン", "えんぴつのセット", "まくら", "タオル", "時計", "ぼうし"];
  const FOOD = [["お米", "kg"], ["コーヒー豆", "g"], ["ナッツ", "g"], ["チーズ", "g"], ["ぶた肉", "g"], ["パスタ", "g"]];
  const MATOME = ["ペットボトルのお茶", "せっけん", "電池", "ティッシュ", "ヨーグルト", "カップめん"];

  const MK = {
    // ○割引
    waribiki(R) {
      const P = ri(R, 5, 60) * 100, a = ri(R, 1, 5), y = P * (10 - a) / 10, it = pick(R, ITEM), md = ri(R, 0, MEDIA.length - 1);
      return { media: MEDIA[md], q: `${yen(P)}の${it}が${a}割引。いくらで買える？`, opts: optsOf(R, yen(y), [yen(P * a / 10), yen(P - a * 10), yen(P - a * 100), yen(P * (10 - a - 1) / 10), yen(P * (10 - a + 1) / 10)], 4), ans: yen(y), grp: "kakeru", v: `${it}:${P}:${a}:${md}`,
        why: `${a}割は ${a * 10}%。${yen(P)} × ${(10 - a) / 10} ＝ ${yen(y)}です（引く分は ${yen(P * a / 10)}）。` };
    },
    // ○%オフ
    off(R) {
      const P = ri(R, 4, 80) * 100, p = pick(R, [5, 10, 15, 20, 25, 30, 40, 50]), y = P * (100 - p) / 100, it = pick(R, ITEM), md = ri(R, 0, MEDIA.length - 1);
      return { media: MEDIA[md], q: `${yen(P)}の${it}が${p}%オフ。いくらで買える？`, opts: optsOf(R, yen(y), [yen(P * p / 100), yen(P - p), yen(P - p * 10), yen(P * (100 - p - 10) / 100), yen(P * (100 - p + 10) / 100)], 4), ans: yen(y), grp: "kakeru", v: `${it}:${P}:${p}:${md}`,
        why: `${p}%オフは、もとの ${100 - p}%を払うこと。${yen(P)} × ${(100 - p) / 100} ＝ ${yen(y)}です。` };
    },
    // 税抜から税込（10%）
    zeikomi(R) {
      const P = ri(R, 3, 300) * 10, y = P * (100 + TAX) / 100, it = pick(R, ITEM), md = ri(R, 0, MEDIA.length - 1);
      return { media: MEDIA[md], q: `${it}のねふだに「税抜${yen(P)}」とある。消費税10%を入れた税込の値段は？`, opts: optsOf(R, yen(y), [yen(P + 10), yen(P * TAX / 100), yen(P + 100), yen(P * 108 / 100), yen(P * 2)], 4), ans: yen(y), grp: "kakeru", v: `${it}:${P}:${md}`,
        why: `${yen(P)} × 1.1 ＝ ${yen(y)}です（消費税は ${yen(P * TAX / 100)}）。お店は税込の値段（総額）を表示することになっています。` };
    },
    // 100gあたりでくらべる
    tanka(R) {
      const [f] = pick(R, FOOD.filter((x) => x[1] === "g")), gs = pickN(R, [200, 300, 400, 500, 800, 1000], 2), ua = ri(R, 10, 60) * 10;
      let ub = ua + pick(R, [-1, 1]) * ri(R, 1, 5) * 10; if (ub < 50) ub = ua + 30;
      const ya = ua * gs[0] / 100, yb = ub * gs[1] / 100, d = Math.abs(ua - ub), win = ua < ub ? "A" : "B", lose = win === "A" ? "B" : "A", md = ri(R, 0, MEDIA.length - 1);
      return { media: MEDIA[md], q: `${f}。A は${gs[0]}gで${yen(ya)}、B は${gs[1]}gで${yen(yb)}。100gあたりで、どちらがいくら安い？`, opts: optsOf(R, `${win}が${d}円安い`, [`${lose}が${d}円安い`, `${win}が${fmt(Math.abs(ya - yb))}円安い`, `${lose}が${fmt(Math.abs(ya - yb))}円安い`, `${win}が${d * 2}円安い`, `${win}が${d + 10}円安い`, `${lose}が${d + 10}円安い`], 4), ans: `${win}が${d}円安い`, grp: "hitotsu", v: `${f}:${gs.join(":")}:${ua}:${ub}:${md}`,
        why: `100gあたりは、A が ${yen(ya)} ÷ ${gs[0] / 100} ＝ ${yen(ua)}、B が ${yen(yb)} ÷ ${gs[1] / 100} ＝ ${yen(ub)}。${win} が ${d}円安いです（全部の値段では${fmt(Math.abs(ya - yb))}円ちがいますが、量がちがうのでくらべられません）。` };
    },
    // 割引と円引き、どちらが安い
    kurabe(R) {
      const P = ri(R, 10, 50) * 100, a = ri(R, 1, 3), c = ri(R, 1, Math.floor(P * 0.4 / 100)) * 100, ya = P * (10 - a) / 10, yb = P - c, it = pick(R, ITEM), md = ri(R, 0, MEDIA.length - 1);
      const d = Math.abs(ya - yb), ans = d === 0 ? "同じ" : `${ya < yb ? "A店" : "B店"}が${fmt(d)}円安い`, oth = ya < yb ? "B店" : "A店";
      return { media: MEDIA[md], q: `${yen(P)}の${it}。A店は${a}割引、B店は${yen(c)}引き。どちらがいくら安い？`, opts: optsOf(R, ans, ["同じ", d ? `${oth}が${fmt(d)}円安い` : `A店が${fmt(P * a / 10)}円安い`, `A店が${fmt(Math.abs(P * a / 10 - c) + 100)}円安い`, `B店が${fmt(Math.abs(c - a * 100))}円安い`, `B店が${fmt(c)}円安い`, `A店が${fmt(d + 200)}円安い`, `B店が${fmt(d + 200)}円安い`], 4), ans, grp: "sa", v: `${it}:${P}:${a}:${c}:${md}`,
        why: `A店は ${yen(P)} × ${(10 - a) / 10} ＝ ${yen(ya)}。B店は ${yen(P)} − ${yen(c)} ＝ ${yen(yb)}。${d === 0 ? "同じ値段です。" : `${ya < yb ? "A店" : "B店"}が ${yen(d)}安いです。`}` };
    },
    // まとめ買いの1個あたり
    matome(R) {
      const u = ri(R, 10, 40) * 10, n = pick(R, [3, 4, 5, 6, 10]), dd = ri(R, 1, Math.floor(u / 30)) * 10, M = n * (u - dd), it = pick(R, MATOME), md = ri(R, 0, MEDIA.length - 1);
      return { media: MEDIA[md], q: `${it}は1個${yen(u)}。${n}個まとめて買うと${yen(M)}。1個あたり、いくら安くなる？`, opts: optsOf(R, yen(dd), [yen(dd * n), yen(u - dd), yen(dd + 10), yen(dd * 2), yen(dd + 20), yen(u)], 4), ans: yen(dd), grp: "hitotsu", v: `${it}:${u}:${n}:${dd}:${md}`,
        why: `${yen(M)} ÷ ${n}個 ＝ 1個 ${yen(u - dd)}。${yen(u)} − ${yen(u - dd)} ＝ ${yen(dd)}安いです（${n}個ぜんぶで ${yen(dd * n)}）。` };
    },
    // 税込から税抜
    zeinuki(R) {
      const P = ri(R, 1, 60) * 100, y = P * (100 + TAX) / 100, it = pick(R, ITEM), md = ri(R, 0, MEDIA.length - 1);
      return { media: MEDIA[md], q: `${it}が税込${yen(y)}（消費税10%）。税抜の値段は？`, opts: optsOf(R, yen(P), [yen(y * 9 / 10), yen(y - 10), yen(y - 100), yen(P - 10), yen(P + 10), yen(P - 20), yen(y * TAX / 100)], 4), ans: yen(P), grp: "modoshi", v: `${it}:${P}:${md}`,
        why: `税込は税抜の1.1倍なので、${yen(y)} ÷ 1.1 ＝ ${yen(P)}。${yen(y)} × 0.9 ＝ ${yen(y * 9 / 10)}とすると、まちがいです。` };
    },
    // ポイント還元の実質の割引
    point(R) {
      const p = pick(R, [5, 10, 20, 25, 50]), P = ri(R, 2, 30) * 1000, pt = P * p / 100, eff = Math.round(p / (100 + p) * 1000) / 10, md = ri(R, 0, MEDIA.length - 1);
      const s = (x) => `約${fmt(x)}%`, cand = [`${p}%`, s(Math.round((eff - 1) * 10) / 10), s(Math.round((p + p * p / 100) * 10) / 10), s(Math.round(eff / 2 * 10) / 10), s(Math.round((eff + 2) * 10) / 10)];
      return { media: MEDIA[md], q: `${yen(P)}の買い物で${p}%のポイント（${fmt(pt)}ポイント・1ポイント1円）がつく。次の買い物でぜんぶ使うと、${yen(P)}で${yen(P + pt)}分を買えたことになる。値引きにすると、およそ何%引き？`, opts: optsOf(R, s(eff), cand, 4), ans: s(eff), grp: "modoshi", v: `${p}:${P}:${md}`,
        why: `払ったのは ${yen(P)}、手に入れたのは ${yen(P + pt)}分。安くなった分 ${yen(pt)} ÷ ${yen(P + pt)} ＝ ${s(eff)}です。${p}%引きより少し少ないです。` };
    },
    // 2回の割引
    nijuu(R) {
      const a = ri(R, 2, 5), b = ri(R, 1, 3), tot = 10 * a + 10 * b - a * b, P = ri(R, 10, 50) * 100, it = pick(R, ITEM), md = ri(R, 0, MEDIA.length - 1);
      const name = a === 5 ? "半額" : `${a}割引`;
      return { media: MEDIA[md], q: `${yen(P)}の${it}が${name}。レジでさらに${b}割引。もとの値段から見て、全部で何%引き？`, opts: optsOf(R, `${tot}%引き`, [`${10 * a + 10 * b}%引き`, `${tot - 5}%引き`, `${tot + 5}%引き`, `${a * b * 10}%引き`, `${tot + 10}%引き`], 4), ans: `${tot}%引き`, grp: "kakeru", v: `${it}:${P}:${a}:${b}:${md}`,
        why: `${yen(P)} × ${(10 - a) / 10} ＝ ${yen(P * (10 - a) / 10)}。さらに × ${(10 - b) / 10} ＝ ${yen(P * (10 - a) * (10 - b) / 100)}。もとの ${100 - tot}%なので ${tot}%引きです（${10 * a + 10 * b}%引きではありません）。` };
    },
    // 割引後からもとの値段
    moto(R) {
      const P = ri(R, 5, 60) * 100, a = ri(R, 1, 5), y = P * (10 - a) / 10, it = pick(R, ITEM), md = ri(R, 0, MEDIA.length - 1);
      return { media: MEDIA[md], q: `${a}割引で${yen(y)}になった${it}。もとの値段は？`, opts: optsOf(R, yen(P), [yen(y * (10 + a) / 10), yen(y + a * 100), yen(y + a * 10), yen(P + 100), yen(P - 100)], 4), ans: yen(P), grp: "modoshi", v: `${it}:${P}:${a}:${md}`,
        why: `${a}割引の値段は、もとの ${(10 - a) / 10}倍。${yen(y)} ÷ ${(10 - a) / 10} ＝ ${yen(P)}です（${yen(y)} × ${(10 + a) / 10} ではありません）。` };
    },
  };

  const KINDS = [
    { id: "waribiki", lv: 0, name: "○割引", src: ["mext", "sogaku"], look: "1割は10%。○割引は、もとの（10 − ○）割を払います。", key: "3割引 ＝ もとの値段 × 0.7" },
    { id: "off", lv: 0, name: "○%オフ", src: ["mext", "sogaku"], look: "○%オフは、もとの（100 − ○）%を払います。", key: "20%オフ ＝ もとの値段 × 0.8" },
    { id: "zeikomi", lv: 0, name: "税込にする", src: ["sogaku", "zeiritsu"], look: "消費税10%なら、税抜の値段に1.1をかけます。", key: "税込 ＝ 税抜 × 1.1（10%の品物）" },
    { id: "tanka", lv: 1, name: "100gあたり", src: ["mext"], look: "量がちがうときは、100gあたりにそろえてくらべます。", key: "100gあたり ＝ 値段 ÷（g ÷ 100）" },
    { id: "kurabe", lv: 1, name: "割引と円引き", src: ["mext"], look: "両方の値段を出してから、引き算します。", key: "○割引と○円引きは、値段しだいでお得が入れかわる" },
    { id: "matome", lv: 1, name: "まとめ買い", src: ["mext"], look: "まとめた値段を個数でわると、1個あたりです。", key: "1個あたり ＝ まとめた値段 ÷ 個数" },
    { id: "zeinuki", lv: 2, name: "税抜にもどす", src: ["sogaku", "zeiritsu"], look: "税込 ÷ 1.1 が税抜。× 0.9 ではありません。", key: "税抜 ＝ 税込 ÷ 1.1" },
    { id: "point", lv: 2, name: "ポイント還元", src: ["mext"], look: "払ったお金と、手に入れた分の合計でわります。", key: "10%ポイントは、約9.1%引きと同じ" },
    { id: "nijuu", lv: 2, name: "2回の割引", src: ["mext"], look: "割引を2回かけ算します。足し算ではありません。", key: "半額のさらに2割引は60%引き（70%引きではない）" },
    { id: "moto", lv: 2, name: "もとの値段", src: ["mext"], look: "引いたあとの値段を、（1 − 割合）でわります。", key: "もとの値段 ＝ 引いたあと ÷ 0.7（3割引のとき）" },
  ];
  for (const k of KINDS) k.make = MK[k.id];
  const BY = Object.fromEntries(KINDS.map((k) => [k.id, k]));
  const kindsOf = (lv) => KINDS.filter((k) => k.lv === lv).map((k) => k.id);

  function seedOf(str) { let h = 2166136261; for (const ch of String(str)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
  function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

  // 1問を作る。tag は「種類|種」。同じ tag ならいつも同じ問題
  function make(tag) {
    const [kind] = String(tag).split("|"), k = Object.prototype.hasOwnProperty.call(BY, kind) ? BY[kind] : null;
    if (!k) return null;
    const p = k.make(rng(seedOf(tag)), k.lv);
    return { tag, kind, lv: k.lv, name: k.name, look: k.look, key: k.key, type: "act", rev: false, src: k.src.map((s) => SRC[s]), ...p };
  }
  const keyOf = (P) => `${P.kind}:${P.q}:${P.opts.slice().sort().join("/")}`;

  // 今日の5問（やさしい2・ふつう2・むずかしい1）。種類は重ねない
  function dailyTags(date) {
    const R = rng(seedOf("day:" + date)), e = pickN(R, kindsOf(0), 2), n = pickN(R, kindsOf(1), 2), h = pickN(R, kindsOf(2), 1);
    return [...e, ...n, ...h].map((id, i) => `${id}|${date}:d${i}`);
  }
  // 上級の3問（むずかしいだけ・今日の5問のむずかしいとは別の種類）
  function hardTags(date) {
    const dh = dailyTags(date)[4].split("|")[0], R = rng(seedOf("hard:" + date)), h = pickN(R, kindsOf(2).filter((x) => x !== dh), 3);
    return h.map((id, i) => `${id}|${date}:h${i}`);
  }

  const OTK = { KINDS, BY, GROUPS, LV, SRC, TAX, kindsOf, seedOf, rng, make, keyOf, dailyTags, hardTags, pickN };
  if (typeof module !== "undefined" && module.exports) module.exports = OTK; else root.OTK = OTK;
})(typeof self !== "undefined" ? self : this);
