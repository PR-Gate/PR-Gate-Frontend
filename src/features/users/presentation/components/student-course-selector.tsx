import { BookOpen, Check } from 'lucide-react';
import type { StudentCourse } from '../../domain/entities/student.entity';
export function StudentCourseSelector({
  courses,
  selected,
  busy,
  onChange,
}: {
  courses: readonly StudentCourse[];
  selected: StudentCourse;
  busy: boolean;
  onChange(id: string): void;
}) {
  return (
    <div className="student-course-picker">
      <div className="student-selected-course">
        <p>CURSO SELECCIONADO</p>
        <h2>{selected.name}</h2>
        <span>
          {selected.term} · Sección {selected.section}
        </span>
      </div>
      <fieldset disabled={busy}>
        <legend className="sr-only">Seleccionar curso</legend>
        <div className="student-course-options">
          {courses.map((course) => (
            <label key={course.id}>
              <input
                type="radio"
                name="student-course"
                aria-label={course.name}
                value={course.id}
                checked={course.id === selected.id}
                onChange={() => onChange(course.id)}
                className="peer sr-only"
              />
              <span className="peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary">
                <BookOpen size={17} aria-hidden="true" />
                <span>
                  <strong>{course.name}</strong>
                  <small>
                    {course.studentCount} estudiantes · Sección {course.section}
                  </small>
                </span>
                {course.id === selected.id && (
                  <Check size={14} aria-hidden="true" />
                )}
              </span>
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  );
}
