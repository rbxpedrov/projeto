(function(){
  const stage=document.getElementById('stage'), slides=[...document.querySelectorAll('.slide')];
  const dots=document.getElementById('dots'), prog=document.getElementById('progress');
  let cur=0;

  // escala 16:9 responsiva
  function fit(){
    const v=window.visualViewport, w=v?v.width:innerWidth, H=v?v.height:innerHeight;
    const h=H-(document.fullscreenElement?0:56); // reserva a faixa da barra de navegação
    stage.style.top=h/2+'px';
    stage.style.transform=`translate(-50%,-50%) scale(${Math.min(w/1280,h/720)})`;
  }
  ['resize','orientationchange','fullscreenchange'].forEach(ev=>addEventListener(ev,fit));
  if(window.visualViewport) visualViewport.addEventListener('resize',fit);
  fit();

  // pontinhos
  slides.forEach((_,i)=>{const d=document.createElement('i'); d.onclick=()=>go(i); dots.appendChild(d)});

  // contador animado
  function count(el){
    const to=parseFloat(el.dataset.count), dec=+el.dataset.dec||0, sep=el.dataset.sep, t0=performance.now(), dur=1800;
    (function f(t){
      const p=Math.min((t-t0)/dur,1), e=1-Math.pow(1-p,3), v=to*e;
      let txt=v.toFixed(dec).replace('.',',');
      if(sep) txt=Math.round(v).toString().replace(/\B(?=(\d{3})+(?!\d))/g,'.');
      el.textContent=txt;
      if(p<1) requestAnimationFrame(f);
    })(t0);
  }

  function enter(s){
    s.querySelectorAll('[data-count]').forEach(count);
    s.querySelectorAll('.pillar').forEach(p=>{p.style.height='0'; requestAnimationFrame(()=>requestAnimationFrame(()=>p.style.height=(p.dataset.h*2.4)+'px'))});
    s.querySelectorAll('.ring-fg').forEach(r=>{
      const c=2*Math.PI*50, pct=+r.dataset.pct;
      r.style.strokeDasharray=`0 ${c}`;
      setTimeout(()=>r.style.strokeDasharray=`${c*pct/100} ${c}`,50);
    });
  }

  function go(n){
    n=Math.max(0,Math.min(slides.length-1,n));
    slides[cur].classList.remove('active'); cur=n; slides[cur].classList.add('active');
    [...dots.children].forEach((d,i)=>d.classList.toggle('on',i===cur));
    prog.style.width=((cur+1)/slides.length*100)+'%';
    document.getElementById('prev').disabled=cur===0;
    document.getElementById('next').disabled=cur===slides.length-1;
    enter(slides[cur]);
    location.hash=cur+1;
  }

  document.getElementById('prev').onclick=()=>go(cur-1);
  document.getElementById('next').onclick=()=>go(cur+1);
  document.getElementById('fs').onclick=()=>document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen();
  addEventListener('keydown',e=>{
    if(e.key==='ArrowRight'){e.preventDefault();go(cur+1)}
    else if(e.key==='ArrowLeft'){e.preventDefault();go(cur-1)}
    else if(e.key==='Home')go(0); else if(e.key==='End')go(slides.length-1);
    else if(e.key.toLowerCase()==='f')document.getElementById('fs').click();
  });
  // swipe no celular
  let x0=null; addEventListener('touchstart',e=>x0=e.touches[0].clientX,{passive:true});
  addEventListener('touchend',e=>{if(x0===null)return;const dx=e.changedTouches[0].clientX-x0; if(Math.abs(dx)>50) go(cur+(dx<0?1:-1)); x0=null});

  go((parseInt(location.hash.slice(1))||1)-1);
})();
