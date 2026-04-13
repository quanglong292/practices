const companyTree = {
  name: "CEO - Long",
  salary: 50000, // Level 0
  subordinates: [
    {
      name: "Director Tech",
      salary: 30000, // Level 1
      subordinates: [
        {
          name: "Manager Frontend",
          salary: 20000, // Level 2
          subordinates: [
            {
              name: "Lead React",
              salary: 15000, // Level 3
              subordinates: [
                { name: "Junior Dev 1", salary: 8000, subordinates: [] }, // Level 4
                { name: "Junior Dev 2", salary: 8500, subordinates: [] }, // Level 4
              ],
            },
          ],
        },
        {
          name: "Manager Backend",
          salary: 21000, // Level 2
          subordinates: [],
        },
      ],
    },
    {
      name: "Director HR",
      salary: 25000, // Level 1
      subordinates: [
        {
          name: "Manager Recruitment",
          salary: 18000, // Level 2
          subordinates: [
            { name: "Sourcing Lead", salary: 12000, subordinates: [] }, // Level 3
          ],
        },
      ],
    },
  ],
};

function calculateSalaryByLevel(root) {
  // 1. Khởi tạo mảng kết quả (Chứa tổng lương từng level)
  const result = [];

  // 2. Khởi tạo Queue (Hàng chờ)
  // Mỗi phần tử gồm: node nhân viên và level của họ
  const queue = [{ node: root, level: 0 }];

  // 3. Vòng lặp "Quét" sạch hàng chờ
  while (queue.length > 0) {
    // Lấy người đầu hàng ra (FIFO - First In First Out)
    const { node, level } = queue.shift();

    // Nếu level này chưa có trong mảng result, khởi tạo nó là 0
    if (result[level] === undefined) {
      result[level] = 0;
    }

    // Cộng lương của nhân viên này vào đúng level của họ
    result[level] += node.salary;

    // Đẩy tất cả cấp dưới vào cuối hàng chờ để xử lý sau
    for (const sub of node.subordinates) {
      queue.push({ node: sub, level: level + 1 });
    }

    console.log({ queue });
  }

  return result;
}

// Chạy thử với dữ liệu mẫu
const salaries = calculateSalaryByLevel(companyTree);
console.log("Tổng lương theo từng cấp bậc:", salaries);
