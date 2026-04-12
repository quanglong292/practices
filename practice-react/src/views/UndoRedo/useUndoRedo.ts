/**
 * Undo/Redo sử dụng Doubly Linked List
 *
 * Ý tưởng:
 * - Mỗi lần user thay đổi form → tạo node mới chứa snapshot state
 * - currentPointer trỏ tới trạng thái hiện tại
 * - Undo = di chuyển currentPointer về prev
 * - Redo = di chuyển currentPointer về next
 * - Khi user thay đổi sau khi undo → cắt bỏ nhánh redo (xoá các node sau current)
 *
 *   [state0] ⇄ [state1] ⇄ [state2] ⇄ [state3]
 *                              ↑
 *                        currentPointer
 *
 *   Undo → currentPointer moves to state1
 *   Redo → currentPointer moves to state3
 *   New change after undo → state2.next bị cắt, thêm node mới
 */

import { useCallback, useRef, useState } from "react";

// ---- Kiểu dữ liệu form ----
export interface FormState {
  name: string;
  email: string;
  message: string;
}

export const INITIAL_FORM: FormState = {
  name: "",
  email: "",
  message: "",
};

// ---- Node cho Doubly Linked List ----
class HistoryNode<T> {
  value: T;
  prev: HistoryNode<T> | null = null;
  next: HistoryNode<T> | null = null;

  constructor(value: T) {
    this.value = value;
  }
}

// ---- Doubly Linked List quản lý lịch sử ----
class UndoRedoHistory<T> {
  head: HistoryNode<T> | null = null;
  tail: HistoryNode<T> | null = null;
  current: HistoryNode<T> | null = null;

  constructor(initialValue: T) {
    const startNode = new HistoryNode(initialValue);
    this.head = startNode;
    this.tail = startNode;
    this.current = startNode;
  }

  /**
   * Thêm trạng thái mới vào lịch sử
   * Quan trọng: Nếu đang ở giữa list (đã undo), phải cắt bỏ các node phía sau current
   * trước khi thêm node mới
   *
   * Ví dụ: [A] ⇄ [B] ⇄ [C] ⇄ [D], current = B
   * → pushState(E) → [A] ⇄ [B] ⇄ [E], current = E
   */
  pushState(value: T): void {
    const newNode = new HistoryNode(value);
    if (!this.head || !this.current) {
      this.head = newNode;
      this.current = newNode;
      this.tail = newNode;
    } else if (this.current) {
      this.current.next = newNode;
      newNode.prev = this.current;
      this.current = newNode;
      this.tail = newNode;
    }
  }

  /**
   * Undo - Lùi về trạng thái trước đó
   * @returns Giá trị trạng thái trước đó, hoặc null nếu không thể undo
   */
  undo(): T | null {
    if (this.current && this.current.prev) {
      this.current = this.current.prev;
      return this.current.value;
    }
    return null;
  }

  /**
   * Redo - Tiến tới trạng thái đã undo
   * @returns Giá trị trạng thái tiếp theo, hoặc null nếu không thể redo
   */
  redo(): T | null {
    if (this.current && this.current.next) {
      this.current = this.current.next;

      return this.current.value;
    }
    return null;
  }

  getCurrent(): T | null {
    if (this.current) return this.current.value;
    return null;
  }

  canUndo(): boolean {
    return Boolean(this.current?.prev) || false;
  }

  canRedo(): boolean {
    return Boolean(this.current?.next) || false;
  }

  /** Lấy toàn bộ lịch sử dưới dạng array (để hiển thị debug) */
  getHistory(): { states: T[]; currentIndex: number } {
    let states = [];
    let node = this.head;
    let currentIndex = 0;
    let i = 0;

    while (node) {
      if (node === this.current) currentIndex = i;

      states.push(node.value);
      node = node.next;
      i += 1;
    }

    return { states, currentIndex };
  }
}

// ---- React Hook bọc lại UndoRedoHistory ----
export function useUndoRedo(initialState: FormState) {
  const historyRef = useRef(new UndoRedoHistory(initialState));
  const [formState, setFormState] = useState<FormState>(initialState);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [history, setHistory] = useState<{
    states: FormState[];
    currentIndex: number;
  }>({
    states: [initialState],
    currentIndex: 0,
  });

  const syncState = useCallback(() => {
    const h = historyRef.current;
    const current = h.getCurrent();
    if (current) setFormState(current);
    setCanUndo(h.canUndo());
    setCanRedo(h.canRedo());
    setHistory(h.getHistory());
  }, []);

  const updateField = useCallback(
    (field: keyof FormState, value: string) => {
      const newFormState = {
        ...formState,
        [field]: value,
      };

      historyRef.current.pushState(newFormState);
      syncState();
    },
    [formState, syncState],
  );

  const undo = useCallback(() => {
    historyRef.current.undo();
    syncState();
  }, [syncState]);

  const redo = useCallback(() => {
    historyRef.current.redo();
    syncState();
  }, [syncState]);

  return {
    formState,
    canUndo,
    canRedo,
    history,
    updateField,
    undo,
    redo,
  };
}
