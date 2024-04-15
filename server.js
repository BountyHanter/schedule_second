const http = require('http');
const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose(); // Подключаем модуль sqlite3

const dbPath = path.resolve(__dirname, 'database', 'mydb.sqlite');

// Подключаемся к базе данных SQLite
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
    if (err) {
        console.error('Failed to connect to the SQLite database.', err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

const server = http.createServer((req, res) => {
    if (req.url.startsWith('/api/schedule') && req.method === 'GET') {
        // Обработка API запроса на получение данных расписания
        db.all("SELECT * FROM schedule", [], (err, rows) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: err.message }));
                return;
            }
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ schedule: rows }));
        });
    } else {
        // Определение файла на основе запрошенного URL
        let filePath = path.join(__dirname, 'public', req.url === '/' ? 'html/index.html' : req.url);

        // Получение расширения файла для определения корректного Content-Type
        const ext = path.extname(filePath);
        let contentType = 'text/html'; // Значение по умолчанию

        switch (ext) {
            case '.css':
                contentType = 'text/css';
                break;
            case '.js':
                contentType = 'application/javascript';
                break;
            case '.png':
                contentType = 'image/png';
                break;
            case '.jpg':
                contentType = 'image/jpeg';
                break;
            case '.ico':
                contentType = 'image/x-icon';
                break;
            default:
                contentType = 'text/html';
                break;
        }

        // Чтение файла, если он существует
        fs.readFile(filePath, (err, content) => {
            if (err) {
                if (err.code === 'ENOENT') {
                    // Если файл не найден, возвращаем 404
                    fs.readFile(path.join(__dirname, 'public', 'html', '404.html'), (err, content) => {
                        res.writeHead(404, { 'Content-Type': 'text/html' });
                        res.end(content, 'utf-8');
                    });
                } else {
                    // Для других серверных ошибок возвращаем 500
                    res.writeHead(500);
                    res.end(`Server Error: ${err.code}`);
                }
            } else {
                // Если файл найден, отдаем его с правильным Content-Type
                res.writeHead(200, { 'Content-Type': contentType });
                res.end(content, 'utf-8');
            }
        });
    }
});

const port = 3001;
server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
