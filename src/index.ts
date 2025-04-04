import { downloadVideo } from './downloaders/downloader';

// Example usage
async function main() {
  const url = process.argv[2];
  const format = process.argv[3] || 'mp4';
  const quality = process.argv[4] || '720p';
  
  if (!url) {
    console.error('Please provide a social media URL as an argument');
    process.exit(1);
  }

  try {
    console.log(`Downloading video from: ${url}`);
    console.log(`Format: ${format}, Quality: ${quality}`);
    
    const outputPath = await downloadVideo(url, format, quality);
    console.log(`Video downloaded successfully: ${outputPath}`);
  } catch (error) {
    console.error('Error downloading video:', error);
  }
}

main();
