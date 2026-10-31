import { useRef, useState } from 'react';
import { Dialog } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import type { RubricDraft } from '../../domain/rubric';
import { useRubricActions } from '../hooks/use-rubrics';
import { validateRubricFile } from '../file-validation';
export function RubricUploadModal({
  onClose,
  onPreview,
}: {
  onClose(): void;
  onPreview(draft: RubricDraft): void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<RubricDraft | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const action = useRubricActions().importPreview;
  const select = (value?: File) => {
    if (action.isPending) return;
    setPreview(null);
    setFile(null);
    if (!value) return;
    const issue = validateRubricFile(value);
    setError(issue ?? '');
    if (!issue) setFile(value);
    if (input.current) input.current.value = '';
  };
  const upload = async () => {
    if (!file) return;
    setError('');
    try {
      setPreview(
        await action.mutateAsync({
          name: file.name,
          size: file.size,
          type: file.type,
        }),
      );
    } catch {
      setError('No se pudo simular la carga. Inténtalo nuevamente.');
    }
  };
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !action.isPending) onClose();
      }}
      title="Subir rúbrica"
      description="PDF, Word o Excel — máximo 10 MB"
    >
      <div
        className="rubric-upload"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          select(event.dataTransfer.files[0]);
        }}
      >
        <label htmlFor="rubric-file">Selecciona o arrastra un archivo</label>
        <input
          id="rubric-file"
          ref={input}
          type="file"
          accept=".pdf,.doc,.docx,.xls,.xlsx"
          disabled={action.isPending}
          onChange={(event) => select(event.target.files?.[0])}
        />
      </div>
      {file && (
        <div className="rubric-file-info">
          <strong>{file.name}</strong>
          <p>
            {(file.size / 1024).toLocaleString('es-PE', {
              maximumFractionDigits: 1,
            })}{' '}
            KB · {file.type || file.name.split('.').pop()?.toUpperCase()}
          </p>
          <p role="status">
            {action.isPending
              ? 'Simulando carga…'
              : preview
                ? 'Carga simulada completada'
                : 'Archivo seleccionado'}
          </p>
          <Button
            variant="outline"
            size="sm"
            disabled={action.isPending}
            onClick={() => {
              setFile(null);
              setPreview(null);
              setError('');
            }}
          >
            Eliminar archivo
          </Button>
        </div>
      )}
      <p className="rubric-notice">
        Después de subir el archivo, revisa los criterios y sus puntajes antes
        de guardar. No se lee el contenido ni se extraen datos: recibirás
        criterios de ejemplo.
      </p>
      {error && (
        <p role="alert" className="rubric-error">
          {error}
        </p>
      )}
      <div className="rubric-actions">
        <Button variant="outline" disabled={action.isPending} onClick={onClose}>
          Cancelar
        </Button>
        {preview ? (
          <Button onClick={() => onPreview(preview)}>
            Revisar criterios simulados
          </Button>
        ) : (
          <Button
            disabled={!file || action.isPending}
            onClick={() => {
              void upload();
            }}
          >
            {action.isPending ? 'Simulando carga…' : 'Simular carga'}
          </Button>
        )}
      </div>
    </Dialog>
  );
}
