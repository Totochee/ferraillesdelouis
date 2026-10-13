/* Ferrailles de Louis — bandeau cookies et Google Analytics (conforme aux recommandations de la CNIL).
   - Aucun traceur n'est chargé avant que le visiteur ait cliqué sur « Accepter ».
   - « Refuser » est aussi simple que « Accepter » ; le choix est gardé 6 mois puis redemandé.
   - Le lien « Gérer les cookies » (pied de page) rouvre le bandeau à tout moment.
   Pour activer Google Analytics : renseigner l'identifiant de mesure (G-XXXXXXXXXX) ci-dessous. */
(function(){
  const GA_ID='';                       /* ex. 'G-ABC123DEF4' */
  const KEY='fdl-cookies';
  const MAX_AGE=1000*60*60*24*182;      /* 6 mois */

  const read=()=>{try{const v=JSON.parse(localStorage.getItem(KEY)||'null');if(v&&Date.now()-v.t<MAX_AGE)return v.choix}catch(e){}return null};
  const save=c=>{try{localStorage.setItem(KEY,JSON.stringify({choix:c,t:Date.now()}))}catch(e){}};

  let gaLoaded=false;
  function loadGA(){
    if(!GA_ID||gaLoaded)return;gaLoaded=true;
    window.dataLayer=window.dataLayer||[];
    window.gtag=function(){dataLayer.push(arguments)};
    gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'granted'});
    gtag('js',new Date());
    gtag('config',GA_ID,{anonymize_ip:true});
    const s=document.createElement('script');s.async=true;s.src='https://www.googletagmanager.com/gtag/js?id='+GA_ID;document.head.appendChild(s);
  }
  function clearGA(){
    if(window.gtag)gtag('consent','update',{analytics_storage:'denied'});
    if(GA_ID)window['ga-disable-'+GA_ID]=true;
    const host=location.hostname.replace(/^www\./,'');
    document.cookie.split(';').map(c=>c.split('=')[0].trim()).filter(n=>/^_ga|^_gid|^_gat/.test(n)).forEach(n=>{
      ['',host,'.'+host].forEach(d=>{document.cookie=n+'=; Max-Age=0; path=/'+(d?'; domain='+d:'')});
    });
  }

  /* ---------- Bandeau ---------- */
  const box=document.createElement('div');
  box.className='cookies';box.id='cookies';box.hidden=true;
  box.setAttribute('role','dialog');box.setAttribute('aria-live','polite');box.setAttribute('aria-labelledby','cookiesTitle');
  box.innerHTML='<p class="cookies-title" id="cookiesTitle">Cookies &amp; mesure d’audience</p>'+
    '<p class="cookies-text">Avec votre accord, nous utilisons Google Analytics pour savoir combien de personnes visitent le site et quelles pièces les intéressent. Aucune publicité, aucune revente. Vous pouvez changer d’avis à tout moment. <a href="confidentialite.html">En savoir plus</a></p>'+
    '<div class="cookies-acts"><button type="button" class="cookies-btn" data-c="refuse">Refuser</button><button type="button" class="cookies-btn" data-c="accepte">Accepter</button></div>';
  const open=()=>{box.hidden=false;requestAnimationFrame(()=>box.classList.add('show'))};
  const close=()=>{box.classList.remove('show');setTimeout(()=>{box.hidden=true},300)};
  box.addEventListener('click',e=>{const b=e.target.closest('[data-c]');if(!b)return;const c=b.dataset.c;save(c);
    if(c==='accepte')loadGA();else clearGA();close()});

  function init(){
    document.body.appendChild(box);
    document.querySelectorAll('[data-cookies]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();open()}));
    const c=read();
    if(c==='accepte')loadGA();
    else if(c===null)setTimeout(open,700);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
  window.fdlCookies={open,choix:read};
})();
