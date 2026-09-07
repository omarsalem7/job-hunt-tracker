import { useEffect, useState } from 'react'

export function useCommandPalette() {
    const [isOpen, setIsOpen] = useState(false)

    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault()
                setIsOpen((prev) => !prev)
            }
            if (e.key === 'Escape') setIsOpen(false)
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [])

    return { isOpen, open: () => setIsOpen(true), close: () => setIsOpen(false) }
}