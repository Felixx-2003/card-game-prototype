import { test, expect } from '@playwright/test';
const SAVE='card-game-prototype-v1';
test.beforeEach(async ({page})=>{await page.goto('/');await page.evaluate(()=>localStorage.clear());await page.reload();});
async function start(page: any, hero='warrior') { await page.getByRole('button',{name:/New adventure/}).click(); await page.locator(`.hero-choice.${hero}`).click(); }
async function snapshot(page: any) { return page.evaluate((key:string)=>JSON.parse(localStorage.getItem(key)!),SAVE); }
test('both hero actives animate, spend Energy, enforce cooldown; passive visibly triggers',async({page})=>{
  for(const hero of ['warrior','mage']) {
    await start(page,hero); const before=await snapshot(page);
    const active=page.locator('.ability-button'); await expect(active).toBeEnabled(); await expect(active).toHaveAttribute('title',/3 turns/); await active.click();
    await expect(page.locator('.ability-overlay')).toBeVisible(); await expect(active).toBeDisabled(); const after=await snapshot(page);
    expect(after.energy).toBe(2); expect(after.activeReadyTurn).toBe(4); expect(after.enemies[0].hp).toBeLessThan(before.enemies[0].hp);
    await expect(page.locator('.ability-overlay')).toHaveCount(0);
    const card=page.locator(`.hand .${hero==='warrior'?'skill':'spell'}:not(.unaffordable)`).first(); await card.click();
    const id=await card.getAttribute('data-card-id'); const kind=await page.evaluate(async id=>{const path='/src/data.ts';return (await import(path)).CARDS[id!].target;},id); const target=kind==='hero'?'[data-target="hero"]':'.enemy-card:not(:disabled)'; await page.locator(target).first().click();
    await expect(page.locator('.passive-skill')).toContainText('Triggered!');
    await page.getByRole('button',{name:'Open main menu'}).click(); await page.getByRole('button',{name:/New adventure/}).click();
    // Return to menu so the next iteration creates a fresh run.
    await page.getByRole('button',{name:'Open main menu'}).click();
  }
});
test('camp locks upgrade choices, highlights next step and gives one persistent global boon',async({page})=>{
  await start(page); await page.keyboard.press('`'); await page.getByRole('button',{name:'win',exact:true}).click(); await page.keyboard.press('`');
  await page.locator('.reward-choice .playing-card').first().click();
  await page.getByRole('button',{name:/Keen Edge/}).click(); for(const c of await page.locator('.boon-choices button').all()) await expect(c).toBeDisabled();
  await expect(page.locator('.global-buffs')).toContainText('Keen Edge');
  await page.getByRole('button',{name:/Tend your deck/}).click(); await page.locator('.collection-grid .playing-card:not(:disabled)').first().click();
  await expect(page.locator('.camp-instructions')).toContainText('Back to the path');
  const next=page.getByRole('button',{name:/Back to the path/}); await expect(next).toHaveClass(/next-action/);
  const skills=page.locator('.collection-grid .playing-card.skill'); for(const c of await skills.all()) await expect(c).toBeDisabled();
  await expect(page.locator('.collection-grid .playing-card.skill').last()).toHaveClass(/upgrade-locked/);
  await next.click(); await page.getByRole('button',{name:/Enter the next battle/}).click();
  await expect(page.locator('.global-buffs')).toContainText('Keen Edge'); expect((await snapshot(page)).globalBuffs).toEqual(['keen-edge']);
});
test('readable controls, instructions, centered numbers stay unobstructed in all themes',async({page})=>{
  await start(page); await page.getByRole('button',{name:'Hide tutorial tips'}).click();
  for(const theme of ['a','b','c']) { await page.getByLabel('Art theme',{exact:true}).selectOption(theme);
    for(const [width,height] of [[1280,720],[1280,800],[1920,1080],[390,844]]) {
      await page.setViewportSize({width,height}); await page.waitForTimeout(300);
      const measured=await page.evaluate(()=>{
        const sels=['.ability-button','.passive-skill','.end-turn-button','.target-instructions','.battle-footer','.global-buffs'];
        const rect=(e:Element)=>e.getBoundingClientRect();
        return { controls:sels.map(s=>{const e=document.querySelector(s)!,r=rect(e);const top=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return {s,inside:r.x>=0&&r.right<=innerWidth+1&&r.y>=0&&r.bottom<=innerHeight+1,clear:!!top&&(e.contains(top)||top.contains(e))};}), hp:[...document.querySelectorAll('.hp-bar')].map(e=>{const a=rect(e),b=rect(e.querySelector('b')!);return Math.abs((a.y+a.height/2)-(b.y+b.height/2))+Math.abs((a.x+a.width/2)-(b.x+b.width/2));}), desc:parseFloat(getComputedStyle(document.querySelector('.hand .card-description')!).fontSize),instructions:parseFloat(getComputedStyle(document.querySelector('.target-instructions')!).fontSize),scroll:document.documentElement.scrollHeight<=innerHeight+1};
      });
      for(const c of measured.controls) {expect(c.inside,`${theme} ${width} ${c.s} bounds`).toBe(true);expect(c.clear,`${theme} ${width} ${c.s} blocked`).toBe(true);}
      expect(measured.hp.every(n=>n<2)).toBe(true); expect(measured.desc).toBeGreaterThanOrEqual(13);expect(measured.instructions).toBeGreaterThanOrEqual(13);expect(measured.scroll).toBe(true);
    }
  }
  await expect(page.getByRole('button',{name:'Pause',exact:true})).toHaveText('Ⅱ');
});
test('music scene follows menu, normal, elite/boss, reward, victory and defeat',async({page})=>{
  const scene=()=>page.evaluate(async()=>{const path=performance.getEntriesByType('resource').find(e=>e.name.includes('/src/audio.ts'))!.name;return (await import(path)).audioController.getDebugState().scene;});
  await expect.poll(scene).toBe('menu');await start(page);expect(await scene()).toBe('battle');
  await page.keyboard.press('`');await page.getByRole('button',{name:'boss',exact:true}).click();expect(await scene()).toBe('danger');
  await page.getByRole('button',{name:'win',exact:true}).click();expect(await scene()).toBe('victory');
  await page.getByRole('button',{name:'lose',exact:true}).click(); // win screen does not accept lose
  await page.getByRole('button',{name:'restart',exact:true}).click();await page.getByRole('button',{name:'lose',exact:true}).click();expect(await scene()).toBe('defeat');
  await page.getByRole('button',{name:'Open main menu'}).click();expect(await scene()).toBe('menu');
  await page.keyboard.press('`');await start(page);await page.keyboard.press('`');await page.getByRole('button',{name:'win',exact:true}).click();expect(await scene()).toBe('progression');
});
