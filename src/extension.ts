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

// Функция для получения пути из терминала через временный файл
async function getTerminalCwd(terminal: vscode.Terminal): Promise<string | null> {
  // Берем корень рабочей области как запасной вариант
  const defaultCwd = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  if (!defaultCwd) return null;

  const tempFile = path.join(defaultCwd, '.vscode_cwd');
  
  // Если файл остался с прошлого раза, удаляем
  if (fs.existsSync(tempFile)) {
    try { fs.unlinkSync(tempFile); } catch (e) {}
  }

  // Просим терминал записать путь
  terminal.sendText(`pwd > "${tempFile}"`, true);

  // Ждем 300 мс, чтобы терминал успел выполнить команду
  await new Promise(resolve => setTimeout(resolve, 300));

  if (fs.existsSync(tempFile)) {
    try {
      const cwd = fs.readFileSync(tempFile, 'utf8').trim();
      fs.unlinkSync(tempFile); // Удаляем за собой
      return cwd;
    } catch (e) {
      return defaultCwd;
    }
  }
  return defaultCwd;
}

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand('cmakeBuildTest.run', async () => {
    // 1. Получаем терминал
    const terminal = vscode.window.activeTerminal || vscode.window.createTerminal();
    terminal.show();

    // 2. Получаем текущую папку терминала
    const cwd = await getTerminalCwd(terminal);
    if (!cwd) return vscode.window.showErrorMessage('Не удалось определить папку проекта');

    // 3. Проверяем наличие CMakeLists.txt
    if (!fs.existsSync(path.join(cwd, 'CMakeLists.txt'))) {
      return vscode.window.showErrorMessage(`В папке "${cwd}" нет файла CMakeLists.txt!`);
    }

    // 4. Запускаем сборку
    const buildDir = path.join(cwd, 'build');
    const xmlPath = path.join(buildDir, 'test-results.xml');
    
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
              const statsFile = path.join(cwd, '.test-stats.txt');
              fs.writeFileSync(statsFile, report);
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