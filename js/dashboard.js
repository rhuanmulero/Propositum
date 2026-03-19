// Inicializa ícones do Lucide
lucide.createIcons();

let profiles = JSON.parse(localStorage.getItem('propositum_profiles')) ||[];
let tempLogoBase64 = null;
let profileToDeleteId = null; 

// Renderiza os Perfis na Tela
function renderProfiles() {
    const container = document.getElementById('cardsContainer');
    if (!container) return; // Trava de segurança
    
    container.innerHTML = '';

    if (profiles.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i data-lucide="layers" style="width: 64px; height: 64px; color: #444; margin-bottom: 20px;"></i>
                <h3>Nenhuma marca configurada</h3>
                <p>Inicie seu workspace adicionando a primeira entidade.</p>
                <button class="btn-nav" onclick="openModal()">+ Nova Entidade</button>
            </div>
        `;
        lucide.createIcons();
        return;
    }

    profiles.forEach(prof => {
        let logoHTML = prof.logoBase64 
            ? `<img src="${prof.logoBase64}" class="brand-logo-preview">` 
            : `<div class="brand-logo-fallback">${prof.name.charAt(0).toUpperCase()}</div>`;

        const cardHTML = `
            <div class="card" id="card-${prof.id}">
                <div class="card-content">
                    <div>
                        <div class="card-header-top">
                            ${logoHTML}
                            <div class="card-actions">
                                <button class="btn-icon" onclick="editProfile('${prof.id}')" title="Editar"><i data-lucide="settings-2" style="width: 18px;"></i></button>
                                <button class="btn-icon delete" onclick="requestDeleteProfile('${prof.id}')" title="Excluir"><i data-lucide="trash-2" style="width: 18px;"></i></button>
                            </div>
                        </div>
                        <h3>${prof.name}</h3>
                        <div class="color-dots">
                            <div class="dot" style="background: ${prof.brandColor || '#ffffff'};"></div>
                            <div class="dot" style="background: ${prof.bgColor || '#000000'};"></div>
                            <div class="dot" style="background: ${prof.textColor || '#ffffff'};"></div>
                        </div>
                        <p>${prof.vision || 'Nenhuma diretriz de Inteligência Artificial definida para esta marca.'}</p>
                    </div>
                    <div class="card-footer" onclick="goToEntity('${prof.id}')">
                        <span>Acessar Studio</span>
                        <i data-lucide="arrow-right" style="width: 20px;"></i>
                    </div>
                </div>
            </div>
        `;
        container.innerHTML += cardHTML;
    });

    lucide.createIcons();
    applyHoverEffect();
}

// MÁGICA DO HOVER (Efeito Glow da Vercel)
function applyHoverEffect() {
    document.getElementById("cardsContainer").onmousemove = e => {
        for(const card of document.getElementsByClassName("card")) {
            const rect = card.getBoundingClientRect(),
                  x = e.clientX - rect.left,
                  y = e.clientY - rect.top;
            card.style.setProperty("--mouse-x", `${x}px`);
            card.style.setProperty("--mouse-y", `${y}px`);
        };
    }
}

/* --- CONTROLE DO MODAL DE CRIAÇÃO/EDIÇÃO --- */
function openModal() {
    // Travas de segurança adicionadas para não dar erro "null"
    if(document.getElementById('modalTitle')) document.getElementById('modalTitle').innerText = "Nova Entidade";
    if(document.getElementById('brandId')) document.getElementById('brandId').value = "";
    if(document.getElementById('brandName')) document.getElementById('brandName').value = "";
    
    // Novos campos
    if(document.getElementById('brandWebsite')) document.getElementById('brandWebsite').value = "";
    if(document.getElementById('brandTemplate')) document.getElementById('brandTemplate').value = "layout-tech";
    if(document.getElementById('textColor')) document.getElementById('textColor').value = "#ffffff";
    
    if(document.getElementById('brandVision')) document.getElementById('brandVision').value = "";
    if(document.getElementById('brandColor')) document.getElementById('brandColor').value = "#ffffff";
    if(document.getElementById('bgColor')) document.getElementById('bgColor').value = "#000000";
    
    const btnSubmit = document.querySelector('.btn-submit');
    if(btnSubmit) btnSubmit.innerText = "Inicializar Marca";
    
    tempLogoBase64 = null;
    if(document.getElementById('logoPreviewContainer')) {
        document.getElementById('logoPreviewContainer').innerHTML = '<i data-lucide="image" style="color: #666; width: 20px;"></i>';
    }
    if(document.getElementById('uploadText')) document.getElementById('uploadText').innerText = "Fazer Upload";
    
    lucide.createIcons();

    const modal = document.getElementById('brandModal');
    if (modal) {
        modal.style.display = 'flex';
        setTimeout(() => modal.classList.add('active'), 10);
    }
}

function closeModal() {
    const modal = document.getElementById('brandModal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => modal.style.display = 'none', 400); 
    }
}

// Upload de Logo
const logoInput = document.getElementById('logoInput');
if(logoInput) {
    logoInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function(event) {
            tempLogoBase64 = event.target.result;
            document.getElementById('logoPreviewContainer').innerHTML = `<img src="${tempLogoBase64}">`;
            document.getElementById('uploadText').innerText = "Logo Carregado";
        };
        reader.readAsDataURL(file);
        e.target.value = ''; 
    });
}

function saveProfile() {
    const idInput = document.getElementById('brandId');
    const nameInput = document.getElementById('brandName');
    
    const id = (idInput && idInput.value) ? idInput.value : 'id_' + Date.now();
    const name = nameInput ? nameInput.value.trim() : '';
    
    if (!name) return;

    const profileData = {
        id, 
        name,
        website: document.getElementById('brandWebsite') ? document.getElementById('brandWebsite').value.trim() : "",
        vision: document.getElementById('brandVision') ? document.getElementById('brandVision').value.trim() : "",
        defaultTemplate: document.getElementById('brandTemplate') ? document.getElementById('brandTemplate').value : "layout-tech",
        brandColor: document.getElementById('brandColor') ? document.getElementById('brandColor').value : "#ffffff",
        bgColor: document.getElementById('bgColor') ? document.getElementById('bgColor').value : "#000000",
        textColor: document.getElementById('textColor') ? document.getElementById('textColor').value : "#ffffff",
        logoBase64: tempLogoBase64
    };

    const existingIndex = profiles.findIndex(p => p.id === id);
    if (existingIndex >= 0) profiles[existingIndex] = profileData;
    else profiles.push(profileData);

    localStorage.setItem('propositum_profiles', JSON.stringify(profiles));
    closeModal();
    renderProfiles();
}

function editProfile(id) {
    const prof = profiles.find(p => p.id === id);
    if (!prof) return;

    if(document.getElementById('modalTitle')) document.getElementById('modalTitle').innerText = "Configurar Entidade";
    if(document.getElementById('brandId')) document.getElementById('brandId').value = prof.id;
    if(document.getElementById('brandName')) document.getElementById('brandName').value = prof.name;
    if(document.getElementById('brandWebsite')) document.getElementById('brandWebsite').value = prof.website || "";
    if(document.getElementById('brandVision')) document.getElementById('brandVision').value = prof.vision || "";
    if(document.getElementById('brandTemplate')) document.getElementById('brandTemplate').value = prof.defaultTemplate || "layout-tech";
    if(document.getElementById('brandColor')) document.getElementById('brandColor').value = prof.brandColor || "#ffffff";
    if(document.getElementById('bgColor')) document.getElementById('bgColor').value = prof.bgColor || "#000000";
    if(document.getElementById('textColor')) document.getElementById('textColor').value = prof.textColor || "#ffffff";
    
    const btnSubmit = document.querySelector('.btn-submit');
    if(btnSubmit) btnSubmit.innerText = "Atualizar Sistema";

    tempLogoBase64 = prof.logoBase64 || null;
    if (tempLogoBase64) {
        if(document.getElementById('logoPreviewContainer')) document.getElementById('logoPreviewContainer').innerHTML = `<img src="${tempLogoBase64}">`;
        if(document.getElementById('uploadText')) document.getElementById('uploadText').innerText = "Alterar Logo";
    } else {
        if(document.getElementById('logoPreviewContainer')) document.getElementById('logoPreviewContainer').innerHTML = '<i data-lucide="image" style="color: #666; width: 20px;"></i>';
        if(document.getElementById('uploadText')) document.getElementById('uploadText').innerText = "Fazer Upload";
    }
    lucide.createIcons();

    const modal = document.getElementById('brandModal');
    if (modal) {
        modal.style.display = 'flex';
        setTimeout(() => modal.classList.add('active'), 10);
    }
}

/* --- EXCLUSÃO ÉPICA --- */
function requestDeleteProfile(id) {
    profileToDeleteId = id;
    const modal = document.getElementById('deleteConfirmModal');
    if (modal) {
        modal.style.display = 'flex';
        setTimeout(() => modal.classList.add('active'), 10);
    }
}

function closeDeleteConfirm() {
    const modal = document.getElementById('deleteConfirmModal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => modal.style.display = 'none', 400); 
    }
    profileToDeleteId = null;
}

function confirmDeleteProfile() {
    if (profileToDeleteId) {
        profiles = profiles.filter(p => p.id !== profileToDeleteId);
        localStorage.setItem('propositum_profiles', JSON.stringify(profiles));
        renderProfiles();
        closeDeleteConfirm();
    }
}

/* --- TRANSIÇÃO PARA O STUDIO --- */
function goToEntity(id) {
    const prof = profiles.find(p => p.id === id);
    if(!prof) return;

    const transition = document.getElementById('transitionOverlay');
    const transitionText = document.getElementById('transitionText');
    
    if (transition && transitionText) {
        transitionText.innerText = `Acessando inteligência de ${prof.name}...`;
        transition.style.display = 'flex';
        setTimeout(() => transition.classList.add('active'), 10);

        setTimeout(() => {
            // MUDOU AQUI: Agora vai para entity.html
            window.location.href = `entity.html?startupId=${id}`;
        }, 1500);
    } else {
        window.location.href = `entity.html?startupId=${id}`;
    }
}

// Inicializa a Tela caso o grid exista na página
if(document.getElementById('cardsContainer')) {
    renderProfiles();
}

/* --- CONFIGURAÇÕES GLOBAIS (API KEY) --- */
function openSettingsModal() {
    const apiKey = localStorage.getItem('propositum_api_key') || '';
    document.getElementById('globalApiKey').value = apiKey;
    
    const modal = document.getElementById('settingsModal');
    if (modal) {
        modal.style.display = 'flex';
        setTimeout(() => modal.classList.add('active'), 10);
    }
}

function closeSettingsModal() {
    const modal = document.getElementById('settingsModal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => modal.style.display = 'none', 400); 
    }
}

function saveSettings() {
    const key = document.getElementById('globalApiKey').value.trim();
    localStorage.setItem('propositum_api_key', key);
    
    const btn = document.getElementById('btnSaveSettings');
    const originalText = btn.innerText;
    
    btn.innerHTML = '<i data-lucide="check" style="width: 18px; display: inline-block; vertical-align: middle;"></i> Salvo';
    btn.style.background = "#34c759"; 
    btn.style.color = "#fff";
    lucide.createIcons();
    
    setTimeout(() => {
        btn.innerText = originalText;
        btn.style.background = "#fff";
        btn.style.color = "#000";
        closeSettingsModal();
    }, 1200);
}
