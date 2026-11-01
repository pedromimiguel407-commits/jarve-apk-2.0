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

test('download page only enables APK and EXE downloads from a published GitHub release', () => {
  const html = fs.readFileSync(path.join(root, 'frontend/download.html'), 'utf8');
  assert.match(html, /const repository = 'pedromimiguel407-commits\/jarve-apk-2\.0'/);
  assert.match(html, /api\.github\.com\/repos\/\$\{repository\}\/releases\/latest/);
  assert.match(html, /asset\.name === 'app-debug\.apk'/);
  assert.match(html, /exeDownload/);
  assert.match(html, /JARVES-AI-Setup-.*x64\\\.exe/);
  assert.match(html, /link\.hidden = false/);
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
