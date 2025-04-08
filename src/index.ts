import { downloadVideo } from './downloaders/downloader.js';

async function main() {
	const url = process.argv[2];

	if (!url) {
		console.error('❗ Please provide a video URL.');
		process.exit(1);
	}

	try {
		await downloadVideo(url);
	} catch (error) {
		console.error('❌ Error:', error);
	}
}

main();
