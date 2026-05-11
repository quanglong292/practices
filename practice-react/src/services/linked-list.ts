class LinkNode {
  data: any;
  next: any;

  constructor(initialValue: any) {
    this.data = initialValue;
    this.next = null;
  }
}

class List {
  current: any;
  head: any;
  tail: any;

  constructor(initialValue: any) {
    const newNode = new LinkNode(initialValue);
    this.head = newNode || null;
    this.current = newNode || null;
    this.tail = newNode || null;
  }

  public push(value: any) {
    const newNode = new LinkNode(value);

    if (!this.head) {
      this.head = newNode;
      this.current = newNode;
      this.tail = newNode;
    } else {
      this.tail.next = newNode;
      this.tail = newNode;
      this.current = newNode;
    }
  }

  public pop(value: any) {
    let currentNode = this.head;
    let i = 0;

    while (currentNode) {
      if (currentNode.next === null) {
        // This node is next to tail
      }
      currentNode = currentNode.next;
    }
  }
}

const list = new List("hello");

list.push("how");
list.push("r");
list.push("u ?");
