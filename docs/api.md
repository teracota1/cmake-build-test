# API плагина

## `activate(context)`
Вызывается автоматически средой VS Code при первом запуске команды плагина. Регистрирует команду `cmakeBuildTest.run`.

* **Параметры:** 
  * `context` (`vscode.ExtensionContext`) — контекст расширения, предоставляемый VS Code.
* **Возвращает:** `void`

**Пример вызова:** вызывается фреймворком VS Code автоматически, ручной вызов не требуется.

---

## `parseJUnit(xmlPath)`
Внутренняя функция. Парсит XML-файл (JUnit), сгенерированный утилитой `ctest`, и подсчитывает количество успешных и проваленных тестов.

* **Параметры:**
  * `xmlPath` (`string`) — абсолютный путь к файлу `test-results.xml`.
* **Возвращает:** `{ passed: number, failed: number }` — объект с количеством пройденных и проваленных тестов.

**Пример вызова:**
`const result = parseJUnit('/home/user/project/build/test-results.xml');`
`console.log(result.passed, result.failed);`

---

## `saveStats(context, run)`
Сохраняет результат текущего запуска тестов в глобальный JSON-файл истории (`.test-stats.json`).

* **Параметры:**
  * `context` (`vscode.ExtensionContext`) — контекст расширения (используется для получения пути к хранилищу).
  * `run` (`TestRun`) — объект с результатами (дата, пройдено, провалено, всего).
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
Вызывается VS Code при закрытии окна или отключении расширения. Очищает ресурсы.

* **Возвращает:** `void`

**Пример вызова:** вызывается автоматически.
