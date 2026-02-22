/**
 * readerService.js
 *
 * Cél:
 * Külön réteg az olvasó logikához.
 * Most csak tovább exportáljuk az openReader-t
 * a driveService-ből, hogy az app.js tisztán
 * a readerService-en keresztül használja.
 */

export { openReader } from "./driveService.js";
