  if (e.target.id === 'video-upload') {
    const file = e.target.files?.[0];
    if (!file) {
      ui.videoUrl = '';
      ui.videoName = '';
      const preview = $('#video-preview');
      if (preview) {
        preview.removeAttribute('src');
        preview.classList.remove('visible');
      }
      const result = document.querySelector('.analysis-result');
      if (result) {
        result.innerHTML = 'Nog geen video geüpload. De workflow gebruikt de standaard referentie, maar de interface is klaar voor een echte AI-opname.';
      }
      return;
    }

    if (ui.videoUrl) URL.revokeObjectURL(ui.videoUrl);
    ui.videoUrl = URL.createObjectURL(file);
    ui.videoName = file.name;

    const preview = $('#video-preview');
    if (preview) {
      preview.src = ui.videoUrl;
      preview.classList.add('visible');
      preview.load();
    }

    const result = document.querySelector('.analysis-result');
    if (result) {
      result.innerHTML = `<strong>Geüpload:</strong> ${esc(file.name)} — de AI-analyse kan nu de kraanvogelvideo vergelijken met de vouwstappen.`;
    }

    const pill = document.querySelector('.upload-pill');
    if (pill) {
      pill.textContent = 'Video beschikbaar';
    }
  }
