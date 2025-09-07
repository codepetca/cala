# Project Documentation

Welcome to the Trip Planner project documentation.  
This folder contains the reference material for **what the system means**, **why it’s designed this way**, and **how to extend it safely**.

---

## 📖 Domain

- [Domain Glossary & Business Rules](./domain.md)  
  Defines core entities (User, Workspace, Plan, Item) and their invariants.  
  This is the source of truth for **what** the system models.  

---

## 🏛 Architecture Decisions

- [ADR Index](./ADR/README.md)  
  Contains Architecture Decision Records.  
  Each ADR explains **why** a major choice was made and what trade-offs were accepted.  

Key ADRs:  
- ADR 0001: Architecture Overview  
- ADR 0002: Use Zod for Schema Validation  
- ADR 0003: Use Convex for Realtime Persistence  
- ADR 0004: Unscheduled Event Semantics  
- ADR 0005–0008: Frontend, Styling, Auth, Testing  

---

## ⚙️ Development Guide

- [AI Development Guide](./AI_GUIDE.md)  
  Coding conventions, file structure, naming, testing, and error-handling rules.  
  Defines **how** to implement new features consistently.  

---

## 🧭 How to Navigate

- Start with **Domain Glossary** to learn the business concepts.  
- Read **ADRs** to understand why architecture choices were made.  
- Follow the **AI Development Guide** when adding or changing code.  

---

## Contributing

When making changes:  
1. Update `domain.md` if business rules change.  
2. Create or supersede an ADR if architecture decisions change.  
3. Follow `AI_GUIDE.md` for implementation details.  