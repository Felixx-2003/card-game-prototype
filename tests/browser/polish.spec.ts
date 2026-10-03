import { test, expect } from '@playwright/test';

const SAVE = 'card-game-prototype-v1';
test.beforeEach(async ({ page }) => { await page.goto('/'); await page.evaluate(() => (localStorage.clear(),localStorage.setItem('card-game-prototype-tutorial-v1',JSON.stringify({tutorialCompleted:true})))); await page.reload(); });

test('short visual field guide covers the game and supports skip', async ({ page }) => {
  await expect(page.locator('.menu-hook')).toContainText('Runes');
  await page.getByRole('button', { name: /quick field guide/ }).click();
  await expect(page.getByRole('button', { name: 'Close tutorial' })).toBeFocused();
  for (let i=0;i<8;i++) { await page.keyboard.press('Tab'); expect(await page.evaluate(() => !!document.activeElement?.closest('[role="dialog"]'))).toBe(true); }
  await expect(page.getByRole('heading', { name: 'Character', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Skills', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Spells', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Next →' }).click();
  await expect(page.getByRole('heading', { name: 'Energy', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'End Turn', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Next →' }).click();
  await expect(page.getByRole('heading', { name: 'Equipment', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Runes', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Ready to play' }).click();
  await expect(page.getByRole('button', { name: /quick field guide/ })).toBeFocused();
  await page.getByRole('button', { name: /New adventure/ }).click();
  await page.locator('.hero-choice.warrior').click();
  await expect(page.locator('.target-instructions')).toHaveCount(0);
  await page.getByRole('button', { name: 'How to play', exact: true }).click();
  await page.getByRole('button', { name: 'Skip tutorial' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('both themes keep a fixed battle screen and consistent card hierarchy', async ({ page }) => {
  await page.getByRole('button', { name: /New adventure/ }).click();
  await page.locator('.hero-choice.warrior').click();
  const original = await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), SAVE);
  for (const theme of ['a', 'b', 'c']) {
    await page.setViewportSize({width:1280,height:720});
    await page.getByLabel('Art theme', { exact: true }).selectOption(theme);
    for (const [width, height] of [[1280,720], [1366,768], [1280,800], [1920,1080], [844,390]]) {
      await page.setViewportSize({ width, height });
      await page.waitForTimeout(350);
      const layout = await page.evaluate(() => {
        const box = (sel: string) => { const el = document.querySelector(sel)!; const r = el.getBoundingClientRect(); return { x:r.x,y:r.y,w:r.width,h:r.height,bottom:r.bottom,right:r.right }; };
        return { doc: document.documentElement.scrollHeight, view:innerHeight, actor:box('.enemy-card'), hero:box('.player-card'), hand:box('.hand .playing-card'), turn:box('.end-turn-button'), footer:box('.battle-footer'), title:box('.encounter-heading h1'), intent:box('.intent'), font:getComputedStyle(document.querySelector('.card-description')!).fontFamily };
      });
      expect(layout.doc, `${theme} ${width}x${height} page scroll`).toBeLessThanOrEqual(height + 1);
      expect(layout.actor.w).toBeCloseTo(layout.hero.w, 0); expect(layout.actor.h).toBeCloseTo(layout.hero.h, 0);
      if(theme!=='c'||height>500){expect(layout.hand.w).toBeLessThan(layout.hero.w + (width < 500 ? 1 : 0));expect(layout.hand.h).toBeLessThan(layout.hero.h);}else expect(layout.hand.w).toBeGreaterThanOrEqual(108);
      expect(layout.turn.bottom).toBeLessThan(height); expect(layout.footer.bottom).toBeLessThanOrEqual(height + 1);
      expect(layout.title.bottom).toBeLessThanOrEqual(layout.intent.y + 1);
      expect(layout.font).toContain('Nunito');
      await page.mouse.wheel(0, 600); expect(await page.evaluate(() => scrollY)).toBe(0);
    }
  }
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), SAVE)).toEqual(original);
  await page.reload(); await expect(page.locator('.game-shell')).toHaveAttribute('data-theme', 'c');
});

test('side effect icons expose tooltips, energy gates cards, and free runes can target unaffordable cards', async ({ page }) => {
  await page.evaluate(async key => {
    const path = '/src/engine.ts'; const e = await import(path); const s = e.startRun('warrior', 42);
    const defs = ['fireball','guard','rune-cheap','heal','heavy-strike'];
    for (const id of defs) if (!s.cards.some((c: any) => c.defId === id)) s.cards.push({uid:`fixture-${++s.serial}`,defId:id,upgraded:false});
    s.hand = defs.map(id => s.cards.find((c: any) => c.defId === id).uid);
    s.deck = s.cards.filter((c: any) => !s.hand.includes(c.uid)).map((c: any) => c.uid); s.discard=[];
    s.energy=0; s.firstSkill=true; s.shield=9; s.statuses={burn:2,freeze:1,poison:3,weak:1,vulnerable:2};
    s.enemies[0].statuses={burn:2,freeze:1}; localStorage.setItem(key,JSON.stringify(s));
  }, SAVE);
  await page.reload(); await page.getByRole('button', { name: /Continue adventure/ }).click();
  const icon = page.locator('.enemy-wrap').first().getByRole('img', { name: 'Burn, 2 stacks', exact: true });
  await icon.hover(); await expect(page.getByRole('tooltip')).toBeVisible(); await expect(page.getByRole('tooltip')).toContainText('Burn');
  const actor = await page.locator('.enemy-card').first().boundingBox(); const rail = await icon.boundingBox();
  expect(rail!.x+rail!.width).toBeLessThanOrEqual(actor!.x+1);
  const heroBox = await page.locator('.player-card').boundingBox();
  const heroRail = await page.locator('.hero-and-gear .status-rail').boundingBox();
  expect(heroRail!.y + heroRail!.height + 5).toBeLessThanOrEqual(heroBox!.y + heroBox!.height + 1);
  await expect(page.locator('.hp-bar .status-icon')).toHaveCount(0);
  const centers = await page.locator('.status-icon').evaluateAll(icons => icons.map(e => {
    const a=e.getBoundingClientRect(), b=e.querySelector('.status-count')!.getBoundingClientRect();
    return b.x>=a.x&&b.right<=a.right&&b.y>=a.y&&b.bottom<=a.bottom?0:10;
  }));
  expect(centers.every(n=>n<2)).toBe(true);

  await expect(page.getByRole('progressbar', { name: 'Energy' })).toHaveAttribute('aria-valuenow','0');
  const fireball = page.locator('.hand [data-card-id="fireball"]');
  await expect(fireball).toHaveClass(/unaffordable/); await expect(fireball).toHaveAttribute('aria-disabled','true');
  await expect(fireball.locator('.unaffordable-hint')).toContainText('End Turn');
  const before = await page.evaluate(key => JSON.parse(localStorage.getItem(key)!).hand.length,SAVE);
  // aria-disabled preserves readable hover/help and intentionally prevents activation.
  const cardBox = await fireball.boundingBox(); await page.mouse.click(cardBox!.x + 50, cardBox!.y + 50);
  await expect(page.getByRole('status')).toContainText('End Turn');
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!).hand.length,SAVE)).toBe(before);
  await page.locator('.hand [data-card-id="rune-cheap"]').click();
  await page.mouse.click(cardBox!.x + 50, cardBox!.y + 50);
  await expect(fireball.locator('.rune-seal')).toContainText('Light Rune');
  const guard = await page.locator('.hand [data-card-id="guard"]').boundingBox();
  await page.mouse.click(guard!.x + 45, guard!.y + 45);
  await page.getByRole('button', { name: 'Discard card' }).click();
  await expect(page.locator('.hand [data-card-id="guard"]')).toHaveCount(0);
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!).energy,SAVE)).toBe(0);
  await page.getByRole('button', { name: /End turn/ }).click();
  await expect(page.getByRole('progressbar', { name: 'Energy' })).toHaveAttribute('aria-valuenow','3');
  await expect(fireball).not.toHaveClass(/unaffordable/);
});

test('audio starts on a gesture, produces a music signal, and separate volumes/mute persist', async ({ page }) => {
  await page.addInitScript(() => {
    const Native = window.AudioContext;
    const audit: any = { contexts:[], gains:[], starts:0 };
    (window as any).__audioAudit = audit;
    window.AudioContext = class extends Native {
      constructor(...args: ConstructorParameters<typeof AudioContext>) { super(...args); audit.contexts.push(this); }
      createGain() { const node=super.createGain(); audit.gains.push(node); return node; }
      createOscillator() { const node=super.createOscillator(); const start=node.start.bind(node); node.start=(when?: number)=>{ audit.starts++; start(when); }; return node; }
    };
  });
  await page.reload();
  expect(await page.evaluate(() => (window as any).__audioAudit.contexts.length)).toBe(0);
  await page.getByRole('button', { name: 'Open settings' }).click();
  await expect(page.getByRole('dialog', { name:'Settings',exact:true })).toBeVisible();
  await page.waitForTimeout(200);
  const signal = await page.evaluate(async () => {
    const a=(window as any).__audioAudit, ctx=a.contexts[0]; const analyser=ctx.createAnalyser(); analyser.fftSize=2048; a.gains[0].connect(analyser);
    await new Promise(resolve=>setTimeout(resolve,100)); const data=new Float32Array(analyser.fftSize); analyser.getFloatTimeDomainData(data); a.gains[0].disconnect(analyser);
    return {state:ctx.state,starts:a.starts,peak:Math.max(...Array.from(data,v=>Math.abs(v)))};
  });
  expect(signal.state).toBe('running'); expect(signal.starts).toBeGreaterThan(2); expect(signal.peak).toBeGreaterThan(0.00001);
  await page.getByLabel(/Music/).focus(); await page.keyboard.press('Home');
  await expect(page.getByLabel(/Music/)).toHaveValue('0');
  await page.getByLabel(/Sound effects/).focus(); await page.keyboard.press('End');
  await expect(page.getByLabel(/Sound effects/)).toHaveValue('100');
  await page.getByLabel('Mute all sound').check();
  const mutedStarts = await page.evaluate(() => (window as any).__audioAudit.starts);
  await page.getByRole('button', { name: 'Back to adventure' }).click();
  await page.getByRole('button', { name: /New adventure/ }).click();
  expect(await page.evaluate(() => (window as any).__audioAudit.starts)).toBe(mutedStarts);
  await page.getByRole('button', { name: 'Open settings' }).click();
  await page.getByLabel('Mute all sound').uncheck();
  await page.getByRole('button', { name: 'Back to adventure' }).click();
  expect(await page.evaluate(() => (window as any).__audioAudit.starts)).toBeGreaterThan(mutedStarts);
  await page.reload(); await page.getByRole('button', { name: 'Open settings' }).click();
  await expect(page.getByLabel(/Music/)).toHaveValue('0'); await expect(page.getByLabel(/Sound effects/)).toHaveValue('100');
  await expect(page.getByLabel('Mute all sound')).not.toBeChecked();
});
