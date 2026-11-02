import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export interface TestRun {
  timestamp: string;
  passed: number;
  failed: number;
  total: number;
}

export function saveStats(context: vscode.ExtensionContext, run: TestRun) {
  const statsPath = path.join(context.globalStorageUri.fsPath, 'test-stats.json');
  const dir = path.dirname(statsPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  let history: TestRun[] = [];
  if (fs.existsSync(statsPath)) {
    try { history = JSON.parse(fs.readFileSync(statsPath, 'utf8')); } catch (e) { history = []; }
  }
  history.push(run);
  fs.writeFileSync(statsPath, JSON.stringify(history, null, 2));
}

export function loadStats(context: vscode.ExtensionContext): TestRun[] {
  const statsPath = path.join(context.globalStorageUri.fsPath, 'test-stats.json');
  if (!fs.existsSync(statsPath)) return [];
  try { return JSON.parse(fs.readFileSync(statsPath, 'utf8')); } catch { return []; }
}

/**
 * Генерирует текстовую строку со статистикой и процентным ASCII-графиком.
 */
export function generateTerminalReport(context: vscode.ExtensionContext, currentRun: TestRun): string {
  const history = loadStats(context);
  if (history.length === 0) return '';

  const successRate = currentRun.total > 0 ? Math.round((currentRun.passed / currentRun.total) * 100) : 0;
  
  // Настоящий невидимый символ ESC для цветов
  const esc = '\u001b';

  let output = `\n📊 ${esc}[1mСТАТИСТИКА ТЕКУЩЕГО ЗАПУСКА${esc}[0m\n`;
  output += `───────────────────────────────────────\n`;
  output += `Всего тестов:      ${esc}[36m${currentRun.total}${esc}[0m\n`;
  output += `Пройдено:          ${esc}[32m${currentRun.passed}${esc}[0m\n`;
  output += `Провалено:         ${esc}[31m${currentRun.failed}${esc}[0m\n`;
  output += `Успешность:        ${esc}[33m${successRate}%${esc}[0m\n`;
  output += `───────────────────────────────────────\n\n`;

  output += `📈 ${esc}[1mГРАФИК ЗАПУСКОВ (последние 10)${esc}[0m\n`;
  
  const recent = history.slice(-10);
  const height = 8; // Высота графика

  // Рисуем график сверху вниз
  for (let row = height; row > 0; row--) {
    const thresholdPercent = (row / height) * 100;
    let line = '';
    
    for (const run of recent) {
      const total = run.total > 0 ? run.total : 1;
      const passedPercent = (run.passed / total) * 100;
      const failedPercent = (run.failed / total) * 100;
      
      if (passedPercent >= thresholdPercent) {
        line += `${esc}[32m█${esc}[0m `; // Зеленый
      } else if (passedPercent + failedPercent >= thresholdPercent) {
        line += `${esc}[31m█${esc}[0m `; // Красный
      } else {
        line += '  '; // Пусто
      }
    }
    output += `${line}\n`;
  }
  
  // Подписи оси X
  let labels = '';
  for (let i = 0; i < recent.length; i++) {
    labels += `${i + 1} `;
  }
  
  output += '─'.repeat(recent.length * 2) + '\n';
  output += labels + '\n';
  output += `${esc}[32m█${esc}[0m Passed  ${esc}[31m█${esc}[0m Failed\n\n`;

  return output;
}