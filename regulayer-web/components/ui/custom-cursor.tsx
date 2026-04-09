"use client";

import React, { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

/* ─────────────────────────────────────────────────────────────
   CUSTOM MAGNETIC CURSOR (APEX AGENCY EXECUTION)
   - Replaces the generic OS cursor with a physically simulated ring.
   - Snaps to clickable elements (magnetic effect).
   - Core requirement for high-end WebGL/Canvas SaaS.
   ───────────────────────────────────────────────────────────── */

export function CustomCursor() {
    const [isVisible, setIsVisible] = useState(false);
    const [isHovering, setIsHovering] = useState(false);
    
    // Core physical vectors
    const cursorX = useMotionValue(-100);
    const cursorY = useMotionValue(-100);

    // Damped springs for fluid following (like standard high-end agencies)
    const springConfig = { damping: 25, stiffness: 200, mass: 0.5 };
    const cursorXSpring = useSpring(cursorX, springConfig);
    const cursorYSpring = useSpring(cursorY, springConfig);

    useEffect(() => {
        const moveCursor = (e: MouseEvent) => {
            cursorX.set(e.clientX - 16);
            cursorY.set(e.clientY - 16);
        };

        const handleMouseEnter = () => setIsVisible(true);
        const handleMouseLeave = () => setIsVisible(false);

        // Magnetic detection for 'a' and 'button'
        const handleLinkHover = () => setIsHovering(true);
        const handleLinkLeave = () => setIsHovering(false);

        window.addEventListener("mousemove", moveCursor);
        document.addEventListener("mouseenter", handleMouseEnter);
        document.addEventListener("mouseleave", handleMouseLeave);

        const interactiveElements = document.querySelectorAll('a, button, [role="button"]');
        interactiveElements.forEach(el => {
            el.addEventListener("mouseenter", handleLinkHover);
            el.addEventListener("mouseleave", handleLinkLeave);
        });

        setIsVisible(true);

        return () => {
            window.removeEventListener("mousemove", moveCursor);
            document.removeEventListener("mouseenter", handleMouseEnter);
            document.removeEventListener("mouseleave", handleMouseLeave);
            interactiveElements.forEach(el => {
                el.removeEventListener("mouseenter", handleLinkHover);
                el.removeEventListener("mouseleave", handleLinkLeave);
            });
        };
    }, [cursorX, cursorY]);

    return (
        <motion.div
            className="fixed top-0 left-0 z-[99999] pointer-events-none mix-blend-difference hidden md:block"
            style={{ x: cursorXSpring, y: cursorYSpring, opacity: isVisible ? 1 : 0 }}
        >
            <motion.div 
                className="w-8 h-8 border border-white rounded-full flex items-center justify-center"
                animate={{ 
                    scale: isHovering ? 1.5 : 1,
                    backgroundColor: isHovering ? "rgba(255,255,255,1)" : "rgba(255,255,255,0)",
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
                <motion.div 
                    className="w-1 h-1 bg-white rounded-full" 
                    animate={{ scale: isHovering ? 0 : 1 }} 
                />
            </motion.div>
        </motion.div>
    );
}
