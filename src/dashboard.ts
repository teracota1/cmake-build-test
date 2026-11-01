import * as vscode from 'vscode';
import { loadStats } from './stats';

export function showDashboard(context: vscode.ExtensionContext) {
  const history = loadStats(context);
  if (history.length === 0) {
    vscode.window.showWarningMessage('Статистика пуста. Запустите тесты!');
    return;
  }

  const panel = vscode.window.createWebviewPanel(
    'testDashboard',
    'Test Dashboard',
    vscode.ViewColumn.One,
    { enableScripts: true }
  );

  const dates = history.map(r => new Date(r.timestamp).toLocaleDateString());
  const passed = history.map(r => r.passed);
  const failed = history.map(r => r.failed);

  panel.webview.html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
      <style>
        body { font-family: sans-serif; padding: 20px; color: white; background: #1e1e1e; }
        .chart-container { width: 80%; max-width: 800px; margin: 20px auto; }
      </style>
    </head>
    <body>
      <h2>Статистика тестов</h2>
      <div class="chart-container">
        <canvas id="myChart"></canvas>
      </div>
      <script>
        new Chart(document.getElementById('myChart').getContext('2d'), {
          type: 'line',
          data: {
            labels: ${JSON.stringify(dates)},
            datasets: [
              { label: 'Пройдено', data: ${JSON.stringify(passed)}, borderColor: '#4caf50', tension: 0.2 },
              { label: 'Провалено', data: ${JSON.stringify(failed)}, borderColor: '#f44336', tension: 0.2 }
            ]
          },
          options: { responsive: true, scales: { y: { beginAtZero: true } } }
        });
      </script>
    </body>
    </html>
  `;
}
