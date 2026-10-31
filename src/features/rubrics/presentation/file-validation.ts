export function validateRubricFile(
  file: Pick<File, 'name' | 'size'>,
): string | null {
  if (!/\.(pdf|doc|docx|xls|xlsx)$/i.test(file.name))
    return 'Selecciona un archivo PDF, Word o Excel.';
  if (file.size <= 0 || file.size > 10 * 1024 * 1024)
    return 'El archivo debe tener contenido y no superar 10 MB.';
  return null;
}
