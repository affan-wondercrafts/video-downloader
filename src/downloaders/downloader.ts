import { spawn } from 'child_process';
import inquirer from 'inquirer';
import * as fs from 'fs-extra';
import * as path from 'path';
import ora from 'ora';

const TARGET_RESOLUTIONS = [2160, 1440, 1080, 720, 480, 360, 240, 144];

function formatSize(format: any) {
	const size = format.filesize || format.filesize_approx;
	return size ? `${(size / 1024 / 1024).toFixed(2)} MB` : 'Size N/A';
}

export async function downloadVideo(url: string): Promise<void> {
	if (url.includes('tiktok.com')) {
		url = url.split('?')[0];
	}
	const downloadsDir = path.join(process.cwd(), 'downloads');
	await fs.ensureDir(downloadsDir);

	// Spinner and timer
	const spinner = ora('🔍 Fetching video formats...').start();
	const startTime = Date.now();

	let formatsJson: string;

	try {
		formatsJson = await new Promise<string>((resolve, reject) => {
			const proc = spawn('yt-dlp', ['-J', url]);

			let data = '';
			proc.stdout.on('data', (chunk) => (data += chunk.toString()));
			proc.stderr.on('data', (err) => console.error(err.toString()));
			proc.on('close', (code) => {
				if (code === 0) resolve(data);
				else reject('❌ Failed to fetch formats');
			});
		});
	} catch (err) {
		spinner.fail(err as string);
		return;
	}

	const endTime = Date.now();
	const seconds = ((endTime - startTime) / 1000).toFixed(2);
	spinner.succeed(`✅ Formats fetched in ${seconds}s`);

	const info = JSON.parse(formatsJson);
	// console.log('Video Info:=================>>>>>', info);
	const videoTitle = info.title.replace(/[\/\\:*?"<>|]/g, '');

	// Popular video formats
	const videoFormatMap: { [height: number]: any } = {};

	for (const res of TARGET_RESOLUTIONS) {
		const preferred = info.formats
			.filter((f: any) => f.filesize && f.ext && f.format_id)
			.find(
				(f: any) =>
					f.height === res &&
					(f.ext === 'mp4' || f.ext === 'webm') &&
					f.vcodec !== 'none',
			);

		const fallback = info.formats
			.filter((f: any) => f.filesize && f.ext && f.format_id)
			.find((f: any) => f.vcodec !== 'none');

		if (preferred) {
			videoFormatMap[res] = preferred;
		} else if (fallback) {
			videoFormatMap[fallback.height] = fallback;
		}
	}

	const videoChoices = Object.values(videoFormatMap).map((f: any) => ({
		name: `📹 ${f.height}p | ${f.ext} | ${formatSize(f)}`,
		value: f.format_id,
	}));

	const audioFormats = info.formats.filter(
		(f: any) => f.vcodec === 'none' && f.acodec !== 'none',
	);

	const audioChoices = audioFormats.map((f: any) => ({
		name: `🎵 Audio | ${f.ext} | ${f.abr || f.asr || 'N/A'} kbps | ${formatSize(
			f,
		)}`,
		value: f.format_id,
	}));

	const choices = [
		new inquirer.Separator('=== Video Formats ==='),
		...videoChoices,
		new inquirer.Separator('=== Audio Formats ==='),
		...audioChoices,
	];

	const { selectedFormat } = await inquirer.prompt([
		{
			type: 'list',
			name: 'selectedFormat',
			message: 'Select format to download:',
			choices,
		},
	]);

	const outputPath = path.join(
		downloadsDir,
		`${videoTitle} - %(format_id)s.%(ext)s`,
	);
	console.log('\n⏬ Starting download...\n');

	let args: string[];
	if (url.includes('tiktok.com')) {
		args = ['-f', selectedFormat, '-o', outputPath, '--newline', url];
	} else {
		args = [
			'-f',
			`${selectedFormat}+bestaudio[ext=m4a]/bestaudio`,
			'-o',
			outputPath,
			'--merge-output-format',
			'mp4',
			'--newline',
			url,
		];
	}

	const proc = spawn('yt-dlp', args);

	proc.stdout.on('data', (data) => {
		const line = data.toString();
		const match = line.match(
			/\[download\]\s+(\d+\.\d+)%\s+of\s+([\d.]+\w+)\s+at\s+([\d.]+\w+\/s)\s+ETA\s+(\d+:\d+)/,
		);
		if (match) {
			const [, percent, totalSize, speed, eta] = match;
			process.stdout.clearLine(0);
			process.stdout.cursorTo(0);
			process.stdout.write(
				`📥 ${percent}% of ${totalSize} at ${speed} | ETA: ${eta}`,
			);
		} else if (line.includes('Destination:')) {
			console.log('\n🎯 ' + line.trim());
		}
	});

	proc.stderr.on('data', (data) => {
		console.error(data.toString());
	});

	await new Promise((resolve, reject) => {
		proc.on('close', (code) => {
			if (code === 0) {
				console.log('\n✅ Download completed!\n');
				resolve(null);
			} else {
				reject('Download failed.');
			}
		});
	});
}
