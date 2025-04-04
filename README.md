# HEIC Converter

A web-based application that converts HEIC images (commonly used by Apple devices) to JPG format directly in your browser. No server-side processing is required, making it privacy-friendly and efficient.

![HEIC Converter](https://raw.githubusercontent.com/martinmysterion/heic-converter/main/screenshot.png)

## Features

- **Client-side Conversion**: All processing happens in your browser
- **Batch Processing**: Convert multiple HEIC files at once
- **Customizable Output**: Adjust quality and resize images
- **Drag & Drop Interface**: Easy-to-use interface for uploading files
- **Download Options**: Download individual images or all at once
- **Progress Tracking**: Monitor conversion progress in real-time

## Usage

1. **Upload HEIC Files**: Drag and drop your HEIC files onto the interface or click "Select Files"
2. **Adjust Settings** (optional): Click the gear icon to adjust quality and resize options
3. **Wait for Conversion**: The app will convert your files and display progress
4. **Download**: Download individual files or all converted images at once

## Conversion Settings

- **Quality**: Adjust the JPEG quality (1-100%)
- **Maximum Width**: Resize images to a maximum width while maintaining aspect ratio
  - Original Size (no resizing)
  - 4K (3840px)
  - Full HD (1920px)
  - HD (1280px)
  - Web Optimized (800px)

## Running Locally

### Using Docker (Recommended)

The easiest way to run HEIC Converter is using Docker:

```bash
# Latest version
docker run -d -p 8080:80 martinmysterion/heic-converter:latest

# Node.js 22 version
docker run -d -p 8080:80 martinmysterion/heic-converter:node22
```

Then open your browser and navigate to http://localhost:8080

### Using Docker Compose

1. Create a `docker-compose.yml` file with the following content:

```yaml
services:
  heic-converter:
    image: martinmysterion/heic-converter:latest
    ports:
      - "8080:80"
    restart: unless-stopped
```

2. Run the following command:

```bash
docker compose up -d
```

3. Open your browser and navigate to http://localhost:8080

### Development Setup

If you want to run the application for development:

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Open your browser and navigate to http://localhost:5173

## Building from Source

To build the application from source:

```bash
# Install dependencies
npm install

# Build the application
npm run build

# Preview the production build
npm run preview
```

## Technical Details

- Built with React and Vite
- Uses heic2any library for HEIC conversion
- Styled with TailwindCSS
- UI components built with Radix UI primitives
- Containerized with Docker
- Supports Node.js 22

## Privacy

All image processing happens entirely in your browser. Your images are never uploaded to any server, ensuring complete privacy.

## License

ISC License

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
