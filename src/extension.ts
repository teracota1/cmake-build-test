import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { saveStats } from './stats';
import { showDashboard } from './dashboard';

/**
 * Парсит XML-файл от ctest и возвращает количество пройденных и проваленных тестов.
 */
function parseJUnit(xmlPath: string): { passed: number, failed: number } {
  if (!fs.existsSync(xmlPath)) return { passed: 0, failed: 0 };
  const xml = fs.readFileSync(xmlPath, 'utf8');
  const passed = (xml.match(/<testcase/g) || []).length - (xml.match(/<failure/g) || []).length;
  const failed = (xml.match(/<failure/g) || []).length;
  return { passed, failed };
}

function runBuildAndTest(cwd: string, terminal: vscode.Terminal, context: vscode.ExtensionContext): void {
  const buildDir = path.join(cwd, 'build');
  const xmlPath = path.join(buildDir, 'test-results.xml');

  terminal.sendText(
    `cmake -S "${cwd}" -B "${buildDir}" && ` +
    `cmake --build "${buildDir}" && ` +
    `ctest --test-dir "${buildDir}" --output-on-failure --output-junit "${xmlPath}"`
  );

  // Ждем 2 секунды, чтобы ctest успел создать XML, и сохраняем статистику
  setTimeout(() => {
    const result = parseJUnit(xmlPath);
    if (result.passed + result.failed > 0) {
      saveStats(context, {
        timestamp: new Date().toISOString(),
        passed: result.passed,
        failed: result.failed,
        total: result.passed + result.failed
      });
      vscode.window.showInformationMessage(`Тесты завершены: ${result.passed} passed, ${result.failed} failed.`);
    }
  }, 2000);
}

export function activate(context: vscode.ExtensionContext) {
  // Команда сборки
  const buildDisposable = vscode.commands.registerCommand('cmakeBuildTest.run', () => {
    const ws = vscode.workspace.workspaceFolders?.[0];
    if (!ws) return vscode.window.showErrorMessage('Нет открытой папки проекта');
    
    const terminal = vscode.window.createTerminal({ name: 'Build & Test', cwd: ws.uri.fsPath });
    terminal.show();
    runBuildAndTest(ws.uri.fsPath, terminal, context);
  });

  // Команда открытия графиков
  const dashboardDisposable = vscode.commands.registerCommand('cmakeBuildTest.dashboard', () => {
    showDashboard(context);
  });

  context.subscriptions.push(buildDisposable, dashboardDisposable);
}

export function deactivate() {}