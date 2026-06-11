import React from 'react'
import useVirtualListV2 from './useVirtualListV2'

type Props = {}

const CONTAINER_HEIGHT = 600
const ITEM_HEIGHT = 100
const length = 1000

const VirtualListV2 = (props: Props) => {
    const { visibleCount, items, containerRef } = useVirtualListV2({
        containerHeight: CONTAINER_HEIGHT,
        itemHeight: ITEM_HEIGHT,
        overScan: 100,
        length: length,
    })

    console.log('rerender', items);


    return (
        <section ref={containerRef} className='relative w-[200px] bg-emerald-400 rounded-md border overflow-auto' style={{
            height: `${CONTAINER_HEIGHT}px`
        }}>
            <div className='absolute top-0 left-0 w-full' style={{
                height: `${length * ITEM_HEIGHT}px`
            }}>
                {items.map((item) => {
                    return <div key={item.id} className='absolute left-0 w-full bg-amber-200 flex justify-center items-center' style={{
                        height: `${ITEM_HEIGHT}px`,
                        top: `${item.position}px`
                    }}>{item.label}</div>
                })}
            </div>
        </section >
    )
}

export default VirtualListV2