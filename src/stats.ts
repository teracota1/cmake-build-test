import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export interface TestRun {
  timestamp: string;
  passed: number;
  failed: number;
  total: number;
}

/**
 * Сохраняет результат запуска тестов в файл статистики.
 * @param {vscode.ExtensionContext} context - Контекст расширения.
 * @param {TestRun} run - Данные о пройденных/проваленных тестах.
 */
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

/**
 * Загружает историю запусков тестов.
 * @param {vscode.ExtensionContext} context - Контекст расширения.
 * @returns {TestRun[]} Массив с историей.
 */
export function loadStats(context: vscode.ExtensionContext): TestRun[] {
  const statsPath = path.join(context.globalStorageUri.fsPath, 'test-stats.json');
  if (!fs.existsSync(statsPath)) return [];
  try { return JSON.parse(fs.readFileSync(statsPath, 'utf8')); } catch { return []; }
