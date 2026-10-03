import { test, expect, type Page } from '@playwright/test';
test.beforeEach(async ({page})=>{await page.goto('/');await page.evaluate(()=>localStorage.clear());await page.reload();await page.getByLabel('Art theme',{exact:true}).selectOption('c');});
async function fontCheck(page: Page) {
  const fonts=await page.locator('h1,h2,h3,p,button,label,select,.card-name,.card-description,.actor-title').evaluateAll(els=>[...new Set(els.filter(e=>e.getBoundingClientRect().height>0).map(e=>getComputedStyle(e).fontFamily))]);
  expect(fonts.length).toBe(1);expect(fonts[0]).toContain('Nunito');expect(await page.evaluate(()=>document.fonts.check('16px Nunito'))).toBe(true);
}
async function centered(page: Page) {
  const r=await page.getByRole('dialog').boundingBox();const v=page.viewportSize()!;
  expect(Math.abs(r!.x+r!.width/2-v.width/2)).toBeLessThan(2);expect(Math.abs(r!.y+r!.height/2-v.height/2)).toBeLessThan(2);
  expect(r!.x).toBeGreaterThanOrEqual(12);expect(r!.y).toBeGreaterThanOrEqual(12);await fontCheck(page);
}
test('new C uses real illustration atlas; one font and centered modals at desktop and mobile',async({page})=>{
  await expect(page.locator('.menu-hero [data-illustration-cell="0"] image')).toHaveAttribute('href','/art/storybook-atlas.png');
  const size=await page.evaluate(async()=>{const img=new Image();img.src='/art/storybook-atlas.png';await img.decode();return [img.naturalWidth,img.naturalHeight];});expect(size[0]).toBeGreaterThan(1000);expect(size[0]).toBe(size[1]);
  for(const [width,height] of [[1280,720],[390,844]]) {
    await page.setViewportSize({width,height});await fontCheck(page);
    await page.getByRole('button',{name:'Open settings'}).click();await centered(page);await page.getByRole('button',{name:'Close settings'}).click();
    await page.getByRole('button',{name:/quick field guide/}).click();await centered(page);
    for(let n=0;n<2;n++){await page.getByRole('button',{name:'Next →'}).click();await centered(page);}
    await page.getByRole('button',{name:'Ready to play'}).click();
  }
  await page.getByRole('button',{name:/New adventure/}).click();await fontCheck(page);await page.locator('.hero-choice.mage').click();await fontCheck(page);
  await expect(page.locator('.player-card [data-illustration-cell="1"]')).toBeVisible();
  await page.getByRole('button',{name:'Open settings'}).click();await centered(page);await page.keyboard.press('Escape');
  await page.keyboard.press('`');await page.getByRole('button',{name:'win',exact:true}).click();await page.keyboard.press('`');await fontCheck(page);
});
test('guidance and former bottom labels stay above hero and hand even with selected cards',async({page})=>{
  await page.getByRole('button',{name:/New adventure/}).click();await page.locator('.hero-choice.warrior').click();
  for(const [width,height] of [[1280,720],[1280,800],[1920,1080],[390,844]]) {
    await page.setViewportSize({width,height});await page.waitForTimeout(400);await page.locator('.hand .playing-card').first().click();
    const a=await page.evaluate(()=>{const b=(s:string)=>document.querySelector(s)!.getBoundingClientRect();const guide=b('.target-instructions'), labels=b('.battle-footer'),hero=b('.player-zone'),hand=b('.hand');const controls=[...document.querySelectorAll('.target-instructions button,.battle-footer>*')].map(e=>{const r=e.getBoundingClientRect();const top=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return !!top&&(e.contains(top)||top.contains(e));});return {guide:guide.bottom,labels:labels.bottom,hero:hero.y,hand:hand.y,clear:controls.every(Boolean),scroll:document.documentElement.scrollHeight<=innerHeight+1};});
    expect(a.guide).toBeLessThan(a.hero);expect(a.labels).toBeLessThan(a.hero);expect(a.labels).toBeLessThan(a.hand);expect(a.clear).toBe(true);expect(a.scroll).toBe(true);
    await page.getByRole('button',{name:'Cancel',exact:true}).click();
  }
});
test('rarity uses visibly different frames, ornamental motifs and background treatment',async({page})=>{
  await page.evaluate(async()=>{const path='/src/engine.ts';const e=await import(path);const s=e.startRun('warrior',42);for(const defId of ['cleave','sunburst'])s.cards.push({uid:`art-${++s.serial}`,defId,upgraded:false});s.hand=['slash','cleave','sunburst'].map(id=>s.cards.find((c:any)=>c.defId===id).uid);s.deck=s.cards.filter((c:any)=>!s.hand.includes(c.uid)).map((c:any)=>c.uid);localStorage.setItem('card-game-prototype-v1',JSON.stringify(s));});
  await page.reload();await page.getByRole('button',{name:/Continue adventure/}).click();
  const frames=await page.locator('.hand .playing-card').evaluateAll(els=>els.map(e=>{const c=getComputedStyle(e);return {style:c.borderTopStyle,color:c.borderTopColor,bg:c.backgroundImage,motif:e.querySelector('.rarity-motif')!.textContent};}));
  expect(frames[0].style).toBe('solid');expect(frames[1].style).toBe('double');expect(frames[2].style).toBe('solid');expect(new Set(frames.map(f=>f.color)).size).toBe(3);expect(frames[1].bg).not.toBe('none');expect(frames[2].bg).not.toBe('none');expect(frames.map(f=>f.motif)).toEqual(['•','◆ ◆','✦ ✦ ✦']);
  for(const theme of ['a','b','c']) {await page.getByLabel('Art theme',{exact:true}).selectOption(theme);await fontCheck(page);}
});

test('three-enemy encounter keeps every portrait, intent and guidance inside a narrow viewport',async({page})=>{
 await page.evaluate(async()=>{const path='/src/engine.ts';const e=await import(path);const s=e.nextBattle(e.chooseReward(e.debugAction(e.startRun('mage',42),'win'),'reward-rune'));localStorage.setItem('card-game-prototype-v1',JSON.stringify(s));});
 await page.reload();await page.getByRole('button',{name:/Continue adventure/}).click();await page.setViewportSize({width:390,height:844});await page.waitForTimeout(400);
 const layout=await page.locator('.enemy-wrap,.target-instructions,.player-zone').evaluateAll(els=>els.map(e=>{const r=e.getBoundingClientRect();return r.x>=0&&r.right<=innerWidth+1&&r.bottom<=innerHeight;}));
 expect(layout.every(Boolean)).toBe(true);expect(await page.locator('.enemy-wrap').count()).toBe(3);
 expect(await page.locator('.intent').evaluateAll(els=>els.every(e=>{const r=e.getBoundingClientRect(),range=document.createRange();range.selectNodeContents(e);const text=range.getBoundingClientRect();return text.y>=r.y&&text.bottom<=r.bottom;}))).toBe(true);
 const card=await page.locator('.hand .playing-card').first().boundingBox();expect(card!.y+card!.height).toBeLessThanOrEqual(844);
});

test('long Rune descriptions fit inside hand frames on compact screens',async({page})=>{
 await page.evaluate(async()=>{const path='/src/engine.ts';const e=await import(path);const s=e.startRun('mage',42);const ids=['rune-echo','rune-blood','rune-chain','rune-renew','mage-ring'];for(const id of ids)if(!s.cards.some((c:any)=>c.defId===id))s.cards.push({uid:`text-${++s.serial}`,defId:id,upgraded:false});s.hand=ids.map(id=>s.cards.find((c:any)=>c.defId===id).uid);s.deck=s.cards.filter((c:any)=>!s.hand.includes(c.uid)).map((c:any)=>c.uid);localStorage.setItem('card-game-prototype-v1',JSON.stringify(s));});
 await page.reload();await page.getByRole('button',{name:/Continue adventure/}).click();
 for(const [width,height] of [[1280,720],[390,844]]) {
  await page.setViewportSize({width,height});await page.waitForTimeout(300);
  const bounds=await page.locator('.hand .playing-card').evaluateAll(els=>els.map(e=>{const r=e.getBoundingClientRect(),d=e.querySelector('.card-description')!.getBoundingClientRect();return d.bottom<=r.bottom-3;}));
  expect(bounds.every(Boolean)).toBe(true);
 }
});
