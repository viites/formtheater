const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

const server = http.createServer((req, res) => {
    // Handle form submission
    if (req.method === 'POST' && req.url === '/submit') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            const data = JSON.parse(body);
            console.log("Received form data:", data);
            
            // Save to submissions.json file
            const submissionsFile = path.join(__dirname, 'submissions.json');
            let submissions = [];
            
            // Read existing submissions
            if (fs.existsSync(submissionsFile)) {
                try {
                    const fileContent = fs.readFileSync(submissionsFile, 'utf-8');
                    submissions = JSON.parse(fileContent);
                } catch (err) {
                    console.error("Error reading submissions.json:", err);
                }
            }
            
            // Add new submission with timestamp
            submissions.push({
                ...data,
                timestamp: new Date().toISOString(),
                id: submissions.length + 1
            });
            
            // Save back to file
            fs.writeFile(submissionsFile, JSON.stringify(submissions, null, 2), (err) => {
                if (err) {
                    console.error("Error saving data:", err);
                } else {
                    console.log("✓ Data saved to submissions.json");
                }
            });
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, message: "Data received and saved!" }));
        });
        return;
    }

    // Serve static files
    let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);
    
    const extname = String(path.extname(filePath)).toLowerCase();
    const mimeTypes = {
        '.html': 'text/html',
        '.css': 'text/css',
        '.js': 'text/javascript',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.ico': 'image/x-icon'
    };

    const contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 - File Not Found</h1>', 'utf-8');
            } else {
                res.writeHead(500);
                res.end('Sorry, check with the site admin for error: ' + err.code + ' ..\n');
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
    console.log(`Press Ctrl+C to stop the server`);
});
