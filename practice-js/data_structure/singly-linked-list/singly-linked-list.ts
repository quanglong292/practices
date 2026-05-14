type NodeType = string;

class LinkNode {
  val: any;
  next: any;

  constructor(val: any) {
    this.val = val;
    this.next = null;
  }
}

let firsNode = new LinkNode("Hi");

firsNode.next = new LinkNode("there");
firsNode.next.next = new LinkNode("there");
firsNode.next.next.next = new LinkNode("there");

console.log({ firsNode });

class LinkedList<T> {
  head: T | null;
  tail: T | null;
  current: T | null;

  constructor(initialValue: T) {
    const newNode = new LinkNode(initialValue) as any;
    this.head = newNode;
    this.tail = newNode;
    this.current = newNode;
  }

  public push(value: T) {
    const newNode = new LinkNode(value) as any;

    if (!this.head) {
      this.head = newNode;
      this.current = newNode;
      this.tail = newNode;
    } else if (this.current && this.current.next) {
      this.current.next = newNode;
      this.current = newNode;
      this.tail = newNode;
    }
  }

  public getCurrent() {
    return this.current;
  }

  public getHead() {
    return this.head;
  }
}

const list = new LinkedList<NodeType>("hi");

list.push("how");
list.push("are");
list.push("u");

console.log({ current: list.getCurrent(), head: list.getHead() });

debugger;
