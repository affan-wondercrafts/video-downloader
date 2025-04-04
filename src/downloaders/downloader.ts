import axios from 'axios';
import * as cheerio from 'cheerio';
import youtubeDl from 'youtube-dl-exec';
import * as fs from 'fs-extra';
import * as path from 'path';
import { processVideo } from '../utils/ffmpeg-processor';
import { getSocialMediaType } from '../utils/url-parser';

export async function downloadVideo(
	url: string,
	format: string = 'mp4',
	quality: string = '720p',
): Promise<string> {
	// Identify the social media platform from the URL
	const platform = getSocialMediaType(url);

	// Create downloads directory if it doesn't exist
	const downloadsDir = path.join(process.cwd(), 'downloads');
	await fs.ensureDir(downloadsDir);

	// Generate a filename based on current timestamp
	const timestamp = new Date().getTime();
	const tempFilePath = path.join(downloadsDir, `temp_${timestamp}.mp4`);
	const outputFilePath = path.join(
		downloadsDir,
		`video_${timestamp}.${format}`,
	);

	try {
		// Download based on platform
		switch (platform) {
			case 'youtube':
				await downloadYouTubeVideo(url, tempFilePath);
				break;
			case 'tiktok':
				await downloadTikTokVideo(url, tempFilePath);
				break;
			case 'instagram':
				await downloadInstagramVideo(url, tempFilePath);
				break;
			default:
				throw new Error(`Unsupported platform: ${platform}`);
		}

		// Process the video to desired format and quality
		await processVideo(tempFilePath, outputFilePath, format, quality);

		// Clean up the temporary file
		await fs.remove(tempFilePath);

		return outputFilePath;
	} catch (error) {
		// Clean up on error
		if (await fs.pathExists(tempFilePath)) {
			await fs.remove(tempFilePath);
		}
		throw error;
	}
}

async function downloadYouTubeVideo(
	url: string,
	outputPath: string,
): Promise<void> {
	try {
		await youtubeDl(url, {
			output: outputPath,
			format: 'bestvideo[height<=720]+bestaudio/best[height<=720]',
			mergeOutputFormat: 'mp4',
			noCheckCertificates: true,
			noWarnings: true,
			preferFreeFormats: true,
			addHeader: [
				'referer:youtube.com',
				'user-agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
			],
		});
		return Promise.resolve();
	} catch (error) {
		console.error('YouTube download error:', error);
		return Promise.reject(new Error('Failed to download YouTube video'));
	}
}

async function downloadTikTokVideo(
	url: string,
	outputPath: string,
): Promise<void> {
	// This is a simplified example - TikTok would require more complex handling
	try {
		// First we would need to extract the actual video URL by parsing the page
		const response = await axios.get(url);
		const $ = cheerio.load(response.data);

		// This is a placeholder - actual extraction would be more complex
		// and would require finding the video URL in the page source
		const videoUrl = $('video source').attr('src');

		if (!videoUrl) {
			throw new Error('Could not find video URL on TikTok page');
		}

		// Download the video
		const videoResponse = await axios({
			method: 'GET',
			url: videoUrl,
			responseType: 'stream',
		});

		const writer = fs.createWriteStream(outputPath);
		videoResponse.data.pipe(writer);

		return new Promise((resolve, reject) => {
			writer.on('finish', resolve);
			writer.on('error', reject);
		});
	} catch (error) {
		console.error('TikTok download error:', error);
		throw new Error('Failed to download TikTok video');
	}
}

async function downloadInstagramVideo(
	url: string,
	outputPath: string,
): Promise<void> {
	// Similar to TikTok, this is a simplified example
	try {
		const response = await axios.get(url);
		const $ = cheerio.load(response.data);

		// This is a placeholder - actual extraction would need to handle Instagram's structure
		const videoUrl = $('meta[property="og:video"]').attr('content');

		if (!videoUrl) {
			throw new Error('Could not find video URL on Instagram page');
		}

		// Download the video
		const videoResponse = await axios({
			method: 'GET',
			url: videoUrl,
			responseType: 'stream',
		});

		const writer = fs.createWriteStream(outputPath);
		videoResponse.data.pipe(writer);

		return new Promise((resolve, reject) => {
			writer.on('finish', resolve);
			writer.on('error', reject);
		});
	} catch (error) {
		console.error('Instagram download error:', error);
		throw new Error('Failed to download Instagram video');
	}
}
