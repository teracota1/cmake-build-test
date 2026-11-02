# API плагина

## `activate(context)`
Вызывается автоматически средой VS Code при первом запуске команды плагина. Регистрирует команду `cmakeBuildTest.run`.

* **Параметры:** 
  * `context` (`vscode.ExtensionContext`) — контекст расширения, предоставляемый VS Code.
* **Возвращает:** `void`

**Пример вызова:** вызывается фреймворком VS Code автоматически.

---

## `getTerminalCwd(terminal)`
Внутренняя функция. Отправляет в терминал команду `pwd`, перенаправляя вывод во временный файл, чтобы узнать текущую рабочую директорию.

* **Параметры:**
  * `terminal` (`vscode.Terminal`) — активный терминал VS Code.
* **Возвращает:** `Promise<string | null>` — абсолютный путь к текущей папке или `null` в случае ошибки.

**Пример вызова:**
`const cwd = await getTerminalCwd(activeTerminal);`

---

## `parseJUnit(xmlPath)`
Внутренняя функция. Парсит XML-файл (JUnit), сгенерированный утилитой `ctest`, и подсчитывает количество успешных и проваленных тестов.

* **Параметры:**
  * `xmlPath` (`string`) — абсолютный путь к файлу `test-results.xml`.
* **Возвращает:** `{ passed: number, failed: number }` — объект с количеством пройденных и проваленных тестов.

**Пример вызова:**
`const result = parseJUnit('/home/user/project/build/test-results.xml');`

---

## `saveStats(context, run)`
Сохраняет результат текущего запуска тестов в глобальный JSON-файл истории.

* **Параметры:**
  * `context` (`vscode.ExtensionContext`) — контекст расширения.
  * `run` (`TestRun`) — объект с результатами.
* **Возвращает:** `void`

**Пример вызова:**
`saveStats(context, { timestamp: new Date().toISOString(), passed: 10, failed: 0, total: 10 });`

---

## `loadStats(context)`
Загружает историю всех запусков тестов из глобального JSON-файла.

* **Параметры:**
  * `context` (`vscode.ExtensionContext`) — контекст расширения.
* **Возвращает:** `TestRun[]` — массив объектов с историей запусков.

**Пример вызова:**
`const history = loadStats(context);`

---

## `generateTerminalReport(context, currentRun)`
Генерирует текстовую строку со статистикой текущего запуска и цветным ASCII-графиком (процент успеха) за последние 10 запусков.

* **Параметры:**
  * `context` (`vscode.ExtensionContext`) — контекст расширения.
  * `currentRun` (`TestRun`) — данные текущего запуска.
* **Возвращает:** `string` — готовый текст отчета с ANSI-кодами цветов.

**Пример вызова:**
`const report = generateTerminalReport(context, currentRun);`

---

## `deactivate()`
Вызывается VS Code при закрытии окна или отключении расширения.

* **Возвращает:** `void`