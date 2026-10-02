# Mermaid Dark Theme Color Palette Reference

This document provides a comprehensive color reference for creating dark-theme-first Mermaid diagrams that maintain WCAG AA contrast (≥ 4.5:1 for body text, ≥ 3:1 for large text/borders) against dark IDE and documentation backgrounds (`#0a0e17` to `#1e293b`).

---

## 1. Core Semantic Palettes

### 1.1 Blue / Indigo (Primary, Core Logic, Handlers)
- **Fill**: `#1e3a8a` (Deep Blue 900)
- **Stroke**: `#3b82f6` (Vivid Blue 500)
- **Text**: `#eff6ff` (Light Blue 50)
- **Contrast**: ~8.2:1 against fill
- **Mermaid Snippet**:
  ```mermaid
  classDef bluePrimary fill:#1e3a8a,stroke:#3b82f6,stroke-width:2px,color:#eff6ff;
  ```

### 1.2 Green / Emerald (Success, Mount, Placement, Valid)
- **Fill**: `#064e3b` (Deep Emerald 900)
- **Stroke**: `#10b981` (Vivid Emerald 500)
- **Text**: `#ecfdf5` (Light Mint 50)
- **Contrast**: ~9.1:1 against fill
- **Mermaid Snippet**:
  ```mermaid
  classDef greenSuccess fill:#064e3b,stroke:#10b981,stroke-width:2px,color:#ecfdf5;
  ```

### 1.3 Amber / Yellow (Warning, Pending, In-Progress, Yield)
- **Fill**: `#78350f` (Deep Amber 900)
- **Stroke**: `#f59e0b` (Vivid Amber 500)
- **Text**: `#fef3c7` (Light Amber 100)
- **Contrast**: ~7.8:1 against fill
- **Mermaid Snippet**:
  ```mermaid
  classDef amberWarning fill:#78350f,stroke:#f59e0b,stroke-width:2px,color:#fef3c7;
  ```

### 1.4 Rose / Red (Danger, Deletion, Removal, Error)
- **Fill**: `#881337` (Deep Rose 900)
- **Stroke**: `#f43f5e` (Vivid Rose 500)
- **Text**: `#ffe4e6` (Light Rose 100)
- **Contrast**: ~7.5:1 against fill
- **Mermaid Snippet**:
  ```mermaid
  classDef roseDanger fill:#881337,stroke:#f43f5e,stroke-width:2px,color:#ffe4e6;
  ```

### 1.5 Purple / Violet (Special, Hooks, Transformations)
- **Fill**: `#581c87` (Deep Purple 900)
- **Stroke**: `#a855f7` (Vivid Purple 500)
- **Text**: `#faf5ff` (Light Purple 50)
- **Contrast**: ~8.6:1 against fill
- **Mermaid Snippet**:
  ```mermaid
  classDef purpleAccent fill:#581c87,stroke:#a855f7,stroke-width:2px,color:#faf5ff;
  ```

### 1.6 Slate / Neutral (Containers, Baselines, Data Structures)
- **Fill**: `#1e293b` (Slate 800)
- **Stroke**: `#475569` (Slate 600)
- **Text**: `#f8fafc` (Slate 50)
- **Sub-container Fill**: `#0f172a` (Slate 900)
- **Sub-container Stroke**: `#334155` (Slate 700)
- **Sub-container Text**: `#cbd5e1` (Slate 300)

---

## 2. Line & Connector Styling

Always avoid dark or default unstyled links on dark canvases:

| Element | Recommended Stroke | Stroke Width | Label Text Color |
| :--- | :--- | :--- | :--- |
| **Normal Arrow** | `#94a3b8` | `1.5px` | `#cbd5e1` |
| **Active / Primary Arrow** | `#38bdf8` | `2px` | `#e0f2fe` |
| **Success / Return Arrow** | `#34d399` | `2px` | `#d1fae5` |
| **Failure / Reject Arrow** | `#fb7185` | `2px` | `#ffe4e6` |
| **Dotted / Alternate Link** | `#64748b` | `1.5px` | `#94a3b8` |

### Global Link Style Snippet
```mermaid
linkStyle default stroke:#94a3b8,stroke-width:1.5px;
```
