document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('fileInput');
    const dropZone = document.getElementById('dropZone');
    const colorSelect = document.getElementById('colorSelect');
    const processBtn = document.getElementById('processBtn');
    const statusMessage = document.getElementById('statusMessage');
    const downloadLink = document.getElementById('downloadLink');
    const previewContainer = document.getElementById('previewContainer');
    
    let currentFile = null;

    // Handle file selection
    fileInput.addEventListener('change', handleFileSelect);
    
    // Drag and drop functionality
    dropZone.addEventListener('click', () => fileInput.click());
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
    });
    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('drag-over');
    });
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        if (e.dataTransfer.files.length) {
            fileInput.files = e.dataTransfer.files;
            handleFileSelect({ target: fileInput });
        }
    });

    // Process button click
    processBtn.addEventListener('click', processSVG);

    function handleFileSelect(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        if (!file.name.endsWith('.svg')) {
            statusMessage.textContent = '❌ Please select a valid SVG file';
            return;
        }
        
        currentFile = file;
        statusMessage.textContent = `📄 ${file.name} ready for processing`;
        processBtn.disabled = false;
    }

    async function processSVG() {
        if (!currentFile) return;
        
        processBtn.disabled = true;
        statusMessage.textContent = "⚡ Processing SVG...";
        
        try {
            const color = colorSelect.value;
            const fileContent = await readFile(currentFile);
            
            statusMessage.textContent = "🎨 Applying color...";
            
            // Process the SVG (same logic as Discord bot)
            const processedSVG = cleanSVG(fileContent, color);
            
            // Create download link
            const blob = new Blob([processedSVG], { type: 'image/svg+xml' });
            const url = URL.createObjectURL(blob);
            
            downloadLink.href = url;
            downloadLink.download = `reddit_${currentFile.name}`;
            downloadLink.classList.remove('hidden');
            
            // Show preview
            previewContainer.innerHTML = processedSVG;
            previewContainer.classList.remove('hidden');
            
            statusMessage.textContent = "✅ Processing complete!";
        } catch (error) {
            console.error(error);
            statusMessage.textContent = `❌ Error: ${error.message}`;
        } finally {
            processBtn.disabled = false;
        }
    }

    function readFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(new Error('Failed to read file'));
            reader.readAsText(file);
        });
    }

    function cleanSVG(content, color) {
        // Same processing logic as your Discord bot
        const cleaned = content
            .replace(/<!--[\s\S]*?-->|<\?xml[\s\S]*?\?>|<!DOCTYPE[\s\S]*?>|\s(id|class|style|xlink:href|xmlns:xlink)="[^"]*"|<image[\s\S]*?>|<\/image>/g, '');
        
        return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 380 600">
  <defs>
    <style>.cls-1 { fill: ${color}; }</style>
  </defs>
  ${cleaned
    .replace(/<svg[\s\S]*?>|<\/svg>/g, '')
    .replace(/<path/g, '<path class="cls-1"')
  }
</svg>`;
    }
});
