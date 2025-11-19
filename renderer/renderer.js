// Global variables
let cropper = null;
let selectedCropSize = null;

// DOM elements
const selectImageBtn = document.getElementById('selectImageBtn');
const cropBtn = document.getElementById('cropBtn');
const saveBtn = document.getElementById('saveBtn');
const image = document.getElementById('image');
const previewCanvas = document.getElementById('previewCanvas');
const cropControls = document.getElementById('cropControls');
const actionButtons = document.getElementById('actionButtons');
const cropInfo = document.getElementById('cropInfo');
const previewContainer = document.getElementById('previewContainer');
const cropPosition = document.getElementById('cropPosition');
const cropSize = document.getElementById('cropSize');
const selectedSize = document.getElementById('selectedSize');
const sizeButtons = document.querySelectorAll('.size-btn');
const formatSelect = document.getElementById('formatSelect');
const qualityContainer = document.getElementById('qualityContainer');
const qualitySlider = document.getElementById('qualitySlider');
const qualityValue = document.getElementById('qualityValue');
const previewDimensions = document.getElementById('previewDimensions');
const appTitle = document.getElementById('appTitle');

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    console.log('Image Crop Tool initialized');
    setupEventListeners();
});

function setupEventListeners() {
    // Select image button
    selectImageBtn.addEventListener('click', selectImage);
    
    // Crop size buttons
    sizeButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            selectCropSize(this.getAttribute('data-size'));
            updateSizeButtonStates(this);
        });
    });
    
    // Action buttons
    cropBtn.addEventListener('click', cropImage);
    saveBtn.addEventListener('click', saveImage);
    
    // Format selection
    formatSelect.addEventListener('change', toggleQualityControls);
    qualitySlider.addEventListener('input', updateQualityValue);
}

function selectImage() {
    window.electronAPI.selectImage().then(result => {
        if (result && result.success) {
            // Update title with filename
            appTitle.textContent = `Image Crop Tool - ${result.fileName}`;
            loadImage(result.dataUrl);
        }
    }).catch(error => {
        console.error('Error selecting image:', error);
    });
}

function loadImage(imageDataUrl) {
    image.src = imageDataUrl;
    image.style.display = 'block';
    
    image.onload = function() {
        // Show crop controls and info
        cropControls.style.display = 'flex';
        cropInfo.style.display = 'block';
        
        // Initialize cropper
        if (cropper) {
            cropper.destroy();
        }
        
        cropper = new Cropper(image, {
            aspectRatio: 1, // Square crop
            viewMode: 1,
            autoCropArea: 0.5,
            responsive: true,
            restore: false,
            guides: true,
            center: true,
            highlight: true,
            cropBoxMovable: true, // Allow moving the crop box
            cropBoxResizable: false, // Disable resizing to maintain fixed size
            dragMode: 'move', // Allow dragging to move crop area
            toggleDragModeOnDblclick: false,
            scalable: true,
            zoomable: true,
            crop: function(event) {
                updateCropInfo(event.detail);
            },
            ready: function() {
                // Set initial crop size if one is selected
                if (selectedCropSize) {
                    setCropBoxSize();
                }
            }
        });
    };
}

function selectCropSize(size) {
    selectedCropSize = parseInt(size);
    selectedSize.textContent = `${size}×${size}px`;
    
    if (cropper && selectedCropSize) {
        setCropBoxSize();
        
        // Enable crop button
        cropBtn.disabled = false;
        actionButtons.style.display = 'flex';
    }
}

function setCropBoxSize() {
    if (!cropper || !selectedCropSize) return;
    
    const imageData = cropper.getImageData();
    const containerData = cropper.getContainerData();
    
    // Calculate the scale factor between natural image size and displayed size
    const scaleX = imageData.naturalWidth / imageData.width;
    const scaleY = imageData.naturalHeight / imageData.height;
    
    // Calculate crop box dimensions based on the display scale
    const cropBoxWidth = selectedCropSize / scaleX;
    const cropBoxHeight = selectedCropSize / scaleY;
    
    // Center the crop box
    const centerX = imageData.left + imageData.width / 2;
    const centerY = imageData.top + imageData.height / 2;
    
    cropper.setCropBoxData({
        left: centerX - cropBoxWidth / 2,
        top: centerY - cropBoxHeight / 2,
        width: cropBoxWidth,
        height: cropBoxHeight
    });
}

function updateSizeButtonStates(activeBtn) {
    sizeButtons.forEach(btn => btn.classList.remove('active'));
    activeBtn.classList.add('active');
}

function updateCropInfo(detail) {
    if (!cropper) return;
    
    // Use Cropper.js getData method for accurate crop information
    const cropData = cropper.getData();
    
    // Round the values for display
    const x = Math.round(cropData.x);
    const y = Math.round(cropData.y);
    const width = Math.round(cropData.width);
    const height = Math.round(cropData.height);
    
    cropPosition.textContent = `(${x}, ${y})`;
    cropSize.textContent = `${width}×${height}px`;
    
    // Debug log for verification
    const imageData = cropper.getImageData();
    console.log(`Image: ${imageData.naturalWidth}×${imageData.naturalHeight}, Crop: (${x}, ${y}) ${width}×${height}`);
}

function cropImage() {
    if (!cropper || !selectedCropSize) return;
    
    // Use Cropper.js built-in getCroppedCanvas for accurate cropping
    const croppedCanvas = cropper.getCroppedCanvas({
        width: selectedCropSize,
        height: selectedCropSize,
        minWidth: selectedCropSize,
        minHeight: selectedCropSize,
        maxWidth: selectedCropSize,
        maxHeight: selectedCropSize,
        fillColor: '#ffffff',
        imageSmoothingEnabled: true,
        imageSmoothingQuality: 'high'
    });
    
    // Update preview canvas with the accurately cropped image
    const ctx = previewCanvas.getContext('2d');
    previewCanvas.width = selectedCropSize;
    previewCanvas.height = selectedCropSize;
    
    // Clear canvas and draw the cropped result
    ctx.clearRect(0, 0, selectedCropSize, selectedCropSize);
    ctx.drawImage(croppedCanvas, 0, 0);
    
    // Update preview dimensions display
    previewDimensions.textContent = `Output: ${selectedCropSize}×${selectedCropSize}px`;
    
    // Show preview container and enable save button
    previewContainer.style.display = 'block';
    saveBtn.disabled = false;
    
    console.log(`Image cropped to exact ${selectedCropSize}×${selectedCropSize}px using Cropper.js`);
}

function toggleQualityControls() {
    const format = formatSelect.value;
    if (format === 'jpeg') {
        qualityContainer.style.display = 'flex';
    } else {
        qualityContainer.style.display = 'none';
    }
}

function updateQualityValue() {
    const quality = Math.round(qualitySlider.value * 100);
    qualityValue.textContent = `${quality}%`;
}

function saveImage() {
    if (!previewCanvas) return;
    
    const format = formatSelect.value;
    let mimeType, extension;
    let dataURL;
    
    if (format === 'jpeg') {
        mimeType = 'image/jpeg';
        extension = 'jpg';
        const quality = parseFloat(qualitySlider.value);
        dataURL = previewCanvas.toDataURL(mimeType, quality);
    } else {
        mimeType = 'image/png';
        extension = 'png';
        dataURL = previewCanvas.toDataURL(mimeType);
    }
    
    // Send to main process for saving with format info
    const saveData = {
        dataURL: dataURL,
        size: selectedCropSize,
        format: format,
        extension: extension
    };
    
    window.electronAPI.saveImage(saveData).then(result => {
        if (result && result.success) {
            console.log('Image saved to:', result.filePath);
            alert(result.message);
        } else {
            console.error('Error saving image:', result.message);
            alert('Error saving image: ' + result.message);
        }
    }).catch(error => {
        console.error('Error saving image:', error);
        alert('Error saving image: ' + error.message);
    });
}