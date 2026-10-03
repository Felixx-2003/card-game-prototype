import { test, expect } from '@playwright/test';
const SAVE='card-game-prototype-v1';
test.beforeEach(async ({page})=>{await page.goto('/');await page.evaluate(()=>(localStorage.clear(),localStorage.setItem('card-game-prototype-tutorial-v1',JSON.stringify({tutorialCompleted:true}))));await page.reload();});
async function start(page: any, hero='warrior') { await page.getByRole('button',{name:/New adventure/}).click(); await page.locator(`.hero-choice.${hero}`).click(); }
async function snapshot(page: any) { return page.evaluate((key:string)=>JSON.parse(localStorage.getItem(key)!),SAVE); }
test('both hero actives animate, spend Energy, enforce cooldown; passive visibly triggers',async({page})=>{
  for(const hero of ['warrior','mage']) {
    await start(page,hero); const before=await snapshot(page);
    const active=page.locator('.ability-button'); await expect(active).toBeEnabled(); await active.hover();await expect(page.getByRole('tooltip')).toContainText('3 turns');await page.keyboard.press('Escape'); await active.click();
    await expect(page.locator('.ability-overlay')).toBeVisible(); await expect(active).toBeDisabled(); const after=await snapshot(page);
    expect(after.energy).toBe(2); expect(after.activeReadyTurn).toBe(4); expect(after.enemies[0].hp).toBeLessThan(before.enemies[0].hp);
    await expect(page.locator('.ability-overlay')).toHaveCount(0);
    await page.locator('.ability-help').focus();await expect(page.getByRole('tooltip')).toContainText('3 turns');await page.keyboard.press('Escape');
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
  await page.getByRole('button',{name:/Sharp Skills/}).click(); for(const c of await page.locator('.boon-choices button').all()) await expect(c).toBeDisabled();
  await expect(page.locator('.global-buffs')).toContainText('Sharp Skills');
  await page.getByRole('button',{name:/Tend your deck/}).click(); await page.locator('.collection-grid .playing-card:not(:disabled)').first().click();
  await expect(page.locator('.camp-instructions')).toContainText('Back to the path');
  const next=page.getByRole('button',{name:/Back to the path/}); await expect(next).toHaveClass(/next-action/);
  const skills=page.locator('.collection-grid .playing-card.skill'); for(const c of await skills.all()) await expect(c).toBeDisabled();
  await expect(page.locator('.collection-grid .playing-card.skill').last()).toHaveClass(/upgrade-locked/);
  await next.click(); await page.getByRole('button',{name:/Enter the next battle/}).click();
  await expect(page.locator('.global-buffs')).toContainText('Sharp Skills'); expect((await snapshot(page)).globalBuffs).toEqual(['keen-edge']);
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
