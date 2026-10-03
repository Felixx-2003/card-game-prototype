import {test,expect,type Page} from '@playwright/test';

async function scene(page:Page,screen:string,all=false) {
 await page.evaluate(async({screen,all})=>{
  const path='/src/engine.ts',data='/src/data.ts';const e=await import(path),d=await import(data);
  let s=e.startRun('warrior',42);
  if(['reward','progress','upgrade'].includes(screen))s=e.debugAction(s,'win');
  if(['progress','upgrade'].includes(screen))s=e.chooseReward(s,s.rewards[0].id);
  s.screen=screen==='defeat'?'battle':screen;if(screen==='defeat')s.hp=1;
  if(all){for(const id of Object.keys(d.CARDS))if(!s.cards.some((c:any)=>c.defId===id))s.cards.push({uid:'qa-'+id,defId:id,upgraded:false});s.deck=s.cards.filter((c:any)=>!s.hand.includes(c.uid)).map((c:any)=>c.uid);}
  localStorage.setItem('card-game-prototype-v1',JSON.stringify(s));
  localStorage.setItem('card-game-prototype-tutorial-v1',JSON.stringify({tutorialCompleted:true}));
  localStorage.setItem('card-game-prototype-ui-v2',JSON.stringify({theme:'c'}));
 },{screen,all});
 await page.reload();
 if(!['menu','select'].includes(screen))await page.getByRole('button',{name:/Continue adventure/}).click();
 if(screen==='select')await page.getByRole('button',{name:/New adventure/}).click();
 if(screen==='defeat')await page.getByRole('button',{name:/End turn/}).click();
 await page.waitForTimeout(700);
}

async function fits(page:Page,root='.screen-stage') {
 const report=await page.locator(root).evaluate(el=>{
  const visible=(e:Element)=>!!(e as HTMLElement).offsetWidth&&!!(e as HTMLElement).offsetHeight&&getComputedStyle(e).visibility!=='hidden';
  const elements=[...el.querySelectorAll('button,input,select,.card-description,.lesson-card p,.boon-choices button>span,.ending-screen>p,.screen-title')].filter(visible);
  return {page:document.documentElement.scrollHeight<=innerHeight+1,items:elements.map(e=>{const r=e.getBoundingClientRect();return {text:e.textContent?.slice(0,55),bounds:r.x>=-1&&r.right<=innerWidth+1&&r.y>=-1&&r.bottom<=innerHeight+1,overflow:e.scrollHeight>e.clientHeight+2};})};
 });
 expect(report.page).toBe(true);
 for(const item of report.items){expect(item.bounds,JSON.stringify(item)).toBe(true);expect(item.overflow,JSON.stringify(item)).toBe(false);}
}

test('all major screens keep actions and full rules inside desktop, tablet and landscape viewports',async({page})=>{
 test.setTimeout(120000);await page.goto('/');
 for(const [width,height] of [[1280,720],[1366,768],[1024,768],[844,390],[932,430],[667,375],[640,360]]) {
  await page.setViewportSize({width,height});
  for(const screen of ['menu','select','reward','progress','upgrade','victory','defeat']) {
   await scene(page,screen,screen==='upgrade');await fits(page);
  }
 }
});

test('floating Rune previews retain school colors and complete rules on desktop and phone',async({page})=>{
 await page.goto('/');
 for(const [width,height] of [[1280,720],[640,360]]) {
  await page.setViewportSize({width,height});await scene(page,'battle',true);
  await page.evaluate(()=>{const key='card-game-prototype-v1',s=JSON.parse(localStorage.getItem(key)!);s.hand=['rune-fire','rune-echo','rune-blood','flame-sword','fortify'].map(id=>s.cards.find((c:any)=>c.defId===id).uid);s.deck=s.cards.filter((c:any)=>!s.hand.includes(c.uid)).map((c:any)=>c.uid);localStorage.setItem(key,JSON.stringify(s));});
  await page.reload();await page.getByRole('button',{name:/Continue adventure/}).click();await page.waitForTimeout(700);
  for(let i=0;i<3;i++) {
   const card=page.locator('.hand .playing-card').nth(i),element=await card.getAttribute('data-element');await card.hover();await page.waitForTimeout(220);const r=await card.boundingBox();
   await page.mouse.move(r!.x+r!.width/2,r!.y+r!.height/2);await page.mouse.down();await page.mouse.move(width/2,height/2,{steps:8});
   await expect(page.locator('.drag-preview')).toHaveAttribute('data-element',element!);
   const result=await page.locator('.drag-preview .card-description').evaluate(e=>({fits:e.scrollHeight<=e.clientHeight+1,inside:e.getBoundingClientRect().bottom<=e.parentElement!.getBoundingClientRect().bottom+1}));
   expect(result.fits).toBe(true);expect(result.inside).toBe(true);await page.mouse.move(20,height/2);await page.mouse.up();
  }
 }
});

test('deck pages expose the entire collection with centered, complete settings and field guide',async({page})=>{
 test.setTimeout(60000);await page.goto('/');
 for(const [width,height] of [[1280,720],[1024,768],[640,360]]) {
  await page.setViewportSize({width,height});await scene(page,'battle',true);
  await page.getByRole('button',{name:/View Deck/}).click();
  const seen=new Set<string>();
  while(true){await fits(page,'.deck-modal');for(const uid of await page.locator('.deck-modal [data-target]').evaluateAll(es=>es.map(e=>e.getAttribute('data-target')!)))seen.add(uid);if(await page.getByRole('button',{name:'Next cards'}).isDisabled())break;await page.getByRole('button',{name:'Next cards'}).click();}
  const count=await page.evaluate(()=>JSON.parse(localStorage.getItem('card-game-prototype-v1')!).cards.length);expect(seen.size).toBe(count);
  await page.locator('.modal-backdrop .close-button').click();
  await page.getByRole('button',{name:'Settings',exact:true}).click();await fits(page,'.settings-panel');
  const r=await page.locator('.settings-panel').boundingBox();expect(Math.abs(r!.x+r!.width/2-width/2)).toBeLessThan(2);expect(Math.abs(r!.y+r!.height/2-height/2)).toBeLessThan(2);
  await page.getByRole('button',{name:'Back to adventure'}).click();await page.getByRole('button',{name:'Pause',exact:true}).click();await fits(page);await page.getByRole('button',{name:/How to play ·/}).click();
  for(let i=0;i<3;i++){await fits(page,'.tutorial-modal');if(i<2)await page.getByRole('button',{name:'Next →',exact:true}).click();}
  await page.locator('.modal-backdrop .close-button').click();
 }
});
