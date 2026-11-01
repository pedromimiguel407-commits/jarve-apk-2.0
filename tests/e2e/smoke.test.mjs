import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.cwd());

test('frontend index exists and has key controls', () => {
  const html = fs.readFileSync(path.join(root, 'frontend/index.html'), 'utf8');
  for (const id of ['btnMenu','btnNewChat','btnSend','btnStop','btnClear','modelSelect','btnSaveSettings','btnUpload','btnPlan','btnRunTask']) {
    assert.ok(html.includes('id="' + id + '"'), 'missing ' + id);
  }
  const navigation = html.match(/<nav class="tool-nav primary-nav"[\s\S]*?<\/nav>/)?.[0] || '';
  assert.deepEqual([...navigation.matchAll(/data-view="([^"]+)"/g)].map(match => match[1]), ['chat', 'voice-studio', 'settings']);
  assert.match(navigation, /href="\/download\.html"/);
  for (const id of ['aiDisplayName','accentColor','rgbMode','speechLanguage','speechVoice','speechRate','speechPitch','btnTestVoice','btnRunHtmlTests','btnRunDiag','repairInput','repairFile','btnAskFix','workflowGoal','btnWorkflowResearch','btnWorkflowPlan','btnWorkflowCreate','btnWorkflowExecute','btnWorkflowPreview','workflowPreview','studioNarration','studioVideoFile','studioVideo','btnSpeakNarration','btnPlayAndSpeak']) {
    assert.ok(html.includes(`id="${id}"`), 'missing preference/diagnostic control ' + id);
  }
});

test('download page only enables APK, EXE, and AppImage downloads from a published GitHub release', () => {
  const html = fs.readFileSync(path.join(root, 'frontend/download.html'), 'utf8');
  assert.match(html, /const repository = 'pedromimiguel407-commits\/jarve-apk-2\.0'/);
  assert.match(html, /api\.github\.com\/repos\/\$\{repository\}\/releases\/latest/);
  assert.match(html, /asset\.name === 'app-debug\.apk'/);
  assert.match(html, /exeDownload/);
  assert.match(html, /JARVES-AI-Setup-.*x64\\\.exe/);
  assert.match(html, /JARVES-AI-.+-x86_64\\\.AppImage/);
  assert.match(html, /linuxDownload/);
  assert.match(html, /link\.hidden = false/);
});

test('Linux packaging builds only an x64 AppImage and uploads it from CI', () => {
  const packageJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
  const workflow = fs.readFileSync(path.join(root, '.github/workflows/linux-appimage.yml'), 'utf8');
  assert.match(packageJson.scripts['build:linux'], /--linux AppImage --x64/);
  assert.deepEqual(packageJson.build.linux.target, [{ target: 'AppImage', arch: ['x64'] }]);
  assert.match(workflow, /npm run build:linux/);
  assert.match(workflow, /dist\/\*\.AppImage/);
});

test('GitHub Pages workflow publishes the downloads page as the site root', () => {
  const workflow = fs.readFileSync(path.join(root, '.github/workflows/pages.yml'), 'utf8');
  assert.match(workflow, /branches: \[main\]/);
  assert.match(workflow, /cp frontend\/download\.html public\/index\.html/);
  assert.match(workflow, /actions\/upload-pages-artifact@v3/);
  assert.match(workflow, /actions\/deploy-pages@v4/);
});

test('HTML diagnostics run on demand and offer reviewed repair prompts', () => {
  const tests = fs.readFileSync(path.join(root, 'frontend/scripts/html-tests.js'), 'utf8');
  const app = fs.readFileSync(path.join(root, 'frontend/scripts/app.js'), 'utf8');
  assert.match(tests, /window\.jarvesHtmlTestReport = report/);
  assert.doesNotMatch(tests, /if \(document\.getElementById\('htmlTestResults'\)\) run\(\)/);
  assert.match(app, /failedTests = report\?\.checks\?\.filter/);
  assert.match(app, /input\.focus\(\)/);
  assert.match(app, /repairFile\.files\?\.\[0\]/);
  assert.match(app, /512 \* 1024/);
});

test('docs exist', () => {
  for (const f of ['README.md','SECURITY.md','.env.example']) {
    assert.ok(fs.existsSync(path.join(root, f)), f);
  }
});
