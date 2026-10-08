# INVENTORY MANAGEMENT SYSTEM

a POS & inventory system. yes, it actually works.

backend: node + express + postgres + sequelize
frontend: react + vite + tailwind
auth: jwt. bcrypt. the whole vibe.

##  structure

```
server/   # the brain
client/   # the face
```

##  run it

```bash
# backend
cd server && npm install && npm run dev

# frontend (new terminal)
cd client && npm install && npm run dev
```

backend → `localhost:5000`
frontend → `localhost:5173`

##  who can do what

- **admin** — literally everything
- **inventory manager** — products, stock, reports
- **cashier** — checkout + their own sales. that's it.

##  features that actually matter

- atomic checkout (no negative stock, no partial carts, no chaos)
- server-calculated prices (never trust the client, ever)
- deadlock-safe row locking (sorted by productId, we're not animals)
- role-based dashboards
- store-wide reports for the people in charge

##  how it was built

spec-first with Kiro (Autopilot OFF), manual review at every step.
full prompt log → [`PROMPT_LOG.md`](./PROMPT_LOG.md)

---

built for a capstone. shipped it. 💀
