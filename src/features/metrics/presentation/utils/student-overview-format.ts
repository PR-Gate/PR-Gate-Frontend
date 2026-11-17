const numberFormat = new Intl.NumberFormat('es-PE', {
  maximumFractionDigits: 2,
});

export function formatStudentValue(value: number | null | undefined) {
  return value == null ? '—' : numberFormat.format(value);
}
