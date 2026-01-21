import { API_URL } from "../config/api";

/**
 * Parsea el path de una imagen para devolver una URL válida.
 * - Si es una URL completa (http/https), la devuelve tal cual (Ej: Cloudinary).
 * - Si es un path relativo, le antepone la API_URL (Ej: uploads local).
 * @param {string} path - Ruta de la imagen guardada en BD
 * @returns {string|null} - URL completa para usar en src=""
 */
export const getImageUrl = (path) => {
  if (!path) return null;

  // Si ya es una URL absoluta (Cloudinary o externa), devolverla
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  // Si es local, asegurar que no tenga slash inicial doble si API_URL termina en slash (aunque no suele)
  // Asumimos path viene "uploads/..."
  return `${API_URL}/${path}`;
};
