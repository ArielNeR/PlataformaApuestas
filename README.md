🎲 BetPro – Plataforma de Apuestas Deportivas (Full-Stack)
========================================================

**Stack moderno:** NestJS + Angular + Ionic + MongoDB + WebSockets  
**Demo rápida:** Crea una cuenta con “@demo.com” y recibe **$ 100.000 demo** automáticamente.

---

📦 ¿Qué incluye el repo?
------------------------

| Carpeta     | Tecnología | Descripción |
|-------------|------------|-------------|
| `backend/`  | NestJS 11  | API REST + WebSockets (eventos en vivo) |
| `Frontend/` | Angular 18 | PWA responsive (Tailwind, standalone components) |
| `ionicApp/` | Ionic 8    | App móvil Android/iOS (Capacitor 8) |

---

⬇️ Descargar APK (Android)
==========================

Puedes descargar la versión Android directamente desde este repositorio:

👉 **[Descargar BetPro.apk](./BetPro.apk)**

**Requisitos:**
- Android 8.0 o superior
- Permitir *“Instalar apps de orígenes desconocidos”*

> El APK es una build de prueba. No incluye firma de Play Store.

🚀 Levantar el proyecto en 3 pasos
---------------------------------

**1. Backend**

```bash
cd backend
cp .env.example .env            # edita MONGODB_URI y JWT_SECRET si quieres
npm install
npm run start:dev               # http://localhost:3000

```

### 2. Frontend web
```bash
cd Frontend
npm install
ng serve                         # http://localhost:4200
```

### 3. App móvil (opcional)
```bash
cd ionicApp
npm install
ionic capacitor add android      # o ios
ionic capacitor sync
ionic capacitor open android     # abre Android Studio
```

---

## 🔐 Autenticación & demo

| Tipo  | Email           | Contraseña | Saldo inicial |
|-------|-----------------|------------|---------------|
| Demo  | `demo@demo.com` | `demo123`  | $ 100.000     |
| Real  | cualquier otro  | ≥ 6 chars  | $ 0           |

---

## ⚽ Flujo típico

1. Registro / Login  
2. Depósito con tarjeta (simulado)  
3. Navega eventos **en vivo** o programados  
4. Arma tu cupón (simple o múltiple)  
5. Apuesta y recibe resultado **simulado** en 5 s  
6. Overlay animado: ¡ganaste! / perdiste  
7. Stats actualizadas en tiempo real (ROI, racha, etc.)

---

## 🛠️ Características destacadas

- **WebSockets** → actualización de cuotas, minuto y marcador en vivo  
- **Modo racha / simulación histórica / torneos** (próximamente)  
- **Cupón flotante** con stake rápido y calculadora de retorno  
- **Diseño glass-morphism + gradientes** (dark-mode nativo)  
- **Protección de rutas** (AuthGuard)  
- **Validación de formularios** (class-validator)  
- **Imágenes de equipos reales** (Wikimedia + fallback avatar)  
- **Docker-ready** (archivos incluidos)

---

## 📊 Variables de entorno (backend)

```env
MONGODB_URI=mongodb://localhost:27017/betpro
JWT_SECRET=cambia-esto-por-un-jwt-secreto
REDIS_URL=redis://localhost:6379   # opcional, caché de sesiones
```

---

## 🧪 Scripts útiles

```bash
# Backend
npm run test:e2e
npm run test:cov

# Frontend
ng build --configuration production
ionic serve --external   # prueba en móvil local
```

---

## 📱 Capturas

| Web en vivo | Cupón | App móvil |
|-------------|-------|-----------|
| ![web](docs/web.png) | ![slip](docs/slip.png) | ![mobile](docs/mobile.png) |

> Carpeta `/docs` con GIFs y vídeos de demostración.

---

## 🤝 Contribuir

1. Fork → feature branch → PR  
2. Usa **Conventional Commits** (`feat:`, `fix:`, `docs:`…)  
3. Asegura lint + tests antes de push  
   ```bash
   npm run lint
   npm run test
   ```

---

## 📝 Licencia

MIT – usa el código libremente, solo mantén los créditos.