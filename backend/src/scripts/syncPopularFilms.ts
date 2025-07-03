import { fetchAndSavePopularFilms } from "../services/filmServices";
import { connectDB } from "../config/db";

async function main() {
  try {
    const args = process.argv.slice(2); // Los primeros dos son 'node' y la ruta del script
    const pages = args[0] ? Number(args[0]) : 5; // 5 es default si no pasás nada

    await connectDB();
    await fetchAndSavePopularFilms(pages);
    process.exit(0);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

main();
