import ffmpeg from 'fluent-ffmpeg';
import * as path from 'path';

export function processVideo(
  inputPath: string, 
  outputPath: string, 
  format: string = 'mp4', 
  quality: string = '720p'
): Promise<void> {
  return new Promise((resolve, reject) => {
    // Parse the quality setting
    const height = parseInt(quality.replace(/[^0-9]/g, ''), 10);
    
    // Configure FFmpeg
    let command = ffmpeg(inputPath);
    
    // Set quality/resolution
    if (!isNaN(height)) {
      command = command.size(`?x${height}`);
    }
    
    // Set format-specific options
    switch (format.toLowerCase()) {
      case 'mp4':
        command = command.format('mp4').videoCodec('libx264').audioCodec('aac');
        break;
      case 'webm':
        command = command.format('webm').videoCodec('libvpx').audioCodec('libvorbis');
        break;
      case 'mov':
        command = command.format('mov').videoCodec('libx264').audioCodec('aac');
        break;
      case 'gif':
        command = command.format('gif').noAudio();
        break;
      case 'mp3':
        command = command.format('mp3').noVideo().audioCodec('libmp3lame');
        break;
      default:
        // Default to mp4
        command = command.format('mp4').videoCodec('libx264').audioCodec('aac');
    }
    
    // Execute the FFmpeg command
    command
      .output(outputPath)
      .on('end', () => resolve())
      .on('error', (err) => reject(new Error(`FFmpeg error: ${err.message}`)))
      .run();
  });
}
