import React from 'react';

const STORAGE_KEY = 'memo_plus_ultimate_v3_folders';
const STYLES = ['GOOGLE', 'MICROSOFT', 'MAC', 'WIN11', 'FUTURE', 'NEON', '2000S', '2010S', '2020S'];
const LANGS = ['JA', 'EN', 'ZH', 'KO', 'FR'];

const TRANSLATIONS: Record<string, any> = {
    JA: { appTitle: 'Memo++', newMemo: '新規作成', settingsHeader: '設定', search: '検索...', save: '保存', cancel: '戻る', delete: '削除', themeLabel: 'デザイン', languageLabel: '言語', done: '完了', sidebarFolders: 'フォルダ', noMemos: 'メモはありません', titlePlaceholder: 'タイトル...', contentPlaceholder: '内容...', folderAdd: '追加', folderCancel: '戻る' },
    EN: { appTitle: 'Memo++', newMemo: 'New Memo', settingsHeader: 'Settings', search: 'Search...', save: 'Save', cancel: 'Cancel', delete: 'Delete', themeLabel: 'Style', languageLabel: 'Language', done: 'Done', sidebarFolders: 'Folders', noMemos: 'No memos found', titlePlaceholder: 'Title...', contentPlaceholder: 'Content...', folderAdd: 'Add', folderCancel: 'Cancel' },
    ZH: { appTitle: 'Memo++', newMemo: '新备忘录', settingsHeader: '设置', search: '搜索...', save: '保存', cancel: '取消', delete: '删除', themeLabel: '风格', languageLabel: '语言', done: '完成', sidebarFolders: '文件夹', noMemos: '未发现备忘录', titlePlaceholder: '标题...', contentPlaceholder: '内容...', folderAdd: '添加', folderCancel: '取消' },
    KO: { appTitle: 'Memo++', newMemo: '새 메모', settingsHeader: '설정', search: '검색...', save: '저장', cancel: '취소', delete: '삭제', themeLabel: '스타일', languageLabel: '언어', done: '완료', sidebarFolders: '폴더', noMemos: '메모를 찾을 수 없습니다', titlePlaceholder: '제목...', contentPlaceholder: '내용...', folderAdd: '추가', folderCancel: '취소' },
    FR: { appTitle: 'Memo++', newMemo: 'Nouv. Note', settingsHeader: 'Paramètres', search: 'Rechercher...', save: 'Sauver', cancel: 'Annuler', delete: 'Supprimer', themeLabel: 'Style', languageLabel: 'Langue', done: 'Fini', sidebarFolders: 'Dossiers', noMemos: 'Aucune note', titlePlaceholder: 'Titre...', contentPlaceholder: 'Contenu...', folderAdd: 'Ajouter', folderCancel: 'Annuler' }
};

class MemoApp {
    state: any;
    currentEditingId: string | null = null;
    activeFolderId: string = 'all';
    game: any = null;

    constructor() {
        (window as any).app = this;
        this.state = this.load();
        this.init();
    }

    load() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            const defaultState = { memos: [], folders: [], style: 'GOOGLE', lang: 'JA' };
            if (!data) return defaultState;
            const parsed = JSON.parse(data);
            return {
                memos: Array.isArray(parsed.memos) ? parsed.memos : [],
                folders: Array.isArray(parsed.folders) ? parsed.folders : [],
                style: parsed.style || 'GOOGLE',
                lang: parsed.lang || 'JA'
            };
        } catch(e) { return { memos: [], folders: [], style: 'GOOGLE', lang: 'JA' }; }
    }

    save() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    }

    init() {
        this.bindEvents();
        this.applyStyle(this.state.style);
        this.applyLang(this.state.lang);
        this.renderAll();
    }

    bindEvents() {
        const safeOnclick = (id: string, fn: Function) => { 
            const el = document.getElementById(id); 
            if (el) el.onclick = () => fn(); 
        };

        safeOnclick('btn-menu', () => this.toggleSidebar(true));
        safeOnclick('btn-new', () => this.openEditor());
        safeOnclick('btn-settings', () => this.toggleModal('modal-settings', true));
        safeOnclick('btn-save', () => this.saveMemo());
        safeOnclick('btn-play', () => this.openGame());
        safeOnclick('game-close-icon', () => this.closeGame());
        safeOnclick('btn-start-game', () => this.startGame());

        safeOnclick('btn-add-folder', () => {
            const container = document.getElementById('folder-input-container');
            if (container) {
                container.classList.toggle('hidden');
                if (!container.classList.contains('hidden')) {
                    const input = document.getElementById('new-folder-name') as HTMLInputElement;
                    if (input) input.focus();
                }
            }
        });

        safeOnclick('btn-confirm-folder', () => this.addNewFolder());
        safeOnclick('btn-cancel-folder', () => {
            const container = document.getElementById('folder-input-container');
            const input = document.getElementById('new-folder-name') as HTMLInputElement;
            if (container) container.classList.add('hidden');
            if (input) input.value = '';
        });

        const searchInput = document.getElementById('search-input') as HTMLInputElement;
        if (searchInput) {
            searchInput.oninput = (e: any) => this.renderMemos(e.target.value);
        }

        const memoGrid = document.getElementById('memo-grid');
        if (memoGrid) {
            memoGrid.onclick = (e: any) => {
                const card = e.target.closest('.memo-card');
                if (card) this.openEditor(card.dataset.id);
            };
        }
    }

    applyLang(l: string) {
        if (!TRANSLATIONS[l]) return;
        this.state.lang = l;
        const t = TRANSLATIONS[l];

        const setTxt = (id: string, key: string) => {
            const el = document.getElementById(id);
            if (el) el.textContent = t[key];
        };

        const setPlh = (id: string, key: string) => {
            const el = document.getElementById(id) as HTMLInputElement;
            if (el) el.placeholder = t[key];
        };

        setTxt('txt-appTitle', 'appTitle');
        setTxt('txt-newMemo', 'newMemo');
        setTxt('txt-settingsHeader', 'settingsHeader');
        setTxt('txt-themeLabel', 'themeLabel');
        setTxt('txt-languageLabel', 'languageLabel');
        setTxt('txt-settingsDone', 'done');
        setTxt('txt-sidebarFolders', 'sidebarFolders');
        setTxt('txt-folderAdd', 'folderAdd');
        setTxt('txt-folderCancel', 'folderCancel');
        setTxt('txt-editorCancel', 'cancel');
        setTxt('txt-editorSave', 'save');

        setPlh('search-input', 'search');
        setPlh('edit-title', 'titlePlaceholder');
        setPlh('edit-content', 'contentPlaceholder');

        this.save();
        this.renderLangList();
        this.renderMemos();
        this.renderFolders();
    }

    renderLangList() {
        const grid = document.getElementById('lang-list');
        if (!grid) return;
        grid.innerHTML = LANGS.map(l => `
            <button onclick="window.app.applyLang('${l}')" class="px-4 py-2 text-xs font-bold rounded-full border-2 transition-all ${this.state.lang === l ? 'border-blue-500 bg-blue-50' : 'border-black/5'}">${l}</button>
        `).join('');
    }

    addNewFolder() {
        const input = document.getElementById('new-folder-name') as HTMLInputElement;
        const name = input.value.trim();
        if (name) {
            const id = 'f_' + Date.now();
            this.state.folders.push({ id, name });
            this.save();
            this.renderFolders();
            input.value = '';
            const container = document.getElementById('folder-input-container');
            if (container) container.classList.add('hidden');
        }
    }

    deleteFolder(id: string, e: any) {
        if (e) e.stopPropagation();
        const t = TRANSLATIONS[this.state.lang];
        if (confirm(t.appTitle + ': Delete folder?')) {
            this.state.folders = this.state.folders.filter((f: any) => f.id !== id);
            this.state.memos.forEach((m: any) => { if (m.folderId === id) m.folderId = 'none'; });
            if (this.activeFolderId === id) this.activeFolderId = 'all';
            this.save();
            this.renderFolders();
            this.renderMemos();
        }
    }

    setActiveFolder(id: string) {
        this.activeFolderId = id;
        this.renderFolders();
        this.renderMemos();
        if (window.innerWidth <= 768) this.toggleSidebar(false);
    }

    toggleSidebar(show?: boolean) {
        const sidebar = document.getElementById('sidebar');
        if (!sidebar) return;
        if (show === undefined) sidebar.classList.toggle('open');
        else if (show) sidebar.classList.add('open');
        else sidebar.classList.remove('open');
    }

    toggleModal(id: string, show: boolean) {
        const m = document.getElementById(id);
        if (m) {
            m.classList.toggle('hidden', !show);
            if (show) m.classList.add('flex'); else m.classList.remove('flex');
        }
    }

    applyStyle(s: string) {
        this.state.style = s;
        document.body.dataset.style = s;
        this.save();
        this.renderStyleList();
    }

    renderAll() {
        this.renderFolders();
        this.renderMemos();
        this.renderStyleList();
        this.renderLangList();
    }

    renderFolders() {
        const list = document.getElementById('folder-list');
        const select = document.getElementById('edit-folder-select');
        if (!list) return;

        const folders = [{ id: 'all', name: 'All' }, { id: 'none', name: 'None' }, ...this.state.folders];
        list.innerHTML = folders.filter(f => f.id !== 'none').map(f => `
            <div class="sidebar-item group ${this.activeFolderId === f.id ? 'active' : ''}" onclick="window.app.setActiveFolder('${f.id}')">
                <span class="truncate flex-1">${f.name}</span>
                ${f.id !== 'all' ? `<button onclick="window.app.deleteFolder('${f.id}', event)" class="p-1 opacity-0 group-hover:opacity-100 hover:text-red-300 transition-opacity">×</button>` : ''}
            </div>
        `).join('');

        if (select) {
            select.innerHTML = [{ id: 'none', name: 'None' }, ...this.state.folders].map(f => `
                <option value="${f.id}">${f.name}</option>
            `).join('');
        }
    }

    renderMemos(q: string = '') {
        const grid = document.getElementById('memo-grid');
        if (!grid) return;
        const lowQ = q.toLowerCase();
        const t = TRANSLATIONS[this.state.lang];
        
        let filtered = this.state.memos;
        if (this.activeFolderId !== 'all') {
            filtered = filtered.filter((m: any) => m.folderId === this.activeFolderId || (!m.folderId && this.activeFolderId === 'none'));
        }
        if (lowQ) {
            filtered = filtered.filter((m: any) => m.title.toLowerCase().includes(lowQ) || m.content.toLowerCase().includes(lowQ));
        }

        if (filtered.length === 0) {
            grid.innerHTML = `<div class="col-span-full py-20 text-center opacity-30 italic">${t.noMemos}</div>`;
            return;
        }

        grid.innerHTML = filtered.map((m: any) => `
            <div class="memo-card group p-4 flex flex-col relative" data-id="${m.id}">
                <h3 class="font-extrabold text-lg truncate mb-2">${m.title || 'Untitled'}</h3>
                <p class="text-sm opacity-60 line-clamp-3 leading-relaxed mb-4">${m.content || '...'}</p>
                <div class="mt-auto flex justify-between items-center opacity-40 text-[10px] font-bold">
                    <span>${new Date(m.updatedAt).toLocaleDateString()}</span>
                    <button onclick="event.stopPropagation(); window.app.deleteMemo('${m.id}')" class="text-red-500">${t.delete}</button>
                </div>
            </div>
        `).join('');
    }

    renderStyleList() {
        const grid = document.getElementById('style-grid');
        if (!grid) return;
        grid.innerHTML = STYLES.map(s => `
            <button onclick="window.app.applyStyle('${s}')" class="p-3 text-[10px] font-bold rounded-lg border-2 transition-all ${this.state.style === s ? 'border-blue-500 bg-blue-50' : 'border-black/5'}">${s}</button>
        `).join('');
    }

    openEditor(id: string | null = null) {
        const m = id ? this.state.memos.find((x: any) => x.id === id) : { title: '', content: '', folderId: 'none' };
        this.currentEditingId = id;
        (document.getElementById('edit-title') as HTMLInputElement).value = m.title;
        (document.getElementById('edit-content') as HTMLTextAreaElement).value = m.content;
        (document.getElementById('edit-folder-select') as HTMLSelectElement).value = m.folderId || 'none';
        this.toggleModal('modal-editor', true);
    }

    saveMemo() {
        const title = (document.getElementById('edit-title') as HTMLInputElement).value;
        const content = (document.getElementById('edit-content') as HTMLTextAreaElement).value;
        const folderId = (document.getElementById('edit-folder-select') as HTMLSelectElement).value;
        const updatedAt = Date.now();

        if (this.currentEditingId) {
            this.state.memos = this.state.memos.map((x: any) => x.id === this.currentEditingId ? { ...x, title, content, folderId, updatedAt } : x);
        } else {
            this.state.memos.unshift({ id: Date.now().toString(), title, content, folderId, updatedAt });
        }
        this.save();
        this.renderMemos();
        this.toggleModal('modal-editor', false);
    }

    deleteMemo(id: string) {
        const t = TRANSLATIONS[this.state.lang];
        if (confirm(t.delete + '?')) {
            this.state.memos = this.state.memos.filter((x: any) => x.id !== id);
            this.save();
            this.renderMemos();
        }
    }

    openGame() {
        this.toggleModal('game-overlay', true);
        document.getElementById('game-intro')?.classList.remove('hidden');
    }

    closeGame() {
        if (this.game) this.game.stop();
        this.toggleModal('game-overlay', false);
    }

    startGame() {
        document.getElementById('game-intro')?.classList.add('hidden');
        if (this.game) this.game.stop();
        this.game = new BreakoutGame('game-canvas', this.state.memos, (s: number) => {
            const el = document.getElementById('game-score');
            if (el) el.textContent = s.toString();
        }, () => this.closeGame());
        this.game.start();
    }
}

class BreakoutGame {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    onScore: Function;
    onEnd: Function;
    score = 0;
    running = false;
    ball = { x: 400, y: 480, dx: 4, dy: -4, radius: 8 };
    paddle = { x: 340, y: 540, w: 120, h: 20 };
    bricks: any[] = [];
    memos: any[];

    constructor(id: string, memos: any[], onScore: Function, onEnd: Function) {
        this.canvas = document.getElementById(id) as HTMLCanvasElement;
        this.ctx = this.canvas.getContext('2d')!;
        this.onScore = onScore;
        this.onEnd = onEnd;
        this.memos = memos;
        this.initBricks();
    }

    initBricks() {
        const rows = 4, cols = 8, w = 90, h = 30, pad = 10, offsetTop = 60, offsetLeft = 10;
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                this.bricks.push({ x: c * (w + pad) + offsetLeft, y: r * (h + pad) + offsetTop, w, h, status: 1 });
            }
        }
    }

    start() {
        this.running = true;
        this.canvas.onmousemove = (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = (e.clientX - rect.left) * (800 / rect.width);
            this.paddle.x = Math.max(0, Math.min(800 - this.paddle.w, x - this.paddle.w / 2));
        };
        this.canvas.ontouchmove = (e) => {
            e.preventDefault();
            const rect = this.canvas.getBoundingClientRect();
            const x = (e.touches[0].clientX - rect.left) * (800 / rect.width);
            this.paddle.x = Math.max(0, Math.min(800 - this.paddle.w, x - this.paddle.w / 2));
        };
        this.loop();
    }

    stop() { this.running = false; }

    draw() {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, 800, 600);
        this.ctx.fillStyle = '#00f2ff';
        this.ctx.fillRect(this.paddle.x, this.paddle.y, this.paddle.w, this.paddle.h);
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = '#fff';
        this.ctx.fill();
        this.ctx.closePath();
        this.bricks.forEach(b => {
            if (b.status === 1) {
                this.ctx.fillStyle = '#3b82f6';
                this.ctx.fillRect(b.x, b.y, b.w, b.h);
            }
        });
    }

    update() {
        this.ball.x += this.ball.dx;
        this.ball.y += this.ball.dy;
        if (this.ball.x + this.ball.radius > 800 || this.ball.x - this.ball.radius < 0) this.ball.dx *= -1;
        if (this.ball.y - this.ball.radius < 0) this.ball.dy *= -1;
        if (this.ball.y + this.ball.radius > this.paddle.y && this.ball.x > this.paddle.x && this.ball.x < this.paddle.x + this.paddle.w) {
            this.ball.dy = -Math.abs(this.ball.dy);
        }
        this.bricks.forEach(b => {
            if (b.status === 1 && this.ball.x > b.x && this.ball.x < b.x + b.w && this.ball.y > b.y && this.ball.y < b.y + b.h) {
                b.status = 0;
                this.ball.dy *= -1;
                this.score += 100;
                this.onScore(this.score);
            }
        });
        if (this.ball.y > 600) this.onEnd();
    }

    loop() {
        if (!this.running) return;
        this.update();
        this.draw();
        requestAnimationFrame(() => this.loop());
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new MemoApp();
});
