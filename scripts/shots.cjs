// usage: node scripts/shots.cjs <outDir> [mobile]
const { chromium } = require("playwright");
(async () => {
  const out = process.argv[2], mobile = process.argv[3] === "mobile";
  const b = await chromium.launch({ args: ["--use-gl=angle","--use-angle=swiftshader","--enable-webgl","--ignore-gpu-blocklist","--enable-unsafe-swiftshader"] });
  const ctx = await b.newContext(mobile ? { viewport:{width:390,height:844}, deviceScaleFactor:1, hasTouch:true, isMobile:true } : { viewport:{width:1440,height:900} });
  const p = await ctx.newPage();
  const errs=[]; p.on("console",m=>{ if(["error","warning"].includes(m.type())) errs.push(m.type()+": "+m.text().slice(0,200)); }); p.on("pageerror",e=>errs.push("PAGEERROR "+e.message));
  await p.goto("http://localhost:3000/",{waitUntil:"load"}); await p.waitForTimeout(6000);
  const secs = await p.evaluate(()=>{ const t=q=>document.querySelector(q).getBoundingClientRect().top+scrollY; const h=q=>document.querySelector(q).offsetHeight; const v=innerHeight; return {
    hero:0, flood:h("#hero-wrap")*0.25, intro:t("#intro")+v*.3, diff:t("#difference")+60, p1:t("#products")+10, p2:t("#products")+(h("#products")-v)*.34, p4:t("#products")+(h("#products")-v)*.99, quiz:t("#quiz"), story:t("#story")+(h("#story")-v)*.5, love:t("#love"), community:t("#community"), faq:t("#faq"), contact:t("#contact"), end:document.documentElement.scrollHeight }; });
  for (const [k,y] of Object.entries(secs)) {
    await p.evaluate(y=>{ const l=window.__lenis; if(l) l.scrollTo(y,{immediate:true,force:true}); else window.scrollTo(0,y); },y);
    await p.waitForTimeout(2500);
    await p.screenshot({path:`${out}/${k}.png`});
  }
  console.log(JSON.stringify(errs.slice(0,15),null,1));
  await b.close();
})();
