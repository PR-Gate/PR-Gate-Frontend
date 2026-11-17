import {
  ClipboardCheck,
  FileUp,
  Info,
  Plus,
  Search,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import '../styles/teacher-rubrics.css';

export function TeacherRubricsPage() {
  return (
    <section
      className="teacher-rubrics"
      aria-labelledby="teacher-rubrics-heading"
    >
      <header className="teacher-rubrics-heading">
        <div>
          <p className="eyebrow">EVALUACIÓN ACADÉMICA</p>
          <h1 className="page-title" id="teacher-rubrics-heading">
            Rúbricas
          </h1>
          <p>
            Crea una rúbrica desde cero o sube una que ya utiliza tu
            institución.
          </p>
        </div>
        <div className="teacher-rubrics-actions">
          <Button
            variant="outline"
            disabled
            aria-describedby="rubric-upload-help"
          >
            <FileUp size={16} aria-hidden="true" />
            Subir rúbrica
          </Button>
          <Button disabled aria-describedby="rubric-create-help">
            <Plus size={16} aria-hidden="true" />
            Crear rúbrica
          </Button>
        </div>
      </header>
      <div className="teacher-rubrics-options">
        <section
          className="teacher-rubrics-panel teacher-rubrics-option"
          aria-labelledby="rubric-create-heading"
        >
          <span className="teacher-rubrics-icon">
            <Plus size={22} aria-hidden="true" />
          </span>
          <div>
            <h2 id="rubric-create-heading">Crear una rúbrica</h2>
            <p>Define cada criterio, su descripción y cuántos puntos vale.</p>
            <p id="rubric-create-help">
              La creación se habilitará al integrar la gestión de rúbricas.
            </p>
          </div>
          <Button disabled aria-describedby="rubric-create-help">
            Empezar desde cero
          </Button>
        </section>
        <section
          className="teacher-rubrics-panel teacher-rubrics-option"
          aria-labelledby="rubric-upload-heading"
        >
          <span className="teacher-rubrics-icon teacher-rubrics-icon-muted">
            <FileUp size={22} aria-hidden="true" />
          </span>
          <div>
            <h2 id="rubric-upload-heading">Subir una rúbrica</h2>
            <p>
              Importa una rúbrica institucional para utilizarla en tus cursos.
            </p>
            <p id="rubric-upload-help">
              La carga y los formatos admitidos se habilitarán con el servicio.
            </p>
          </div>
          <Button
            variant="outline"
            disabled
            aria-describedby="rubric-upload-help"
          >
            Seleccionar archivo
          </Button>
        </section>
      </div>
      <section aria-labelledby="rubric-library-heading">
        <header className="teacher-rubrics-library-heading">
          <div>
            <h2 id="rubric-library-heading">Mis rúbricas</h2>
            <p>Rúbricas creadas o importadas para tus cursos.</p>
          </div>
          <div className="teacher-rubrics-search">
            <label htmlFor="teacher-rubric-search">
              <Search size={16} aria-hidden="true" />
              <span className="sr-only">Buscar rúbrica</span>
              <input
                id="teacher-rubric-search"
                type="search"
                placeholder="Buscar rúbrica"
                disabled
                aria-describedby="rubric-search-help"
              />
            </label>
            <p id="rubric-search-help">
              Disponible cuando se cargue tu biblioteca.
            </p>
          </div>
        </header>
        <div className="teacher-rubrics-panel teacher-rubrics-empty">
          <span className="teacher-rubrics-icon">
            <ClipboardCheck size={30} aria-hidden="true" />
          </span>
          <h3>Tus rúbricas aparecerán aquí</h3>
          <p>
            Podrás consultar el curso, los criterios, el puntaje total y el
            estado de publicación de cada rúbrica cuando se conecte el servicio.
          </p>
          <span className="teacher-rubrics-badge">Información pendiente</span>
        </div>
      </section>
      <aside className="teacher-rubrics-guidance">
        <span className="teacher-rubrics-icon">
          <ShieldCheck size={22} aria-hidden="true" />
        </span>
        <div>
          <h2>El docente mantiene el control de la evaluación</h2>
          <p>
            Las reglas técnicas aportan evidencia para revisar los criterios y
            acompañar el aprendizaje.
          </p>
        </div>
      </aside>
      <p className="teacher-rubrics-notice">
        <Info size={15} aria-hidden="true" />
        La biblioteca estará disponible cuando se integre el servicio de
        rúbricas.
      </p>
    </section>
  );
}
