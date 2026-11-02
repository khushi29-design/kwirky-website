// End-to-end checks. Run with a server on :3000: NODE_PATH="$(npm root -g)" npm run qa
const { chromium } = require("playwright");
const B = "http://localhost:3000";
const pages = ["/","/about","/products","/products/orange-can","/products/lime-can","/products/coral-can","/products/plum-can","/testimonials","/contact","/faq","/team","/quiz","/privacy","/terms","/cart","/checkout"];
const results=[]; const ok=(n,c,x="")=>{results.push(c);console.log(`${c?"PASS":"FAIL"}  ${n}${x?"  "+x:""}`)};
(async()=>{
 const b=await chromium.launch({args:["--use-gl=angle","--use-angle=swiftshader","--enable-webgl","--ignore-gpu-blocklist","--enable-unsafe-swiftshader"]});
 for(const [label,opt] of [["desktop",{viewport:{width:1440,height:900}}],["mobile",{viewport:{width:390,height:844},hasTouch:true,isMobile:true}],["tablet",{viewport:{width:820,height:1180},hasTouch:true}]]){
  const ctx=await b.newContext(opt); const p=await ctx.newPage(); let errs=[],bad=[];
  p.on("console",m=>{if(m.type()==="error"||m.type()==="warning")errs.push(m.text().slice(0,160))}); p.on("pageerror",e=>errs.push("EXC "+e.message));
  p.on("response",r=>{if(r.status()>=400&&!r.url().includes("wa.me"))bad.push(r.status()+" "+r.url())});
  const links=new Set();
  for(const u of pages){
   await p.goto(B+u,{waitUntil:"load"}); await p.waitForTimeout(u==="/"?2500:500);
   const o=await p.evaluate(()=>({over:document.documentElement.scrollWidth-innerWidth,h1:document.querySelectorAll("h1").length,broken:[...document.images].filter(i=>i.complete&&!i.naturalWidth&&i.loading!=="lazy").map(i=>i.src),links:[...document.querySelectorAll("a[href]")].map(a=>a.getAttribute("href"))}));
   ok(`${label} ${u} no sideways scroll, one h1, images ok`,o.over<=0&&o.h1===1&&!o.broken.length,`over=${o.over} h1=${o.h1} ${o.broken}`);
   o.links.filter(l=>l.startsWith("/")).forEach(l=>links.add(l));
   for(const a of o.links.filter(l=>l.startsWith("#"))) ok(`${label} ${u} anchor ${a}`,await p.locator(a).count()===1);
  }
  for(const l of links){const r=await ctx.request.get(B+l);if(!r.ok())ok(`${label} link ${l}`,false,String(r.status()))}
  ok(`${label} all ${links.size} internal links resolve`,true);
  // images incl. lazy
  await p.goto(B+"/products");await p.waitForTimeout(800);ok(`${label} product images`,await p.evaluate(async()=>{for(const i of document.images){i.loading="eager";await i.decode().catch(()=>{})}return [...document.images].every(i=>i.naturalWidth>0)}));
  // quiz every path
  await p.goto(B+"/quiz");await p.waitForTimeout(600);
  const quiz=async(n)=>{for(let q=0;q<4;q++){await p.locator(".answer").nth(n).click();await p.getByRole("button",{name:q===3?"See my result":"Next",exact:true}).click();await p.waitForTimeout(120)};return p.locator(".quiz-result h3").innerText()};
  const names=[];for(const n of [0,1,2,3]){names.push(await quiz(n));await p.getByRole("button",{name:"Restart quiz"}).click();await p.waitForTimeout(100)}
  ok(`${label} quiz reaches results and restarts`,names.length===4&&await p.locator(".quiz legend").count()===1,names.join(" | "));
  ok(`${label} quiz Next disabled until answered`,await p.getByRole("button",{name:"Next",exact:true}).isDisabled());
  await p.locator(".answer").nth(0).click();await p.getByRole("button",{name:"Next",exact:true}).click();await p.waitForTimeout(100);await p.getByRole("button",{name:"Back"}).click();await p.waitForTimeout(100);
  ok(`${label} quiz Back keeps answer`,await p.locator(".answer input").nth(0).isChecked());
  // cart
  await p.goto(B+"/products/lime-can");await p.waitForTimeout(500);
  await p.getByRole("button",{name:"Increase quantity"}).click();await p.getByRole("button",{name:"Add to cart"}).click();
  ok(`${label} add to cart x2`,(await p.getByLabel(/^Cart/).getAttribute("aria-label")).includes("2 items"));
  await p.goto(B+"/cart");await p.waitForTimeout(400);await p.getByRole("button",{name:"Increase quantity"}).click();
  ok(`${label} cart persists & qty`,await p.locator(".cart-line output").innerText()==="3");
  await p.getByRole("link",{name:"Continue to order enquiry"}).click();await p.waitForURL("**/checkout");
  await p.getByRole("button",{name:"Send enquiry on WhatsApp"}).click();ok(`${label} checkout validation`,await p.locator(".field-error").count()===3);
  await p.fill("#order-name","Test");await p.fill("#order-phone","9876543210");await p.fill("#order-city","Nagpur");
  await p.route("https://wa.me/**",r=>r.fulfill({body:"ok"}));
  const popP=ctx.waitForEvent("page");await p.getByRole("button",{name:"Send enquiry on WhatsApp"}).click();const pop=await popP;
  const waurl=decodeURIComponent(await p.getByRole("link",{name:"Open WhatsApp again"}).getAttribute("href"));ok(`${label} WhatsApp enquiry`,waurl.includes("918087806310")&&waurl.includes("3 x Lime can"));await pop.close();
  await p.getByRole("button",{name:"Clear my cart"}).click();
  // contact
  await p.goto(B+"/contact");await p.waitForTimeout(400);await p.evaluate(()=>{window.__m=null});
  await p.locator("main form button").click();ok(`${label} contact validation`,await p.locator("main .field-error").count()===3);
  await p.fill("#contact-name","Test");await p.fill("#contact-email","bad");await p.fill("#contact-message","Hello from the test run");await p.locator("main form button").click();ok(`${label} bad email rejected`,await p.locator("main .field-error").count()===1);
  await p.fill("#contact-email","a@b.co");await p.locator("main form button").click();await p.waitForTimeout(200);ok(`${label} contact handoff state`,await p.getByText("Your email app is opening").count()===1);
  // newsletter
  await p.fill("#news-email","x");await p.locator(".news-form button").click();ok(`${label} newsletter validation`,await p.locator(".news-form .field-error").count()===1);
  await p.fill("#news-email","a@b.co");await p.locator(".news-form button").click();await p.waitForTimeout(150);ok(`${label} newsletter handoff`,await p.getByText("Press send to join").count()===1);
  // faq
  await p.goto(B+"/faq");await p.waitForTimeout(400);await p.getByRole("button",{name:"What are probiotics?"}).click();ok(`${label} FAQ opens`,await p.getByRole("button",{name:"What are probiotics?"}).getAttribute("aria-expanded")==="true");
  // search
  await p.getByRole("button",{name:"Search the site"}).click();await p.fill("#site-search","whatsapp");await p.waitForTimeout(100);ok(`${label} search results`,await p.locator(".search-results a").count()>0);
  await p.fill("#site-search","zzzz");ok(`${label} search empty state`,await p.locator(".search-empty").count()===1);await p.keyboard.press("Escape");ok(`${label} search Esc closes`,await p.locator(".search").count()===0);
  // testimonials slider
  await p.goto(B+"/testimonials");await p.waitForTimeout(400);await p.getByRole("button",{name:"Next review"}).click();await p.waitForTimeout(900);ok(`${label} slider`,await p.locator(".voices-nav span").innerText()==="2 of 3");
  // mobile menu
  if(label!=="desktop"){await p.getByRole("button",{name:"Open menu"}).click();await p.waitForTimeout(600);ok(`${label} menu opens`,await p.locator("#mobile-menu a").first().isVisible());await p.locator("#mobile-menu a",{hasText:"About"}).click();await p.waitForURL("**/about");await p.waitForTimeout(600);ok(`${label} menu navigates, closes`,!(await p.locator("#mobile-menu").evaluate(e=>e.classList.contains("is-open"))))}
  else for(const [n,u] of [["About","/about"],["Products","/products"],["Quiz","/quiz"],["Contact","/contact"]]){await p.locator(".main-nav a",{hasText:n}).click();await p.waitForURL("**"+u);}
  // home
  await p.goto(B+"/");await p.waitForSelector(".loader.is-done",{state:"attached",timeout:15000});await p.waitForTimeout(2500);
  const painted=await p.evaluate(()=>{const s=window.__kwirkyScene;return !!s&&s.renderer.info.render.frame>0});
  ok(`${label} 3D scene rendering`,painted);
  await p.locator(".hero-side a",{hasText:"EXPLORE"}).click();await p.waitForTimeout(2500);
  ok(`${label} EXPLORE THE FIZZ scrolls to products`,Math.abs(await p.evaluate(()=>document.querySelector("#products").getBoundingClientRect().top))<60);
  const cw=await p.evaluate(async()=>{const h=document.querySelector("#products");const y=h.getBoundingClientRect().top+scrollY+h.offsetHeight-innerHeight-5;(window.__lenis?window.__lenis.scrollTo(y,{immediate:true,force:true}):window.scrollTo(0,y));await new Promise(r=>setTimeout(r,1500));return window.__kwirkyScene.currentColorway});
  if(label==="desktop")ok("desktop can colour follows products",cw==="plum",cw);
  // client-nav away & back: no leak errors
  await p.locator(".brand").click();await p.waitForTimeout(300);await p.goto(B+"/about");await p.goBack();await p.waitForTimeout(1500);
  const r404=await ctx.request.get(B+"/nope");ok(`${label} 404 page`,r404.status()===404);
  ok(`${label} console clean`,errs.length===0,[...new Set(errs)].slice(0,5).join(" || "));
  ok(`${label} no failed requests`,bad.filter(x=>!x.includes("/nope")).length===0,[...new Set(bad)].slice(0,5).join(" "));
  await ctx.close();
 }
 // No-WebGL + reduced motion fallback
 const ctx=await b.newContext({viewport:{width:1280,height:800},reducedMotion:"reduce"});const p=await ctx.newPage();const e=[];p.on("pageerror",x=>e.push(x.message));
 await p.goto(B+"/");await p.waitForTimeout(1500);ok("reduced motion uses stills",await p.evaluate(()=>document.documentElement.classList.contains("no3d")&&getComputedStyle(document.querySelector(".hero-fallback")).display==="block"));
 ok("reduced motion no errors, no sideways scroll",!e.length&&await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await p.screenshot({path:process.env.SHOT_DIR?process.env.SHOT_DIR+"/reduced.png":"/dev/null"}).catch(()=>{});
 await b.close();
 const f=results.filter(x=>!x).length;console.log(`\n${results.length-f} passed, ${f} failed`);process.exit(f?1:0);
})().catch(e=>{console.error(e);process.exit(2)});
