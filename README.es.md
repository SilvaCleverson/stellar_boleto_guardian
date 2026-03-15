# Stellar Boleto Guardian

Autenticación de boletos bancarios mediante la blockchain Stellar, integrada con TOTVS Protheus.

---

## 🎯 Entiende el proyecto

> **Cada boleto se convierte en un registro inmutable en Stellar.**  
> Protheus genera un hash único del boleto, la API escribe ese hash en la cuenta Stellar del cliente (Manage Data) y cualquiera puede comprobar la autenticidad en la red — sin depender del ERP.

**Flujo en 3 pasos:**

```
  PROTHEUS                    API NODE                      STELLAR
  (emite boleto)     →     (firma transacción)     →     (registro on-chain)
       │                            │                            │
       │  Hash SHA1 +                │  Manage Data               │  Cuenta del cliente
       │  Account/Secret             │  (clave=hash,               │  guarda el hash
       │  de ZXH                     │   valor=datos)              │  para siempre
       └────────────────────────────┴────────────────────────────┘
                                              │
                                              ▼
  VALIDACIÓN PÚBLICA  ←  Cualquiera abre la página, introduce Account ID + hash
                         y ve al instante: boleto auténtico o no.
```

| Por qué importa | Qué obtienes |
|-----------------|--------------|
| **Fraude** | Hash en blockchain = el boleto no puede alterarse sin romper la prueba |
| **Confianza** | Validación pública: pagador o tercero confirman sin hablar con el ERP |
| **Trazabilidad** | Cada boleto queda ligado a una transacción Stellar (Horizon) |

---

## Visión general

Este proyecto:

- **Genera un hash único** de cada boleto en Protheus (SHA1)
- **Registra en Stellar** (Manage Data) para inmutabilidad
- **Permite validación pública** mediante código QR y página web
- **Ayuda a prevenir fraudes** con verificación on-chain

## Arquitectura

Protheus genera el hash y llama a la API Node.js; la API firma una transacción Stellar (Manage Data) en la cuenta del cliente y la envía a Horizon. Cada cliente tiene una cuenta Stellar; la validación consulta los datos de esa cuenta.

## Estructura del proyecto

```
Boleto/
├── Protheus/           # Fuentes ADVPL
│   ├── ZXH.prw         # Tabla ZXH (cuenta Stellar por cliente)
│   ├── BoletoHashStellar.prw
│   └── README.md
├── Stellar/            # API Node.js
│   ├── server.js, createClientAccount.js, sendHashToAccount.js
│   ├── public/validation.html
│   └── README.md
└── README.md
```

## Instalación rápida

### 1. Protheus
```advpl
U_ZXH()  // Crear tabla ZXH (una vez)
```

### 2. API Stellar
```bash
cd Stellar
npm install
cp env.example .env
npm start
```

### 3. Protheus
Configurar **MV_XURLST** y **MV_XURLVL** (ej.: `http://localhost:3000`).  
Crear cuenta: `U_CriaWalletStellar("000001")`.  
Generar hash: `cHash := U_BoletoHashStellar(cNossoNum, nValor, dVencimento, cCodCli)`.

### 4. Validación
Abrir `http://localhost:3000/validation.html` e informar Account ID y hash.

## Tabla ZXH

| Campo      | Tipo | Descripción            |
|------------|------|------------------------|
| ZXH_FILIAL | C  2 | Sucursal               |
| ZXH_CODCLI | C  6 | Código de cliente      |
| ZXH_WALLET | C 60 | Stellar Account ID      |
| ZXH_TOPIC  | C 20 | Reservado               |
| ZXH_PRIVKEY| C 300| Clave privada Stellar   |
| ZXH_DTGER  | D  8 | Fecha de creación      |

## Seguridad

- Hash SHA1 para integridad; Stellar para inmutabilidad.
- No registrar claves privadas; en producción, considerar cifrado en ZXH.
- Usar HTTPS en producción.

## Costes Stellar

- Testnet: Friendbot financia; coste despreciable.
- Mainnet: ~0,00001 XLM por operación.

## Licencia

MIT.

---

**Autor:** Cleverson Silva
