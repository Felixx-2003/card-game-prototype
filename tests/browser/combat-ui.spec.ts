import {test,expect,type Page} from '@playwright/test';
const SAVE='card-game-prototype-v1';
async function battle(page:Page,opts:{hp?:number;energy?:number;cards?:string[];statuses?:boolean}={}) {
 await page.goto('/');await page.evaluate(async opts=>{
  const path='/src/engine.ts',data='/src/data.ts';const e=await import(path),d=await import(data);const s=e.startRun('warrior',42);
  const ids=opts.cards??['slash','rally','cleave','chain-lightning','sunburst'];
  for(const id of ids)if(!s.cards.some((c:any)=>c.defId===id))s.cards.push({uid:'qa-'+id,defId:id,upgraded:false});
  s.hand=ids.map(id=>s.cards.find((c:any)=>c.defId===id).uid);s.deck=s.cards.filter((c:any)=>!s.hand.includes(c.uid)).map((c:any)=>c.uid);s.discard=[];
  s.hp=opts.hp??74;s.energy=opts.energy??3;
  if(opts.statuses){s.statuses={burn:2,poison:3,weak:2,freeze:1,vulnerable:2};s.shield=7;s.enemies[0].statuses={burn:2,weak:2};s.globalBuffs=['keen-edge','spell-spring','forest-aegis','rune-resonance'];}
  localStorage.setItem('card-game-prototype-v1',JSON.stringify(s));localStorage.setItem('card-game-prototype-tutorial-v1',JSON.stringify({tutorialCompleted:true}));localStorage.setItem('card-game-prototype-ui-v2',JSON.stringify({theme:'c'}));
 },opts);await page.reload();await page.getByRole('button',{name:/Continue adventure/}).click();await page.waitForTimeout(700);
}

test('flat hand shows full contents, contained costs, uniform scaling and tray-only snap scrolling',async({page})=>{
 await battle(page,{cards:['rune-fire','rune-echo','rune-blood','flame-sword','fortify'],energy:0});
 await expect(page.locator('[data-card-id=rune-fire] .card-description [data-effect=burn]')).toHaveCount(1);await expect(page.locator('[data-card-id=rune-blood] .card-description [data-effect=power]')).toHaveCount(1);await expect(page.locator('[data-card-id=rune-blood] .card-description [data-effect=blood]')).toHaveCount(1);
 await page.getByRole('button',{name:/View Deck/}).click();while(await page.locator('.deck-modal [data-card-id=rune-fire]').count()===0)await page.getByRole('button',{name:'Next cards'}).click();await expect(page.locator('.deck-modal [data-card-id=rune-fire] [data-effect=burn]')).toHaveCount(2);while(await page.locator('.deck-modal [data-card-id=rune-blood]').count()===0)await page.getByRole('button',{name:'Next cards'}).click();await expect(page.locator('.deck-modal [data-card-id=rune-blood] [data-effect=power]')).toHaveCount(1);await page.locator('.modal-backdrop .close-button').click();
 for(const [width,height] of [[1280,720],[1366,768],[1920,1080],[844,390],[640,360]]) {
  await page.setViewportSize({width,height});await page.mouse.move(20,20);await page.waitForTimeout(220);
  const report=await page.locator('.hand').evaluate(el=>{const cards=[...el.querySelectorAll('.playing-card')],boxes=cards.map(c=>c.getBoundingClientRect());return {fixed:document.documentElement.scrollHeight<=innerHeight+1,widths:boxes.map(b=>b.width),gaps:boxes.slice(1).map((b,i)=>b.left-boxes[i].right),snap:getComputedStyle(el).scrollSnapType,scroll:el.scrollWidth>el.clientWidth+1,cards:cards.map(c=>{const b=c.getBoundingClientRect(),cost=c.querySelector('.energy-cost')!.getBoundingClientRect(),desc=c.querySelector('.card-description')!;return {flat:getComputedStyle(c).transform==='none',art:getComputedStyle(c.querySelector('.card-art')!).display!=='none',rules:desc.scrollHeight<=desc.clientHeight+1,cost:cost.left>=b.left&&cost.right<=b.right&&cost.top>=b.top&&cost.bottom<=b.bottom};})};});
  expect(report.fixed).toBe(true);expect(Math.max(...report.widths)-Math.min(...report.widths)).toBeLessThan(1);for(const gap of report.gaps)expect(gap).toBeGreaterThanOrEqual(12);
  for(const card of report.cards)expect(Object.values(card).every(Boolean),JSON.stringify({width,height,card})).toBe(true);
  if(height>500)expect(report.scroll).toBe(false);else{expect(report.snap).toContain('x');await page.locator('.hand .playing-card').last().scrollIntoViewIfNeeded();await expect(page.locator('.hand .playing-card').last()).toBeInViewport();}
 }
 await page.setViewportSize({width:1280,height:720});const first=page.locator('.hand .playing-card').first(),other=page.locator('.hand .playing-card').nth(1);await page.mouse.move(20,20);await page.waitForTimeout(220);const a=await first.boundingBox(),b=await other.boundingBox();await first.hover();await page.waitForTimeout(220);const h=await first.boundingBox(),n=await other.boundingBox();expect(a!.y-h!.y).toBeGreaterThanOrEqual(8);expect(n!.x).toBeCloseTo(b!.x,1);expect(n!.y).toBeCloseTo(b!.y,1);expect(h!.x+h!.width).toBeLessThan(n!.x);
});

test('HP bars expose exact values, threshold colors, damage ghosts, healing and reduced motion',async({page})=>{
 for(const [hp,state] of [[74,'healthy'],[44,'wounded'],[22,'danger'],[11,'danger critical']] as const){await battle(page,{hp,cards:['fireball','heal','guard']});await expect(page.locator('.player-card .unit-hp')).toHaveClass(new RegExp(state.split(' ').join('.*')));await expect(page.locator('.player-card .hp-track')).toHaveAttribute('aria-valuenow',String(hp));await expect(page.locator('.player-card .hp-track')).toContainText(`${hp} / 74`);await expect(page.locator('.unit-health')).toHaveCount(0);}
 // Capture the real transient DOM state at commit time rather than racing a 180 ms timer.
 await page.locator('.enemy-card .hp-track').first().evaluate(track=>{const samples:{fill:number;ghost:number}[]=[];(window as unknown as {hpSamples:typeof samples}).hpSamples=samples;new MutationObserver(()=>samples.push({fill:parseFloat((track.querySelector('.hp-fill') as HTMLElement).style.width),ghost:parseFloat((track.querySelector('.hp-ghost') as HTMLElement).style.width)})).observe(track,{subtree:true,attributes:true,attributeFilter:['style']});});
 await page.locator('.hand [data-card-id=fireball]').click();await page.locator('.enemy-card').first().click();
 const hp=page.locator('.enemy-card').first().locator('.unit-hp');expect(await page.evaluate(()=>(window as unknown as {hpSamples:{fill:number;ghost:number}[]}).hpSamples.some(s=>s.fill<s.ghost))).toBe(true);await page.waitForTimeout(750);expect(await hp.locator('.hp-fill').getAttribute('style')).toBe(await hp.locator('.hp-ghost').getAttribute('style'));
 await battle(page,{hp:11,cards:['heal','guard']});await page.locator('.hand [data-card-id=heal]').click();await page.locator('.player-card').click();await expect(page.locator('.player-card .hp-heal')).toHaveCount(1);await expect(page.locator('.player-card .hp-track')).toContainText('23 / 74');await page.waitForTimeout(700);await expect(page.locator('.hp-heal')).toHaveCount(0);
 await page.emulateMedia({reducedMotion:'reduce'});await battle(page,{hp:11});expect(await page.locator('.player-card .hp-track').evaluate(e=>getComputedStyle(e).animationName)).toBe('none');expect(await page.locator('.player-card .hp-fill').evaluate(e=>getComputedStyle(e).transitionDuration)).toBe('0s');
});

test('shared stat icons and tooltips support hover, keyboard, touch and viewport edges',async({page,browser})=>{
 await battle(page,{statuses:true});
 for(const selector of ['.player-card .unit-attack .effect-chip','.player-card .unit-counter .effect-chip','.player-card .unit-hp','.intent-help','.status-burn','.buff-icon','.passive-skill']) {
  const chip=page.locator(selector).first();await chip.hover();await expect(page.getByRole('tooltip')).toBeVisible();await expect(page.getByRole('tooltip').locator('svg')).toHaveCount(1);await page.keyboard.press('Escape');await chip.focus();await expect(page.getByRole('tooltip')).toBeVisible();const r=await page.getByRole('tooltip').boundingBox();expect(r!.x).toBeGreaterThanOrEqual(0);expect(r!.y).toBeGreaterThanOrEqual(0);expect(r!.x+r!.width).toBeLessThanOrEqual(1280);expect(r!.y+r!.height).toBeLessThanOrEqual(800);await page.keyboard.press('Escape');await page.mouse.move(20,20);
 }
 const touch=await browser.newContext({viewport:{width:844,height:390},hasTouch:true,isMobile:true});const mobile=await touch.newPage();await battle(mobile,{statuses:true});const rail=await mobile.locator('.hero-and-gear .status-rail').boundingBox(),actor=await mobile.locator('.player-card').boundingBox(),tray=await mobile.locator('.hand').boundingBox();expect(rail!.y+rail!.height).toBeLessThanOrEqual(actor!.y+actor!.height+1);expect(rail!.y+rail!.height).toBeLessThan(tray!.y);
 const hp=mobile.locator('.player-card .unit-hp'),before=await mobile.evaluate(k=>localStorage.getItem(k),SAVE);await hp.tap();await expect(mobile.getByRole('tooltip')).toBeVisible();expect(await mobile.evaluate(k=>localStorage.getItem(k),SAVE)).toBe(before);await mobile.keyboard.press('Escape');await hp.dispatchEvent('pointerdown',{pointerType:'touch',clientX:420,clientY:210});await mobile.waitForTimeout(420);await expect(mobile.getByRole('tooltip')).toBeVisible();await hp.dispatchEvent('pointerup',{pointerType:'touch'});const r=await mobile.getByRole('tooltip').boundingBox();expect(r!.x+r!.width).toBeLessThanOrEqual(844);expect(r!.y+r!.height).toBeLessThanOrEqual(390);await touch.close();
});

test('five original rarity constructions stay distinct while elements retain their own art tones',async({page})=>{
 await battle(page);const result=await page.locator('.hand .playing-card').evaluateAll(cards=>cards.map(c=>({rarity:c.getAttribute('data-rarity'),gem:c.querySelector('.rarity-mark svg path')!.getAttribute('d'),edge:getComputedStyle(c).borderWidth,ornament:getComputedStyle(c,':before').borderStyle,art:getComputedStyle(c.querySelector('.card-art')!).backgroundColor})));
 expect(new Set(result.map(c=>c.rarity)).size).toBe(5);expect(new Set(result.map(c=>c.gem)).size).toBe(5);expect(result.find(c=>c.rarity==='uncommon')!.ornament).toBe('dashed');expect(parseFloat(result.find(c=>c.rarity==='legendary')!.edge)).toBeGreaterThan(parseFloat(result.find(c=>c.rarity==='common')!.edge));
 await battle(page,{cards:['ice-ward','slash','rally','cleave','sunburst']});const ice=page.locator('[data-card-id=ice-ward]');const iceTone=await ice.locator('.card-art').evaluate(e=>getComputedStyle(e).backgroundColor);// Exercise the CSS rarity/element cross-product without changing card rules or module caches.
 await ice.evaluate(e=>e.setAttribute('data-rarity','legendary'));await expect(ice).toHaveAttribute('data-rarity','legendary');expect(await ice.locator('.card-art').evaluate(e=>getComputedStyle(e).backgroundColor)).toBe(iceTone);
 await page.emulateMedia({reducedMotion:'reduce'});expect(await page.locator('[data-rarity=legendary]').first().evaluate(e=>getComputedStyle(e,':after').animationName)).toBe('none');
});
