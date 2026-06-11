import { useEffect, useRef, useState } from 'react'

type Props = {
    itemHeight: number
    containerHeight: number
    overScan: number
    length: number
}

const useVirtualListV2 = (props: Props) => {
    const { itemHeight, overScan, containerHeight, length } = props

    // Refs
    const containerRef = useRef<HTMLElement | null>(null)

    // States
    const [scrollTop, setScrollTop] = useState(0)

    // Effects
    useEffect(() => {
        if (!containerRef.current) return;

        const container = containerRef.current

        const setScroll = (e: Event) => {
            const target = e.target as HTMLElement;

            setScrollTop(target.scrollTop)
        }

        container.addEventListener('scroll', setScroll)

        return () => container.removeEventListener('scroll', setScroll)
    }, [])

    const scrolledItems = Math.max(0, Math.ceil((scrollTop / itemHeight) - overScan))
    const visibleCount = Math.max(0, Math.ceil(containerHeight / itemHeight))
    const rawEndIndex = Math.ceil(Math.min(length, (scrolledItems + visibleCount + overScan)))
    const rawStartIndex = scrolledItems
    const items = Array.from({ length: rawEndIndex - rawStartIndex }).map((_, i: any) => {
        const index = i + rawStartIndex

        return {
            label: `Item ${index + 1}`,
            position: index * itemHeight,
            id: index,
        }
    })

    console.log({ scrolledItems, items, visibleCount, rawEndIndex, rawStartIndex });


    return {
        visibleCount,
        items,
        containerRef,
    }
}

export default useVirtualListV2