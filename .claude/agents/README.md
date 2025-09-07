# Claude Code Agent Directory

This directory contains specialized agents for handling different aspects of the Trip Planner application development and maintenance.

## Agent Directory

### 🧪 [E2E Test Agent](./e2e-test-agent.md)
**Expertise**: Playwright, End-to-End Testing, Issue Diagnosis & Resolution Management  
**Role**: Execute E2E tests, analyze failures, create GitHub issues, delegate to specialists  
**Status**: Active  
**Created**: 2025-09-07

### 🎨 [Frontend/Next.js Specialist](./frontend-nextjs-specialist.md) 
**Expertise**: Next.js, React, TypeScript, Tailwind CSS, UI/UX Issues  
**Role**: Handle frontend component issues, form interactions, styling problems  
**Status**: Active  
**Created**: 2025-09-07 by E2E Test Agent  
**Current Assignment**: Fix create trip flow E2E test timeout

### 🗄️ [Backend/Database Specialist](./backend-database-specialist.md)
**Expertise**: Convex, Database Operations, API Design, Data Seeding  
**Role**: Handle backend functions, database issues, test data management  
**Status**: Active  
**Created**: 2025-09-07 by E2E Test Agent  
**Current Assignment**: Create demo trip seed data for public share page

## Issue Assignment Matrix

| Issue Type | Primary Agent | Backup Agent |
|------------|---------------|--------------|
| UI/Component Issues | Frontend Specialist | E2E Test Agent |
| Form/Interaction Problems | Frontend Specialist | E2E Test Agent |
| Database/API Issues | Backend Specialist | E2E Test Agent |
| E2E Test Failures | E2E Test Agent | - |
| Performance Issues | TBD - Create Performance Specialist | E2E Test Agent |
| Infrastructure Issues | TBD - Create DevOps Specialist | E2E Test Agent |

## Agent Creation Protocol

When a new issue requires specialized expertise not covered by existing agents:

1. **Assessment**: E2E Test Agent identifies the gap
2. **Creation**: New specialist agent is created with:
   - Clear expertise area and responsibilities
   - Relevant documentation and context
   - Tools and access requirements
   - Issue patterns and resolution workflows
3. **Assignment**: First issue is assigned to validate effectiveness
4. **Documentation**: Agent is added to this directory and matrix

## Communication Flow

```
E2E Test Agent
    ├── Identifies issue
    ├── Analyzes root cause  
    ├── Creates GitHub issue
    └── Delegates to appropriate specialist
        ├── Frontend Specialist (UI/Component issues)
        ├── Backend Specialist (API/Database issues)
        └── [Creates new agent if needed]
```

## Success Metrics

### Agent Performance
- **Response Time**: < 2 hours for critical issues
- **Resolution Rate**: > 95% first-attempt success
- **Issue Classification**: > 90% accuracy
- **Delegation Effectiveness**: < 5% reassignment rate

### System Health
- **E2E Test Pass Rate**: > 98%
- **Issue Resolution Time**: < 24 hours average
- **False Positive Rate**: < 2%
- **Agent Coverage**: 100% of issue types covered

## Current Active Issues

### 🔴 High Priority
1. **Create Trip Flow E2E Test Timeout** - Assigned to Frontend Specialist
2. **Public Share Page Missing Demo Data** - Assigned to Backend Specialist

### 🟡 Medium Priority
- TBD (No current medium priority issues)

### 🟢 Low Priority  
- TBD (No current low priority issues)

---

*This directory is maintained by the E2E Test Agent and updated as new specialists are created and issues are resolved.*