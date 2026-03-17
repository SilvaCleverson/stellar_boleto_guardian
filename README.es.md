<div align="center">

# Stellar Boleto Guardian

### Autenticacion inmutable de boletos via blockchain Stellar

[![Stellar](https://img.shields.io/badge/Blockchain-Stellar-blue?logo=stellar&logoColor=white)](https://stellar.org/)
[![Node.js](https://img.shields.io/badge/API-Node.js-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Protheus](https://img.shields.io/badge/ERP-TOTVS%20Protheus-00529B)](https://www.totvs.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**[Portugues](README.pt-BR.md)** | **[English](README.en.md)**

</div>

---

## Entiende el proyecto

> **El usuario solo tiene el boleto. Es todo lo que necesita.**

Conoce a **DS2U**, una empresa que usa Protheus ERP y emite cientos de boletos diarios para sus clientes. Un dia, un boleto es interceptado y su codigo de barras es adulterado. El pagador paga, pero el dinero va a otro lugar. Fraude clasico.

**Stellar Boleto Guardian lo resuelve de forma simple:**

Cuando DS2U emite un boleto, el **codigo de barras** (linea digitalizadora, 47 digitos) se graba en la blockchain Stellar. Cualquiera que reciba el boleto puede digitar esos numeros y verificar al instante si es autentico.

```
         DS2U emite boleto              API graba en Stellar
         +------------------+           +------------------+
         | Protheus genera  |           | Manage Data      |
         | boleto con       |  POST     | key = codebar    |
         | codigo de barras | --------> | value = datos    |
         | (47 digitos)     |           | del boleto       |
         +------------------+           +--------+---------+
                                                 |
                                                 | Grabado para siempre
                                                 v
                                        +------------------+
                                        | Blockchain       |
                                        | Stellar          |
                                        | (cuenta de DS2U) |
                                        +--------+---------+
                                                 |
                    +----------------------------+
                    |
                    v
         +------------------+
         | USUARIO          |
         | Recibe boleto    |
         | Digita los 47    |
         | numeros          |
         | VALIDA AL        |
         | INSTANTE         |
         +------------------+
```

### Por que importa?

| Problema | Sin Guardian | Con Guardian |
|----------|-------------|--------------|
| **Boleto adulterado** | Nadie se da cuenta hasta que el dinero desaparece | Codigo de barras no existe en la chain = fraude |
| **Quien valida?** | Solo el banco o el ERP | Cualquiera, con los numeros del boleto |
| **Que necesita el usuario?** | Hash, Account ID, datos tecnicos | **Solo los numeros del boleto** |
| **Trazabilidad** | Logs internos que pueden alterarse | Blockchain inmutable |
| **Coste** | Sistemas antifraude caros | ~0,00001 XLM por boleto |

---

## Por que el codigo de barras como clave?

Stellar permite grabar datos en la blockchain usando la operacion **Manage Data**: una clave (hasta 64 bytes) y un valor (hasta 64 bytes).

La linea digitalizadora de un boleto bancario tiene **47 digitos** -- cabe perfectamente en 64 bytes.

| Enfoque | Clave | Que necesita el usuario | Experiencia |
|---------|-------|------------------------|-------------|
| Antiguo (hash) | SHA1 del boleto | Account ID + Hash | Mala -- datos tecnicos |
| **Nuevo (codebar)** | **Linea digitalizadora** | **Solo los numeros del boleto** | **Excelente** |

---

## Arquitectura

```
+------------------+        +--------------------+        +--------------------+
|    PROTHEUS      |        |     API NODE.JS    |        |      STELLAR       |
|    (DS2U)        |        |     (Express)      |        |    (Blockchain)    |
+------------------+        +--------------------+        +--------------------+
|                  |        |                    |        |                    |
| Emite boleto     | POST   | /api/blockchain    | Horizon| Manage Data        |
| codebar como     |------->| key = codebar      |------->| en CUENTA DE DS2U  |
| clave            |        | value = payload    |        | (cuenta unica)     |
|                  |        |                    |        |                    |
| Setup inicial    | POST   | /api/wallet        | Friend | Crea cuenta        |
| (una vez)        |------->| Keypair.random()   |--bot-->| Financia           |
|                  |        |                    |        |                    |
|                  |        | /api/validate/     | Horizon| GET account data   |
| Usuario valida   |------->| :codebar           |------->| Existe el codebar? |
+------------------+        +--------------------+        +--------------------+
```

**Punto clave:** la cuenta Stellar es de la **empresa** (DS2U), no de cada cliente. Todos los boletos quedan en la misma cuenta. El Account ID de DS2U es fijo y ya viene configurado en la API -- el usuario final nunca necesita saberlo.

---

## Escenario DS2U -- paso a paso

### Requisitos previos

| Requisito | Version |
|-----------|---------|
| TOTVS Protheus | 12.1.33+ |
| Node.js | 18+ |
| Funciones ADVPL | `SHA1()`, `FWRest` |

### 1. Iniciar la API Stellar

```bash
cd Stellar
npm install
cp env.example .env
npm start
```

### 2. Crear cuenta Stellar de la empresa (una sola vez)

```advpl
U_ZXH()            // Crea tabla ZXH
U_CriWltSt()       // Crea cuenta Stellar de DS2U y la guarda en ZXH
```

### 3. Configurar parametros en Protheus

| Parametro | Valor | Descripcion |
|-----------|-------|-------------|
| **MV_XURLST** | `http://localhost:3000` | URL de la API Stellar |
| **MV_XURLVL** | `http://localhost:3000` | URL de la pagina de validacion |

### 4. Emitir boleto con registro en Stellar

```advpl
U_BolStlr(cCodebar, cNossoNum, nValor, dVencto, cCodCli)
// El codigo de barras se graba en Stellar como clave del Manage Data
```

### 5. Validar boleto (experiencia del usuario final)

1. Abrir `http://ds2u.com/validar` (o escanear el codigo QR)
2. Digitar los **47 numeros** del codigo de barras
3. El sistema consulta Stellar y muestra: monto original, vencimiento, estado
4. **Si los datos coinciden con el boleto impreso, es autentico. Si no existe en la chain, es fraude.**

---

## Endpoints de la API

| Metodo | Ruta | Proposito |
|--------|------|-----------|
| `GET` | `/` | Estado de la API |
| `POST` | `/api/wallet` | Crear cuenta Stellar de la empresa |
| `POST` | `/api/blockchain` | Registrar boleto (key=codebar, value=payload) |
| `GET` | `/api/validate/:codebar` | Validar boleto por codigo de barras |
| `GET` | `/api/account/:id/data` | Listar todos los boletos registrados |

### Ejemplo POST /api/blockchain

```json
{
  "codebar": "23793381286000000000300000004001184340000012050",
  "nosso_numero": "000000040",
  "valor": "120.50",
  "vencimiento": "2025-08-05",
  "secret": "S..."
}
```

---

## Seguridad

| Aspecto | Detalle |
|---------|---------|
| **Inmutabilidad** | Manage Data en Stellar: una vez escrito, no puede alterarse sin nueva transaccion |
| **Clave de la empresa** | Clave privada almacenada en ZXH (cifrar en produccion) |
| **Transporte** | HTTPS obligatorio en produccion |
| **Cuenta unica** | Account ID de la empresa es publico; clave privada nunca se expone |

## Costes

| Entorno | Coste |
|---------|-------|
| **Testnet** | Gratuito (Friendbot) |
| **Mainnet** | ~0,00001 XLM por operacion (~US$ 0,000001) |
| **Reserva** | 1 XLM base + 0,5 XLM por boleto registrado (subentry) |

---

## Stack tecnologico

<div align="center">

| | Tecnologia | Rol |
|-|------------|-----|
| ![Stellar](https://img.shields.io/badge/-Stellar-7C3AED?logo=stellar&logoColor=white) | Stellar Blockchain | Almacenamiento inmutable de boletos |
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
