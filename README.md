# Popcard — Lead Backend Engineer Assignment

## Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express |
| Database | MongoDB (Mongoose) |
| Queue | BullMQ |
| Cache / Session store | Redis (ioredis) |
| OCR | Google Gemini Vision (`@google/genai`) |
| LLM | Google Gemini 2.5 Flash (`@google/genai`) |
| Validation | Zod |
| Logging | Winston |
| Testing | Jest |

---

## Project Structure

```
src/
├── app.js                                   # Express app factory
├── index.js                                 # Server bootstrap + graceful shutdown
│
├── middleware/
│   ├── auth.middleware.js                   # JWT cookie + Redis two-layer check
│   ├── error.middleware.js                  # Global error + 404 handler
│   └── validate.middleware.js              # Zod schema middleware factory
│
├── utils/
│   ├── database.js                          # Mongoose connection + heartbeat
│   ├── logger.js                            # Winston structured logger
│   ├── redis.js                             # ioredis singleton + connectRedis()
│   └── response.js                          # sendSuccess / sendError helpers
│
├── modules/
│   ├── auth/
│   │   ├── auth.controller.js              # login → set cookie / logout → clear cookie
│   │   ├── auth.repository.js              # Redis token store (save/get/delete)
│   │   ├── auth.routes.js                  # POST /api/auth/login|logout
│   │   ├── auth.schema.zod.js              # Zod LoginSchema (ObjectId validation)
│   │   └── auth.service.js                 # sign JWT + store in Redis with TTL
│   │
│   ├── client/
│   │   ├── client.schema.js                # Client (identity) + ClientEnterprise (loyalty account)
│   │   └── client.repository.js            # findOrCreate, $inc incrementPoints
│   │
│   ├── enterprise/
│   │   ├── enterprise.schema.js            # Enterprise + loyaltyConfig (Mixed discriminated union)
│   │   └── enterprise.repository.js
│   │
│   ├── purchase/
│   │   ├── purchase.calculator.js          # Pure points functions — linear / category / range
│   │   ├── purchase.controller.js          # Ownership check + delegate to service
│   │   ├── purchase.routes.js              # auth → validate → controller
│   │   ├── purchase.schema.zod.js          # Zod CreatePurchaseSchema
│   │   └── purchase.service.js             # fetch config → calculate → enqueue
│   │
│   ├── queue/
│   │   └── points.queue.js                 # BullMQ Queue singleton + defaultJobOptions
│   │
│   └── receipt/
│       ├── receipt.controller.js           # POST /api/receipts/extract
│       ├── receipt.llm.js                  # Gemini 2.5 Flash — raw text → structured JSON
│       ├── receipt.ocr.js                  # Gemini Vision — image → raw text
│       ├── receipt.routes.js               # auth → rate limit → upload → controller
│       ├── receipt.schema.zod.js           # Zod LLMOutputSchema (validates LLM output)
│       ├── receipt.service.js              # OCR → LLM → validate → confidence
│       └── receipt.upload.js               # Multer — memoryStorage, type/size validation
│
├── seeders/
│   └── seed.js                             # 5 enterprises + 5 clients + loyalty accounts
│
├── workers/
│   └── points-award.worker.js              # BullMQ worker — separate process
│
└── __tests__/
    └── purchase.calculator.test.js         # Jest — 20 test cases across all 3 modes
```

---

## Local Setup

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Redis (local or cloud)

### Install

```bash
npm install
cp .env.example .env
# Fill in your values in .env  you use my cloud redis and DB for quick test also  you can use my GEMINI_API_KEY is real
```



```bash
# Terminal 1 — API server
npm run dev

# Terminal 2 — Queue worker (separate process)
npm run dev:worker

# Seed database with test data no need if work with my atlas DB
npm run seed

# Run unit tests
npm test
```
