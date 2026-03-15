<div align="center">

# Stellar Boleto Guardian

### Autenticacion de boletos bancarios via blockchain Stellar

[![Stellar](https://img.shields.io/badge/Blockchain-Stellar-blue?logo=stellar&logoColor=white)](https://stellar.org/)
[![Node.js](https://img.shields.io/badge/API-Node.js-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Protheus](https://img.shields.io/badge/ERP-TOTVS%20Protheus-00529B)](https://www.totvs.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**[Portugues](README.pt-BR.md)** | **[English](README.en.md)**

</div>

---

## Entiende el proyecto

> **Cada boleto se convierte en un registro inmutable en la blockchain Stellar.**

Piensa en este escenario: se emite un boleto y alguien por el camino cambia el codigo de barras o el monto. El pagador paga, pero el dinero va a otro lugar. Fraude clasico.

**Stellar Boleto Guardian lo resuelve en 3 pasos:**

```
                        +------------------+
                        |   1. PROTHEUS    |
                        |                  |
                        |  Emite el boleto |
                        |  Genera hash     |
                        |  SHA1            |
                        +--------+---------+
                                 |
                                 | POST hash + account + secret
                                 v
                        +------------------+
                        |   2. API NODE    |
                        |                  |
                        |  Firma una       |
                        |  transaccion     |
                        |  Stellar         |
                        |  (Manage Data)   |
                        +--------+---------+
                                 |
                                 | Envia a Horizon
                                 v
                        +------------------+
                        |   3. STELLAR     |
                        |                  |
                        |  Guarda el hash  |
                        |  en la cuenta    |
                        |  del cliente     |
                        |  PARA SIEMPRE    |
                        +--------+---------+
                                 |
                                 v
            +--------------------------------------------+
            |          VALIDACION PUBLICA                 |
            |                                            |
            |  Cualquiera introduce Account ID + Hash    |
            |  y ve al instante si el boleto es          |
            |  autentico                                 |
            +--------------------------------------------+
```

### Por que importa?

| Problema | Sin Guardian | Con Guardian |
|----------|-------------|--------------|
| **Boleto adulterado** | Nadie se da cuenta hasta que el dinero desaparece | El hash cambia = fraude detectado |
| **Quien valida?** | Solo el banco o el ERP | Cualquiera, via blockchain |
| **Trazabilidad** | Logs internos que pueden alterarse | Transaccion Stellar inmutable |
| **Coste** | Sistemas antifraude caros | ~0,00001 XLM por boleto |

---

## Que hace el proyecto

- **Genera un hash unico** de cada boleto en Protheus (SHA1)
- **Registra en Stellar** usando la operacion Manage Data
- **Permite validacion publica** via pagina web (Account ID + hash)
- **Genera codigo QR** en el boleto apuntando a la validacion

---

## Arquitectura

```
+------------------+        +--------------------+        +--------------------+
|    PROTHEUS      |        |     API NODE.JS    |        |      STELLAR       |
|    (ADVPL)       |        |     (Express)      |        |    (Blockchain)    |
+------------------+        +--------------------+        +--------------------+
|                  |        |                    |        |                    |
| BoletoHash       | POST   | /api/blockchain    | Horizon| Manage Data        |
| Stellar.prw      |------->| Firma tx con       |------->| name = hash        |
|                  |        | secret del cliente |        | value = payload    |
|                  |        |                    |        |                    |
| ZXH.prw          | POST   | /api/wallet        | Friend | Crea cuenta        |
| (tabla cuentas)  |------->| Keypair.random()   |--bot-->| Financia 10k XLM   |
|                  |        |                    |        |                    |
|                  | GET    | /api/validate/     | Horizon| GET account data   |
|                  |------->| :accountId/:hash   |------->| Existe el hash?    |
+------------------+        +--------------------+        +--------------------+
```

---

## Estructura del proyecto

```
stellar_boleto_guardian/
|
|-- Protheus/                        # Fuentes ADVPL
|   |-- ZXH.prw                      # Creacion de la tabla ZXH
|   |-- BoletoHashStellar.prw        # Hash + envio + validacion + QR
|   +-- README.md
|
|-- Stellar/                         # API Node.js
|   |-- server.js                    # Express (4 endpoints)
|   |-- createClientAccount.js       # Keypair + Friendbot
|   |-- sendHashToAccount.js         # Transaccion Manage Data
|   |-- env.example                  # Variables de entorno
|   |-- package.json
|   |-- README.md
|   +-- public/
|       +-- validation.html          # Pagina de validacion publica
|
|-- README.md                        # Indice
|-- README.pt-BR.md                  # Documentacion en portugues
|-- README.en.md                     # Documentacion en ingles
|-- README.es.md                     # Documentacion en espanol (este archivo)
+-- .gitignore
```

---

## Instalacion paso a paso

### Requisitos previos

| Requisito | Version |
|-----------|---------|
| TOTVS Protheus | 12.1.33+ |
| Node.js | 18+ |
| Funciones ADVPL | `SHA1()`, `HTTPRequest()` |

### 1. Crear tabla ZXH en Protheus

Compilar `ZXH.prw` y ejecutar **una sola vez:**

```advpl
U_ZXH()
```

### 2. Iniciar la API Stellar

```bash
cd Stellar
npm install
cp env.example .env      # Ajustar PORT si es necesario
npm start                # Inicia en http://localhost:3000
```

### 3. Configurar parametros en Protheus

| Parametro | Valor | Descripcion |
|-----------|-------|-------------|
| **MV_XURLST** | `http://localhost:3000` | URL de la API Stellar |
| **MV_XURLVL** | `http://localhost:3000` | URL de la pagina de validacion |

### 4. Crear cuenta Stellar para un cliente

```advpl
U_CriaWalletStellar("000001")
// Guarda automaticamente en ZXH: Account ID + clave secreta
```

### 5. Generar boleto con hash

```advpl
cHash := U_BoletoHashStellar("123456789012", 1235.40, CToD("05/08/2025"), "000001")
// El hash se registra en Stellar y se genera el codigo QR
```

### 6. Validar boleto

Abrir `http://localhost:3000/validation.html` e introducir:
- **Account ID** (de la tabla ZXH)
- **Hash** (impreso en el boleto / codigo QR)

---

## Endpoints de la API

| Metodo | Ruta | Proposito |
|--------|------|-----------|
| `GET` | `/` | Estado de la API |
| `POST` | `/api/wallet` | Crear cuenta Stellar (Friendbot) |
| `POST` | `/api/blockchain` | Registrar hash en la cuenta (Manage Data) |
| `GET` | `/api/account/:id/data` | Listar hashes de la cuenta |
| `GET` | `/api/validate/:id/:hash` | Validar si existe el hash |

### Ejemplo POST /api/blockchain

```json
{
  "hash": "a94a8fe5ccb19ba61c4c0873d391e987982fbbd3",
  "nosso_numero": "123456789012",
  "valor": "1235.40",
  "vencimento": "2025-08-05",
  "secret": "S..."
}
```

---

## Tabla ZXH (Protheus)

| Campo | Tipo | Tam | Descripcion |
|-------|------|-----|-------------|
| `ZXH_FILIAL` | C | 2 | Sucursal |
| `ZXH_CODCLI` | C | 6 | Codigo de cliente |
| `ZXH_WALLET` | C | 60 | Stellar Account ID (clave publica) |
| `ZXH_TOPIC` | C | 20 | Reservado |
| `ZXH_PRIVKEY` | C | 300 | Clave secreta Stellar |
| `ZXH_DTGER` | D | 8 | Fecha de creacion |

---

## Funciones ADVPL

| Funcion | Proposito |
|---------|-----------|
| `U_ZXH()` | Crea la tabla ZXH |
| `U_BoletoHashStellar(cNossoNum, nValor, dVenc, cCodCli)` | Genera hash, registra en Stellar, genera QR |
| `U_ValidaBoletoStellar(cAccount, cHash)` | Valida hash en la cuenta Stellar |
| `U_CriaWalletStellar(cCodCli)` | Crea cuenta Stellar y guarda en ZXH |
| `U_TestaIntegracaoStellar()` | Prueba la conexion con la API |

---

## Seguridad

| Aspecto | Detalle |
|---------|---------|
| **Hash** | SHA1 sobre numero_boleto + monto + vencimiento + cod_cliente |
| **Inmutabilidad** | Manage Data en Stellar: una vez escrito, no puede alterarse sin nueva transaccion |
| **Claves privadas** | Nunca registrarlas; cifrar en ZXH en produccion |
| **Transporte** | HTTPS obligatorio en produccion |

## Costes

| Entorno | Coste |
|---------|-------|
| **Testnet** | Gratuito (Friendbot) |
| **Mainnet** | ~0,00001 XLM por operacion (~US$ 0,000001) |

---

## Stack tecnologico

<div align="center">

| | Tecnologia | Rol |
|-|------------|-----|
| ![Stellar](https://img.shields.io/badge/-Stellar-7C3AED?logo=stellar&logoColor=white) | Stellar Blockchain | Almacenamiento inmutable de hashes |
| ![Node](https://img.shields.io/badge/-Node.js-339933?logo=node.js&logoColor=white) | Node.js + Express | API puente entre Protheus y Stellar |
| ![ADVPL](https://img.shields.io/badge/-ADVPL-00529B) | TOTVS Protheus | ERP que emite y valida boletos |

</div>

---

## Licencia

MIT - use, modifique y distribuya libremente.

---

<div align="center">

**Hecho por [Cleverson Silva](https://github.com/SilvaCleverson)**

Powered by [Stellar](https://stellar.org/)

</div>
