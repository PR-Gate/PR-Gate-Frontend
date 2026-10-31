import { useState } from 'react';
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from '@/shared/components/feedback/async-state';
import { useStudentRubric } from '../hooks/use-rubrics';
import { StudentRubricSummary } from '../components/student-rubric-summary';
import { StudentCriterionList } from '../components/student-criterion-list';
import { StudentCriterionDetail } from '../components/student-criterion-detail';
import '../styles/rubrics.css';
export default function StudentRubricPage() {
  const query = useStudentRubric();
  const [selected, setSelected] = useState('coverage');
  if (query.isPending) return <LoadingState />;
  if (query.isError)
    return (
      <ErrorState
        error={query.error}
        retry={() => {
          void query.refetch();
        }}
      />
    );
  const student = query.data;
  return (
    <section className="rubrics-page">
      <div className="rubric-heading">
        <div>
          <p className="eyebrow">TU APRENDIZAJE</p>
          <h1>Mi rúbrica</h1>
          <p>
            Conoce qué evalúa tu docente, cuánto vale cada criterio y cómo se
            calculó tu resultado.
          </p>
        </div>
      </div>
      <p className="rubric-demo">
        Demostración · Los resultados y evidencias son ejemplos preparados; no
        se evalúan métricas en React.
      </p>
      {!student ? (
        <EmptyState
          title="Todavía no tienes una rúbrica asignada"
          description="Tu docente la compartirá cuando esté disponible."
        />
      ) : (
        <>
          <StudentRubricSummary student={student} />
          <p className="rubric-explanation">
            Tu nota relaciona {student.rubric.criteria.length} criterios.
            Selecciona uno para conocer su puntaje, la evidencia utilizada y qué
            puedes mejorar.
          </p>
          <p className="rubric-notice">
            Cada puntaje se relaciona con una regla y evidencia concreta. El
            resultado final siempre es revisado por tu docente.
          </p>
          <div className="rubric-student-layout">
            <StudentCriterionList
              student={student}
              selected={selected}
              onSelect={setSelected}
            />
            {(() => {
              const criterion =
                student.rubric.criteria.find(
                  (criterion) => criterion.id === selected,
                ) ?? student.rubric.criteria[0];
              return criterion ? (
                <StudentCriterionDetail
                  key={criterion.id}
                  criterion={criterion}
                  result={student.results.find(
                    (result) => result.criterionId === criterion.id,
                  )}
                />
              ) : null;
            })()}
          </div>
        </>
      )}
    </section>
  );
}
