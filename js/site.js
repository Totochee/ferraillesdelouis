/* Ferrailles de Louis — script commun à l'accueil et à la page Créations.
   Les œuvres sont dans js/oeuvres.js (variable OEUVRES). */
(function(){
  const $=id=>document.getElementById(id);
  const RUBRIQUES=[...new Set(OEUVRES.map(o=>o.cat))];
  const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const src=(i,s)=>'img/oeuvres/'+i+'-'+s+'.jpg';
  const slugify=s=>s.normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/&/g,' ').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  const normTxt=s=>s.normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase();
  const reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;
  const byslug=Object.fromEntries(OEUVRES.map(o=>[o.slug,o]));
  const ARROW={p:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6l-6 6 6 6"/></svg>',n:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>'};
  const IS_CREATIONS=document.body.dataset.page==='creations';

  function cardHTML(o,big){
    const n=o.photos.length,i=o.photos[0];
    return '<article class="card'+(big?' big':'')+'" id="'+o.slug+'" data-slug="'+o.slug+'" data-name="'+esc(o.nom)+'" data-cat="'+esc(o.cat)+'">'+
      '<div class="card-img" data-k="0"><img src="'+src(i,640)+'" srcset="'+src(i,640)+' 640w, '+src(i,1280)+' 1280w" sizes="'+(big?'(max-width:600px) 95vw, 640px':'(max-width:600px) 48vw, 320px')+'" alt="'+esc(o.nom)+', fer forgé" loading="lazy">'+
      '<span class="status">Disponible</span>'+
      (n>1?'<span class="count-ph">'+n+' photos</span><button class="cnav p" type="button" data-step="-1" aria-label="Photo précédente">'+ARROW.p+'</button><button class="cnav n" type="button" data-step="1" aria-label="Photo suivante">'+ARROW.n+'</button>':'')+
      '<div class="piece-info"><h3>'+esc(o.nom)+'</h3><p>'+esc(o.cat)+'</p><div class="piece-actions"><button class="pill reserve-btn" type="button">Réserver</button><button class="pill ghost see" type="button">Voir en grand</button></div></div>'+
      '</div></article>';
  }
  const surMesure='<article class="card sur-mesure" data-cat="*"><h3>Une idée en tête ?</h3><p>Une forme, un croquis, une dimension précise : Louis la forge pour vous.</p><a class="pill" href="index.html#contact">Commander sur mesure ↗</a></article>';

  /* ---------- Univers (rubriques) ---------- */
  const univEl=$('univers');
  if(univEl){
    univEl.innerHTML=RUBRIQUES.map(r=>{const L=OEUVRES.filter(o=>o.cat===r);const cover=(L.find(o=>o.avant)||L[0]).photos[0];
      const inner='<img src="'+src(cover,640)+'" alt="" loading="lazy"><span><b>'+esc(r)+'</b><i>'+L.length+' pièce'+(L.length>1?'s':'')+'</i></span>';
      return IS_CREATIONS?'<button class="univ" type="button" data-cat="'+esc(r)+'" aria-pressed="false">'+inner+'</button>':'<a class="univ" href="creations.html#'+slugify(r)+'">'+inner+'</a>'}).join('');
  }
  if($('nbPieces'))$('nbPieces').textContent=OEUVRES.length;
  const thumbs=$('ctaThumbs');
  if(thumbs){const pick=OEUVRES.filter(o=>!o.avant);const step=Math.max(1,Math.floor(pick.length/6));thumbs.innerHTML=[0,1,2,3,4,5].map(k=>pick[k*step]).filter(Boolean).map(o=>'<img src="'+src(o.photos[0],640)+'" alt="" loading="lazy">').join('')}
  document.querySelectorAll('[data-nb]').forEach(e=>e.textContent=OEUVRES.length);

  /* ---------- Galerie ---------- */
  const cardsEl=$('cards');
  let applyFilters=()=>{},query='';
  if(cardsEl){
    if(IS_CREATIONS){
      cardsEl.innerHTML=OEUVRES.map(o=>cardHTML(o,o.avant)).join('')+surMesure;
      const PAGE=24;let cat='Toutes',limit=PAGE;
      const moreBtn=$('moreBtn'),noResultEl=$('noResult'),galTitle=$('galTitle'),showAll=$('showAll');
      applyFilters=()=>{
        let match=0;
        cardsEl.querySelectorAll('.card').forEach(c=>{
          if(c.dataset.cat==='*'){c.classList.toggle('hidden',!!query);return}
          const ok=(cat==='Toutes'||c.dataset.cat===cat)&&(!query||normTxt(c.dataset.name+' '+c.dataset.cat).includes(query));
          if(ok)match++;
          c.classList.toggle('hidden',!(ok&&(query||match<=limit)));
        });
        const rest=match-limit;
        moreBtn.parentElement.hidden=!!query||rest<=0;
        moreBtn.textContent=rest>1?'Voir les '+rest+' autres pièces':'Voir la dernière pièce';
        noResultEl.classList.toggle('show',match===0);
        galTitle.innerHTML=(query?'Résultats':(cat==='Toutes'?'Toutes les pièces':esc(cat)))+' <span>· '+match+'</span>';
        showAll.hidden=cat==='Toutes'&&!query;
        univEl.querySelectorAll('.univ').forEach(b=>b.setAttribute('aria-pressed',b.dataset.cat===cat));
      };
      const setCat=(c,scroll)=>{cat=c;limit=PAGE;applyFilters();try{history.replaceState(null,'',c==='Toutes'?location.pathname+location.search:'#'+slugify(c))}catch(e){}if(scroll)$('galerie').scrollIntoView({behavior:reduced?'auto':'smooth',block:'start'})};
      univEl.addEventListener('click',e=>{const b=e.target.closest('.univ');if(!b)return;setCat(b.dataset.cat===cat?'Toutes':b.dataset.cat,true)});
      showAll.addEventListener('click',()=>{$('searchInput').value='';query='';setCat('Toutes',false)});
      moreBtn.addEventListener('click',()=>{limit+=PAGE;applyFilters()});
      const fromHash=RUBRIQUES.find(r=>slugify(r)===location.hash.slice(1));
      const q=new URLSearchParams(location.search).get('q');
      if(q){query=normTxt(q.trim());$('searchInput').value=q}
      if(fromHash)cat=fromHash;
      applyFilters();
      if(fromHash||q)setTimeout(()=>$('galerie').scrollIntoView({block:'start'}),60);
    }else{
      /* Accueil : uniquement les coups de cœur */
      const sel=OEUVRES.filter(o=>o.avant);
      /* complète la mosaïque pour qu'elle tombe juste (4 colonnes, sans trou) */
      const extra=['oeuvre-250','oeuvre-40','oeuvre-268','oeuvre-124','oeuvre-4','oeuvre-196'].map(s=>byslug[s]).filter(o=>o&&!o.avant);
      while(sel.length%4!==0&&extra.length)sel.push(extra.shift());
      cardsEl.innerHTML=sel.map((o,k)=>cardHTML(o,k===0)).join('')+surMesure;
    }

    /* carrousel dans chaque pièce */
    const showPhoto=(card,k)=>{
      const o=byslug[card.dataset.slug];if(!o)return;const box=card.querySelector('.card-img'),n=o.photos.length;k=(k+n)%n;box.dataset.k=k;
      const img=box.querySelector('img'),i=o.photos[k];img.src=src(i,640);img.srcset=src(i,640)+' 640w, '+src(i,1280)+' 1280w';
      const cp=box.querySelector('.count-ph');if(cp)cp.textContent=(k+1)+' / '+n;
    };
    cardsEl.addEventListener('click',e=>{
      const card=e.target.closest('.card');if(!card||!card.dataset.slug)return;
      if(e.target.closest('.reserve-btn'))return;
      const nav=e.target.closest('.cnav');
      if(nav){showPhoto(card,+card.querySelector('.card-img').dataset.k+ +nav.dataset.step);return}
      openLB(card.dataset.slug,+card.querySelector('.card-img').dataset.k);
    });
    let tx=null;
    cardsEl.addEventListener('touchstart',e=>{if(e.target.closest('.card-img'))tx=e.touches[0].clientX},{passive:true});
    cardsEl.addEventListener('touchend',e=>{const card=e.target.closest('.card');if(tx===null||!card||!card.dataset.slug)return;const dx=e.changedTouches[0].clientX-tx;tx=null;if(Math.abs(dx)>40&&byslug[card.dataset.slug].photos.length>1){e.preventDefault();showPhoto(card,+card.querySelector('.card-img').dataset.k+(dx<0?1:-1))}});
  }

  /* ---------- Visionneuse ---------- */
  const lb=$('lightbox'),lbImg=$('lbImg'),lbCap=$('lbCap'),lbReserve=$('lbReserve');let lbO=null,lbK=0;
  function lbShow(){const n=lbO.photos.length;lbK=(lbK+n)%n;lbImg.src=src(lbO.photos[lbK],1280);lbImg.alt=lbO.nom;lbCap.innerHTML='<b>'+esc(lbO.nom)+'</b>'+esc(lbO.cat)+(n>1?' · '+(lbK+1)+' / '+n:'');lb.querySelectorAll('.lb-prev,.lb-next').forEach(b=>b.hidden=n<2);
    const card=document.querySelector('.card[data-slug="'+lbO.slug+'"]');lbReserve.hidden=!card||card.classList.contains('is-reserved')}
  function openLB(slug,k){lbO=byslug[slug];if(!lbO)return;lbK=k||0;lbShow();lb.classList.add('open');$('lbClose').focus()}
  const closeLB=()=>lb.classList.remove('open');
  $('lbClose').addEventListener('click',closeLB);
  $('lbPrev').addEventListener('click',()=>{lbK--;lbShow()});
  $('lbNext').addEventListener('click',()=>{lbK++;lbShow()});
  lbReserve.addEventListener('click',()=>{const b=document.querySelector('.card[data-slug="'+lbO.slug+'"] .reserve-btn');closeLB();if(b)b.click()});
  lb.addEventListener('click',e=>{if(e.target===lb)closeLB()});
  addEventListener('keydown',e=>{if(!lb.classList.contains('open'))return;if(e.key==='Escape')closeLB();if(e.key==='ArrowLeft'){lbK--;lbShow()}if(e.key==='ArrowRight'){lbK++;lbShow()}});

  /* ---------- Carrousel de l'accueil (en boucle : après la 7e pièce revient la 1re) ---------- */
  const track=$('track');
  if(track){
    const feat=OEUVRES.filter(o=>o.avant);const N=feat.length;
    const slideHTML=o=>'<article class="slide"><img src="'+src(o.photos[0],640)+'" alt=""><div><h3>'+esc(o.nom)+'</h3><p>'+esc(o.cat)+(o.photos.length>1?' · '+o.photos.length+' photos':'')+'</p><a class="pill" href="#'+o.slug+'" data-open="'+o.slug+'">Voir la pièce</a></div></article>';
    /* trois copies de la série : on circule dans celle du milieu, les autres remplissent les côtés */
    track.innerHTML=[0,1,2].map(()=>feat.map(slideHTML).join('')).join('');
    [...track.children].forEach((el,k)=>{if(k<N||k>=2*N)el.setAttribute('aria-hidden','true')});
    track.addEventListener('click',e=>{const a=e.target.closest('[data-open]');if(!a)return;e.preventDefault();openLB(a.dataset.open,0)});
    const slides=[...track.children],fill=$('progressFill'),now=$('slideNow');
    const pad=n=>String(n).padStart(2,'0');
    $('slideTotal').textContent=pad(N);
    let pos=N,timer=null,busy=false;
    const step=()=>slides[0].offsetWidth+(parseFloat(getComputedStyle(track).gap)||0);
    const place=(animate)=>{track.style.transition=animate?'':'none';track.style.transform='translateX(-'+step()*pos+'px)';
      const k=((pos%N)+N)%N;slides.forEach((s,j)=>s.classList.toggle('current',j===pos));fill.style.width=((k+1)/N*100)+'%';now.textContent=pad(k+1);
      if(!animate){void track.offsetWidth;track.style.transition=''}};
    const go=d=>{if(busy)return;busy=true;pos+=d;place(true);setTimeout(()=>{if(pos>=2*N)pos-=N;else if(pos<N)pos+=N;place(false);busy=false},reduced?0:600)};
    const restart=()=>{clearInterval(timer);if(!reduced)timer=setInterval(()=>go(1),3500)};
    $('next').addEventListener('click',()=>{go(1);restart()});
    $('prev').addEventListener('click',()=>{go(-1);restart()});
    track.addEventListener('mouseenter',()=>clearInterval(timer));
    track.addEventListener('mouseleave',restart);
    let startX=null;
    track.addEventListener('touchstart',e=>{startX=e.touches[0].clientX},{passive:true});
    track.addEventListener('touchend',e=>{if(startX===null)return;const dx=e.changedTouches[0].clientX-startX;if(Math.abs(dx)>40){go(dx<0?1:-1);restart()}startX=null});
    addEventListener('resize',()=>place(false));
    place(false);restart();
  }

  /* ---------- Menu, lien actif, année ---------- */
  $('year').textContent=new Date().getFullYear();
  const menu=$('menu'),links=$('links'),mm=$('mmenu');
  const setMenu=open=>{
    menu.setAttribute('aria-expanded',open);document.body.classList.toggle('menu-open',open);
    if(open){mm.hidden=false;requestAnimationFrame(()=>mm.classList.add('open'));setTimeout(()=>$('mmenuClose').focus(),60)}
    else{mm.classList.remove('open');setTimeout(()=>{if(!mm.classList.contains('open'))mm.hidden=true},250)}
  };
  menu.addEventListener('click',()=>setMenu(true));
  $('mmenuClose').addEventListener('click',()=>{setMenu(false);menu.focus()});
  mm.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>setMenu(false)));
  addEventListener('keydown',e=>{if(e.key==='Escape'&&!mm.hidden)setMenu(false)});
  if(!IS_CREATIONS){
    const navItems=[...links.querySelectorAll('a[href^="#"]')];
    const io2=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)navItems.forEach(a=>a.classList.toggle('active',a.getAttribute('href')==='#'+e.target.id))}),{rootMargin:'-40% 0px -55%'});
    navItems.map(a=>document.querySelector(a.getAttribute('href'))).filter(Boolean).forEach(s=>io2.observe(s));
  }

  /* ---------- Recherche ---------- */
  const search=$('searchInput');
  if(search){
    if(IS_CREATIONS){
      search.addEventListener('input',()=>{query=normTxt(search.value.trim());applyFilters()});
      search.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();$('galerie').scrollIntoView({behavior:reduced?'auto':'smooth'})}});
    }else{
      search.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();const v=search.value.trim();location.href='creations.html'+(v?'?q='+encodeURIComponent(v):'')}});
    }
  }

  /* ---------- FAQ, apparition au scroll ---------- */
  document.querySelectorAll('.faq details').forEach(item=>item.addEventListener('toggle',()=>{if(item.open)document.querySelectorAll('.faq details[open]').forEach(o=>{if(o!==item)o.open=false})}));
  const els=document.querySelectorAll('.reveal');
  if('IntersectionObserver'in window){const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.12});els.forEach(e=>io.observe(e))}else els.forEach(e=>e.classList.add('in'));

  /* ---------- Réservations (Supabase) ---------- */
  const SUPABASE_URL='https://ficpgpduwkgdqcfgjtdi.supabase.co';
  const SUPABASE_KEY='sb_publishable_D7hHj4K2Y1bVn2hIHA8HAA__ZcT0sPk';
  function initReservations(){
    let sb=null;try{sb=window.supabase?window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY):null}catch(e){sb=null}
    const modal=$('reserveModal'),pieceName=$('pieceName');
    const nameInput=$('clientName'),contactInput=$('clientContact'),phoneInput=$('clientPhone'),messageInput=$('clientMessage');
    const send=$('sendReservation'),out=$('formMsg');
    let currentSlug='',currentName='';
    const markReserved=slug=>{document.querySelectorAll('.slide [data-open="'+slug+'"]').forEach(x=>x.closest('.slide').classList.add('is-reserved'));const card=document.querySelector('.card[data-slug="'+slug+'"]');if(!card)return;card.classList.add('is-reserved');const st=card.querySelector('.status');if(st)st.textContent='Réservé';const b=card.querySelector('.reserve-btn');if(b)b.textContent='Déjà réservée'};
    const close=()=>modal.classList.remove('open');
    $('closeModal').addEventListener('click',close);
    modal.addEventListener('click',e=>{if(e.target===modal)close()});
    addEventListener('keydown',e=>{if(e.key==='Escape')close()});
    document.querySelectorAll('.card[data-slug] .reserve-btn').forEach(button=>button.addEventListener('click',()=>{
      const card=button.closest('.card');if(card.classList.contains('is-reserved'))return;
      currentSlug=card.dataset.slug;currentName=card.dataset.name;
      pieceName.textContent=currentName;nameInput.value='';contactInput.value='';phoneInput.value='';messageInput.value='';out.textContent='';out.className='form-msg';send.disabled=false;modal.classList.add('open');setTimeout(()=>nameInput.focus(),40);
    }));
    if(sb){
      sb.from('pieces').select('slug,reserved').then(({data})=>(data||[]).forEach(p=>{if(p.reserved)markReserved(p.slug)}),()=>{});
      try{sb.channel('pieces-live').on('postgres_changes',{event:'UPDATE',schema:'public',table:'pieces'},payload=>{if(payload.new&&payload.new.reserved)markReserved(payload.new.slug)}).subscribe()}catch(e){}
    }
    send.addEventListener('click',async()=>{
      const clientName=nameInput.value.trim(),clientContact=contactInput.value.trim(),clientPhone=phoneInput.value.trim(),clientMessage=messageInput.value.trim();
      if(!clientName||!clientPhone){out.className='form-msg error';out.textContent='Indiquez votre nom et votre numéro de téléphone.';return}
      if(clientPhone.replace(/[^0-9]/g,'').length<9){out.className='form-msg error';out.textContent='Vérifiez votre numéro de téléphone.';return}
      if(!sb){const subject=encodeURIComponent('Réservation — '+currentName),body=encodeURIComponent('Bonjour Louis,\n\nJe souhaite réserver : '+currentName+'.\n\nNom : '+clientName+'\nTéléphone : '+clientPhone+'\nE-mail : '+clientContact+'\nMessage : '+clientMessage);location.href='mailto:louisbestion48@gmail.com?subject='+subject+'&body='+body;return}
      send.disabled=true;out.className='form-msg';out.textContent='Enregistrement en cours…';
      try{
        const reservation=await sb.from('reservations').insert({piece_slug:currentSlug,name:clientName,phone:clientPhone,contact:clientContact||clientPhone,message:clientMessage});if(reservation.error)throw reservation.error;
        const piece=await sb.from('pieces').update({reserved:true}).eq('slug',currentSlug);if(piece.error)throw piece.error;
        markReserved(currentSlug);out.className='form-msg ok';out.textContent='Réservation enregistrée. Louis vous recontactera rapidement.';setTimeout(close,1800);
      }catch(error){console.warn(error);send.disabled=false;out.className='form-msg error';out.textContent='La réservation n’a pas pu être envoyée. Vous pouvez contacter Louis directement.'}
    });
  }
  if(document.readyState==='complete')initReservations();else addEventListener('load',initReservations);
})();
