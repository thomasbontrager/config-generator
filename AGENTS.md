# Agent Architecture

This repository implements an agent mesh architecture that scales from solo dev → team → platform.

## 🧠 Core Philosophy

Instead of one god agent, we build:

- **1 Orchestrator agent** - coordinates and delegates
- **Many narrow, surgical sub-agents** - each with one responsibility

Each agent = one responsibility, one mental model.

This mirrors how real platforms scale.

## 🏗️ Architecture Overview

```
┌─────────────────────────────────┐
│   Config Orchestrator Agent     │
│  (Master Brain & Delegator)     │
└───────────┬─────────────────────┘
            │
            │ Delegates to...
            │
    ┌───────┴───────┐
    │               │
    ▼               ▼
┌─────────┐    ┌─────────┐
│ Docker  │    │Frontend │
│ Agent   │    │ Agent   │
└─────────┘    └─────────┘
    │               │
    ▼               ▼
┌─────────┐    ┌─────────┐
│Backend  │    │ Infra   │
│ Agent   │    │ Agent   │
└─────────┘    └─────────┘
    │               │
    ▼               ▼
┌─────────┐    ┌─────────┐
│ CI/CD   │    │  Env    │
│ Agent   │    │ Agent   │
└─────────┘    └─────────┘
    │               │
    ▼               ▼
┌─────────┐    ┌─────────┐
│Security │    │  Docs   │
│ Agent   │    │ Agent   │
└─────────┘    └─────────┘
    │               │
    ▼               ▼
┌─────────┐    ┌─────────┐
│  Test   │    │Release  │
│ Agent   │    │ Agent   │
└─────────┘    └─────────┘
```

## 📋 Available Agents

### 1. 🎯 Config Orchestrator
**File:** `.github/agents/config-orchestrator.agent.md`

**Role:** Master coordinator that:
- Determines which specialized agent(s) should handle a request
- Ensures outputs follow repository standards
- Prevents duplicated or conflicting boilerplate
- Coordinates multi-step scaffolding flows

**Use when:** You have a complex request that spans multiple domains or you're unsure which agent to use.

---

### 2. 🐳 Docker Agent
**File:** `.github/agents/docker.agent.md`

**Scope:**
- Dockerfile creation and optimization
- docker-compose.yml configuration
- .dockerignore files
- Multi-stage builds
- Dev vs prod containers

**Best Practices:**
- Minimal images preferred
- Multi-stage builds when applicable
- Never bake secrets into images
- Follow repo language/runtime conventions

---

### 3. 🎨 Frontend Agent
**File:** `.github/agents/frontend.agent.md`

**Scope:**
- Vite / Next / Create React App configs
- ESLint, Prettier configuration
- TypeScript configs
- Environment handling
- Build scripts

**Best Practices:**
- Modern defaults
- Optimized for developer experience and fast builds
- No unnecessary UI libraries
- Match existing frontend stack

---

### 4. ⚙️ Backend Agent
**File:** `.github/agents/backend.agent.md`

**Scope:**
- Express / Fastify / NestJS configs
- API structure
- Environment variable loading
- Logging setup
- Health checks

**Best Practices:**
- Production-safe defaults
- Explicit error handling
- No magic globals
- Config over code

---

### 5. ☁️ Infrastructure Agent
**File:** `.github/agents/infra.agent.md`

**Scope:**
- Terraform configurations
- Cloud platform configs (AWS, GCP, Azure)
- Service definitions
- Resource naming conventions

**Best Practices:**
- Idempotent outputs
- Environment-aware
- Secure by default

---

### 6. 🔁 CI/CD Agent
**File:** `.github/agents/ci-cd.agent.md`

**Scope:**
- GitHub Actions workflows
- Build pipelines
- Test automation pipelines
- Release workflows

**Best Practices:**
- Fail fast
- Cache aggressively
- Never expose secrets

---

### 7. 🔐 Environment Agent
**File:** `.github/agents/env.agent.md`

**Scope:**
- .env files and templates
- Environment variable management
- Config validation
- Environment-specific settings

**Best Practices:**
- Never commit secrets
- Provide .env.example templates
- Document all required variables
- Use sensible defaults where possible

---

### 8. 🛡️ Security Agent
**File:** `.github/agents/security.agent.md`

**Scope:**
- Secret handling patterns
- Permission configurations
- Dependency safety checks
- Security headers & policies

**Best Practices:**
- Least privilege always
- No secrets in repo
- Explicit allowlists

---

### 9. 🧪 Test Agent
**File:** `.github/agents/test.agent.md`

**Scope:**
- Test runner configurations
- Coverage configs
- Test environments
- CI test integration

**Best Practices:**
- Fast feedback loops
- Deterministic tests

---

### 10. 📝 Docs Agent
**File:** `.github/agents/docs.agent.md`

**Scope:**
- README files
- Usage documentation
- Setup guides
- Inline config comments

**Best Practices:**
- Minimal but complete
- Examples over theory

---

### 11. 🚀 Release Agent
**File:** `.github/agents/release.agent.md`

**Scope:**
- Semantic versioning
- Changelog generation
- Release automation

**Best Practices:**
- No breaking changes without signaling

---

## 🎯 How to Use

### For Users
1. **Simple requests**: Directly invoke the specific agent you need
2. **Complex requests**: Use the Config Orchestrator to coordinate multiple agents
3. **Unsure which agent**: Start with the Config Orchestrator - it will delegate appropriately

### For Contributors
When adding new configuration capabilities:
1. Identify which agent owns that domain
2. Update that agent's configuration in `.github/agents/`
3. Update this documentation if adding new agent types
4. Keep agents focused - if an agent grows too large, consider splitting it

## 🔥 Why This Architecture?

### Traditional Approach ❌
- One vague agent with unclear scope
- Hallucinated configs
- Inconsistent outputs
- Hard to maintain

### Our Agent Mesh ✅
- Clear separation of concerns
- Intent-based delegation
- Predictable scaffolding
- Enterprise-grade thinking
- Easy to extend and maintain

## 🚀 Future Enhancements

Potential next-level improvements:
- [ ] Add `templates/` folder with each agent owning specific templates
- [ ] Build CLI that selects agents dynamically
- [ ] Agent composition for complex multi-domain tasks
- [ ] Agent versioning and compatibility tracking
- [ ] Template validation and linting

---

**This is how platforms are built, not demos.** 💪
