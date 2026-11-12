import { useState } from 'react';
import type { LoginProfile } from '@/shared/services/auth/auth-session.service';
import { useAuth } from '@/shared/services/auth/auth-context';
import { Button } from '@/shared/components/ui/button';

export function CompleteProfileForm() {
  const { completeProfile, loading } = useAuth();
  const [profile, setProfile] = useState<LoginProfile>('student');
  return (
    <form
      className="mb-6 rounded-lg border border-border p-4"
      aria-label="Completar perfil académico"
      onSubmit={(event) => {
        event.preventDefault();
        if (completeProfile && !loading) void completeProfile(profile);
      }}
    >
      <fieldset disabled={loading}>
        <legend className="text-sm font-semibold">
          ¿Eres docente o estudiante?
        </legend>
        <div className="my-4 flex flex-wrap gap-5">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="academic-profile"
              value="student"
              checked={profile === 'student'}
              onChange={() => setProfile('student')}
            />
            Estudiante
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="academic-profile"
              value="teacher"
              checked={profile === 'teacher'}
              onChange={() => setProfile('teacher')}
            />
            Docente
          </label>
        </div>
        <Button type="submit" disabled={!completeProfile || loading}>
          Guardar perfil y continuar
        </Button>
      </fieldset>
    </form>
  );
}
