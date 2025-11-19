# Image Crop Electron App

A desktop application built with Electron for selecting and cropping images with an intuitive interface.

## Features

- 🖼️ **Image Selection**: Browse and select images from your file system
- ✂️ **Interactive Cropping**: Use Cropper.js for precise image cropping with visual feedback
- 💾 **Save Functionality**: Save cropped images to your desired location
- 🎨 **Modern UI**: Beautiful, responsive interface with gradient backgrounds
- ⌨️ **Keyboard Shortcuts**: Quick access with keyboard shortcuts
- 🖱️ **Drag & Drop**: Drop images directly onto the app
- 📱 **Responsive Design**: Works well on different screen sizes

## Supported Image Formats

- JPEG (.jpg, .jpeg)
- PNG (.png)
- GIF (.gif)
- BMP (.bmp)
- WebP (.webp)

## Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone <your-repo-url>
   cd image-crop-electron
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run the application**:
   ```bash
   npm start
   ```

## Development

- **Development mode** (with DevTools):
  ```bash
  npm run dev
  ```

- **Build for distribution**:
  ```bash
  npm run build
  ```

## Keyboard Shortcuts

- `Ctrl/Cmd + O`: Open image
- `Ctrl/Cmd + S`: Save cropped image
- `Enter`: Crop image
- `Escape`: Reset cropper

## Project Structure

```
image-crop-electron/
├── main.js                 # Main Electron process
├── package.json            # Project configuration
├── renderer/               # Renderer process files
│   ├── index.html         # Main HTML file
│   ├── styles.css         # Application styles
│   ├── renderer.js        # Main renderer logic
│   └── preload.js         # Secure IPC bridge
└── README.md              # This file
```

## Technologies Used

- **Electron**: Cross-platform desktop app framework
- **Cropper.js**: JavaScript image cropping library
- **HTML5 Canvas**: For image processing
- **Modern CSS**: Gradients, flexbox, and responsive design
- **ES6+ JavaScript**: Modern JavaScript features

## How to Use

1. **Launch the app** using `npm start`
2. **Select an image** by clicking "Select Image" or drag & drop
3. **Crop the image** by adjusting the crop area and clicking "Crop Image"
4. **Save the result** by clicking "Save Cropped Image"

## Security

This app follows Electron security best practices:
- Context isolation enabled
- Node integration disabled in renderer
- Secure IPC communication via preload script
- No remote module usage

## License

MIT License - feel free to use and modify as needed.

## Contributing

1. Fork the repository
2. Create your feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Troubleshooting

### Permission Issues
If you encounter permission issues during installation:
```bash
sudo npm install --unsafe-perm=true
```

### App Won't Start
Make sure all dependencies are installed:
```bash
npm install
```

### Images Not Loading
Ensure your images are in supported formats (JPEG, PNG, GIF, BMP, WebP).

## Future Enhancements

- [ ] Multiple crop aspect ratios
- [ ] Rotation and flip tools
- [ ] Batch image processing
- [ ] Filters and effects
- [ ] Cloud storage integration
- [ ] Undo/redo functionality