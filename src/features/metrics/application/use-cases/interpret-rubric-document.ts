/** Only import rows with explicit point values. Ambiguous text stays available for review. */
export function interpretRubricDocument(content: string) {
  return content
    .split(/\r?\n/)
    .flatMap((line) => {
      const columns = line.trim().split(/\t+/);
      const match =
        columns.length > 1
          ? /^(\d{1,2}(?:[.,]\d{1,2})?)(?:\s*(?:pts?\.?|puntos?))?$/i.exec(
              columns.at(-1) ?? '',
            )
          : /^(.+?)\s*[:–—-]\s*(\d{1,2}(?:[.,]\d{1,2})?)\s*(?:pts?\.?|puntos?)$/i.exec(
              line.trim(),
            );
      if (!match) return [];
      const description = (columns.length > 1 ? columns[0] : match[1])?.trim();
      const points = Number(
        (columns.length > 1 ? match[1] : match[2])?.replace(',', '.'),
      );
      if (
        !description ||
        /^(total|puntaje total|máximo)$/i.test(description) ||
        points <= 0 ||
        points > 20
      )
        return [];
      return [
        {
          description,
          objective: columns.slice(1, -1).join(' ').slice(0, 2000),
          points: String(points),
        },
      ];
    })
    .slice(0, 100);
}
