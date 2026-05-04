<div align="center">

# Stellar Boleto Guardian

## Whitepaper v1.0

### Immutable Bank Slip Authentication on Stellar Blockchain

*Transforming financial transaction security in Brazil*

**Author:** Cleverson Silva
**Date:** March 2026
**Version:** 1.0

---

[![Stellar](https://img.shields.io/badge/Blockchain-Stellar-blue?logo=stellar&logoColor=white)](https://stellar.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**[Versao em Portugues](WHITEPAPER.pt-BR.md)**

</div>

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [The Problem](#2-the-problem)
3. [The Solution: Boleto Guardian](#3-the-solution-boleto-guardian)
4. [Conceptual Architecture](#4-conceptual-architecture)
5. [Why Stellar?](#5-why-stellar)
6. [Viability and Scalability](#6-viability-and-scalability)
7. [Security, Privacy and Compliance](#7-security-privacy-and-compliance)
8. [Adoption Strategy](#8-adoption-strategy)
9. [Future Vision](#9-future-vision)
10. [Conclusion](#10-conclusion)
11. [References](#11-references)

---

## 1. Executive Summary

Brazil issues over **4 billion bank slips (boletos) per year**, making the boleto one of the most widely used payment instruments in the country. However, this massive volume coexists with an alarming reality: estimates point to losses between **R$ 25 and 29 billion annually** in digital fraud involving boletos and other electronic payment methods (ClearSale, 2024; Finsiders, 2024).

The **Stellar Boleto Guardian** is a solution that records the barcode number (linha digitavel) of each issued boleto on the Stellar blockchain, creating a public, immutable, and auditable proof of authenticity. The central differentiator lies in the end-user experience: **to validate a boleto, one simply types the numbers printed on the document itself**. No knowledge of hashes, cryptographic keys, or any technical concept is required. The user already has everything they need in hand.

The solution integrates with any ERP system through an intermediary API, making it platform-agnostic. In this whitepaper, we use TOTVS Protheus as a reference implementation, given our team's experience with that ecosystem, but the architecture is replicable for any ERP on the market.

---

## 2. The Problem

### 2.1 The fraud landscape in Brazil

The bank slip (boleto) is a pillar of the Brazilian financial system. Present in B2B, B2C, and government transactions, it serves everyone from large corporations to individual consumers. However, its popularity has made it a preferred target for digital criminals.

The numbers are striking:

- **4 billion** boletos issued annually in Brazil (FEBRABAN)
- **R$ 25 to 29 billion** in losses from digital fraud, including boletos and PIX (ClearSale, 2024; Finsiders, 2024)
- **Boleto tampering** ranks among the most common forms of digital crime in the country

### 2.2 How the fraud works

Boleto fraud exploits vulnerabilities at multiple points in the chain:

```
  Company issues         Boleto in           Criminal             Payer receives
  legitimate boleto      transit             intercepts           tampered boleto
  +-----------+         +-----------+        +-----------+        +-----------+
  | ERP       |         | Email,    |        | Alters    |        | Pays to   |
  | generates | ------> | mail,     | -----> | barcode   | -----> | wrong     |
  | original  |         | portal    |        | or data   |        | account   |
  +-----------+         +-----------+        +-----------+        +-----------+
```

The most common techniques include:

- **Email interception** with attached boletos and barcode replacement
- **Malware** that alters the barcode number at the time of viewing or printing
- **Social engineering** with fake boletos mimicking legitimate companies
- **Physical tampering** of printed boletos before delivery to the recipient

### 2.3 The trust gap

The fundamental problem is not just fraud itself, but the **absence of a public, reliable verification layer** between three actors:

```
  +-------------+        +-------------+        +-------------+
  |    ERP      |        |  Financial  |        |    End      |
  |  (Company)  |        | Institution |        |   Customer  |
  +------+------+        +------+------+        +------+------+
         |                      |                      |
         +---------- ? ---------+---------- ? ---------+
                  No public, independent
                    verification layer
```

Today, the payer of a boleto relies exclusively on trust in the sender. There is no public, independent, tamper-proof mechanism that allows the user to verify, on their own, whether the boleto they received is identical to the one issued by the company.

### 2.4 Limitations of current solutions

Existing approaches to combat boleto fraud present significant limitations:

| Approach | Limitation |
|----------|-----------|
| **Bank verification** | Requires the payer to access online banking and manually compare data |
| **Corporate anti-fraud systems** | Operate internally, with no transparency for the payer |
| **DDA (Authorized Direct Debit)** | Requires prior registration, does not cover all scenarios |
| **Internal ERP logs** | Can be altered; not public or externally auditable |

All these solutions share a common flaw: **the payer has no autonomy to validate the boleto independently, publicly, and instantly**.

### 2.5 Prioritized pains and personas

> *The question is not "how do I use Stellar?". The question is: **what real financial problem do we solve better with this product?** (Stellar builder framing.)*

Boleto Guardian starts **from the pain**, not from the blockchain. Below are **prioritized pains** (ordered by product impact) and **personas** who feel each pain.

#### Pains (prioritized)

| Priority | Pain | Evidence / context |
|----------|------|-------------------|
| **P1** | **"I don't know if this boleto is the same one the company issued."** | The payer trusts email, PDF, or paper; there is no public, independent check before payment. |
| **P2** | **"I paid and the money went to a fraudster."** | Tampered barcode in transit; direct loss and hard recovery. |
| **P3** | **"Customers and suppliers say my company sent a fake boleto."** | Reputational damage and support/legal cost even when the company is also a victim. |
| **P4** | **"My ERP and my bank don't give the payer a simple, auditable proof."** | Internal logs don't convince third parties; manual online-banking checks don't scale. |

#### Personas

| Persona | Profile | What they need | How Boleto Guardian helps |
|---------|---------|----------------|---------------------------|
| **Payer (B2C or sole trader)** | Receives boleto by email, portal, or paper; non-technical. | Confirm in seconds whether the slip is authentic **before** paying, without an account at the issuer's bank. | Types the **47 digits** (or uses the company validation link); checks on-chain whether the record exists. |
| **Treasury / collections (B2B)** | High issuance volume; owns delinquency and fraud exposure. | Reduce "I paid the wrong account" and give **trust** about the slip sent. | Immutable record per issuance; clear validation messaging aligned with the brand. |
| **IT / integration (ERP)** | Ships APIs; owns secrets and compliance. | Simple **REST** integration; signing key **not** in the end-user client; path to **HSM** on the roadmap. | ERP-agnostic middleware; security docs (no key in the browser). |
| **Audit / compliance (secondary)** | Needs traceability and data policies. | Integrity proof without excessive personal data on-chain. | Only necessary metadata; no payer PII on the network. |

**Anti-pattern avoided:** this is not a generic wallet or DeFi without demand -- the use case is a **Brazilian payment slip**, and the action is **validate (and, in the next phase, settle) inside the Guardian ecosystem**, with clear personas (payer + issuer + IT).

---

## 3. The Solution: Boleto Guardian

### 3.1 The concept

The Boleto Guardian solves the trust gap directly: **when issuing a boleto, the company records the barcode number on the Stellar blockchain**. From that moment on, anyone who possesses the boleto can verify its authenticity by querying the blockchain.

Validation is as simple as:

> **Received a boleto? Type the numbers. If it exists on the blockchain, it's authentic.**

### 3.2 Why the barcode number as the key?

The barcode number (linha digitavel) of a Brazilian bank slip has **47 digits**. This sequence is:

- **Unique** per boleto -- no two boletos share the same barcode number
- **Printed** on the physical and digital document -- the payer always has access to it
- **Standardized** by FEBRABAN -- consistent format across the entire banking system
- **Compact** -- 47 characters fit comfortably within Stellar's Manage Data 64-byte limit

This choice eliminates the need for the user to know any technical information. There are no hashes, public keys, or account identifiers. **The boleto itself is the lookup credential.**

| Approach | Lookup key | What the user needs to know | Experience |
|----------|-----------|----------------------------|------------|
| Traditional (hash) | Cryptographic hash of the boleto | Account ID + SHA1 Hash | Complex, technical |
| **Boleto Guardian** | **Barcode number (47 digits)** | **Nothing beyond the boleto itself** | **Simple, intuitive** |

### 3.3 Stellar Manage Data

The Stellar blockchain natively offers the **Manage Data** operation, which allows storing key-value pairs directly on a user's account on the network:

- **Key**: up to 64 bytes -- used to store the boleto's barcode number
- **Value**: up to 64 bytes -- used to store essential metadata (our number, amount, due date, status)

This operation requires no smart contracts, additional languages, or complex infrastructure. It is a native feature of the Stellar protocol, ready to use.

### 3.4 One account per company

In the Boleto Guardian model, each issuing company has **a single account on the Stellar network**. All boletos issued by that company are recorded in this account. The account identifier (Account ID) is public and can be configured once in the API -- the end user never needs to know it.

```
  Company (e.g., DS2U)
  Stellar Account: GABCD...XYZ
  +--------------------------------------------------+
  | Manage Data                                      |
  |                                                  |
  | key: 23793.38128.60000.000003.00000.004001...    |
  | val: 000000040|120.50|20250805|pending           |
  |                                                  |
  | key: 23793.38128.60000.000003.00000.004002...    |
  | val: 000000041|350.00|20250810|pending           |
  |                                                  |
  | key: 23793.38128.60000.000003.00000.004003...    |
  | val: 000000042|89.90|20250815|pending            |
  |                                                  |
  | ... (all company boletos)                        |
  +--------------------------------------------------+
```

### 3.5 Zero-friction validation

The end-user experience is the central point of the solution:

1. The payer receives a boleto (via email, mail, or portal)
2. Accesses the company's validation page (or scans a QR Code)
3. Types the **47 numbers** of the barcode
4. The system queries the Stellar blockchain and displays the original data
5. The payer compares: if the data matches, the boleto is authentic

**If the barcode number does not exist on the blockchain, the boleto was not issued by the company -- it is potentially fraud.**

---

## 4. Conceptual Architecture

### 4.1 Overview

The Boleto Guardian architecture is composed of three layers:

```
+-------------------+       +-------------------+       +-------------------+
|                   |       |                   |       |                   |
|    ERP SYSTEM     |       |  API MIDDLEWARE   |       | STELLAR NETWORK   |
|                   |       |                   |       |                   |
|  Generates        | POST  |  Receives data    | TX   |  Manage Data      |
|  boletos          |------>|  Validates input  |----->|  Immutable record |
|  Sends barcode    |       |  Builds TX        |       |  Public query     |
|  and metadata     |       |  Signs and sends  |       |                   |
+-------------------+       +-------------------+       +-------------------+
                                    ^
                                    |  GET
                            +-------+-------+
                            |               |
                            |   END USER    |
                            | Types barcode |
                            | Validates     |
                            |               |
                            +---------------+
```

### 4.2 The three moments

The lifecycle of a boleto in the Boleto Guardian comprises three distinct moments:

**Moment 1 -- Issuance**

The company's ERP system generates the boleto normally, following its standard billing flow. After issuance, the barcode number and essential metadata are sent to the intermediary API.

**Moment 2 -- Blockchain Registration**

The API receives the data, validates the input, builds a Stellar transaction containing the Manage Data operation (key = barcode number, value = metadata), and submits it to the network. In approximately 5 seconds, the record is confirmed and immutable.

**Moment 3 -- Public Validation**

Anyone, at any time, can query the blockchain using only the boleto's barcode number. The API queries the Stellar network and returns the original data for comparison.

### 4.3 ERP integration

The Boleto Guardian was designed to be **ERP-agnostic**. Communication between the enterprise system and the intermediary API occurs via standard HTTP calls (REST), making integration feasible with any platform that supports web requests.

In this project, we use **TOTVS Protheus** as the reference implementation, given the team's deep knowledge of that ecosystem. However, the same integration can be replicated for Sankhya, Omie, SAP, Oracle, or any other ERP that supports REST calls.

---

## 5. Why Stellar?

### 5.1 Choosing the blockchain

Selecting the blockchain is a critical decision for any system that relies on immutable records. The Boleto Guardian requires a network that is simultaneously fast, affordable, secure, and easy to integrate with. **Stellar** meets all these requirements.

### 5.2 Manage Data: native operation

The most significant differentiator of Stellar for this use case is the **Manage Data** operation. Unlike other blockchains that require creating smart contracts to store data, Stellar offers this functionality **natively in the protocol**:

- No need to write, audit, or maintain smart contracts
- No risks associated with contract vulnerabilities
- The operation is straightforward: set a key and a value on the account

This simplicity drastically reduces the complexity of development, maintenance, and auditing.

### 5.3 Operational cost

Stellar operates with extremely low fees. Each transaction costs approximately **0.00001 XLM** (the network's base fee). Even with fluctuations in XLM price, the cost per registered boleto remains in the order of **fractions of a cent**.

For comparison:

| Blockchain | Cost per transaction | Smart contract required | Confirmation time |
|------------|---------------------|------------------------|------------------|
| **Stellar** | **~0.00001 XLM** | **No** | **~5 seconds** |
| Ethereum | Variable (gas fees) | Yes (Solidity) | ~15 seconds to minutes |
| Bitcoin | Variable (fee market) | N/A (no structured data) | ~10 minutes |
| Hedera | ~$0.0001 | Yes (HCS/HTS) | ~3-5 seconds |

### 5.4 Fast finality

Transactions on Stellar are confirmed in approximately **5 seconds**, with absolute finality. There is no need to wait for multiple confirmations as in proof-of-work blockchains. When the API returns success, the record is already definitive.

### 5.5 Public and decentralized network

Stellar is a public, open, and decentralized network. Anyone can:

- **Query** data recorded in any account, directly through the Stellar Explorer or via the Horizon API
- **Verify** the complete transaction history of an account
- **Audit** records independently, without relying on third parties

This transparency is fundamental to the Boleto Guardian's purpose: creating a trust layer that does not depend on any centralized entity.

### 5.6 Governance

The Stellar network is maintained by the **Stellar Development Foundation (SDF)**, a nonprofit organization dedicated to protocol development and the promotion of global financial inclusion. This governance ensures stability, responsible evolution, and alignment with social impact objectives.

---

## 6. Viability and Scalability

### 6.1 Favorable cost structure

The Boleto Guardian architecture was designed to operate with extremely low unit costs. The combination of minimal Stellar network fees with a lightweight intermediary API results in a cost per registered boleto that is **orders of magnitude lower** than the average loss caused by a single fraud.

This asymmetry between the cost of prevention and the cost of fraud is the economic foundation of the solution: protecting millions of boletos costs a fraction of what is lost to a single successful scam.

### 6.2 XLM reserve

The Stellar network requires a minimum XLM reserve for each Manage Data entry (subentry). This means each registered boleto consumes a small reserve in the company's account. This mechanism ensures the network is not polluted with irrelevant data and creates an economic incentive for responsible use.

At scale, this reserve is manageable and predictable, allowing companies to dimension their costs in advance.

### 6.3 Scalability

Stellar processes thousands of transactions per second with consistent confirmation times of ~5 seconds. For the boleto volume of a typical company -- or even large corporations -- the network offers more than enough capacity.

The intermediary API, in turn, is stateless and horizontally scalable: it can be replicated across multiple instances to handle demand peaks without performance impact.

### 6.4 Addressable market

With **4 billion boletos issued annually** in Brazil and an estimated market growth of **15% per year**, the adoption opportunity is vast. Even conservative penetration represents a significant volume of protected boletos and prevented frauds.

---

## 7. Security, Privacy and Compliance

### 7.1 Immutability

Once recorded on the Stellar blockchain, a Manage Data entry can only be altered by a new transaction signed by the account's private key. This means:

- Records cannot be tampered with by third parties
- Any change generates a new transaction visible in the history
- The original record remains traceable indefinitely

### 7.2 Key protection

The company's Stellar account private key is the only sensitive asset in the system. It must be stored in a secure environment (digital vault, HSM, or Secret Manager) and is **never exposed** to the end user or transmitted over the network by the client (e.g. ERP). The **client never sends the key**: the API uses only the key configured on the server (environment variable or vault). The ERP and other clients send only the barcode and non-sensitive metadata; they do not store or transmit the private key. In deployment and version control, **passwords, tokens, private keys, and signing hashes must never be committed or uploaded**.

The intermediary API is the only layer that accesses the private key to sign transactions, and it must operate in a protected environment with mandatory HTTPS.

### 7.3 No upload of full financial data

The Boleto Guardian does **not** upload or store full financial documents or sensitive financial data. Only the **minimum data required for authenticity verification** is sent to the API and recorded on the blockchain: the barcode (47 digits), nosso número, amount, due date, and status. The system does **not** receive or store: full boleto text, bank account details, customer financial history, or any data beyond what is necessary to prove that a given barcode was issued by the company. This limits exposure and keeps the solution aligned with data minimization and regulatory expectations.

### 7.4 Privacy by Design -- LGPD

The Boleto Guardian was conceived with the **privacy by design** principle:

- **No personal data** is stored on the blockchain
- The barcode number and boleto metadata do not identify the payer
- Sensitive information (name, CPF/CNPJ, address) is **never** recorded on chain
- **No full financial data** is uploaded; only the minimal set for verification (see 7.3)
- The system is compliant with Brazil's General Data Protection Law (LGPD) from its inception

### 7.5 Transparency and audit

Data recorded on the Stellar blockchain is **public by nature**. This means:

- Anyone can audit an account's records via the Stellar Explorer
- Regulatory bodies can verify data integrity independently
- The issuing company can demonstrate transparency with no additional effort
- Independent audits (such as CertiK or similar) can certify the system's security

### 7.6 Production infrastructure

For production environment operation, the Boleto Guardian requires:

| Requirement | Description |
|-------------|-------------|
| **HTTPS** | All communication between ERP, API, and user must be encrypted |
| **Key backup** | Stellar account private key with secure, redundant backup |
| **Monitoring** | Alerts for transaction failures, API unavailability, or anomalous usage |
| **Auditable logs** | Record of all operations for internal traceability |

---

## 8. Adoption Strategy

### 8.1 Multiple channels

Boleto Guardian adoption is designed to occur through complementary channels that maximize market penetration:

**ERP consulting partnerships**

Certified consultancies for platforms such as TOTVS, Sankhya, and Omie have direct access to enterprise client bases. These partnerships enable facilitated integration, qualified technical support, and rapid deployment.

**Native integrations**

Native modules for the leading ERPs on the market, available through each platform's official marketplace. This reduces the adoption barrier and enables simplified installation with automatic updates.

**White-Label model**

The solution can be rebranded by ERPs and fintechs that wish to offer boleto validation under their own brand. This model extends reach without requiring direct commercial effort.

**Direct corporate contracts**

For large companies with significant boleto issuance volumes, direct relationships allow for customizations, differentiated SLAs, and dedicated support.

### 8.2 Network effect

Every company that adopts the Boleto Guardian strengthens the ecosystem. The more boletos are registered and validated, the greater the market's trust in the solution, creating a virtuous cycle of adoption:

```
  More companies adopt
         |
         v
  More boletos registered
         |
         v
  More users validate
         |
         v
  Greater market trust
         |
         v
  More companies adopt ...
```

---

## 9. Future Vision

The Boleto Guardian is the first step of a broader digital trust platform. The same architecture that validates boletos can be extended to other critical documents:

### Next step: Settlement inside the Boleto Guardian environment

The immediate phase ahead is to **carry boleto settlement within the Boleto Guardian ecosystem itself**: align on-chain validation, operations, and payer experience so that **settlement** (payment confirmation and closing the instrument lifecycle) runs inside the product environment, reducing hand-offs between systems and strengthening a single audit trail.

### Security roadmap: HSM-backed signing (including HSM2-class modules)

A **future architecture version** is planned where **Stellar transactions are signed without holding the private key in software on the API server**, using an **HSM** (Hardware Security Module). This includes evaluating integration with certified modules and compliance profiles often associated with **HSM Level 2** (for example, FIPS 140-2 Level 2 or equivalent), reducing private-key exposure and aligning deployment with enterprise and financial security standards.

### Phase 1: National Standard for Boletos

Consolidate position as the reference for bank slip validation in Brazil, with integration in all major ERPs and recognition from companies and consumers as a security seal.

### Phase 2: Electronic Invoices

Apply the same technology for electronic invoice validation (NF-e, NFS-e), combating fiscal document fraud and increasing tax compliance.

### Phase 3: Digital Contracts

Extend validation to digital contracts, creating an immutable record of terms, signatures, and contractual changes, with complete traceability and provable legal validity.

### Phase 4: National Trust Infrastructure

Establish the platform as **Brazil's digital validation layer**, with public APIs for verification of government and private documents, recognized by regulatory bodies.

> *"In 5 years, the Boleto Guardian will be synonymous with digital trust in Brazil, just as the SSL padlock represents security on the web. Each validated document strengthens the trust network, creating a positive viral effect."*

---

## 10. Conclusion

The Brazilian bank slip market handles billions of transactions annually, and boleto fraud represents one of the country's greatest financial security challenges. The absence of a public, immutable, and accessible verification layer between the issuer and the payer creates a trust gap that the Boleto Guardian fills elegantly and efficiently.

By using the **Stellar** blockchain and its native **Manage Data** operation, the solution eliminates the need for complex smart contracts, operates at minimal cost, and provides confirmation in seconds. The choice of the **barcode number as the lookup key** ensures the end user needs no technical knowledge to validate a boleto -- having the document in hand is enough.

The ERP-agnostic architecture, Stellar network scalability, and native LGPD compliance position the Boleto Guardian as a solution ready for national-scale adoption, with potential for expansion to other financial and contractual documents.

**Every validated boleto is a secure boleto. Every secure boleto strengthens trust in the Brazilian financial system.**

---

## 11. References

1. **Stellar Development Foundation** -- Stellar Protocol Documentation. Available at: https://stellar.org/developers
2. **Stellar Horizon API** -- API reference for account and data queries. Available at: https://developers.stellar.org/api
3. **FEBRABAN** -- Data on bank slip volume in Brazil. Brazilian Federation of Banks.
4. **ClearSale** (2024) -- Digital fraud report for Brazil.
5. **Finsiders** (2024) -- Analysis of losses from boleto and PIX fraud.
6. **Central Bank of Brazil** -- Bank slip regulations and payment system.
7. **General Data Protection Law (LGPD)** -- Law No. 13,709/2018. Available at: https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm

---

<div align="center">

**Stellar Boleto Guardian** -- Security, transparency, and trust in every boleto.

**Website:** [boletoguardian.xyz](https://boletoguardian.xyz)

Powered by [Stellar](https://stellar.org/)

*Copyright 2026 Cleverson Silva. Distributed under the MIT license.*

</div>
