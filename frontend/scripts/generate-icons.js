const path = require("path");
const sharp = require("sharp");

const SRC = path.join(__dirname, "..", "assets", "Logo.png");
const RES = path.join(__dirname, "..", "android", "app", "src", "main", "res");

const SIZES = {
  mdpi: 48,
  hdpi: 72,
  xhdpi: 96,
  "xxhdpi": 144,
  "xxxhdpi": 192,
};

async function run() {
  for (const [density, size] of Object.entries(SIZES)) {
    const outDir = path.join(RES, `mipmap-${density}`);

    await sharp(SRC)
      .resize(size, size)
      .png()
      .toFile(path.join(outDir, "ic_launcher.png"));

    const circleMask = Buffer.from(
      `<svg width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="#fff"/></svg>`
    );
    await sharp(SRC)
      .resize(size, size)
      .composite([{ input: circleMask, blend: "dest-in" }])
      .png()
      .toFile(path.join(outDir, "ic_launcher_round.png"));

    console.log(`Generated ${density} (${size}x${size})`);
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
