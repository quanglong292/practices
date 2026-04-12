import "./UndoRedoForm.css";
import { INITIAL_FORM, useUndoRedo } from "./useUndoRedo";

export default function UndoRedoForm() {
    const { formState, canUndo, canRedo, history, updateField, undo, redo } =
        useUndoRedo(INITIAL_FORM);

    return (
        <div className="ur-root">
            <div className="ur-container">
                {/* ── Header ── */}
                <div className="ur-header">
                    <h1 className="ur-title">Undo / Redo Form</h1>
                    <p className="ur-subtitle">
                        Doubly Linked List — mỗi thay đổi tạo 1 node mới
                    </p>
                </div>

                <div className="ur-content">
                    {/* ── Form ── */}
                    <div className="ur-form-section">
                        <div className="ur-field">
                            <label htmlFor="field-name" className="ur-label">
                                Name
                            </label>
                            <input
                                id="field-name"
                                className="ur-input"
                                type="text"
                                value={formState.name}
                                onChange={(e) => updateField("name", e.target.value)}
                                placeholder="Enter your name"
                            />
                        </div>

                        <div className="ur-field">
                            <label htmlFor="field-email" className="ur-label">
                                Email
                            </label>
                            <input
                                id="field-email"
                                className="ur-input"
                                type="email"
                                value={formState.email}
                                onChange={(e) => updateField("email", e.target.value)}
                                placeholder="Enter your email"
                            />
                        </div>

                        <div className="ur-field">
                            <label htmlFor="field-message" className="ur-label">
                                Message
                            </label>
                            <textarea
                                id="field-message"
                                className="ur-input ur-textarea"
                                value={formState.message}
                                onChange={(e) => updateField("message", e.target.value)}
                                placeholder="Write something..."
                                rows={4}
                            />
                        </div>

                        {/* ── Undo / Redo buttons ── */}
                        <div className="ur-actions">
                            <button
                                id="btn-undo"
                                className="ur-btn"
                                onClick={undo}
                                disabled={!canUndo}
                            >
                                ↩ Undo
                            </button>
                            <button
                                id="btn-redo"
                                className="ur-btn"
                                onClick={redo}
                                disabled={!canRedo}
                            >
                                Redo ↪
                            </button>
                        </div>
                    </div>

                    {/* ── History timeline (debug view) ── */}
                    <div className="ur-history-section">
                        <h3 className="ur-history-title">History (Linked List)</h3>
                        <div className="ur-timeline">
                            {history.states.map((state, i) => (
                                <div
                                    key={i}
                                    className={`ur-node ${
                                        i === history.currentIndex ? "ur-node-active" : ""
                                    } ${i > history.currentIndex ? "ur-node-redo" : ""}`}
                                >
                                    <div className="ur-node-dot" />
                                    {i < history.states.length - 1 && (
                                        <div className="ur-node-line" />
                                    )}
                                    <div className="ur-node-content">
                                        <span className="ur-node-index">
                                            {i === history.currentIndex
                                                ? "→ current"
                                                : `#${i}`}
                                        </span>
                                        <span className="ur-node-data">
                                            {state.name || "—"} · {state.email || "—"}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {history.states.length === 0 && (
                            <p className="ur-empty">No history yet</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}