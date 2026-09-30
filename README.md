# Skin Care 01

App web responsive/PWA para seguimiento de una rutina facial sencilla.

## Publicarla en GitHub Pages

1. Crea un repositorio nuevo, por ejemplo `skin-care-01`.
2. Sube **todo el contenido de esta carpeta** a la raíz del repositorio.
3. En GitHub ve a **Settings → Pages**.
4. En *Build and deployment* selecciona **Deploy from a branch**.
5. Elige la rama `main` y la carpeta `/ (root)`.
6. Guarda. GitHub te mostrará la URL pública.

## Uso en móvil

En Safari/Chrome abre la URL de GitHub Pages y usa **Añadir a pantalla de inicio**.  
La app guarda checks, rachas, ajustes, check-ins y fotografías **en el navegador del dispositivo** usando almacenamiento local.

> Importante: los datos locales no se sincronizan automáticamente entre móvil y ordenador.

## Archivos

- `index.html` — estructura
- `styles.css` — diseño responsive
- `app.js` — lógica, checks, rachas, fotos y seguimiento
- `manifest.json` — instalación PWA
- `sw.js` — caché/offline básico
- `assets/` — imágenes e iconos

## Privacidad

Las fotos de progreso añadidas dentro de la app se guardan localmente en el navegador. No se suben a ningún servidor por esta versión.
