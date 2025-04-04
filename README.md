# Video Downloader

A Node.js application built with TypeScript that can download videos from various social media platforms in different formats and resolutions using FFmpeg.

## Prerequisites

- Node.js (>=14.x)
- Yarn (>=2.x)
- FFmpeg installed on your system

## Installation

1. Clone this repository
2. Install dependencies:
   ```
   yarn install
   ```

## Usage

### Build the project:
```
yarn build
```

### Run the downloader:
```
yarn start <social-media-url> [format] [quality]
```

Example:
```
yarn start https://www.youtube.com/watch?v=dQw4w9WgXcQ mp4 720p
```

### Supported platforms:
- YouTube
- TikTok
- Instagram
- Twitter/X (partial support)
- Facebook (partial support)

### Supported formats:
- mp4
- webm
- mov
- gif
- mp3 (audio only)

### Supported qualities:
- 240p
- 360p
- 480p
- 720p
- 1080p
- 2160p (4K)

## Development

Run in development mode:
```
yarn dev <social-media-url> [format] [quality]
```

## Notes

- This is a basic implementation and may require updates as social media platforms change their structures.
- Some platforms may have anti-scraping measures that could prevent downloads.
- Always respect copyright and terms of service when downloading content.
