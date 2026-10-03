import { test, expect, type Page } from '@playwright/test';

const SAVE = 'card-game-prototype-v1';
async function state(page: Page) { return page.evaluate(key => JSON.parse(localStorage.getItem(key) || 'null'), SAVE); }
async function drag(page: Page, source: string, target?: string) {
  const a = await page.locator(source).boundingBox();
  expect(a).toBeTruthy();
  await page.mouse.move(a!.x + a!.width / 2, a!.y + a!.height / 2);
  await page.mouse.down();
  if (target) {
    const b = await page.locator(target).first().boundingBox(); expect(b).toBeTruthy();
    await page.mouse.move(b!.x + b!.width / 2, b!.y + b!.height / 2, { steps: 12 });
  } else await page.mouse.move(25, 95, { steps: 12 });
  await page.mouse.up();
}

test.beforeEach(async ({ page }) => { await page.goto('/'); await page.evaluate(() => localStorage.clear()); await page.reload(); });

for (const hero of ['warrior', 'mage']) test(`${hero}: complete adventure through rewards, elite, boss and victory`, async ({ page }) => {
  test.setTimeout(120000);
  const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
  await page.evaluate(() => { Date.now = () => 42; });
  await page.getByRole('button', { name: /New adventure/ }).click();
  await page.locator(`.hero-choice.${hero}`).click();
  await expect(page.locator('.battle-board')).toBeVisible();
  const original = await state(page);
  await drag(page, '.hand .playing-card:first-child');
  expect((await state(page)).hand).toEqual(original.hand);
  let draggedAttack = false, equipped = false, runePlayed = false, bossPhaseSeen = false;
  for (let step = 0; step < 180; step++) {
    const s = await state(page);
    if (s.screen === 'battle' && s.enemies.some((e: any) => e.phase === 2)) {
      bossPhaseSeen = true; await expect(page.locator('.phase-label')).toContainText('PHASE II');
    }
    if (s.screen === 'victory') break;
    expect(s.screen, `unexpected screen at action ${step}`).not.toBe('defeat');
    if (s.screen === 'reward') {
      if (s.encounter === 0) await page.locator('.reward-choice').nth(1).locator('button').click();
      else await page.locator('.reward-choice').nth(2).locator('button').click();
      continue;
    }
    if (s.screen === 'upgrade') { await page.getByRole('button', { name: /Back to the path/ }).click(); continue; }
    if (s.screen === 'progress') {
      await page.getByRole('button', { name: /Tend your deck/ }).click();
      const upgradable = page.locator('.collection-grid .playing-card.skill:not(.upgraded), .collection-grid .playing-card.spell:not(.upgraded)').first();
      if (await upgradable.count()) await upgradable.click();
      await page.getByRole('button', { name: /Back to the path/ }).click();
      await page.getByRole('button', { name: /Enter .*battle/ }).click();
      continue;
    }
    const move = await page.evaluate(async key => {
      const s = JSON.parse(localStorage.getItem(key)!);
      const enginePath = '/src/engine.ts', dataPath = '/src/data.ts';
      const engine = await import(enginePath);
      const data = await import(dataPath);
      for (const uid of s.hand) {
        const c = s.cards.find((c: any) => c.uid === uid); const d = data.CARDS[c.defId];
        const target = d.target === 'hero' ? 'hero' : d.target === 'card' ? s.hand.find((id: string) => engine.canTarget(s, c, id)) : s.enemies.filter((e: any) => e.hp > 0).sort((a: any, b: any) => a.hp - b.hp)[0]?.uid;
        if (target && engine.getCost(s, c) <= s.energy && engine.canTarget(s, c, target)) return { uid, target, type: d.type };
      }
      return null;
    }, SAVE);
    if (move) {
      const source = `[data-target="${move.uid}"]`; const target = `[data-target="${move.target}"]`;
      if ((!draggedAttack && move.type === 'skill') || move.type === 'equipment' || move.type === 'rune') {
        await drag(page, source, target);
        draggedAttack ||= move.type === 'skill'; equipped ||= move.type === 'equipment'; runePlayed ||= move.type === 'rune';
      } else { await page.locator(source).click(); await page.locator(target).first().click(); }
    } else await page.getByRole('button', { name: /End turn/ }).click();
  }
  await expect(page.getByRole('heading', { name: 'A hero comes home.' })).toBeVisible();
  expect(equipped).toBe(true); expect(runePlayed).toBe(true); expect(bossPhaseSeen).toBe(true); expect(errors).toEqual([]);
  await page.getByRole('button', { name: /Another adventure/ }).click();
  await expect(page.getByRole('heading', { name: 'Choose your hero' })).toBeVisible();
});

test('defeat, restart, saving and corrupt-save recovery', async ({ page }) => {
  await page.getByRole('button', { name: /New adventure/ }).click();
  await page.locator('.hero-choice.mage').click();
  const before = await state(page);
  await page.reload(); await page.getByRole('button', { name: /Continue adventure/ }).click();
  expect((await state(page)).hand).toEqual(before.hand);
  for (let i = 0; i < 20 && (await state(page)).screen === 'battle'; i++) await page.getByRole('button', { name: /End turn/ }).click();
  await expect(page.getByRole('heading', { name: 'A brave little attempt.' })).toBeVisible();
  await page.getByRole('button', { name: /Another adventure/ }).click();
  await page.locator('.hero-choice.warrior').click();
  expect((await state(page)).hp).toBe(74);
  await page.evaluate(key => localStorage.setItem(key, '{"version":1,"screen":"battle","cards":[null]}'), SAVE);
  await page.reload();
  await expect(page.getByRole('button', { name: /New adventure/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /Continue adventure/ })).toHaveCount(0);
});

test('rune drag, gear replacement and status resolution use visible mouse controls', async ({ page }) => {
  await page.evaluate(async key => {
    const enginePath = '/src/engine.ts'; const engine = await import(enginePath);
    const s = engine.debugAction(engine.startRun('warrior', 42), 'cards');
    const ids = ['rune-fire', 'heavy-strike', 'iron-armor', 'oak-charm', 'flame-sword'];
    // Add the recovery accessory, then arrange a valid small hand for focused interaction QA.
    s.cards.push({ uid: 'fixture-charm', defId: 'oak-charm', upgraded: false });
    s.hand = ids.map(id => s.cards.find((c: any) => c.defId === id)!.uid);
    s.deck = s.cards.filter((c: any) => !s.hand.includes(c.uid)).map((c: any) => c.uid);
    s.discard = []; s.energy = 10; s.enemies[0].statuses = { freeze: 1 };
    localStorage.setItem(key, JSON.stringify(s));
  }, SAVE);
  await page.reload(); await page.getByRole('button', { name: /Continue adventure/ }).click();
  await drag(page, '.hand [data-card-id="rune-fire"]', '.hand [data-card-id="heavy-strike"]');
  await expect(page.locator('.hand [data-card-id="heavy-strike"] .rune-seal')).toContainText('Ember Rune');
  await drag(page, '.hand [data-card-id="iron-armor"]', '.player-card');
  await expect(page.locator('.gear-slot').nth(1)).toContainText('Iron Armor');
  const armor = (await state(page)).gear.armor;
  await drag(page, '.hand [data-card-id="oak-charm"]', '.player-card');
  await expect(page.locator('.gear-slot').nth(1)).toContainText('Oak Charm');
  expect((await state(page)).discard).toContain(armor);
  await drag(page, '.hand [data-card-id="heavy-strike"]', '[data-target="enemy-0"]');
  await expect(page.locator('[data-target="enemy-0"] .status-burn')).toContainText('burn 2');
  const hp = (await state(page)).hp;
  await page.getByRole('button', { name: /End turn/ }).click();
  expect((await state(page)).hp).toBe(hp);
  expect((await state(page)).enemies[0].statuses.freeze).toBe(0);
  expect((await state(page)).enemies[0].statuses.burn).toBe(1);
});

test('boss phase intent changes and development restart tools work', async ({ page }) => {
  await page.getByRole('button', { name: /New adventure/ }).click();
  await page.locator('.hero-choice.mage').click();
  await page.keyboard.press('Backquote');
  await page.locator('.debug-panel').getByRole('button', { name: 'boss', exact: true }).click();
  expect((await state(page)).encounter).toBe(3);
  await page.locator('.debug-panel').getByRole('button', { name: 'restart', exact: true }).click();
  expect((await state(page)).turn).toBe(1);
  await page.locator('.debug-panel').getByRole('button', { name: 'lose', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'A brave little attempt.' })).toBeVisible();
  await page.locator('.debug-panel').getByRole('button', { name: 'Clear local save' }).click();
  expect(await state(page)).toBeNull();
  await expect(page.getByRole('button', { name: /New adventure/ })).toBeVisible();
});

test('camp supports rune attachment, replacement, removal and readable upgrades', async ({ page }) => {
  await page.evaluate(async key => {
    const path = '/src/engine.ts'; const e = await import(path);
    const s = e.chooseReward(e.debugAction(e.debugAction(e.startRun('warrior', 42), 'cards'), 'win'), 'reward-rune');
    localStorage.setItem(key, JSON.stringify(s));
  }, SAVE);
  await page.reload(); await page.getByRole('button', { name: /Continue adventure/ }).click();
  await page.getByRole('button', { name: /Tend your deck/ }).click();
  const heavy = page.locator('[data-card-id="heavy-strike"]').first();
  await page.locator('[data-card-id="rune-fire"]').first().click();
  await heavy.click();
  await expect(heavy.locator('.rune-seal')).toContainText('Ember Rune');
  await heavy.click();
  await expect(heavy.locator('.card-description')).toContainText('19 damage');
  await page.locator('[data-card-id="rune-echo"]').click();
  await heavy.click();
  await expect(heavy.locator('.rune-seal')).toContainText('Echo Rune');
  const uid = (await state(page)).cards.find((c: any) => c.defId === 'heavy-strike').uid;
  await heavy.locator('..').getByRole('button', { name: 'Remove Echo Rune' }).click();
  expect((await state(page)).cards.find((c: any) => c.uid === uid).rune).toBeUndefined();
  await expect(page.locator('[data-card-id="rune-echo"]')).toHaveCount(1);
});
