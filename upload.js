(function(){
  const uploader = document.getElementById('uploader');
  const slotTpl = document.getElementById('slot-template');

  for(let i=0;i<5;i++){
    uploader.appendChild(slotTpl.content.cloneNode(true));
  }

  function setStatus(box, text){ box.querySelector('.status').textContent = text; }
  function setPreview(box, src){
    const p = box.querySelector('.preview');
    if(src){ p.src = src; p.style.display='block'; }
    else { p.src=''; p.style.display='none'; }
  }
  function setURL(box, url){
    const d = box.querySelector('.url');
    if(url){ d.textContent = url; d.style.display='block'; }
    else { d.textContent=''; d.style.display='none'; }
  }

  async function uploadBox(box){
    const input = box.querySelector('.file-input');
    const file = input.files[0];
    if(!file){ alert('Lütfen önce bir resim seçin.'); return null; }

    setStatus(box, 'Yükleniyor...');

    const form = new FormData();
    form.append('file', file);
    form.append('upload_preset', UPLOAD_PRESET);

    try{
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`, {
        method:'POST', body: form
      });
      const data = await res.json();
      if(data.error){ setStatus(box, 'Hata: ' + (data.error.message || 'bilinmeyen')); return null; }
      setStatus(box, 'Yüklendi ✔️ ');
      setURL(box, data.secure_url);
      return data.secure_url;
    }catch(err){
      console.error(err);
      setStatus(box, 'Ağ veya CORS hatası');
      return null;
    }
  }

  uploader.addEventListener('click', async function(ev){
    const target = ev.target;
    const box = target.closest('.slot');
    if(!box) return;

    if(target.classList.contains('upload-btn')){
      await uploadBox(box);
    }
    if(target.classList.contains('remove-btn')){
      box.querySelector('.file-input').value='';
      setPreview(box, null);
      setStatus(box, 'Henüz yüklenmedi');
      setURL(box, null);
    }
  });

  uploader.addEventListener('change', function(ev){
    const input = ev.target;
    if(!input.classList.contains('file-input')) return;
    const box = input.closest('.slot');
    const f = input.files[0];
    if(!f){ setPreview(box, null); return; }
    const reader = new FileReader();
    reader.onload = ()=> setPreview(box, reader.result);
    reader.readAsDataURL(f);
  });

  document.getElementById('upload-all').addEventListener('click', async function(){
    const boxes = Array.from(uploader.querySelectorAll('.slot'));
    for(const b of boxes){ await uploadBox(b); }
    alert('Tarama başlatıldı. 6-8 saat sürecek');
  });

  document.getElementById('clear-all').addEventListener('click', function(){
    const boxes = Array.from(uploader.querySelectorAll('.slot'));
    for(const b of boxes){
      b.querySelector('.file-input').value='';
      setPreview(b, null);
      setStatus(b, 'Henüz yüklenmedi');
      setURL(b, null);
    }
  });
})();
