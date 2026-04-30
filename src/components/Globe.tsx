'use client';

import React, { useEffect, useRef } from 'react';
import styles from '@/styles/components/globe.module.css';

const Globe: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    let W = 0, H = 0, R = 0, cx = 0, cy = 0, dpr = 1;

    // ── Land bounding boxes (lat/lon degrees) ──
    const LAND = [
      {a:25,b:72,c:-168,d:-52},   // North America
      {a:60,b:84,c:-55, d:-18},   // Greenland
      {a:8, b:25,c:-92, d:-77},   // Central America
      {a:-56,b:12,c:-82,d:-34},   // South America
      {a:36,b:71,c:-10, d:40 },   // Europe
      {a:57,b:71,c:5,   d:32 },   // Scandinavia extra
      {a:50,b:61,c:-11, d:2  },   // UK / Ireland
      {a:63,b:67,c:-25, d:-13},   // Iceland
      {a:-35,b:37,c:-18,d:52 },   // Africa
      {a:15,b:42,c:35,  d:62 },   // Middle East
      {a:50,b:78,c:30,  d:180},   // Russia / N Asia
      {a:50,b:78,c:-180,d:-165},  // Russia far east wrap
      {a:8, b:38,c:62,  d:92 },   // South Asia
      {a:-10,b:28,c:92, d:142},   // SE Asia
      {a:18,b:55,c:100, d:145},   // China / E Asia
      {a:30,b:46,c:129, d:146},   // Japan
      {a:34,b:43,c:124, d:132},   // Korea
      {a:-39,b:-11,c:113,d:154},  // Australia
      {a:-47,b:-34,c:166,d:178},  // New Zealand
      {a:-90,b:-65,c:-180,d:180}, // Antarctica
      {a:-9,b:6,  c:95,  d:141},  // Indonesia
      {a:5, b:21, c:117, d:127},  // Philippines
      {a:-26,b:-12,c:43, d:51},   // Madagascar
      {a:10,b:24, c:-85, d:-60},  // Caribbean
      {a:55,b:72, c:-170,d:-130}, // Alaska
    ];

    function isLand(lat: number, lon: number) {
      while(lon > 180) lon -= 360;
      while(lon < -180) lon += 360;
      for (const b of LAND) {
        if(lat>=b.a && lat<=b.b && lon>=b.c && lon<=b.d) return true;
      }
      return false;
    }

    // Pre-build dot list
    const STEP = 5.8;
    const dots: [number, number][] = [];
    for (let lat = -88; lat <= 88; lat += STEP) {
      const n = Math.max(1, Math.round((360 / STEP) * Math.cos(lat * Math.PI / 180)));
      const dln = 360 / n;
      for (let i = 0; i < n; i++) {
        const lon = -180 + i * dln;
        if (isLand(lat, lon)) dots.push([lat, lon]);
      }
    }

    // Cloudflare Edge Nodes - Random arcs representing Global Serverless Traffic
    function MathRandom() { return Math.random(); }
    function mkArcs(n: number) {
      const a = [];
      for(let i=0; i<n; i++){
        const p = dots[Math.floor(MathRandom() * dots.length)];
        const q = dots[Math.floor(MathRandom() * dots.length)];
        // Create longer arcs to simulate global edge traffic
        if (Math.abs(p[0]-q[0]) < 80 && Math.abs(p[1]-q[1]) < 120) {
          a.push({
            p, q, 
            ph: MathRandom() * Math.PI * 2, 
            sp: 0.008 + MathRandom() * 0.015,
            edgeId: Math.floor(MathRandom() * 1000)
          });
        }
      }
      return a;
    }
    const arcs = mkArcs(60); // More arcs for a highly active network

    function resize() {
      if(!canvas) return;
      if(!canvas.parentElement) return;
      dpr = window.devicePixelRatio || 1;
      const size = Math.min(canvas.parentElement.clientWidth, 600);
      W = H = size; 
      cx = cy = size / 2; 
      R = size * 0.45;
      canvas.width = size * dpr; 
      canvas.height = size * dpr;
      canvas.style.width = size + 'px'; 
      canvas.style.height = size + 'px';
      ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize);

    let rot = Math.PI * 0.2, vel = 0, dragging = false, lastX = 0, t = 0;
    let animationFrameId: number;

    // Drag Interaction
    const onMouseDown = (e: MouseEvent) => { dragging = true; lastX = e.clientX; vel = 0; canvas.style.cursor = 'grabbing'; };
    const onMouseMove = (e: MouseEvent) => { if(!dragging) return; vel = (e.clientX - lastX) * 0.004; rot += vel; lastX = e.clientX; };
    const onMouseUp = () => { dragging = false; canvas.style.cursor = 'grab'; };
    const onTouchStart = (e: TouchEvent) => { dragging = true; lastX = e.touches[0].clientX; vel = 0; };
    const onTouchMove = (e: TouchEvent) => { if(!dragging) return; vel = (e.touches[0].clientX - lastX) * 0.004; rot += vel; lastX = e.touches[0].clientX; e.preventDefault(); };
    const onTouchEnd = () => { dragging = false; };
    
    canvas.style.cursor = 'grab';
    canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('touchstart', onTouchStart, { passive: true });
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });
    canvas.addEventListener('touchend', onTouchEnd);

    // lat/lon → screen
    function proj(lat: number, lon: number) {
      const phi = (90 - lat) * Math.PI / 180;
      const theta = (lon * Math.PI / 180) + rot;
      const x = R * Math.sin(phi) * Math.cos(theta);
      const y = R * Math.cos(phi);
      const z = R * Math.sin(phi) * Math.sin(theta);
      return { x: cx + x, y: cy - y, z };
    }

    function draw() {
      if(!ctx) return;
      ctx.clearRect(0,0,W,H);
      t++;
      if (!dragging) { vel *= 0.96; rot += 0.002 + vel; }

      // Clean White Globe Fill with subtle shadow
      const g = ctx.createRadialGradient(cx-R*0.3, cy-R*0.3, R*0.1, cx, cy, R);
      g.addColorStop(0, '#ffffff');
      g.addColorStop(0.8, '#F9FAFB');
      g.addColorStop(1, '#F3F4F6');
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI*2);
      ctx.fillStyle = g;
      ctx.fill();

      // Soft white back-glow
      ctx.shadowColor = 'rgba(0,0,0,0.03)';
      ctx.shadowBlur = 30;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Modern Faint Grid lines
      ctx.save();
      ctx.globalAlpha = 0.4;
      ctx.strokeStyle = '#E5E7EB';
      ctx.lineWidth = 0.5;
      // lon lines
      for (let lo = -180; lo < 180; lo += 30) {
        ctx.beginPath();
        let first = true;
        for (let la = -88; la <= 88; la += 4) {
          const p = proj(la, lo);
          if (p.z < 0) { first = true; continue; }
          first ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y);
          first = false;
        }
        ctx.stroke();
      }
      // lat lines
      for (let la = -60; la <= 60; la += 30) {
        ctx.beginPath();
        let first = true;
        for (let lo = -180; lo <= 180; lo += 3) {
          const p = proj(la, lo);
          if (p.z < 0) { first = true; continue; }
          first ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y);
          first = false;
        }
        ctx.stroke();
      }
      ctx.restore();

      // Cloudflare Orange Edge Traffic Arcs
      for (const arc of arcs) {
        const pa = proj(arc.p[0], arc.p[1]);
        const pb = proj(arc.q[0], arc.q[1]);
        if (pa.z < 0 || pb.z < 0) continue; // Only draw arcs on the front side
        
        // Arc control point for curvature
        const mx = (pa.x + pb.x) / 2 - (pb.y - pa.y) * 0.4;
        const my = (pa.y + pb.y) / 2 + (pb.x - pa.x) * 0.4;
        
        const pulse = 0.2 + 0.8 * Math.sin(t * arc.sp + arc.ph); // High contrast pulse
        if (pulse < 0) continue;
        
        ctx.save();
        ctx.globalAlpha = pulse * 0.7;
        ctx.strokeStyle = '#F97316'; // Cloudflare Orange
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 6]);
        ctx.lineDashOffset = -(t * arc.sp * 25);
        ctx.beginPath();
        ctx.moveTo(pa.x, pa.y);
        ctx.quadraticCurveTo(mx, my, pb.x, pb.y);
        ctx.stroke();
        ctx.restore();
        
        // Endpoint Edge Nodes (pulsing)
        let isSource = true;
        for (const pt of [pa, pb]) {
          ctx.save();
          ctx.globalAlpha = Math.max(0.2, pulse);
          ctx.fillStyle = '#F97316';
          
          // Outer glow for active nodes
          ctx.shadowColor = '#F97316';
          ctx.shadowBlur = 8 * pulse;
          
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 2 + pulse * 1.5, 0, Math.PI*2);
          ctx.fill();
          ctx.restore();
          
          // Literal Worker labels for explicit 'worker' vibes
          if (!isSource && arc.edgeId % 5 === 0 && pulse > 0.6) {
             ctx.save();
             ctx.globalAlpha = (pulse - 0.6) / 0.4; // Fade in label at peak pulse
             ctx.font = '600 10px monospace';
             ctx.fillStyle = '#F97316';
             ctx.fillText(`WK-${arc.edgeId}`, pt.x + 8, pt.y + 4);
             ctx.restore();
          }
          isSource = false;
        }
      }

      // Modern Land dots (Slate gray)
      for(const [lat, lon] of dots) {
        const p = proj(lat, lon);
        if (p.z < 0) continue;
        const depth = (p.z / R + 1) / 2;
        ctx.save();
        ctx.globalAlpha = 0.3 + depth * 0.7;
        ctx.fillStyle = '#9CA3AF'; // Slate gray land dots
        const dr = 1.2 * (0.5 + depth * 0.6);
        ctx.beginPath();
        ctx.arc(p.x, p.y, dr, 0, Math.PI*2);
        ctx.fill();
        ctx.restore();
      }

      // Crisp Outer Ring
      ctx.save();
      ctx.globalAlpha = 0.8;
      ctx.strokeStyle = '#E5E7EB';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI*2);
      ctx.stroke();
      ctx.restore();

      animationFrameId = requestAnimationFrame(draw);
    }
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      canvas?.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      canvas?.removeEventListener('touchstart', onTouchStart);
      canvas?.removeEventListener('touchmove', onTouchMove);
      canvas?.removeEventListener('touchend', onTouchEnd);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className={styles.globeWrapper}>
      <canvas ref={canvasRef} className={styles.canvas} />
      {/* 
        Optional crisp white vignette instead of muddy gradients.
        Removed dynamic vignette block to prefer the clean canvas edge. 
      */}
    </div>
  );
};

export default Globe;
