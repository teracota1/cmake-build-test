# История изменений

> Формат основан на [Keep a Changelog](https://keepachangelog.com/ru/1.1.0/).

## [0.0.1] — 2026-11-02

### Добавлено
- Базовая структура расширения.
- Команда `cmakeBuildTest.run` — сборка и тестирование.
- Горячая клавиша `Ctrl+Alt+C`.
- JSDoc-комментарии к каждой функции.
- Сбор статистики (JUnit XML) и вывод цветного ASCII-графика.
- **Умное определение пути:** сборка проекта в папке активного терминала.
- Обновление документации.

### Коммиты

| Хеш | Сообщение |
|-----|-----------|
| `9275995` | `chore: init repository` |
| `8bbc2f0` | `chore: add gitignore` |
| `88e3759` | `chore: add package.json` |
| `d82947a` | `chore: add tsconfig.json` |
| `f149fb5` | `chore: scaffold extension entry point` |
| `e05dae5` | `chore: add package-lock.json` |
| `04a1d35` | `feat: register command and Ctrl+Alt+D keybinding` |
| `b1e6e79` | `chore: add vscode debug configuration` |
| `c55af7c` | `docs: add JSDoc and node types` |
| `282b420` | `feat: change keybinding to Ctrl+Alt+B` |
| `d38f99c` | `feat: change keybinding to Ctrl+Alt+C` |
| `812a04d` | `chore: add chart.js dependency` |
| `aa8ae65` | `feat: add stats storage module` |
| `55c04a2` | `feat: parse JUnit XML and save stats` |
| `f86ced0` | `feat: add webview dashboard with graphs` |
| `21f9141` | `feat: register dashboard command` |
| `633a43a` | `feat: add stats storage module` |
| `cfb5f79` | `feat: collect test stats and render ASCII chart` |
| `4dbeb83` | `chore: update project config` |
| `e85cc57` | `docs: fix README rendering` |
| `3b24ca5` | `docs: finalize API reference` |
| `98176e6` | `docs: finalize overview description` |
| `83d94c3` | `chore: add MIT license` |
| `7aab350` | `docs: update changelog with actual hashes` |
| `f3586c3` | `docs: simplify README` |
| `8b49a8c` | `chore: add repository url to package.json` |
| `da373fe` | `feat: build project in active terminal directory` |