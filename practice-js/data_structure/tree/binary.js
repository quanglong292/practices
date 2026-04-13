class EmployeeNode {
  constructor(salary) {
    this.salary = salary;
    this.left = null; // Những người lương thấp hơn
    this.right = null; // Những người lương cao hơn
  }
}

class SalaryBST {
  constructor() {
    this.root = null;
  }

  insert(salary) {
    const newNode = new EmployeeNode(salary);

    if (this.root === null) {
      this.root = newNode;
      return;
    }

    let current = this.root;
    console.log({ current });

    while (true) {
      if (salary === current.salary) return; // Không lưu trùng lương

      if (salary < current.salary) {
        // Nếu lương mới thấp hơn -> Sang trái
        if (current.left === null) {
          current.left = newNode;
          return;
        }
        current = current.left;
      } else {
        // Nếu lương mới cao hơn -> Sang phải
        if (current.right === null) {
          current.right = newNode;
          return;
        }
        current = current.right;
      }
    }
  }

  search(salary) {
    if (!this.root) return false;

    let current = this.root;
    while (current) {
      if (salary === current.salary) return true; // Tìm thấy rồi!

      // Chặt đôi dữ liệu để tìm:
      if (salary < current.salary) {
        current = current.left; // Lương thấp hơn thì tìm bên trái
      } else {
        current = current.right; // Lương cao hơn thì tìm bên phải
      }
    }
    return false; // Không có ai nhận mức lương này
  }

  getSortedSalaries(node = this.root, result = []) {
    if (node) {
      this.getSortedSalaries(node.left, result); // Đi hết bên trái (thấp nhất)
      result.push(node.salary); // Lấy sếp ở giữa
      this.getSortedSalaries(node.right, result); // Đi sang bên phải (cao hơn)
    }
    console.log({ result });
    
    return result;
  }
}

const bst = new SalaryBST();

// Thêm lương vào hệ thống
bst.insert(5000); // Root
bst.insert(3000);
bst.insert(7000);
bst.insert(2000);
bst.insert(4000);
bst.insert(6000);
bst.insert(8000);

console.log({
  currentTree: bst.root,
});

// 1. Tìm kiếm:
console.log(bst.search(6000)); // true (Tìm cực nhanh, chỉ tốn 3 bước thay vì 7)
console.log(bst.search(9999)); // false

// 2. Xuất danh sách sắp xếp:
console.log(bst.getSortedSalaries());
// Kết quả: [2000, 3000, 4000, 5000, 6000, 7000, 8000]
debugger;
