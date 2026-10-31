import type { StudentRubric } from '../../domain/rubric';
export function StudentCriterionList({
  student,
  selected,
  onSelect,
}: {
  student: StudentRubric;
  selected: string;
  onSelect(id: string): void;
}) {
  return (
    <div className="rubric-student-criteria">
      <h2>Criterios de tu rúbrica</h2>
      {student.rubric.criteria.map((criterion) => {
        const result = student.results.find(
          (result) => result.criterionId === criterion.id,
        );
        return (
          <button
            key={criterion.id}
            className="rubric-student-criterion"
            aria-pressed={selected === criterion.id}
            onClick={() => onSelect(criterion.id)}
          >
            <strong>{criterion.name}</strong>
            <p>{criterion.description}</p>
            <span>
              {result
                ? `${result.score} de ${result.maxScore} puntos`
                : 'Resultado pendiente'}
            </span>
            {result && (
              <>
                <progress
                  max={100}
                  value={result.percentage}
                  aria-label={`Cumplimiento de ${criterion.name}`}
                />
                <small>{result.percentage}% de cumplimiento del puntaje</small>
              </>
            )}
          </button>
        );
      })}
    </div>
  );
}
