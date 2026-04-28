const fs = require('fs');
const path = require('path');
const https = require('https');

const iconsDir = path.join(__dirname, 'public', 'Icons');

if (!fs.existsSync(iconsDir)) {
  console.error("Icons directory not found at", iconsDir);
  process.exit(1);
}

const files = fs.readdirSync(iconsDir);
let activeDownloads = 0;
let urlFiles = 0;

files.forEach(file => {
  if (file.endsWith('.url')) {
    urlFiles++;
    const filePath = path.join(iconsDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const match = content.match(/URL=(.+png)/i);
    
    if (match && match[1]) {
      const url = match[1].trim();
      const filename = path.basename(url);
      const targetPath = path.join(iconsDir, filename);
      
      activeDownloads++;
      https.get(url, (response) => {
        if (response.statusCode === 200) {
          const fileStream = fs.createWriteStream(targetPath);
          response.pipe(fileStream);
          fileStream.on('finish', () => {
            fileStream.close();
            try {
              fs.unlinkSync(filePath);
            } catch (e) { }
            console.log(`Downloaded ${filename}`);
            activeDownloads--;
            if (activeDownloads === 0) console.log("Done downloading all icons.");
          });
        } else {
          console.error(`Failed to download ${url} - Status: ${response.statusCode}`);
          activeDownloads--;
          if (activeDownloads === 0) console.log("Done downloading all icons.");
        }
      }).on('error', (err) => {
        console.error(`Error downloading ${url}:`, err.message);
        activeDownloads--;
        if (activeDownloads === 0) console.log("Done downloading all icons.");
      });
    }
  }
});

if (urlFiles === 0) {
  console.log("No .url files found to process.");
} else {
  console.log(`Found ${urlFiles} .url files, starting downloads...`);
}
