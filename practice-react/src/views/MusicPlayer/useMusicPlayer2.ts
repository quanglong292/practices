class MusicNode<T> {
    value: T;
    next: MusicNode<T> | null = null;
    prev: MusicNode<T> | null = null;

    constructor(song: T) {
        this.prev = null
        this.value = song
        this.next = null
    }
}

class MusicPlayer<T> {
    head: MusicNode<T> | null = null;
    tail: MusicNode<T> | null = null;
    currentPointer: MusicNode<T> | null = null;

    addSong(song: T) {
        const newSong = new MusicNode(song)

        // Initial case
        if (!this.head) {
            this.head = newSong
            this.tail = newSong
            this.currentPointer = newSong
        }

        // Continous case
        if (this.tail) {
            this.tail.next = newSong
            newSong.prev = this.tail
            this.tail = newSong
        }
    }

    next() {
        if (this.currentPointer && this.currentPointer.next) {
            this.currentPointer = this.currentPointer.next
            return this.currentPointer;
        }

        return null
    }

    prev() {
        if (this.currentPointer && this.currentPointer.prev) {
            this.currentPointer = this.currentPointer.prev
            return this.currentPointer;
        }

        return null
    }

    delete(index: number) {
        let theSong = this.head;
        let i = 0;

        while (theSong) {
            if (i === index) break
            theSong = theSong.next;
            i++
        }

        if (!theSong) return null;

        // Bước 2: Nếu đang xoá bài đang phát, chuyển pointer
        if (theSong === this.currentPointer) {
            // Ưu tiên chuyển sang bài tiếp theo, nếu không thì bài trước
            this.currentPointer = theSong.next ?? theSong.prev;
        }

        // Bước 3: Nối lại pointers - O(1)
        if (theSong.prev) {
            theSong.prev.next = theSong.next; // theSong trước trỏ tới theSong sau
        } else {
            this.head = theSong.next; // Xoá head → head mới là theSong tiếp theo
        }

        if (theSong.next) {
            theSong.next.prev = theSong.prev; // theSong sau trỏ ngược về theSong trước
        } else {
            this.tail = theSong.prev; // Xoá tail → tail mới là theSong trước đó
        }

        // Bước 4: Dọn dẹp references của theSong bị xoá
        theSong.prev = null;
        theSong.next = null;

        return true;
    }
}