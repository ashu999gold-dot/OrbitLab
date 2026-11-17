const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const SCENES_CONFIG = [
  {
    id: 'scene1',
    name: 'Scene 1: Introduction',
    type: 'html',
    filePath: 'video/assets/scene1_intro.html',
    durationSec: 24.5
  },
  {
    id: 'scene2',
    name: 'Scene 2: Two-Body Problem',
    type: 'html',
    filePath: 'video/assets/scene2_physics_problem.html',
    durationSec: 40.5
  },
  {
    id: 'scene3',
    name: 'Scene 3: Numerical Method',
    type: 'html',
    filePath: 'video/assets/scene3_numerical_method.html',
    durationSec: 55.5
  },
  {
    id: 'scene4',
    name: 'Scene 4: Live Demonstration',
    type: 'app_scene4',
    durationSec: 87.0
  },
  {
    id: 'scene5',
    name: 'Scene 5: Results & Classification',
    type: 'app_scene5',
    durationSec: 71.5
  },
  {
    id: 'scene6',
    name: 'Scene 6: Conclusion',
    type: 'html',
    filePath: 'video/assets/scene6_conclusion.html',
    durationSec: 33.0
  }
];

async function recordScene(scene, browser) {
  console.log(`\n========================================`);
  console.log(`Starting ${scene.name} (target: ${scene.durationSec}s)...`);
  
  const rawDir = path.resolve(`video/raw/${scene.id}`);
  if (fs.existsSync(rawDir)) {
    fs.rmSync(rawDir, { recursive: true, force: true });
  }
  fs.mkdirSync(rawDir, { recursive: true });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    recordVideo: {
      dir: rawDir,
      size: { width: 1920, height: 1080 }
    }
  });

  const page = await context.newPage();

  if (scene.type === 'html') {
    const fileUrl = 'file:///' + path.resolve(scene.filePath).replace(/\\/g, '/');
    await page.goto(fileUrl);
    await page.waitForTimeout(scene.durationSec * 1000);
  } else if (scene.type === 'app_scene4') {
    await recordAppScene4(page);
  } else if (scene.type === 'app_scene5') {
    await recordAppScene5(page);
  }

  const video = page.video();
  await context.close();

  if (video) {
    const rawVideoPath = await video.path();
    console.log(`Recorded raw video for ${scene.id} at: ${rawVideoPath}`);
    // Rename to a predictable filename
    const destPath = path.resolve(`video/raw/${scene.id}.webm`);
    if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
    fs.renameSync(rawVideoPath, destPath);
    console.log(`Saved as: ${destPath}`);
  }
}

async function recordAppScene4(page) {
  await page.goto('http://localhost:4173/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // 1. Initial workspace view (Earth-Moon system)
  // Hover over left panel
  await page.mouse.move(200, 300, { steps: 10 });
  await page.waitForTimeout(3000);

  // Hover over center canvas
  await page.mouse.move(960, 500, { steps: 10 });
  await page.waitForTimeout(3000);

  // Hover over right telemetry dashboard
  await page.mouse.move(1700, 350, { steps: 10 });
  await page.waitForTimeout(4000);

  // 2. Open Bodies tab in Controls Panel
  console.log('Inspecting Bodies tab...');
  const bodiesTab = page.locator('button:has-text("Bodies")');
  if (await bodiesTab.count() > 0) {
    await bodiesTab.click();
    await page.waitForTimeout(3000);
  }

  // Open Orbit tab
  console.log('Inspecting Orbit tab...');
  const orbitTab = page.locator('button:has-text("Orbit")');
  if (await orbitTab.count() > 0) {
    await orbitTab.click();
    await page.waitForTimeout(3000);
  }

  // Back to Presets tab
  const presetsTab = page.locator('button:has-text("Presets")');
  if (await presetsTab.count() > 0) {
    await presetsTab.click();
    await page.waitForTimeout(2000);
  }

  // 3. Start Playback
  console.log('Starting Playback...');
  const playBtn = page.locator('button:has-text("Play")');
  if (await playBtn.count() > 0) {
    await playBtn.click();
    await page.waitForTimeout(2000);
  }

  // Speed up to 100x
  console.log('Speeding to 100x...');
  const speed100 = page.locator('button:has-text("100x")');
  if (await speed100.count() > 0) {
    await speed100.click();
    await page.waitForTimeout(3000);
  }

  // Speed up to 180kx for rapid Moon orbit
  console.log('Speeding to 180kx...');
  const speed180k = page.locator('button:has-text("180k×")');
  if (await speed180k.count() > 0) {
    await speed180k.click();
    await page.waitForTimeout(6000);
  }

  // Toggle Velocity Vectors
  console.log('Toggling Velocity Vectors...');
  const velocityBtn = page.locator('button[title*="Velocity"]');
  if (await velocityBtn.count() > 0) {
    await velocityBtn.click();
    await page.waitForTimeout(3000);
  }

  // Toggle Distance Line
  const distBtn = page.locator('button[title*="Distance"]');
  if (await distBtn.count() > 0) {
    await distBtn.click();
    await page.waitForTimeout(3000);
  }

  // 4. Smooth 3D camera orbit
  console.log('Orbiting 3D camera...');
  await page.mouse.move(960, 500);
  await page.mouse.down();
  await page.mouse.move(1150, 420, { steps: 30 });
  await page.mouse.up();
  await page.waitForTimeout(4000);

  // 5. Highlight Telemetry Dashboard metrics
  console.log('Hovering Telemetry Dashboard...');
  await page.mouse.move(1720, 240, { steps: 15 });
  await page.waitForTimeout(4000);
  await page.mouse.move(1720, 480, { steps: 15 });
  await page.waitForTimeout(4000);
  await page.mouse.move(1720, 720, { steps: 15 });
  await page.waitForTimeout(5000);

  // 6. Zoom camera into Earth to reveal mantle barycenter
  console.log('Zooming into Earth barycenter...');
  await page.mouse.move(960, 500);
  for (let z = 0; z < 8; z++) {
    await page.mouse.wheel(0, -180);
    await page.waitForTimeout(200);
  }
  await page.waitForTimeout(5000);

  // Subtle rotation around Earth
  await page.mouse.down();
  await page.mouse.move(900, 480, { steps: 20 });
  await page.mouse.up();
  await page.waitForTimeout(8000);
}

async function recordAppScene5(page) {
  await page.goto('http://localhost:4173/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // 1. Equal-Mass Binary Stars
  console.log('Selecting Equal-Mass Binary preset...');
  const presetsTab = page.locator('button:has-text("Presets")');
  if (await presetsTab.count() > 0) {
    await presetsTab.click();
    await page.waitForTimeout(1000);
  }

  const binaryPreset = page.locator('text=Equal-Mass Binary');
  if (await binaryPreset.count() > 0) {
    await binaryPreset.click();
    await page.waitForTimeout(2000);
  }

  // Play simulation
  const playBtn = page.locator('button:has-text("Play")');
  if (await playBtn.count() > 0) {
    await playBtn.click();
    await page.waitForTimeout(2000);
  }

  // Speed to 100x
  const speed100 = page.locator('button:has-text("100x")');
  if (await speed100.count() > 0) {
    await speed100.click();
    await page.waitForTimeout(3000);
  }

  // Orbit camera around binary stars
  console.log('Orbiting around Equal-Mass Binary...');
  await page.mouse.move(960, 500);
  await page.mouse.down();
  await page.mouse.move(1120, 440, { steps: 25 });
  await page.mouse.up();
  await page.waitForTimeout(5000);

  // Highlight equal accelerations & zero momentum in telemetry
  console.log('Hovering Telemetry (Equal accelerations & momentum)...');
  await page.mouse.move(1720, 280, { steps: 15 });
  await page.waitForTimeout(5000);
  await page.mouse.move(1720, 520, { steps: 15 });
  await page.waitForTimeout(6000);

  // 2. Escape Trajectory preset
  console.log('Selecting Escape Trajectory preset...');
  const escapePreset = page.locator('text=Escape Trajectory');
  if (await escapePreset.count() > 0) {
    await escapePreset.click();
    await page.waitForTimeout(2000);
  }

  // Play escape simulation
  const playBtn2 = page.locator('button:has-text("Play")');
  if (await playBtn2.count() > 0) {
    await playBtn2.click();
    await page.waitForTimeout(3000);
  }

  // Camera tracking
  console.log('Tracking hyperbolic escape flyby...');
  await page.mouse.move(960, 500);
  for (let z = 0; z < 3; z++) {
    await page.mouse.wheel(0, 150);
    await page.waitForTimeout(200);
  }
  await page.waitForTimeout(6000);

  // Focus on Telemetry: e > 1, E > 0, Apoapsis/Period = ∞
  console.log('Hovering Telemetry (Unbound parameters: e, E, Apoapsis)...');
  await page.mouse.move(1720, 320, { steps: 15 });
  await page.waitForTimeout(5000);
  await page.mouse.move(1720, 600, { steps: 15 });
  await page.waitForTimeout(8000);
}

async function main() {
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
    args: [
      '--enable-webgl',
      '--use-gl=angle',
      '--enable-gpu-rasterization',
      '--window-size=1920,1080',
      '--no-sandbox'
    ]
  });

  const targetScene = process.argv[2];
  const scenesToRun = targetScene 
    ? SCENES_CONFIG.filter(s => s.id === targetScene)
    : SCENES_CONFIG;

  for (const scene of scenesToRun) {
    await recordScene(scene, browser);
  }

  await browser.close();
  console.log('\nAll scene recordings completed successfully!');
}

main().catch(err => {
  console.error('Error recording scenes:', err);
  process.exit(1);
});
