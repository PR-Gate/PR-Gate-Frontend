# users / domain

Contiene el modelo de identidad `User` y los modelos de lectura `StudentCourse`, `CourseStudent`, `StudentRoster` y `StudentContribution`. `StudentRepository` define el puerto para consultar listado y contribución por curso.

No depende de React, Axios, MSW ni otras capas. Los estados y la participación son datos recibidos del servicio; no hay reglas de calificación académica en este dominio frontend.

Los endpoints se adaptarán en Infrastructure cuando exista el backend. El modelo de lectura y el puerto se conservarán mientras el contrato funcional lo permita.
