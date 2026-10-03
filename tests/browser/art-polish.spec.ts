import {test,expect} from '@playwright/test';
const KEY='card-game-prototype-tutorial-v1',SAVE='card-game-prototype-v1';
test.beforeEach(async({page})=>{await page.goto('/');await page.evaluate(()=>localStorage.clear());await page.reload();await page.getByLabel('Art theme',{exact:true}).selectOption('c');});
async function practice(page:any) {
 await page.getByRole('button',{name:'Next',exact:true}).click();
 for(let step=1;step<=4;step++){const s=await page.locator('.guided-tutorial').getAttribute('data-target-selector');await page.locator(s!).first().click();await expect(page.locator('.guided-tip')).toHaveAttribute('data-step',String(step+1));}
 await page.getByRole('button',{name:'Next',exact:true}).click();await page.getByRole('button',{name:'Finish tutorial'}).click();
}
test('guided first run gates actions, completes once, and replay preserves the real run',async({page})=>{
 await page.getByRole('button',{name:/New adventure/}).click();await page.locator('.hero-choice.warrior').click();
 await expect(page.locator('.guided-tip')).toHaveAttribute('data-step','0');
 await page.getByRole('button',{name:'Pause',exact:true}).dispatchEvent('click');await expect(page.locator('.battle-board')).toBeVisible();
 await page.keyboard.press('Escape');await expect(page.locator('.guided-tip')).toHaveAttribute('data-step','0');
 await practice(page);await expect(page.locator('.guided-tutorial')).toHaveCount(0);
 expect(await page.evaluate(k=>JSON.parse(localStorage.getItem(k)!).tutorialCompleted,KEY)).toBe(true);
 const original=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)!),SAVE);
 await page.getByRole('button',{name:'Tutorial',exact:true}).click();await practice(page);
 expect(await page.evaluate(k=>JSON.parse(localStorage.getItem(k)!),SAVE)).toEqual(original);
 await page.reload();await page.getByRole('button',{name:/New adventure/}).click();await page.locator('.hero-choice.mage').click();await expect(page.locator('.guided-tutorial')).toHaveCount(0);
});
test('cartoon vectors, fixed landscape battle, portrait prompt, and archived art',async({page})=>{
 await expect(page.locator('.menu-hero [data-cartoon]')).toHaveCount(1);await expect(page.locator('.menu-hero image')).toHaveCount(0);
 await page.evaluate(k=>localStorage.setItem(k,JSON.stringify({tutorialCompleted:true})),KEY);
 await page.getByRole('button',{name:/New adventure/}).click();await page.locator('.hero-choice.mage').click();
 for(const [width,height] of [[1280,720],[1366,768],[1024,768],[844,390],[932,430],[667,375],[640,360]]) {
  await page.setViewportSize({width,height});await page.waitForTimeout(250);
  const result=await page.evaluate(()=>{
   const r=(s:string)=>document.querySelector(s)!.getBoundingClientRect();const actor=r('.enemy-card'),hero=r('.player-card'),hand=r('.hand .playing-card');
   const selectors=['.ability-button','.end-turn-button','.battle-left .side-actions button','.battle-right .side-actions button','.equipment-slots','.hand','.player-card','.enemy-card','.intent'];
   return {scroll:document.documentElement.scrollHeight<=innerHeight+1,sizes:[actor.width,hero.width,actor.height,hero.height,hand.width,hand.height],bounds:selectors.map(s=>{const b=r(s);return {s,valid:b.x>=0&&b.right<=innerWidth+1&&b.y>=0&&b.bottom<=innerHeight+1};}),title:r('.encounter-heading').bottom,intent:r('.intent').top,fonts:[...new Set([...document.querySelectorAll('button,h1,h2,.card-description')].map(e=>getComputedStyle(e).fontFamily))]};
  });
  expect(result.scroll).toBe(true);expect(result.sizes[0]).toBeCloseTo(result.sizes[1],0);expect(result.sizes[2]).toBeCloseTo(result.sizes[3],0);if(height>500){expect(result.sizes[4]).toBeLessThan(result.sizes[0]);expect(result.sizes[5]).toBeLessThan(result.sizes[2]);}else expect(result.sizes[4]).toBeGreaterThanOrEqual(108);
  for(const b of result.bounds)expect(b.valid,width+' '+b.s).toBe(true);expect(result.title).toBeLessThanOrEqual(result.intent+1);expect(result.fonts).toHaveLength(1);expect(result.fonts[0]).toContain('Nunito');
 }
 await page.setViewportSize({width:390,height:844});await expect(page.getByRole('heading',{name:'Rotate device to play'})).toBeVisible();await expect(page.locator('.battle-board')).toBeHidden();
 await page.setViewportSize({width:1280,height:720});await page.getByLabel('Art theme',{exact:true}).selectOption('d');await expect(page.locator('.player-card image')).toHaveAttribute('href','/art/storybook-atlas.png');
 for(const theme of ['a','b','c']){await page.getByLabel('Art theme',{exact:true}).selectOption(theme);await expect(page.locator('.player-card svg').first()).toBeVisible();}
});
test('practice is usable at smallest landscape with every spotlight visible',async({page})=>{
 await page.setViewportSize({width:640,height:360});await page.getByRole('button',{name:/New adventure/}).click();await page.locator('.hero-choice.mage').click();
 for(let step=0;step<7;step++){
  await expect(page.locator('.guided-tip')).toHaveAttribute('data-step',String(step));
  const r=await page.locator('.guided-tip').boundingBox();expect(r!.y).toBeGreaterThanOrEqual(0);expect(r!.y+r!.height).toBeLessThanOrEqual(360);
  if([0,5,6].includes(step))await page.locator('.guided-tip button').click();else{const s=await page.locator('.guided-tutorial').getAttribute('data-target-selector');await page.locator(s!).first().click();}
 }
 await expect(page.locator('.guided-tutorial')).toHaveCount(0);
});

test('three enemies and long Rune rules fit the smallest landscape without ornament overlap',async({page})=>{
 await page.evaluate(async()=>{const path='/src/engine.ts';const e=await import(path);const s=e.startRun('warrior',42);s.enemies.push({...structuredClone(s.enemies[0]),uid:'enemy-2'});s.enemies.forEach((x:any)=>x.statuses={burn:2,weak:1,poison:3});s.globalBuffs=['keen-edge','spell-spring','forest-aegis'];const ids=['rune-fire','rune-echo','rune-blood','flame-sword','fortify'];for(const id of ids)if(!s.cards.find((c:any)=>c.defId===id))s.cards.push({uid:'qa-'+id,defId:id,upgraded:false});s.hand=ids.map(id=>s.cards.find((c:any)=>c.defId===id).uid);s.deck=s.cards.filter((c:any)=>!s.hand.includes(c.uid)).map((c:any)=>c.uid);localStorage.setItem('card-game-prototype-v1',JSON.stringify(s));});
 await page.reload();await page.getByRole('button',{name:/Continue adventure/}).click();await page.setViewportSize({width:640,height:360});await page.waitForTimeout(400);
 const result=await page.evaluate(()=>{
  const all=[...document.querySelectorAll('.enemy-card,.player-card,.end-turn-button,.status-rail .status-icon')].map(e=>e.getBoundingClientRect());
  return {all:all.map(r=>r.x>=0&&r.right<=innerWidth&&r.y>=0&&r.bottom<=innerHeight),cards:[...document.querySelectorAll('.playing-card')].map(e=>{const d=e.querySelector('.card-description')!;const a=d.getBoundingClientRect(),b=e.querySelector('.rarity-mark')!.getBoundingClientRect();return {text:d.scrollHeight<=d.clientHeight+1,ornament:b.bottom<=a.top||b.top>=a.bottom||b.right<=a.left||b.left>=a.right};})};
 });
 expect(result.all.every(Boolean)).toBe(true);for(const c of result.cards){expect(c.text).toBe(true);expect(c.ornament).toBe(true);}
 await page.locator('.hand .playing-card').first().click();
 for(const width of [640,844]){await page.setViewportSize({width,height:390});const discard=await page.getByRole('button',{name:'Discard card'}).boundingBox();expect(discard!.y+discard!.height).toBeLessThanOrEqual(390);const buff=await page.locator('.global-buffs').boundingBox(),deck=await page.locator('.battle-left .side-actions button').first().boundingBox();expect(buff!.y+buff!.height).toBeLessThanOrEqual(deck!.y);}
 await page.setViewportSize({width:640,height:360});await page.getByRole('button',{name:'Settings',exact:true}).click();const box=await page.getByRole('dialog',{name:'Settings',exact:true}).boundingBox();expect(Math.abs(box!.x+box!.width/2-320)).toBeLessThan(2);expect(Math.abs(box!.y+box!.height/2-180)).toBeLessThan(2);
});
