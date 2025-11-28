# 🔐 Solución: API Key de Gemini Reportada como Filtrada

## Problema Detectado

Los logs de Vercel muestran:
```
[403 Forbidden] Your API key was reported as leaked. Please use another API key.
```

La API key actual ha sido deshabilitada por Google porque fue detectada como "filtrada" (probablemente expuesta en un repositorio público o archivo compartido).

## Solución: Generar Nueva API Key

### Paso 1: Generar Nueva API Key

1. Ve a https://aistudio.google.com/app/apikey
2. Inicia sesión con tu cuenta de Google
3. Haz clic en **"Create API Key"** o **"Get API Key"**
4. Copia la nueva API key (formato: `AIzaSy...`)

### Paso 2: Actualizar en Vercel (Producción)

**Opción A: Usando Vercel CLI**
```bash
# Eliminar la key antigua
vercel env rm GEMINI_API_KEY production
vercel env rm GOOGLE_GENERATIVE_AI_API_KEY production

# Agregar la nueva key
vercel env add GEMINI_API_KEY production
# Pega tu nueva API key cuando se solicite

vercel env add GOOGLE_GENERATIVE_AI_API_KEY production
# Pega la misma API key cuando se solicite
```

**Opción B: Usando Dashboard de Vercel**
1. Ve a https://vercel.com/dashboard
2. Selecciona el proyecto `gigstream-mx`
3. Ve a **Settings** → **Environment Variables**
4. Elimina `GEMINI_API_KEY` y `GOOGLE_GENERATIVE_AI_API_KEY`
5. Agrega nuevas variables con tu nueva API key
6. Selecciona **Production** como entorno

### Paso 3: Actualizar Localmente

Crea un archivo `.env.local` (NO lo subas a git):

```bash
# .env.local (NO subir a git)
GEMINI_API_KEY=tu_nueva_api_key_aqui
GOOGLE_GENERATIVE_AI_API_KEY=tu_nueva_api_key_aqui
```

### Paso 4: Redeploy

```bash
vercel --prod --yes
```

## Prevención Futura

✅ **NUNCA** subas archivos `.env` o `.env.local` a git
✅ **NUNCA** pongas API keys en archivos que se suban al repositorio
✅ Usa `.gitignore` para excluir archivos con keys
✅ Usa variables de entorno en Vercel para producción
✅ Usa `.env.local` para desarrollo local (ya está en .gitignore)

## Verificación

Después de actualizar, prueba:
1. Visita: `https://gigstream-mx.vercel.app/api/test-gemini`
2. Debe mostrar `success: true` con el modelo usado
3. Prueba el chatbot en la página principal

## Nota Importante

El archivo `env.example` ya fue actualizado para NO incluir la API key real. Solo usa valores de ejemplo.

