"use client";

import React, { useRef, useEffect, useCallback } from "react";

interface Node {
    x: number; y: number;
    vx: number; vy: number;
    radius: number;
    sealed: boolean;
    phase: number;
    orbit: number;
    label: string;
    color: string;
}

interface TrustNetworkProps {
    className?: string;
    nodeCount?: number;
    interactive?: boolean;
}

/**
 * Interactive Trust Chain — Dramatic Edition
 * 
 * Glowing nodes = sealed decisions.
 * Luminous connections = hash chain links.
 * Cursor-reactive with teal/blue/purple aurora glow trails.
 */
export function TrustNetwork({ className = "", nodeCount = 55, interactive = true }: TrustNetworkProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mouseRef = useRef({ x: -1000, y: -1000 });
    const nodesRef = useRef<Node[]>([]);
    const animRef = useRef<number>(0);
    const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;

    const COLORS = ["#00D4AA", "#4B6FFF", "#A855F7", "#2EE8B6", "#7C3AED"];

    const init = useCallback((w: number, h: number) => {
        const labels = ["dec_", "gov_", "seal_", "hash_", "pol_", "aud_", "sig_", "worm_"];
        const nodes: Node[] = [];
        for (let i = 0; i < nodeCount; i++) {
            nodes.push({
                x: Math.random() * w,
                y: Math.random() * h,
                vx: (Math.random() - 0.5) * 0.4,
                vy: (Math.random() - 0.5) * 0.4,
                radius: 1.5 + Math.random() * 2.5,
                sealed: Math.random() > 0.2,
                phase: Math.random() * Math.PI * 2,
                orbit: 0.3 + Math.random() * 0.7,
                label: labels[Math.floor(Math.random() * labels.length)] + Math.random().toString(16).slice(2, 6),
                color: COLORS[Math.floor(Math.random() * COLORS.length)],
            });
        }
        nodesRef.current = nodes;
    }, [nodeCount]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const resize = () => {
            const rect = canvas.getBoundingClientRect();
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            ctx.scale(dpr, dpr);
            if (nodesRef.current.length === 0) init(rect.width, rect.height);
        };
        resize();
        window.addEventListener("resize", resize);

        const handleMouse = (e: MouseEvent) => {
            if (!interactive) return;
            const rect = canvas.getBoundingClientRect();
            mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
        };
        const handleLeave = () => { mouseRef.current = { x: -1000, y: -1000 }; };
        canvas.addEventListener("mousemove", handleMouse);
        canvas.addEventListener("mouseleave", handleLeave);

        const CONN_DIST = 140;
        const MOUSE_DIST = 200;

        const draw = () => {
            const rect = canvas.getBoundingClientRect();
            const W = rect.width, H = rect.height;
            ctx.clearRect(0, 0, W, H);
            const nodes = nodesRef.current;
            const mx = mouseRef.current.x, my = mouseRef.current.y;
            const time = Date.now() * 0.001;

            // Update
            for (const n of nodes) {
                n.x += n.vx;
                n.y += n.vy;
                if (n.x < 0 || n.x > W) n.vx *= -1;
                if (n.y < 0 || n.y > H) n.vy *= -1;
                n.x = Math.max(0, Math.min(W, n.x));
                n.y = Math.max(0, Math.min(H, n.y));

                // Orbital drift
                n.vx += Math.sin(time * n.orbit + n.phase) * 0.003;
                n.vy += Math.cos(time * n.orbit + n.phase) * 0.003;

                // Mouse attraction
                if (interactive) {
                    const dx = mx - n.x, dy = my - n.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < MOUSE_DIST && dist > 10) {
                        n.vx += (dx / dist) * 0.02;
                        n.vy += (dy / dist) * 0.02;
                    }
                }
                n.vx *= 0.992;
                n.vy *= 0.992;
            }

            // Draw connections — glowing
            for (let i = 0; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                    const dx = nodes[j].x - nodes[i].x;
                    const dy = nodes[j].y - nodes[i].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < CONN_DIST) {
                        const alpha = (1 - dist / CONN_DIST);
                        const midX = (nodes[i].x + nodes[j].x) / 2;
                        const midY = (nodes[i].y + nodes[j].y) / 2;
                        const mouseDist = Math.sqrt((mx - midX) ** 2 + (my - midY) ** 2);
                        const near = mouseDist < MOUSE_DIST;

                        const gradient = ctx.createLinearGradient(nodes[i].x, nodes[i].y, nodes[j].x, nodes[j].y);
                        if (near) {
                            gradient.addColorStop(0, `${nodes[i].color}${Math.round(alpha * 180).toString(16).padStart(2, '0')}`);
                            gradient.addColorStop(1, `${nodes[j].color}${Math.round(alpha * 180).toString(16).padStart(2, '0')}`);
                        } else {
                            const a = Math.round(alpha * 30).toString(16).padStart(2, '0');
                            gradient.addColorStop(0, `${nodes[i].color}${a}`);
                            gradient.addColorStop(1, `${nodes[j].color}${a}`);
                        }
                        ctx.beginPath();
                        ctx.moveTo(nodes[i].x, nodes[i].y);
                        ctx.lineTo(nodes[j].x, nodes[j].y);
                        ctx.strokeStyle = gradient;
                        ctx.lineWidth = near ? 1.5 : 0.5;
                        ctx.stroke();
                    }
                }
            }

            // Draw nodes — glowing orbs
            for (const n of nodes) {
                const mouseDist = Math.sqrt((mx - n.x) ** 2 + (my - n.y) ** 2);
                const isNear = mouseDist < MOUSE_DIST;
                const pulse = Math.sin(time * 2 + n.phase) * 0.4 + 0.6;
                const r = n.radius * (isNear ? 2 : 1);

                // Outer glow
                if (n.sealed) {
                    const glowR = isNear ? r * 10 : r * 5;
                    const gradient = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, glowR);
                    const glowAlpha = isNear ? 0.25 : 0.06 * pulse;
                    gradient.addColorStop(0, n.color + Math.round(glowAlpha * 255).toString(16).padStart(2, '0'));
                    gradient.addColorStop(1, n.color + '00');
                    ctx.fillStyle = gradient;
                    ctx.beginPath();
                    ctx.arc(n.x, n.y, glowR, 0, Math.PI * 2);
                    ctx.fill();
                }

                // Core
                ctx.beginPath();
                ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
                const coreAlpha = isNear ? 1 : (n.sealed ? 0.6 * pulse : 0.2 * pulse);
                ctx.fillStyle = n.color + Math.round(coreAlpha * 255).toString(16).padStart(2, '0');
                ctx.fill();

                // Label
                if (isNear && mouseDist < 80) {
                    ctx.font = "10px 'JetBrains Mono', monospace";
                    ctx.fillStyle = n.color + 'AA';
                    ctx.textAlign = "center";
                    ctx.fillText(n.label, n.x, n.y - r - 8);
                }
            }

            animRef.current = requestAnimationFrame(draw);
        };
        draw();

        return () => {
            cancelAnimationFrame(animRef.current);
            window.removeEventListener("resize", resize);
            canvas.removeEventListener("mousemove", handleMouse);
            canvas.removeEventListener("mouseleave", handleLeave);
        };
    }, [init, interactive, dpr]);

    return <canvas ref={canvasRef} className={`w-full h-full ${className}`} style={{ display: "block" }} />;
}
