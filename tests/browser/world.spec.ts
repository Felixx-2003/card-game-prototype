import {test,expect} from '@playwright/test';
const SAVE='card-game-prototype-v1';
async function fixture(page:any,encounter=0){await page.evaluate(async(n:number)=>{const path='/src/engine.ts';const e=await import(path);let s=e.startRun('warrior',42);for(let i=0;i<n;i++){s.screen='progress';s=e.nextBattle(s);}localStorage.setItem('card-game-prototype-v1',JSON.stringify(s));},encounter);await page.reload();await page.getByRole('button',{name:/Continue adventure/}).click();await page.waitForTimeout(450);}
test.beforeEach(async({page})=>{await page.goto('/');await page.evaluate(()=>{localStorage.clear();localStorage.setItem('card-game-prototype-tutorial-v1',JSON.stringify({tutorialCompleted:true}));localStorage.setItem('card-game-prototype-ui-v2',JSON.stringify({theme:'c'}));});await page.reload();});
test('four layered worlds, platforms, parallax and scene entrances preserve battle state',async({page})=>{
 for(const [n,name] of ['forest','grove','ruins','arena'].entries()){
  await fixture(page,n);await expect(page.locator('.battle-world')).toHaveAttribute('data-environment',name);await expect(page.locator('.battle-platform')).toHaveCount(2);await expect(page.locator('.battle-world > svg')).toHaveCount(3);
  expect(await page.locator('.battle-world').evaluate(e=>getComputedStyle(e).animationName)).toBe('world-reveal');
  const before=await page.evaluate(k=>localStorage.getItem(k),SAVE);await page.mouse.move(50,90);await page.waitForTimeout(60);const a=await page.locator('.world-middle').evaluate(e=>getComputedStyle(e).transform);await page.mouse.move(1100,650);await page.waitForTimeout(60);expect(await page.locator('.world-middle').evaluate(e=>getComputedStyle(e).transform)).not.toBe(a);expect(await page.evaluate(k=>localStorage.getItem(k),SAVE)).toBe(before);
  for(const [width,height] of [[1366,768],[844,390],[640,360]]){await page.setViewportSize({width,height});await page.waitForTimeout(180);const geometry=await page.evaluate(()=>({scroll:document.documentElement.scrollHeight<=innerHeight+1,intents:[...document.querySelectorAll('.intent')].map(e=>{const range=document.createRange();range.selectNodeContents(e);const text=range.getBoundingClientRect(),badge=e.getBoundingClientRect();return text.top>=badge.top-1&&text.bottom<=badge.bottom+1;}),actors:[...document.querySelectorAll('.actor-card')].map(e=>{const r=e.getBoundingClientRect();return r.y>=0&&r.bottom<innerHeight;}),turn:document.querySelector('.end-turn-button')!.getBoundingClientRect().bottom}));expect(geometry.scroll).toBe(true);expect(geometry.intents.every(Boolean)).toBe(true);expect(geometry.actors.every(Boolean)).toBe(true);expect(geometry.turn).toBeLessThan(height);}
  await page.setViewportSize({width:1280,height:720});
 }
 for(const theme of ['a','b','d']){await page.getByLabel('Art theme',{exact:true}).selectOption(theme);await expect(page.locator('.battle-world')).toHaveCount(0);await expect(page.locator('.player-card')).toBeVisible();}
});
test('physical fan lifts on hover and separates selected cards without clipping',async({page})=>{
 await fixture(page);await page.mouse.move(20,20);const cards=page.locator('.hand .playing-card');const first=cards.first(),last=cards.last();const before=await first.boundingBox();expect(await first.evaluate(e=>getComputedStyle(e).transform)).not.toBe(await last.evaluate(e=>getComputedStyle(e).transform));
 await first.hover();await page.waitForTimeout(180);const hover=await first.boundingBox();expect(hover!.y).toBeLessThan(before!.y-8);expect(await first.evaluate(e=>{const m=new DOMMatrix(getComputedStyle(e).transform);return Math.hypot(m.a,m.b);})).toBeGreaterThan(1.05);
 await first.click();await page.mouse.move(20,20);await page.waitForTimeout(180);const selected=await first.boundingBox(),hand=await page.locator('.hand').boundingBox();expect(selected!.y).toBeLessThan(before!.y-10);expect(selected!.y).toBeGreaterThanOrEqual(hand!.y);expect(selected!.y+selected!.height).toBeLessThan(hand!.y+hand!.height);
});
test('card flights, actor lunges, spell impact, hit flash, status pop and defeat ghosts execute',async({page})=>{
 await page.addInitScript(()=>{const original=Element.prototype.animate;(window as any).__motions=[];Element.prototype.animate=function(...args:any[]){(window as any).__motions.push({target:(this as HTMLElement).dataset.target,duration:args[1]?.duration});return original.apply(this,args as any);};});
 await fixture(page);await page.locator('.hand [data-card-id="fireball"]').click();await page.locator('.enemy-card').first().click();await expect(page.locator('.card-flight')).toHaveCount(1);await expect(page.locator('.spell-burst')).toHaveCount(1);await expect(page.locator('.combat-flash')).toHaveCount(1);
 const burn=page.locator('.enemy-wrap').first().locator('.status-burn');await expect(burn).toBeVisible();expect(await burn.evaluate(e=>getComputedStyle(e).animationName)).toBe('status-pop');
 await page.locator('.hand [data-card-id="heavy-strike"]').click();await page.locator('.enemy-card').first().click();await expect(page.locator('.defeat-ghost')).toHaveCount(1);await expect(page.locator('.enemy-wrap').first()).toHaveClass(/fallen/);await expect(page.locator('.defeat-ghost')).toHaveCount(0);
 const firstMotions=await page.evaluate(()=>(window as any).__motions);expect(firstMotions.some((m:any)=>m.target==='hero'&&m.duration===300)).toBe(true);
 await fixture(page);await page.locator('.hand [data-card-id="flame-sword"]').click();await page.locator('.player-card').click();await expect(page.locator('.card-flight.drop')).toHaveCount(1);await page.getByRole('button',{name:/End turn/}).click();
 await page.waitForTimeout(80);const motions=await page.evaluate(()=>(window as any).__motions);expect(motions.some((m:any)=>m.target==='hero'&&m.duration===340)).toBe(true);expect(motions.some((m:any)=>m.target==='enemy-0'&&m.duration===300)).toBe(true);expect(motions.some((m:any)=>m.target==='hero'&&m.duration===280)).toBe(true);
});
test('reduced motion keeps the world playable and suppresses combat motion',async({page})=>{await page.emulateMedia({reducedMotion:'reduce'});await fixture(page);await page.locator('.hand [data-card-id="fireball"]').click();await page.locator('.enemy-card').first().click();await expect(page.locator('.card-flight')).toBeHidden();await expect(page.locator('.spell-burst')).toBeHidden();expect(await page.locator('.battle-world').evaluate(e=>getComputedStyle(e).animationName)).toBe('none');await expect(page.locator('.end-turn-button')).toBeEnabled();});

test('dragged cards stay visible above the world outside the hand and equip on drop',async({page})=>{
 await fixture(page);const gear=page.locator('.hand [data-card-id="flame-sword"]');await gear.hover();await page.waitForTimeout(160);const a=await gear.boundingBox(),hero=await page.locator('.player-card').boundingBox();await page.mouse.move(a!.x+a!.width/2,a!.y+a!.height/2);await page.mouse.down();await page.mouse.move(hero!.x+hero!.width/2,hero!.y+hero!.height/2,{steps:8});await expect(page.locator('.drag-preview')).toBeVisible();const drag=await page.locator('.drag-preview').boundingBox(),hand=await page.locator('.hand').boundingBox();expect(drag!.y+drag!.height).toBeLessThan(hand!.y);await page.mouse.up();await expect(page.locator('.drag-preview')).toHaveCount(0);await expect(page.locator('.gear-slot').first()).toContainText('Fire Sword');
});

test('Energy and End Turn share the hand decision zone on laptop, tablet and phone',async({page})=>{
 await fixture(page,1);
 for(const [width,height] of [[1366,768],[1024,768],[844,390],[932,430],[667,375],[640,360]]){
  await page.setViewportSize({width,height});await page.waitForTimeout(180);
  const layout=await page.evaluate(()=>{const rect=(s:string)=>document.querySelector(s)!.getBoundingClientRect();const e=rect('.energy-meter'),h=rect('.hand'),t=rect('.end-turn-button'),bar=rect('.energy-bar');return {energyNear:Math.abs(e.y+e.height/2-h.y-h.height/2)<h.height/2,turnNear:Math.abs(t.y+t.height/2-h.y-h.height/2)<h.height/2,energyLeft:e.right<=h.x+3,turnRight:t.x>=h.right-3,barFits:bar.right<=e.right,turnFits:t.right<=innerWidth,scroll:document.documentElement.scrollHeight<=innerHeight+1};});
  expect(Object.values(layout).every(Boolean),JSON.stringify({width,height,...layout})).toBe(true);
 }
});
