import * as vscode from 'vscode';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand('cmakeBuildTest.run', () => {
    const ws = vscode.workspace.workspaceFolders?.[0];
    if (!ws) {
      vscode.window.showErrorMessage('Нет открытой папки проекта');
      return;
    }

    const cwd = ws.uri.fsPath;
    const buildDir = path.join(cwd, 'build');

    const terminal = vscode.window.createTerminal({ name: 'Build & Test', cwd });
    terminal.show();

    terminal.sendText(
      `cmake -S "${cwd}" -B "${buildDir}" && ` +
      `cmake --build "${buildDir}" && ` +
      `ctest --test-dir "${buildDir}" --output-on-failure`
    );
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {}