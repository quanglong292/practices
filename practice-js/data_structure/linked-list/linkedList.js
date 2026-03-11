class TaskNode {
    // data: string;
    // next: TaskNode | null;

    constructor(data) {
        this.data = data;
        this.next = null;
    }
}

const task1 = new TaskNode("Cài đặt Docker");
const task2 = new TaskNode("Cấu hình Firewall");
const task3 = new TaskNode("Triển khai ứng dụng");
const task4 = new TaskNode("Kiểm tra hệ thống");

task1.next = task2;
task2.next = task3;
task3.next = task4;