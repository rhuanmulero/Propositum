import { AppState } from '../state.js';

let cropperInstance = null;

export function initEditorEvents() {
    // Menu de contexto da Imagem
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('editable-img')) {
            AppState.targetImageToReplace = e.target;
            const toolbar = document.getElementById('imageToolbar');
            toolbar.style.display = 'flex';
            toolbar.style.left = e.clientX + 'px';
            toolbar.style.top = (e.clientY - 40) + 'px'; 
        } 
        else if (!e.target.closest('#imageToolbar')) {
            document.getElementById('imageToolbar').style.display = 'none';
        }
    });

    // Trocar Imagem Slide
    document.getElementById('btnToolbarChange').addEventListener('click', () => {
        document.getElementById('slideImageInput').click();
        document.getElementById('imageToolbar').style.display = 'none';
    });

    document.getElementById('slideImageInput').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if(!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            document.getElementById('cropModal').style.display = 'flex';
            const cropTarget = document.getElementById('cropTarget');
            cropTarget.src = ev.target.result;
            if (cropperInstance) cropperInstance.destroy();
            cropperInstance = new window.Cropper(cropTarget, { viewMode: 1, autoCropArea: 1, background: false });
        };
        reader.readAsDataURL(file);
        e.target.value = ''; 
    });

    document.getElementById('btnCancelCrop').addEventListener('click', () => {
        document.getElementById('cropModal').style.display = 'none';
        if(cropperInstance) { cropperInstance.destroy(); cropperInstance = null; }
    });

    document.getElementById('btnApplyCrop').addEventListener('click', () => {
        if (cropperInstance && AppState.targetImageToReplace) {
            const canvas = cropperInstance.getCroppedCanvas({ maxWidth: 1080, maxHeight: 1350 });
            AppState.targetImageToReplace.src = canvas.toDataURL('image/jpeg', 0.9);
            document.getElementById('cropModal').style.display = 'none';
            cropperInstance.destroy(); cropperInstance = null;
        }
    });

    // Logo Upload
    document.getElementById('btnLogoUpload').addEventListener('click', () => document.getElementById('logoInput').click());
    document.getElementById('logoInput').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if(!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            AppState.customLogoUrl = ev.target.result;
            const btn = document.getElementById('btnLogoUpload');
            btn.innerHTML = '<i data-lucide="check" style="color:var(--brand-color);"></i>';
            window.lucide.createIcons();
            document.querySelectorAll('.brand-logo-container').forEach(container => container.innerHTML = `<img src="${AppState.customLogoUrl}" class="custom-logo-img draggable">`);
        };
        reader.readAsDataURL(file);
    });
}