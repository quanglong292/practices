import { useState, useEffect, useRef, type CSSProperties } from "react";

interface UseVirtualListOptions {
    itemCount: number;
    itemHeight: number;
    overscan?: number;
}

interface VirtualItem {
    index: number;
    style: CSSProperties;
}

export function useVirtualList(options: UseVirtualListOptions) {
    const { itemCount, itemHeight, overscan = 3 } = options;

    const containerRef = useRef<HTMLDivElement | null>(null);
    const [scrollTop, setScrollTop] = useState(0);
    const [containerHeight, setContainerHeight] = useState(0);

    useEffect(() => {
        const containerElement = containerRef.current;
        const isContainerMounted = containerElement !== null;

        if (!isContainerMounted) {
            return;
        }

        // Set initial size of viewport
        setContainerHeight(containerElement.clientHeight);
        setScrollTop(containerElement.scrollTop);

        const handleScroll = (event: Event) => {
            const scrollTarget = event.currentTarget as HTMLElement;
            setScrollTop(scrollTarget.scrollTop);
        };

        const handleResize = () => {
            setContainerHeight(containerElement.clientHeight);
        };

        containerElement.addEventListener("scroll", handleScroll, { passive: true });

        // Measure size dynamically when container resizes
        const resizeObserver = new ResizeObserver(() => {
            handleResize();
        });
        resizeObserver.observe(containerElement);

        return () => {
            containerElement.removeEventListener("scroll", handleScroll);
            resizeObserver.disconnect();
        };
    }, []);

    // Total height of the scroll spacer runner
    const totalSpacerHeight = itemCount * itemHeight;

    // Calculate rendering indices with semantic name variables
    const scrolledItemCount = Math.floor(scrollTop / itemHeight);
    const visibleItemCount = Math.ceil(containerHeight / itemHeight);

    const rawStartIndex = scrolledItemCount - overscan;
    const boundedStartIndex = Math.max(0, rawStartIndex);

    const rawEndIndex = scrolledItemCount + visibleItemCount + overscan;
    const boundedEndIndex = Math.min(itemCount - 1, rawEndIndex);

    const visibleItems: VirtualItem[] = [];

    for (
        let currentItemIndex = boundedStartIndex;
        currentItemIndex <= boundedEndIndex;
        currentItemIndex++
    ) {
        const itemOffsetTop = currentItemIndex * itemHeight;

        visibleItems.push({
            index: currentItemIndex,
            style: {
                position: "absolute",
                top: itemOffsetTop,
                left: 0,
                width: "100%",
                height: itemHeight,
            },
        });
    }

    console.log({
        totalSpacerHeight,
        scrolledItemCount,
        visibleItemCount,
        rawStartIndex,
        boundedStartIndex,
        rawEndIndex,
        boundedEndIndex,
        visibleItems
    });

    return {
        containerRef,
        visibleItems,
        totalHeight: totalSpacerHeight,
        startIndex: boundedStartIndex,
        endIndex: boundedEndIndex,
        scrollTop,
        containerHeight,
    };
}
