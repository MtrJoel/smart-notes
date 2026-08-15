# Smart Notes — v1.1

## Texto para "Novedades" en la Chrome Web Store (corto, cara al público)

```
Novedades en la versión 1.1:
• Confirmación visual al guardar una nota
• Contador de notas en el ícono de la extensión
• Resaltado más confiable al reabrir o recargar una página
• Exporta tus notas a Markdown o PDF
• Agrega comentarios propios a cada nota guardada
• Búsqueda mejorada (ahora también busca en tus comentarios)
```

## Descripción larga sugerida (si quieres actualizar la ficha completa)

```
Smart Notes te permite guardar y resaltar fragmentos importantes de
cualquier página web.

Pensada para estudiantes universitarios, investigadores y personas que
estudian en línea, la extensión guarda tus notas localmente y te permite
volver al texto original con un solo clic.

Características:
• Guarda texto seleccionado como nota
• Resalta automáticamente el texto al volver a la página
• Agrega tus propios comentarios a cada nota
• Exporta tus notas a Markdown o PDF
• Organización simple y rápida, con búsqueda
• No requiere cuenta
• No recopila datos personales

Todo se guarda localmente en tu navegador.
```

## Changelog técnico (para ti / control de versiones)

- Toast de confirmación al guardar una nota
- Badge en el ícono con el conteo de notas de la página activa
- Resaltado reescrito: se eliminó una condición de carrera entre
  `content.js` y `background.js` que hacía fallar el resaltado al
  reabrir notas o recargar la página
- Comparación de URL ahora ignora el fragmento (#) para evitar falsos
  negativos
- Reintentos automáticos de resaltado (hasta 3, con 700ms de espera)
  para páginas con contenido dinámico
- Exportar notas a Markdown (.md) desde el popup
- Exportar notas a PDF (vía diálogo de impresión) desde una vista dedicada
- Campo de comentario propio por nota, editable desde el popup
- La búsqueda del popup ahora también filtra por comentario
- Se eliminó el permiso `scripting` del manifest (ya no se usa)
- `manifest.json`: version 1.0 → 1.1

## Checklist antes de publicar

1. [✔] Copiar `icon16.png`, `icon48.png`, `icon128.png` dentro de la
       carpeta antes de comprimir (no estaban en los archivos que me
       compartiste, así que no van en este zip)
2. [✔] Confirmar que la ruta sea `popup/popup.html` y no `popup.html` —
       verifica que coincide con tu estructura real de carpetas
3. [✔] Probar la extensión localmente: `chrome://extensions` →
       "Cargar descomprimida" → seleccionar la carpeta → probar
       guardar, resaltar, exportar y comentar una nota
4. [✔] Entrar al Chrome Web Store Developer Dashboard
       (https://chrome.google.com/webstore/devconsole)
5. [✔] Seleccionar "Smart Notes" → Package → subir el nuevo .zip
6. [✔] Pegar el texto de "Novedades" de este documento en el campo
       correspondiente (o en la descripción, si prefieres)
7. [✔] Revisar la pestaña de "Privacy practices" — como ya no usas
       `scripting`, puedes confirmar que los permisos declarados
       siguen siendo mínimos y coherentes con lo que hace la extensión
8. [✔] Enviar a revisión

Nota: el Developer Dashboard cobra una cuota de registro única de
$5 USD la primera vez que publicas (si esta es tu primera app, revisa
que ya la hayas pagado). Las actualizaciones a extensiones ya
publicadas no tienen costo adicional.
