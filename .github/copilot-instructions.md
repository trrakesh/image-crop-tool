# Image Crop Electron App - Copilot Instructions

This is an Electron desktop application for selecting and cropping images.

## Project Structure
- `main.js` - Main Electron process
- `renderer/` - Renderer process files (HTML, CSS, JS)
- `package.json` - Project dependencies and scripts

## Technologies Used
- Electron - Desktop app framework
- HTML/CSS/JavaScript - User interface
- Cropper.js - Image cropping functionality

## Key Features
- Browse and select images from file system
- Display selected images
- Interactive image cropping with preview
- Save cropped images

## Development Guidelines
- Keep main process lightweight
- Use IPC for file operations
- Follow Electron security best practices
- Use modern JavaScript features