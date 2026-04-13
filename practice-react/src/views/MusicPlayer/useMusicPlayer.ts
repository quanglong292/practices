import { useCallback, useRef, useState } from "react";

export interface Song {
    id: string;
    title: string;
    artist: string;
    duration: number; // seconds
    cover: string;
}

class MusicNode<T> {
    value: T;
    next: MusicNode<T> | null = null;
    prev: MusicNode<T> | null = null;

    constructor(value: T) {
        this.value = value;
    }
}

class MusicPlayer<T> {
    head: MusicNode<T> | null = null;
    tail: MusicNode<T> | null = null;
    currentPointer: MusicNode<T> | null = null;

    // Thêm bài hát vào danh sách phát - O(1)
    addSong(song: T): void {
        const newNode = new MusicNode(song);
        if (!this.head) {
            this.head = this.tail = newNode;
            this.currentPointer = newNode; // Tự động chọn bài đầu tiên
            console.log({ head: this.head, tail: this.tail, currentPointer: this.currentPointer });
        } else if (this.tail) {
            this.tail.next = newNode;
            newNode.prev = this.tail; // Nối ngược lại - Đây là điểm khác biệt!
            this.tail = newNode;
            console.log({ head: this.head, tail: this.tail, currentPointer: this.currentPointer });

        }
    }

    // Tiến tới bài tiếp theo - O(1)
    next(): T | null {
        if (this.currentPointer && this.currentPointer.next) {
            this.currentPointer = this.currentPointer.next;
            return this.currentPointer.value;
        }
        return null; // Hết danh sách hoặc không có bài tiếp theo
    }

    // Lùi lại bài trước đó - O(1)
    previous(): T | null {
        if (this.currentPointer && this.currentPointer.prev) {
            this.currentPointer = this.currentPointer.prev;
            return this.currentPointer.value;
        }
        return null; // Đang ở bài đầu tiên, không lùi được
    }

    getCurrentSong(): T | null {
        return this.currentPointer ? this.currentPointer.value : null;
    }

    // Nhảy tới bài đầu tiên - O(1) vì ta giữ con trỏ head
    jumpToFirst(): T | null {
        if (this.head) {
            this.currentPointer = this.head;
            return this.head.value;
        }
        return null;
    }

    // Nhảy tới bài cuối cùng - O(1) vì ta giữ con trỏ tail
    jumpToLast(): T | null {
        if (this.tail) {
            this.currentPointer = this.tail;
            return this.tail.value;
        }
        return null;
    }

    // Sắp xếp danh sách - Bubble Sort trên doubly linked list
    // Swap giá trị giữa các node, giữ nguyên cấu trúc liên kết
    sort(compareFn: (a: T, b: T) => number): void {
        if (!this.head || !this.head.next) return; // 0 hoặc 1 phần tử

        let swapped: boolean;
        do {
            swapped = false;
            let current = this.head;
            while (current && current.next) {
                if (compareFn(current.value, current.next.value) > 0) {
                    // Swap giá trị, không swap node
                    const temp = current.value;
                    current.value = current.next.value;
                    current.next.value = temp;
                    swapped = true;
                }
                current = current.next;
            }
        } while (swapped);
    }

    // Collect all songs into an array for display
    getAllSongs(): T[] {
        const songs: T[] = [];
        let node = this.head;
        while (node) {
            songs.push(node.value);
            node = node.next;
        }
        return songs;
    }

    // Jump to a specific song by index
    jumpTo(index: number): T | null {
        let node = this.head;
        let i = 0;
        while (node) {
            if (i === index) {
                this.currentPointer = node;
                return node.value;
            }
            node = node.next;
            i++;
        }
        return null;
    }

    // Get index of current song
    getCurrentIndex(): number {
        let node = this.head;
        let i = 0;
        while (node) {
            if (node === this.currentPointer) return i;
            node = node.next;
            i++;
        }
        return -1;
    }

    // Xoá bài hát theo index - O(n) tìm node, O(1) xoá
    // Đây là thế mạnh của doubly linked list so với array:
    // - Không cần dịch chuyển phần tử như array
    // - Chỉ cần nối lại prev/next pointers
    deleteSong(index: number): boolean {
        // Bước 1: Tìm node tại vị trí index - O(n)
        let node = this.head;
        let i = 0;
        while (node) {
            if (i === index) break;
            node = node.next;
            i++;
        }
        if (!node) return false; // Không tìm thấy

        // Bước 2: Nếu đang xoá bài đang phát, chuyển pointer
        if (node === this.currentPointer) {
            // Ưu tiên chuyển sang bài tiếp theo, nếu không thì bài trước
            this.currentPointer = node.next ?? node.prev;
        }

        // Bước 3: Nối lại pointers - O(1)
        if (node.prev) {
            node.prev.next = node.next; // Node trước trỏ tới node sau
        } else {
            this.head = node.next; // Xoá head → head mới là node tiếp theo
        }

        if (node.next) {
            node.next.prev = node.prev; // Node sau trỏ ngược về node trước
        } else {
            this.tail = node.prev; // Xoá tail → tail mới là node trước đó
        }

        // Bước 4: Dọn dẹp references của node bị xoá
        node.prev = null;
        node.next = null;

        return true;
    }
}


export function useMusicPlayer() {
    const playerRef = useRef(new MusicPlayer<Song>());
    const [currentSong, setCurrentSong] = useState<Song | null>(null);
    const [playlist, setPlaylist] = useState<Song[]>([]);
    const [currentIndex, setCurrentIndex] = useState(-1);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0); // 0-100
    const syncState = useCallback(() => {
        const player = playerRef.current;
        setCurrentSong(player.getCurrentSong());
        setPlaylist(player.getAllSongs());
        setCurrentIndex(player.getCurrentIndex());
    }, []);

    const addSong = useCallback(
        (song: Song) => {
            playerRef.current.addSong(song);
            syncState();
        },
        [syncState]
    );

    const next = useCallback(() => {
        const result = playerRef.current.next();
        if (result) {
            syncState();
            setProgress(0);
        }
    }, [syncState]);

    const previous = useCallback(() => {
        const result = playerRef.current.previous();
        if (result) {
            syncState();
            setProgress(0);
        }
    }, [syncState]);

    const jumpTo = useCallback(
        (index: number) => {
            const result = playerRef.current.jumpTo(index);
            if (result) {
                syncState();
                setProgress(0);
                setIsPlaying(true);
            }
        },
        [syncState]
    );

    const jumpToFirst = useCallback(() => {
        const result = playerRef.current.jumpToFirst();
        if (result) {
            syncState();
            setProgress(0);
        }
    }, [syncState]);

    const jumpToLast = useCallback(() => {
        const result = playerRef.current.jumpToLast();
        if (result) {
            syncState();
            setProgress(0);
        }
    }, [syncState]);

    const sortPlaylist = useCallback(
        (by: "title" | "artist" | "duration") => {
            const compareFns: Record<string, (a: Song, b: Song) => number> = {
                title: (a, b) => a.title.localeCompare(b.title),
                artist: (a, b) => a.artist.localeCompare(b.artist),
                duration: (a, b) => a.duration - b.duration,
            };
            playerRef.current.sort(compareFns[by]);
            syncState();
        },
        [syncState]
    );

    const deleteSong = useCallback(
        (index: number) => {
            const wasPlaying = isPlaying;
            playerRef.current.deleteSong(index);
            syncState();
            setProgress(0);
            // Nếu playlist rỗng sau khi xoá, dừng phát
            if (!playerRef.current.head) {
                setIsPlaying(false);
            } else if (wasPlaying) {
                setIsPlaying(true);
            }
        },
        [syncState, isPlaying]
    );

    const togglePlay = useCallback(() => {
        if (currentSong) {
            setIsPlaying((prev) => !prev);
        }
    }, [currentSong]);

    const hasNext = playerRef.current.currentPointer?.next !== null && playerRef.current.currentPointer?.next !== undefined;
    const hasPrevious = playerRef.current.currentPointer?.prev !== null && playerRef.current.currentPointer?.prev !== undefined;

    return {
        currentSong,
        playlist,
        currentIndex,
        isPlaying,
        progress,
        setProgress,
        addSong,
        deleteSong,
        next,
        previous,
        jumpTo,
        jumpToFirst,
        jumpToLast,
        sortPlaylist,
        togglePlay,
        hasNext,
        hasPrevious,
    };
}