export function TotalScoreSummary({
  total,
  expected,
}: {
  total: number;
  expected: number;
}) {
  const matches = total === expected;
  return (
    <div
      className={`rubric-total ${matches ? 'rubric-total-valid' : 'rubric-total-warning'}`}
      role="status"
      aria-live="polite"
    >
      <div>
        <span>Puntaje total</span>
        <strong>{total} puntos</strong>
      </div>
      <p>
        {matches
          ? `La rúbrica suma ${expected} puntos y está lista para guardarse. Revisa los demás campos antes de publicar.`
          : `Actualmente la rúbrica suma ${total} puntos. La calificación del curso se expresa sobre ${expected}.`}
      </p>
    </div>
  );
}
