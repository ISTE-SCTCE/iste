const fs = require('fs');
const path = require('path');

const htmlDir = path.join(__dirname, '../HTML');
const files = fs.readdirSync(htmlDir).filter(f => f.endsWith('.html') && f !== 'index.html'); // Skip index as we did it manually

const cssToInject = `
    <link rel="stylesheet" href="../components/ui/glowing-effect.css">
    <script type="importmap">
    {
      "imports": {
        "motion": "https://cdn.jsdelivr.net/npm/motion@11.11.13/+esm"
      }
    }
    </script>`;

const scriptToInject = `
    <script type="module" src="../JS/init-glowing-effect.js"></script>`;

files.forEach(file => {
    const filePath = path.join(htmlDir, file);
    let content = fs.readFileSync(filePath, 'utf-8');
    let modified = false;

    // Inject CSS & Import Map
    if (!content.includes('glowing-effect.css')) {
        // Try to find main.css to inject after
        if (content.includes('href="../CSS/main.css"')) {
            content = content.replace('href="../CSS/main.css">', 'href="../CSS/main.css">' + cssToInject);
            modified = true;
        } else if (content.includes('</head>')) {
            // Fallback to before </head>
            content = content.replace('</head>', cssToInject + '\n</head>');
            modified = true;
        }
    }

    // Inject Script
    if (!content.includes('init-glowing-effect.js')) {
        if (content.includes('</body>')) {
            content = content.replace('</body>', scriptToInject + '\n</body>');
            modified = true;
        }
    }

    if (modified) {
        fs.writeFileSync(filePath, content, 'utf-8');
        console.log(`Updated ${file}`);
    } else {
        console.log(`Skipped ${file} (already updated or structure mismatch)`);
    }
});
