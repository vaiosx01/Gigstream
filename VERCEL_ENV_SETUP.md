# Vercel Environment Variables Setup

## Required Environment Variables

Para que la aplicación funcione correctamente en producción, necesitas configurar las siguientes variables de entorno en Vercel:

### 1. Reown/Web3Modal Configuration

**IMPORTANTE:** Asegúrate de que NO haya saltos de línea o espacios extra al final del Project ID.

```
NEXT_PUBLIC_PROJECT_ID=6fd397eb41ba4744205068f35b888825
```

**También necesitas:**
- Ir a https://dashboard.reown.com
- Seleccionar tu proyecto
- En "App Settings" → "Allowed Domains", agregar:
  - `gigstream-mx.vercel.app`
  - `*.vercel.app` (para preview deployments)
  - Tu dominio personalizado si lo tienes

### 2. Gemini AI

```
GEMINI_API_KEY=AIzaSyBIagF-Irh1r-9r0VcD_Z5XcghyfXEiLj8
GOOGLE_GENERATIVE_AI_API_KEY=AIzaSyBIagF-Irh1r-9r0VcD_Z5XcghyfXEiLj8
```

### 3. Smart Contracts

**IMPORTANTE:** Asegúrate de que NO haya saltos de línea al final de las direcciones.

```
NEXT_PUBLIC_GIGESCROW_ADDRESS=0x7094f1eb1c49Cf89B793844CecE4baE655f3359b
NEXT_PUBLIC_REPUTATION_TOKEN_ADDRESS=0x51FBdDcD12704e4FCc28880E22b582362811cCdf
NEXT_PUBLIC_STAKING_POOL_ADDRESS=0x77Ee7016BB2A3D4470a063DD60746334c6aD84A4
```

### 4. Somnia Network

```
NEXT_PUBLIC_SOMNIA_RPC_URL=https://dream-rpc.somnia.network
NEXT_PUBLIC_SOMNIA_CHAIN_ID=50312
NEXT_PUBLIC_SOMNIA_EXPLORER=https://shannon-explorer.somnia.network
```

### 5. App URL (Opcional)

```
NEXT_PUBLIC_APP_URL=https://gigstream-mx.vercel.app
```

## Cómo Configurar en Vercel

1. Ve a tu proyecto en Vercel: https://vercel.com/dashboard
2. Selecciona el proyecto "gigstream-mx"
3. Ve a "Settings" → "Environment Variables"
4. Agrega cada variable de entorno
5. **IMPORTANTE:** Al pegar valores, asegúrate de:
   - No tener espacios al inicio o final
   - No tener saltos de línea
   - Usar el formato exacto mostrado arriba

## Verificar Configuración

Después de configurar las variables:
1. Ve a "Deployments"
2. Haz un nuevo deployment o redeploy el último
3. Verifica que no haya errores 403 en la consola del navegador

## Problemas Comunes

### Error 403 en api.web3modal.org
- **Causa:** El dominio no está autorizado en Reown Dashboard
- **Solución:** Agrega el dominio en https://dashboard.reown.com → Tu Proyecto → App Settings → Allowed Domains

### Error "Address is invalid"
- **Causa:** Saltos de línea o espacios en las direcciones de contratos
- **Solución:** Asegúrate de que las variables de entorno no tengan espacios o saltos de línea al final

### Error "Project ID not found"
- **Causa:** Saltos de línea en NEXT_PUBLIC_PROJECT_ID
- **Solución:** Copia y pega el Project ID sin espacios ni saltos de línea

