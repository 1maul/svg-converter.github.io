document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const fileInput = document.getElementById('fileInput');
    const dropZone = document.getElementById('dropZone');
    const colorSelect = document.getElementById('colorSelect');
    const processBtn = document.getElementById('processBtn');
    const statusMessage = document.getElementById('statusMessage');
    const downloadLink = document.getElementById('downloadLink');
    const previewContainer = document.getElementById('previewContainer');
    const progressBar = document.getElementById('progressBar');
    
    let currentFile = null;
    const colorMap = {
        lime: '#4cc9f0',
        blue: '#4361ee',
        yellow: '#ffd166',
        red: '#ef476f',
        purple: '#7209b7'
    };

    // Event Listeners
    fileInput.addEventListener('change', handleFileSelect);
    processBtn.addEventListener('click', processSVG);
    
    // Drag and drop functionality with enhanced UI feedback
    dropZone.addEventListener('click', () => fileInput.click());
    
    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            dropZone.classList.add('drag-over', 'pulse');
        });
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            dropZone.classList.remove('drag-over', 'pulse');
        });
    });
    
    dropZone.addEventListener('drop', (e) => {
        if (e.dataTransfer.files.length) {
            fileInput.files = e.dataTransfer.files;
            handleFileSelect({ target: fileInput });
        }
    });

    // File selection handler
    function handleFileSelect(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        // Reset previous state
        resetProcessingState();
        
        // Validate file type
        if (!file.name.endsWith('.svg') && !file.type.includes('svg')) {
            showStatus('❌ Please select a valid SVG file', 'error');
            return;
        }
        
        currentFile = file;
        showStatus(`📄 ${file.name} ready for processing`, 'success');
        processBtn.disabled = false;
        
        // Show upload progress animation
        simulateUploadProgress();
    }

    // Main processing function
    async function processSVG() {
        if (!currentFile) {
            showStatus('❌ No file selected', 'error');
            return;
        }
        
        // UI state changes
        processBtn.disabled = true;
        showStatus("⚡ Processing SVG...", 'processing');
        downloadLink.classList.add('hidden');
        previewContainer.classList.add('hidden');
        
        try {
            // Read file with progress simulation
            const fileContent = await readFileWithProgress(currentFile);
            
            // Process the SVG
            showStatus("🎨 Applying color transformation...", 'processing');
            const processedSVG = await transformSVG(fileContent, colorSelect.value);
            
            // Create download link
            createDownloadLink(processedSVG);
            
            // Show preview
            showPreview(processedSVG);
            
            showStatus("✅ Processing complete! Click to download", 'success');
        } catch (error) {
            console.error('Processing error:', error);
            showStatus(`❌ Error: ${error.message}`, 'error');
        } finally {
            processBtn.disabled = false;
        }
    }

    // Helper functions
    function resetProcessingState() {
        currentFile = null;
        processBtn.disabled = true;
        progressBar.style.width = '0%';
    }

    function showStatus(message, type = 'info') {
        statusMessage.textContent = message;
        statusMessage.style.color = type === 'error' ? 'var(--warning)' : 
                                  type === 'success' ? 'var(--success)' : '';
    }

    function simulateUploadProgress() {
        let width = 0;
        const interval = setInterval(() => {
            if (width >= 100) {
                clearInterval(interval);
            } else {
                width += 10;
                progressBar.style.width = `${width}%`;
            }
        }, 100);
    }

    function readFileWithProgress(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onprogress = (e) => {
                if (e.lengthComputable) {
                    const percent = Math.round((e.loaded / e.total) * 100);
                    progressBar.style.width = `${percent}%`;
                }
            };
            
            reader.onload = (e) => {
                progressBar.style.width = '100%';
                setTimeout(() => progressBar.style.width = '0%', 500);
                resolve(e.target.result);
            };
            
            reader.onerror = () => {
                reject(new Error('Failed to read file'));
            };
            
            reader.readAsText(file);
        });
    }

    function transformSVG(content, colorKey) {
        return new Promise((resolve) => {
            // Simulate processing delay for animation
            setTimeout(() => {
                const color = colorMap[colorKey] || '#4361ee';
                
                // 1. Remove unwanted elements and attributes
                const cleaned = content
                    .replace(/<!--[\s\S]*?-->|<\?xml[\s\S]*?\?>|<!DOCTYPE[\s\S]*?>|\s(id|class|style|xlink:href|xmlns:xlink)="[^"]*"|<image[\s\S]*?>|<\/image>/g, '');
                
                // 2. Apply color transformation
                const processed = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 380 600">
  <defs>
    <style>.cls-1 { fill: ${color}; }</style>
  </defs>
  ${cleaned
    .replace(/<svg[\s\S]*?>|<\/svg>/g, '')
    .replace(/<path/g, '<path class="cls-1"')
  }
</svg>`;
                
                resolve(processed);
            }, 800); // Simulated processing delay
        });
    }

    function createDownloadLink(svgContent) {
        const blob = new Blob([svgContent], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        
        downloadLink.href = url;
        downloadLink.download = `reddit_${currentFile.name.replace('.svg', '')}_${colorSelect.value}.svg`;
        downloadLink.classList.remove('hidden');
    }

    function showPreview(svgContent) {
        previewContainer.innerHTML = svgContent;
        previewContainer.classList.remove('hidden');
        previewContainer.classList.add('fade-in');
        
        // Scale down large SVGs for preview
        const svg = previewContainer.querySelector('svg');
        if (svg) {
            const viewBox = svg.getAttribute('viewBox');
            if (viewBox) {
                const [,, width, height] = viewBox.split(' ').map(Number);
                if (width > 500 || height > 500) {
                    svg.setAttribute('width', '100%');
                    svg.setAttribute('height', '100%');
                }
            }
        }
    }
});
