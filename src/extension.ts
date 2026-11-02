import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as cp from 'child_process';
import { saveStats, generateTerminalReport } from './stats';

function parseJUnit(xmlPath: string): { passed: number, failed: number } {
  if (!fs.existsSync(xmlPath)) return { passed: 0, failed: 0 };
  const xml = fs.readFileSync(xmlPath, 'utf8');
  const passed = (xml.match(/<testcase/g) || []).length - (xml.match(/<failure/g) || []).length;
  const failed = (xml.match(/<failure/g) || []).length;
  return { passed, failed };
}

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand('cmakeBuildTest.run', async () => {
    const ws = vscode.workspace.workspaceFolders?.[0];
    if (!ws) return vscode.window.showErrorMessage('Нет открытой папки проекта');
    
    const cwd = ws.uri.fsPath;
    const buildDir = path.join(cwd, 'build');
    const xmlPath = path.join(buildDir, 'test-results.xml');
    const terminal = vscode.window.createTerminal({ name: 'Build & Test', cwd: cwd });
    terminal.show();

    if (fs.existsSync(xmlPath)) fs.unlinkSync(xmlPath);

    const cmd = `cmake -S "${cwd}" -B "${buildDir}" && cmake --build "${buildDir}"; ctest --test-dir "${buildDir}" --output-on-failure --output-junit "${xmlPath}"`;

    terminal.sendText(cmd);
    
    vscode.window.withProgress({
      location: vscode.ProgressLocation.Notification,
      title: "Сборка и тестирование...",
      cancellable: false
    }, async () => {
      return new Promise<void>((resolve) => {
        cp.exec(cmd, { cwd, maxBuffer: 1024 * 1024 * 10 }, (error) => {
          
          const result = parseJUnit(xmlPath);
          
          if (result.passed + result.failed > 0) {
            const currentRun = {
              timestamp: new Date().toISOString(),
              passed: result.passed,
              failed: result.failed,
              total: result.passed + result.failed
            };
            
            saveStats(context, currentRun);

            const report = generateTerminalReport(context, currentRun);
            if (report) {
              // Записываем текст в файл
              const tempFile = path.join(cwd, '.test-stats.txt');
              fs.writeFileSync(tempFile, report);
              
              // Используем Node.js для вывода файла в терминал.
              // Это 100% защищает ANSI-коды от искажения оболочкой bash.
              terminal.sendText(`node -e "process.stdout.write(require('fs').readFileSync('.test-stats.txt', 'utf8')); require('fs').unlinkSync('.test-stats.txt');"`);
            }
          } else {
            terminal.sendText(`node -e "console.log('\\n\\u001b[31m❌ Ошибка сборки или тесты не найдены!\\u001b[0m\\n')"`);
          }
          resolve();
        });
      });
    });
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {}