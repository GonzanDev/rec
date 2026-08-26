# Features nuevas para Musicboxd — plan pre-defensa

## Context

El equipo tiene la defensa de tesis **en menos de una semana** y quiere agregar funcionalidad al proyecto. La restricción real no es la capacidad técnica sino el riesgo: a días de la presentación, cualquier cambio que rompa el flujo de la demo cuesta más de lo que suma.

La revisión del código encontró algo que cambia el enfoque: **hay bastante funcionalidad ya escrita en los servicios que nunca recibió interfaz**. Varias "features nuevas" están en realidad hechas al 70–80 %, lo que las vuelve baratas y de bajo riesgo.

Prioridades elegidas por el usuario: tapar huecos funcionales, features visibles en la demo, y completar lo ya escrito.

### Hallazgos que fundamentan el plan

| Hallazgo | Dónde | Consecuencia |
|---|---|---|
| `updateReview()` y `deleteReview()` existen y no se usan en ningún componente | `services/review.service.ts:63,68` | Una reseña publicada no se puede editar ni borrar |
| `addFavoriteReview()` / `removeFavoriteReview()` escriben `users.favoriteReviews[]`, sin uso en templates | `services/review.service.ts:73,80` | Función completa sin botón |
| `getPendingReports()` / `updateReportStatus()` sin ruta ni componente | `services/report.service.ts:82,88` | El sistema de reportes escribe pero nadie lee |
| `LibraryPageComponent` renderiza `<app-album-list layout="wrap">` **sin inputs**, y `detectRoute()` no contempla esas rutas | `pages/library-page/library-page.component.ts:18` y `components/album-list/album-list.component.ts:42` | **Los 4 links de biblioteca llevan a una página siempre vacía** |
| La página de álbum renderiza reseñas con markup propio en vez de `<app-review>` | `components/album/album.component.html:105` | Hay dos tarjetas de reseña paralelas; lo que se agregue a una no aparece en la otra |

---

## Antes que cualquier feature: dos correcciones

Si el tiempo alcanza para poco, **esto rinde más que agregar nada**, porque son respuestas a preguntas que el tribunal casi seguro hace:
pull

---

## Recomendación: tres features de riesgo bajo, una opcional

Ordenadas por impacto sobre riesgo. **La línea de corte está después de F3**: F1–F3 son aditivas y aisladas (~4–5 h en total). F4 toca el flujo central de la demo y solo conviene si hay una tarde entera disponible.

### F1 · Hacer que "Tu Biblioteca" funcione
**Por qué**: hay cuatro links en la navegación lateral que llevan a una página vacía. Es de lo primero que se clickea en una demo y hoy no muestra nada.
**Riesgo**: mínimo — `LibraryPageComponent` está aislada, nada depende de ella.

- Convertir `pages/library-page/library-page.component.ts` en un componente con lógica: inyectar `AuthStateService`, `UserService` y `SpotifyService`.
- En `ngOnInit`, resolver el uid con `authState$.pipe(filter(a => !!a), take(1))` y el perfil con `getUserProfile(uid).pipe(take(1))`.
- **Reusar el patrón exacto de `getFavoriteAlbumsDetails()`** en `components/profile/profile.component.ts:126`: `forkJoin` sobre los IDs con `catchError(() => of(null))` y filtrado de nulos.
- Mapear ruta → contenido:
  - `/saved` → `user.favoriteAlbums` → `<app-album-list layout="wrap" [albums]="albums">`
  - `/following` → `user.favoriteArtists` → `<app-artist-list [artists]="artists">`
- `/favorites` (canciones) y `/playlists` **no tienen datos en el modelo**. Recomendación: **quitar esos dos links** de `app.component.html:18,27` y sus rutas de `app.routes.ts`. Menos superficie y cero links rotos, en vez de dos pantallas de "Próximamente".
- Guardar las suscripciones y cancelarlas en `ngOnDestroy` — no repetir el leak ya detectado.

### F2 · Estadísticas en el perfil
**Por qué**: muy visible en la demo, cálculo puro en el cliente, cero infraestructura nueva. Y es un caso claro de `reduce` y `filter` que sirve para explicar en el oral.
**Riesgo**: mínimo — aditivo, no toca nada existente.

- En `components/profile/profile.component.ts`, nuevo método `loadStats()` llamado tras cargar el perfil. `reviewService` **ya está inyectado** (línea 27) y `getReviewsByUser()` ya se usa en `compareProfiles()`.
- Calcular sobre el array de reseñas: total, promedio de puntuación que da el usuario, distribución de 1 a 5 estrellas (array de cinco contadores), y su álbum mejor puntuado.
- En el HTML, barras de distribución con `[style.width.%]`. Los contadores de seguidores ya están en `profile.component.html:13,17` — el bloque de estadísticas va al lado.

### F3 · Ordenar el feed por "Más gustadas"
**Por qué**: explota `likes[]`, que hoy se escribe pero nunca se usa para nada. Es ordenar un array en memoria.
**Riesgo**: mínimo.

- `@Input() sort: 'recent' | 'popular' = 'recent'` en `components/review-feed/review-feed.component.ts`.
- En el `subscribe` de `loadReviews()` (línea 124), donde ya se ordena por `timestamp`, agregar la rama `(b.likes?.length || 0) - (a.likes?.length || 0)`.
- `ngOnChanges` ya existe (línea 61) y reacciona a `mode`; sumar `sort` a esa condición.
- Botones en `pages/home-page/home-page.component.html`, junto a los de "Todas / Siguiendo" que ya usan `setMode()`.

---

### F4 · Editar y borrar tu propia reseña *(opcional — riesgo medio)*
**Por qué**: es el hueco funcional más notorio y los servicios ya existen.
**Riesgo**: toca `CreateReviewComponent`, que es parte del flujo principal de la demo. El modo edición debe ser **aditivo**: sin el nuevo input, el componente se comporta exactamente como hoy.

- `components/review/review.component.ts/html`: `@Output() editRequested` y `@Output() deleteRequested`; botones con `*ngIf="currentUserId === review.userId"` — es la condición inversa de la que ya está en `review.component.html:24` para el botón de reportar.
- Modal de confirmación de borrado: copiar la estructura del modal de reporte que ya existe en `review.component.html:110`.
- `components/review-feed/review-feed.component.ts`: manejar los eventos y llamar `reviewService.deleteReview(id)` / abrir el editor.
- `components/create-review/create-review.component.ts`: `@Input() reviewToEdit?: Review`; si viene, precargar `comment` y `rating` en `ngOnInit` y bifurcar `submitReview()` entre `create()` y `updateReview(id, { comment, rating })`.
- **Alcance acotado a propósito**: solo el feed y el perfil. La página de álbum quedaría sin estos botones porque usa markup propio. Unificar las dos tarjetas es un refactor aparte, no recomendado esta semana.

---

## Fuera de alcance ahora, y por qué

- **Panel de moderación** (`getPendingReports()`): requiere decidir un modelo de permisos — no hay campo `role` en `User` — y, sin Firestore Security Rules, un panel de admin es seguridad aparente. **Implementarlo ahora abre una pregunta incómoda nueva en vez de cerrar una.** Va como trabajo futuro junto con las reglas.
- **Unificar la tarjeta de reseña**: refactor sobre el flujo central de la demo. Alto riesgo a días de la defensa.
- **Guardar reseñas** (`favoriteReviews`) y **página de búsqueda completa**: baratas y razonables, pero de menor impacto que F1–F3. Candidatas si sobra tiempo.

> **Advertencia estratégica:** cada feature nueva es una superficie nueva de preguntas. Todo lo que agreguen tienen que poder defenderlo con el mismo detalle que el resto. Es un argumento real para mantener la lista corta.

---

## Verificación

1. `npm start` y recorrer el flujo completo de la demo del manual de defensa, de punta a punta, sin saltear pasos.
2. **F1**: nav lateral → *Guardados* muestra los álbumes favoritos; *Siguiendo* muestra los artistas. Confirmar que los links eliminados ya no aparecen.
3. **F2**: abrir un perfil con varias reseñas y verificar que el promedio y la distribución coincidan con las reseñas listadas abajo.
4. **F3**: alternar *Recientes* / *Más gustadas* y comprobar que el orden cambia; dar un like y verificar que el reordenamiento lo refleja.
5. **F4**: editar una reseña y confirmar en la consola de Firebase que el documento cambió; borrarla y confirmar que desaparece del feed en tiempo real.
6. Revisar que todo componente nuevo cancele sus suscripciones en `ngOnDestroy`.
7. **Congelar el código 48 h antes de la defensa** y volver a grabar el video de respaldo de la demo con el estado final.

## Impacto en los manuales de defensa

- Si entra **F4**, el manual pasa a poder afirmar que el CRUD de reseñas está completo.
- Si entran las dos correcciones previas, las filas 2 y 14 de la tabla de limitaciones cambian de "lo detectamos" a "lo corregimos" — que en un tribunal no es lo mismo.
- Sumar a la tabla el hallazgo nuevo: tarjeta de reseña duplicada entre `ReviewComponent` y `album.component.html`.
