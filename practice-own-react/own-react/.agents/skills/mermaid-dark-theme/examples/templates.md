# Mermaid Dark Theme Diagram Templates

Ready-to-use snippets for common diagram types pre-configured for dark theme environments.

---

## 1. Flowchart / Architecture Template

```mermaid
flowchart TD
    %% Global Dark Classes
    classDef default fill:#1e293b,stroke:#475569,stroke-width:1.5px,color:#f8fafc;
    classDef primary fill:#1e3a8a,stroke:#3b82f6,stroke-width:2px,color:#eff6ff;
    classDef success fill:#064e3b,stroke:#10b981,stroke-width:2px,color:#ecfdf5;
    classDef warning fill:#78350f,stroke:#f59e0b,stroke-width:2px,color:#fef3c7;
    classDef danger  fill:#881337,stroke:#f43f5e,stroke-width:2px,color:#ffe4e6;
    classDef neutral fill:#0f172a,stroke:#334155,stroke-width:1.5px,color:#94a3b8;

    subgraph Client ["Client Layer"]
        UserAction["User Click Event"]:::primary
    end

    subgraph Core ["Engine Processing"]
        WorkLoop{"workLoop() Time Remaining?"}:::warning
        PerformWork["performUnitOfWork()"]:::default
        Reconcile["reconcileChildren()"]:::primary
        Commit["commitRoot()"]:::success
    end

    subgraph Output ["Target DOM"]
        RealDOM["document.body"]:::neutral
    end

    UserAction --> WorkLoop
    WorkLoop -->|"Yes (> 1ms)"| PerformWork
    PerformWork --> Reconcile
    WorkLoop -->|"No (Done)"| Commit
    Commit --> RealDOM

    style Client fill:#0f172a,stroke:#334155,stroke-width:1.5px;
    style Core fill:#111827,stroke:#374151,stroke-width:1.5px;
    style Output fill:#0f172a,stroke:#334155,stroke-width:1.5px;
    linkStyle default stroke:#94a3b8,stroke-width:1.5px;
```

---

## 2. Sequence Diagram Template

```mermaid
%%{init: {
  'theme': 'dark',
  'themeVariables': {
    'actorBkg': '#1e293b',
    'actorBorder': '#3b82f6',
    'actorTextColor': '#f8fafc',
    'actorLineColor': '#64748b',
    'signalColor': '#94a3b8',
    'signalTextColor': '#f8fafc',
    'labelBoxBkgColor': '#1e293b',
    'labelBoxBorderColor': '#3b82f6',
    'labelTextColor': '#f8fafc',
    'loopTextColor': '#f8fafc',
    'noteBkgColor': '#0c4a6e',
    'noteBorderColor': '#0284c7',
    'noteTextColor': '#e0f2fe',
    'activationBkgColor': '#1e3a8a',
    'activationBorderColor': '#3b82f6'
  }
}}%%
sequenceDiagram
    autonumber
    actor Caller as Caller
    participant Core as Core Engine
    participant Fiber as Fiber Tree

    Caller->>Core: render(element, container)
    activate Core
    Core->>Fiber: create wipRoot
    Note over Core,Fiber: Alternate linked to currentRoot
    Core-->>Caller: Scheduled via requestIdleCallback
    deactivate Core
```

---

## 3. State Diagram Template

```mermaid
%%{init: {
  'theme': 'dark',
  'themeVariables': {
    'darkMode': true,
    'stateBkg': '#1e293b',
    'stateBorder': '#3b82f6',
    'labelColor': '#f8fafc',
    'compositeTitleBackground': '#0f172a',
    'compositeBackground': '#111827',
    'compositeBorder': '#334155',
    'innerEndBackground': '#f43f5e'
  }
}}%%
stateDiagram-v2
    [*] --> Idle
    Idle --> InProgress: requestIdleCallback
    state InProgress {
        [*] --> PerformUnitOfWork
        PerformUnitOfWork --> ReconcileChildren
        ReconcileChildren --> YieldCheck
        YieldCheck --> PerformUnitOfWork: timeRemaining > 1ms
    }
    InProgress --> CommitPhase: nextUnitOfWork == null
    CommitPhase --> Idle: currentRoot = wipRoot
```
