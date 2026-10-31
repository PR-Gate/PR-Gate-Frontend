import type { StudentRubric } from '../../domain/rubric';
export function StudentRubricSummary({ student }: { student: StudentRubric }) {
  return (
    <section className="rubric-student-summary">
      <div>
        <p className="eyebrow">{student.courseName}</p>
        <h2>{student.rubric.name}</h2>
        <p>
          Proyecto: {student.projectName} · Versión {student.rubric.version}
        </p>
        <span className="rubric-badge rubric-review-status">
          {student.reviewStatus}
        </span>
      </div>
      <div>
        <p>Resultado actual</p>
        <strong>
          {student.score} / {student.maxScore}
        </strong>
        <p>Puntos · resultado preliminar</p>
      </div>
    </section>
  );
}
