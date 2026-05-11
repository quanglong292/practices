class LinkNode {
  constructor(initialValue) {
    this.data = initialValue;
    this.next = null;
  }
}

class List {
  constructor(initialValue) {
    const newNode = new LinkNode(initialValue);
    this.head = newNode || null;
    this.current = newNode || null;
    this.tail = newNode || null;
    this.length = 0;
  }

  push(value) {
    const newNode = new LinkNode(value);

    if (!this.head) {
      this.head = newNode;
      this.current = newNode;
      this.tail = newNode;
    } else {
      this.tail.next = newNode;
      this.tail = newNode;
      this.current = newNode;
      this.length += 1;
    }
  }

  pop() {
    if (!this.head || !this.tail) return;

    let currentNode = this.head;

    while (currentNode) {
      if (currentNode.next.next === null) {
        // Reach the item near tail
        currentNode.next = null;
        this.current = currentNode;
        this.tail = currentNode;
        this.length -= 1;

        if (this.length == 0) {
          this.head = null;
          this.tail = null;
          this.current = null;
        }

        return currentNode;
      }
      currentNode = currentNode.next;
    }
  }

  shift() {
    if (!this.head) return;

    const newHead = this.head.next;
    this.head = newHead;
    this.length -= 1;

    if (this.length == 0) {
      this.head = null;
      this.tail = null;
      this.current = null;
    }

    return this.head;
  }
}

const list = new List("hello");

list.push("how");
list.push("r");
list.push("u ?");
list.pop();
list.pop();
list.pop();
list.pop();
list.pop();
list.push("start");
list.push("1");
list.push("2");
list.shift();
list.shift();
list.shift();

console.log({
  current: list.current,
  head: list.head,
  tail: list.tail,
  length: list.length,
});
debugger;
