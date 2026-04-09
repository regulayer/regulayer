"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

/* ─────────────────────────────────────────────────────────────
   GOD-LEVEL SMOOTH SCROLLER
   - Intercepts native scrolling and applies physical mass/damping.
   - Creates the physical "weight" required for Top-Universe agency sites.
   ───────────────────────────────────────────────────────────── */

export function SmoothScroller({ children }: { children: React.ReactNode }) {
    // Use a ref to the scrollable container
    const scrollRef = useRef<HTMLDivElement>(null);
    const [pageHeight, setPageHeight] = useState(0);

    // Resize observer to update the body height so the native scrollbar matches the virtual content
    const resizePageHeight = useCallback((entries: ResizeObserverEntry[]) => {
        for (let entry of entries) {
            setPageHeight(entry.contentRect.height);
        }
    }, []);

    useEffect(() => {
        const resizeObserver = new ResizeObserver((entries) => resizePageHeight(entries));
        scrollRef.current && resizeObserver.observe(scrollRef.current);
        return () => resizeObserver.disconnect();
    }, [scrollRef, resizePageHeight]);

    // Capture native scroll progress
    const { scrollY } = useScroll();
    
    // Apply physical spring physics to the scroll
    const transform = useTransform(scrollY, [0, pageHeight], [0, -pageHeight]);
    const physics = { damping: 15, mass: 0.27, stiffness: 55 }; // Extremely buttery
    const spring = useSpring(transform, physics);

    return (
        <>
            {/* The native body assumes the height of the virtual container */}
            <div style={{ height: pageHeight }} />
            
            {/* The actual content is fixed and physically transformed upwards */}
            <motion.div
                ref={scrollRef}
                style={{ y: spring }}
                className="fixed top-0 left-0 w-full overflow-hidden will-change-transform"
            >
                {children}
            </motion.div>
        </>
    );
}
