const fs = require("fs");

const core = JSON.parse(fs.readFileSync("core.json", "utf-8"));
const mono = JSON.parse(fs.readFileSync("mono.json", "utf-8"));
const harmony = JSON.parse(fs.readFileSync("harmony.json", "utf-8"));

function mapAssets(assets) {
	return assets.map(a => ({
		name: a.name,
		size: a.size,
		url: a.browser_download_url
	}));
}

function simplifyRelease(r) {
	return {
		version: r.tag_name,
		name: r.name,
		published_at: r.published_at,
		prerelease: r.prerelease,
		assets: mapAssets(r.assets)
	};
}

function extractMonoByAbi(release) {
	const result = {
		arm64: null,
		armv7: null
	};

	for (const asset of release.assets) {
		const name = asset.name.toLowerCase();

		if (name.includes("arm64")) {
			result.arm64 = asset.browser_download_url;
		}
		if (name.includes("armeabi") || name.includes("armv7")) {
			result.armv7 = asset.browser_download_url;
		}
	}

	return result;
}

const latestCore = core[0];
const latestMono = mono[0];
const latestHarmony = harmony[0];

const index = {
	generated_at: new Date().toISOString(),

	core: {
		latest: simplifyRelease(latestCore),
		all: core.slice(0, 5).map(simplifyRelease) // last 5 versions
	},

	nativemono: {
		latest: {
			...simplifyRelease(latestMono),
			abi: extractMonoByAbi(latestMono)
		},
		all: mono.slice(0, 5).map(r => ({
			...simplifyRelease(r),
			abi: extractMonoByAbi(r)
		}))
	},

	harmonymodule: {
		latest: simplifyRelease(latestHarmony),
		all: harmony.slice(0, 5).map(simplifyRelease)
	}
};

fs.writeFileSync("index.json", JSON.stringify(index, null, 2));
