// 430 - Flatten a multilevel doubbly linked-list - medium

// doubly linked-list + random doubly linked-list child.
// input = head

//  *    this.val = val;
//  *    this.prev = prev;
//  *    this.next = next;
//  *    this.child = child;

const head = {
  val: 1,
  next: {
    val: 2,
    next: {
      val: 3,
      child: {
        // Thằng 3 rẽ nhánh xuống tầng dưới
        val: 7,
        next: {
          val: 8,
          child: {
            // Thằng 8 lại rẽ nhánh xuống tiếp
            val: 11,
            next: { val: 12, next: null, child: null },
            child: null,
          },
          next: {
            val: 9,
            next: { val: 10, next: null, child: null },
            child: null,
          },
        },
        child: null,
      },
      next: {
        val: 4,
        next: {
          val: 5,
          next: { val: 6, next: null, child: null },
          child: null,
        },
        child: null,
      },
    },
    child: null,
  },
  child: null,
};

var flatten = function (head) {
  let built = null;
  let currentNode = null;

  const trav = (node) => {
    if (!node) return;

    if (!built && !currentNode) {
      currentNode = node;
      built = node;
    } else {
      currentNode.next = node;
      built = currentNode;
    }

    if (node?.child) trav(node.child);
    if (node?.next) trav(node.next);
  };

  trav(head);

  return built;
};

const built1 = flatten(head);
console.log({ built1: flatten(head) });
debugger;

var flatten2 = function (head) {
  if (!head) return null;

  // Hàm helper DFS: Trả về node CUỐI CÙNG sau khi đã làm phẳng nhánh đó
  const flattenDFS = (node) => {
    let current = node;
    let last = node; // Dùng để lưu lại node cuối cùng của chuỗi

    while (current) {
      let nextNode = current.next;
      let childNode = current.child;

      if (childNode) {
        // 1. Đệ quy xuống dưới để làm phẳng nhánh con, lấy về node cuối cùng của nhánh đó
        let childTail = flattenDFS(childNode);

        // 2. Chèn nhánh con vào giữa current và nextNode
        current.next = childNode;
        childNode.prev = current;

        if (nextNode) {
          childTail.next = nextNode;
          nextNode.prev = childTail;
        }

        // 3. Xóa liên kết child đi theo yêu cầu đề bài
        current.child = null;

        // 4. Cập nhật lại node cuối cùng tạm thời là đuôi của nhánh con
        last = childTail;
      } else {
        // Nếu không có con, node cuối cùng chính là current hiện tại
        last = current;
      }

      // Tiến lên node tiếp theo (đã được nối dây lại ở trên nếu có child)
      current = nextNode;
    }

    return last; // Trả về node cuối cùng của danh sách hiện tại
  };

  flattenDFS(head);
  return head;
};

// current = 2
// last = 2
// nextNode = 2.next
// childNode = 2.child
// childTail = flattenDFS(2.child)
// 2.next = childNode
// childNode.prev = 2

var flatten3 = function (head) {
  if (!head) return null;

  const flattenDFS = (node) => {
    let current = node;
    let last = node;
    let tempNext = null;

    while (current) {
      let nextNode = current.next;
      let childNode = current.child;

      if (childNode) {
        tempNext = nextNode;
        let childTail = flattenDFS(childNode);

        if (childTail) {
          childTail.prev = current
          current.next = childNode
          tempNext = null;
        }
      } else {
        last = current;
        current = current.next;
      }
    }

    return last;
  }

  flattenDFS(head);

  return head;
}