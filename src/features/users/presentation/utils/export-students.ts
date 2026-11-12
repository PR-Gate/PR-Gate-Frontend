import type {
  CourseStudent,
  StudentCourse,
} from '../../domain/entities/student.entity';
const statusLabels = {
  up_to_date: 'Al día',
  review: 'Revisar',
  support: 'Requiere acompañamiento',
};
function cell(value: string | number) {
  const text = String(value);
  return `"${(/^[\s]*[=+@-]|^[\t\r\n]/.test(text) ? `'${text}` : text).replaceAll('"', '""')}"`;
}
export function serializeStudentsCsv(
  course: StudentCourse,
  students: readonly CourseStudent[],
): string {
  const rows: (string | number)[][] = [
    ['PR Gate · DEMOSTRACIÓN · Datos simulados'],
    ['Curso', course.name, 'Sección', course.section, 'Ciclo', course.term],
    ['La participación es una señal orientativa y no una calificación.'],
    [
      'Estudiante',
      'Correo',
      'Equipo',
      'Proyecto',
      'Participación (%)',
      'Commits',
      'Estado',
    ],
    ...students.map((student) => [
      student.name,
      student.email,
      student.team,
      student.projectName,
      student.participation,
      student.commits,
      statusLabels[student.status],
    ]),
  ];
  return '\uFEFF' + rows.map((row) => row.map(cell).join(',')).join('\r\n');
}
export function downloadStudentsCsv(
  course: StudentCourse,
  students: readonly CourseStudent[],
) {
  const url = URL.createObjectURL(
    new Blob([serializeStudentsCsv(course, students)], {
      type: 'text/csv;charset=utf-8',
    }),
  );
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `estudiantes-demo-${course.id}.csv`;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
