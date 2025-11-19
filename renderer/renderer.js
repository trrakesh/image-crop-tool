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
    // Get the actual coordinates and size in the original image
    const imageData = cropper.getImageData();
    const scaleX = imageData.naturalWidth / imageData.width;
    const scaleY = imageData.naturalHeight / imageData.height;
    
    // Calculate actual pixel coordinates in the original image
    const actualX = Math.round(detail.x * scaleX);
    const actualY = Math.round(detail.y * scaleY);
    const actualWidth = Math.round(detail.width * scaleX);
    const actualHeight = Math.round(detail.height * scaleY);
    
    cropPosition.textContent = `(${actualX}, ${actualY})`;
    cropSize.textContent = `${actualWidth}×${actualHeight}px`;
}

function cropImage() {
    if (!cropper || !selectedCropSize) return;
    
    // Get the crop box data and image data for precise cropping
    const cropBoxData = cropper.getCropBoxData();
    const imageData = cropper.getImageData();
    const canvasData = cropper.getCanvasData();
    
    // Calculate the scale between display and natural image size
    const scaleX = imageData.naturalWidth / imageData.width;
    const scaleY = imageData.naturalHeight / imageData.height;
    
    // Calculate actual crop coordinates in the original image
    const cropX = (cropBoxData.left - imageData.left) * scaleX;
    const cropY = (cropBoxData.top - imageData.top) * scaleY;
    const cropWidth = cropBoxData.width * scaleX;
    const cropHeight = cropBoxData.height * scaleY;
    
    // Get the original image element
    const originalImage = cropper.element;
    
    // Create a temporary canvas for precise cropping
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = selectedCropSize;
    tempCanvas.height = selectedCropSize;
    const tempCtx = tempCanvas.getContext('2d');
    
    // Draw the cropped portion at exact selected size
    tempCtx.drawImage(
        originalImage,
        cropX, cropY, cropWidth, cropHeight,  // Source coordinates and size
        0, 0, selectedCropSize, selectedCropSize  // Destination coordinates and size
    );
    
    // Update preview canvas with the precisely cropped image
    const ctx = previewCanvas.getContext('2d');
    previewCanvas.width = selectedCropSize;
    previewCanvas.height = selectedCropSize;
    ctx.drawImage(tempCanvas, 0, 0);
    
    // Update preview dimensions display
    previewDimensions.textContent = `Output: ${selectedCropSize}×${selectedCropSize}px`;
    
    // Show preview container and enable save button
    previewContainer.style.display = 'block';
    saveBtn.disabled = false;
    
    console.log(`Image cropped to exact ${selectedCropSize}×${selectedCropSize}px`);
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