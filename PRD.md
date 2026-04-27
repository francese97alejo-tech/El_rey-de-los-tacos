# El Rey de los Tacos - PRD

## Original Problem Statement
Menú digital "El Rey de los Tacos" con login admin (matiasfrancese/matias123), CRUD de categorías/productos/salsas, carrito verde con envío por WhatsApp (1155644915) que pregunta retiro/envío y efectivo/transferencia, modal de selección de 2 salsas (de 7) al pedir tacos, QR para compartir, y botón de consulta de franquicia.

## Architecture
- **Backend**: FastAPI + MongoDB (motor async). Hardcoded admin auth with token.
- **Frontend**: React + React Router + Tailwind + shadcn/ui. CartContext (localStorage persisted).
- **Routes**: `/` (menú público), `/admin/login`, `/admin` (panel CRUD)

## Implemented (Feb 2026)
- ✅ Backend endpoints: auth/login, CRUD categorías/productos/salsas, seed automático
- ✅ Auto-seed: 4 categorías (Tacos, Corn Dogs, Postres, Bebidas), 9 productos, 7 salsas
- ✅ Menú público con hero, logo del cliente, accordion de categorías estilo screenshot referencia
- ✅ Carrito verde (#16A34A) con retiro/envío, efectivo/transferencia, dirección condicional
- ✅ Modal de salsas: forzar exactamente 2 de 7 (botón deshabilitado hasta cumplir)
- ✅ Checkout WhatsApp formateado a wa.me/5491155644915
- ✅ Modal QR (qrcode.react) para compartir el menú
- ✅ Botón de franquicia en footer → WhatsApp pre-rellenado
- ✅ Login admin + panel con 3 tabs CRUD (productos/categorías/salsas)
- ✅ Help-box explicando cómo agregar fotos por URL
- ✅ data-testid en todos los elementos interactivos

## Test Results
- Backend: 14/14 pytest tests pass (100%)
- Frontend: end-to-end UI tests pass (100%)

## Backlog / Next Items
- P2: Reemplazar botón anidado en SauceModal (warning hidratación, no bloqueante)
- P2: Añadir DialogDescription para a11y
- P2: Mover credenciales admin a variables de entorno (actualmente hardcoded por pedido del usuario)
- P1: Considerar agregar campo "horario de apertura" para mostrar Abierto/Cerrado dinámicamente
- P1: Sumar precio de envío configurable
- P1: Soporte multi-foto por producto (carousel)
