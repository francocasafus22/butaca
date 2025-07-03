import { updateAllFilmsPopularity } from "../services/filmServices";
import { connectDB } from "../config/db";
import { disconnect } from "mongoose";

async function main() {
  try {
    await connectDB();
    await updateAllFilmsPopularity();
    console.log("Sincronización con exito.");
    await disconnect(); // Cierra la conexión
    process.exit(0);
  } catch (error) {
    console.error("Error durante sincronización:", error.message);
    process.exit(1);
  }
}

main();
