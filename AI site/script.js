// ======= UTIL: clamp + lerp =======
    const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
    const lerp = (a, b, t) => a + (b - a) * t;

    // ======= THEME TOGGLE =======
    (function(){
      const saved = localStorage.getItem('theme');
      if(saved) document.documentElement.setAttribute('data-theme', saved);
      document.getElementById('themeToggle').addEventListener('click', () => {
        const cur = document.documentElement.getAttribute('data-theme');
        const next = cur === 'light' ? '' : 'light';
        if(next) document.documentElement.setAttribute('data-theme', next); else document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('theme', next);
      });
    })();

    // ======= STARFIELD BACKGROUND (Canvas 2D) =======
    (function(){
      const c = document.getElementById('stars');
      const ctx = c.getContext('2d');
      let w, h, stars;
      const STAR_COUNT = 160;
      function resize(){ w = c.width = innerWidth; h = c.height = innerHeight; stars = Array.from({length: STAR_COUNT}, () => ({ x: Math.random()*w, y: Math.random()*h, z: Math.random()*1 + 0.3, s: Math.random()*2 + 0.5 })); }
      addEventListener('resize', resize); resize();
      function draw(){ ctx.clearRect(0,0,w,h); for(const st of stars){ st.x += (st.z*0.2); if(st.x > w+20) st.x = -20; const a = 0.4 + st.z*0.6; ctx.globalAlpha = a; ctx.beginPath(); ctx.arc(st.x, st.y, st.s*st.z, 0, Math.PI*2); ctx.fillStyle = '#9ddfff'; ctx.fill(); }
        requestAnimationFrame(draw);
      }
      draw();
    })();

    // ======= 3D POINT‑CLOUD ORB (Pure Canvas, No libs) =======
    ;(function(){
      const canvas = document.getElementById('orbCanvas');
      const parent = canvas.parentElement;
      const ctx = canvas.getContext('2d');
      let w, h, dpr;

      function resize(){
        const rect = parent.getBoundingClientRect();
        w = canvas.width = Math.floor(rect.width * (window.devicePixelRatio||1));
        h = canvas.height = Math.floor(rect.height * (window.devicePixelRatio||1));
        dpr = window.devicePixelRatio || 1; ctx.setTransform(1,0,0,1,0,0);
      }
      new ResizeObserver(resize).observe(parent); resize();

      // Generate points on sphere via Fibonacci lattice for nice distribution
      const COUNT = 850;
      const pts = [];
      const PHI = Math.PI * (3 - Math.sqrt(5));
      for(let i=0;i<COUNT;i++){
        const y = 1 - (i / (COUNT - 1)) * 2; // y in [-1,1]
        const radius = Math.sqrt(1 - y*y);
        const theta = PHI * i;
        const x = Math.cos(theta) * radius;
        const z = Math.sin(theta) * radius;
        pts.push({x,y,z});
      }

      let rotX = 0.25, rotY = 0.6; // initial tilt
      let targetX = rotX, targetY = rotY;

      // Mouse controls: gentle orbit
      const panel = document.getElementById('tilt');
      panel.addEventListener('mousemove', (e)=>{
        const r = panel.getBoundingClientRect();
        const nx = (e.clientX - r.left)/r.width - 0.5; // -0.5..0.5
        const ny = (e.clientY - r.top)/r.height - 0.5;
        targetY = nx * 1.2; // yaw
        targetX = -ny * 1.0; // pitch
        // 3D tilt for the card
        const tiltX = clamp(-ny*8, -8, 8);
        const tiltY = clamp(nx*10, -10, 10);
        panel.style.transform = `rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
      });
      panel.addEventListener('mouseleave', ()=>{ targetX=0.25; targetY=0.6; panel.style.transform='rotateX(0deg) rotateY(0deg)'; });

      function project(pt){
        // simple rotation around X and Y axes
        const cx = Math.cos(rotX), sx = Math.sin(rotX), cy = Math.cos(rotY), sy = Math.sin(rotY);
        const y = pt.y * cx - pt.z * sx;
        const z = pt.y * sx + pt.z * cx;
        const x = pt.x * cy + z * sy;
        const z2 = -pt.x * sy + z * cy; // depth
        // perspective projection
        const f = 540; // focal length
        const scale = f / (f - z2*240); // keep within bounds
        return { x: x*180*scale, y: y*180*scale, s: clamp(1.2*scale, 0.4, 4), a: clamp(0.55*scale, 0.08, 0.9) };
      }

      function draw(){
        rotX = lerp(rotX, targetX, 0.04);
        rotY = lerp(rotY, targetY, 0.04);
        ctx.clearRect(0,0,w,h);
        ctx.save(); ctx.translate(w/2, h/2);
        // draw subtle grid lines (lat/long)
        ctx.globalAlpha = 0.06; ctx.strokeStyle = '#9ddfff';
        for(let i=0;i<8;i++){ ctx.beginPath(); ctx.arc(0,0, (i+1)*22, 0, Math.PI*2); ctx.stroke(); }
        ctx.globalAlpha = 1;
        // draw points
        for(const p of pts){
          const q = project(p);
          ctx.globalAlpha = q.a;
          const r = q.s * dpr;
          ctx.beginPath();
          ctx.arc(q.x, q.y, r, 0, Math.PI*2);
          const g = ctx.createRadialGradient(q.x, q.y, 0, q.x, q.y, r*3);
          g.addColorStop(0, '#bff6ff');
          g.addColorStop(1, 'rgba(100, 200, 255, 0)');
          ctx.fillStyle = g;
          ctx.fill();
        }
        ctx.restore();
        requestAnimationFrame(draw);
      }
      draw();
    })();

    // ======= FAKE TERMINAL =======
    ;(function(){
      const el = document.getElementById('term');
      const lines = [
        '$ curl nova.ai -d "prompt=hello"',
        '… initializing graph kernels',
        '… loading tokenizer (32k)',
        '… warmup: ✓',
        'response: "Hi! I\'m Nova — how can I help?"',
      ];
      let i=0, j=0; let out='';
      function type(){
        if(i < lines.length){
          const line = lines[i];
          if(j < line.length){ out += line[j++]; el.textContent = out + '\n'; setTimeout(type, 14); }
          else { out += '\n'; j=0; i++; setTimeout(type, 180); }
        } else {
          setTimeout(()=>{ i=0; j=0; out=''; type(); }, 2200);
        }
      }
      type();
    })();

    // ======= LOCAL CHAT DEMO (No network) =======
    ;(function(){
      const input = document.getElementById('input');
      const send = document.getElementById('send');
      const log = document.getElementById('chatlog');
      const replies = [
        'This is a UI‑only demo — no servers, no API keys. ✨',
        'Try clicking the theme toggle (top right) to switch light/dark.',
        'The orb is a 3D point cloud rendered with plain Canvas 2D.',
        'Cards tilt gently with your mouse. Give them a hover!'
      ];
      function pushBubble(text, who='user'){
        const b = document.createElement('div'); b.className = 'bubble ' + who; b.textContent = text; log.appendChild(b); log.scrollTop = log.scrollHeight;
      }
      function aiType(text){
        const b = document.createElement('div'); b.className = 'bubble ai'; b.textContent = ''; log.appendChild(b);
        let i = 0; (function step(){ if(i < text.length){ b.textContent += text[i++]; log.scrollTop = log.scrollHeight; setTimeout(step, 16); } })();
      }
      function onSend(){
        const v = input.value.trim(); if(!v) return; pushBubble(v, 'user'); input.value='';
        const hint = replies[(Math.random()*replies.length)|0];
        setTimeout(()=> aiType(hint), 220);
      }
      send.addEventListener('click', onSend);
      input.addEventListener('keydown', e=>{ if(e.key==='Enter') onSend(); });
    })();

    // ======= YEAR =======
    document.getElementById('year').textContent = new Date().getFullYear();