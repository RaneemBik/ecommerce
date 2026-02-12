const STORAGE_KEY = 'novadash_messages';

interface Message {
  id: number;
  from: string;
  subject: string;
  body: string;
  read: boolean;
  date: string;
}

function loadMessages(): Message[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return getDefaultMessages();
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed)) return getDefaultMessages();
    const normalized = parsed.map((m: any, idx: number) => ({
      id: typeof m.id === 'number' ? m.id : Date.now() + idx,
      from: String(m.from ?? m.sender ?? 'Unknown'),
      subject: String(m.subject ?? 'No subject'),
      body: String(m.body ?? ''),
      read: Boolean(m.read),
      date: String(m.date ?? new Date().toISOString().split('T')[0])
    } as Message));
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized)); } catch (e) {}
    return normalized;
  } catch {
    const defaults = getDefaultMessages();
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults)); } catch (e) {}
    return defaults;
  }
}

function saveMessages(messages: Message[]): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(messages)); } catch (e) {}
  window.dispatchEvent(new Event('novadash:data-changed'));
}

function getDefaultMessages(): Message[] {
  return [
    { id: 1, from: 'Sarah Chen', subject: 'Order status?', body: 'Hi, can you check my order #1024?', read: false, date: '2026-02-11' },
    { id: 2, from: 'Mike Ross', subject: 'Billing question', body: 'I have a question about my invoice.', read: false, date: '2026-02-10' },
    { id: 3, from: 'Emily Zhang', subject: 'Feature request', body: 'Would love to see dark mode!', read: false, date: '2026-02-09' },
  ];
}

export function renderMessages(container: HTMLElement) {
  const messages = loadMessages();
  const unreadCount = messages.filter(m => !m.read).length;

  container.innerHTML = `
    <h1 class="page-title">Messages</h1>
    <p class="page-subtitle">Customer messages and support inbox (${unreadCount} unread).</p>

    <div class="panel">
      <div class="panel__header">
        <h3 class="panel__title">Inbox (${messages.length})</h3>
        <button class="panel__action" id="composeBtn">+ Compose</button>
      </div>
      <div id="messagesContainer" style="display:flex;flex-direction:column;gap:8px">
        ${messages.length === 0 ? '<p style="padding:16px;color:#666">No messages</p>' : messages.map(msg => `
          <div class="panel message-item ${msg.read ? '' : 'message-unread'}" data-msg-id="${msg.id}" style="padding:12px;cursor:pointer;position:relative;">
            <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:4px;">
              <strong style="${msg.read ? '' : 'font-weight:700;'}">${msg.from}</strong>
              <div style="display:flex;gap:8px;">
                <button class="btn-icon mark-read-btn" data-msg-id="${msg.id}" title="${msg.read ? 'Mark unread' : 'Mark read'}" style="padding:4px;">
                  <i class="fas fa-${msg.read ? 'envelope' : 'envelope-open'}"></i>
                </button>
                <button class="btn-icon delete-msg-btn" data-msg-id="${msg.id}" title="Delete" style="padding:4px;">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
            <div style="color:#888;font-size:13px;margin-bottom:4px;">${msg.subject}</div>
            <div style="color:#666;font-size:14px;">${msg.body}</div>
            <div style="color:#666;font-size:12px;margin-top:4px;">${msg.date}</div>
          </div>
        `).join('')}
      </div>
    </div>

    <div id="composeModal" class="modal" style="display:none;position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:9999;align-items:center;justify-content:center;">
      <div class="panel" style="width:90%;max-width:500px;padding:24px;">
        <h3 style="margin-bottom:16px;">New Message</h3>
        <form id="composeForm">
          <div style="margin-bottom:12px;">
            <label style="display:block;margin-bottom:4px;font-weight:500;">From</label>
            <input type="text" id="msgFrom" required style="width:100%;padding:8px;border:1px solid #333;background:#1a1a1a;color:#fff;border-radius:4px;">
          </div>
          <div style="margin-bottom:12px;">
            <label style="display:block;margin-bottom:4px;font-weight:500;">Subject</label>
            <input type="text" id="msgSubject" required style="width:100%;padding:8px;border:1px solid #333;background:#1a1a1a;color:#fff;border-radius:4px;">
          </div>
          <div style="margin-bottom:16px;">
            <label style="display:block;margin-bottom:4px;font-weight:500;">Message</label>
            <textarea id="msgBody" required rows="4" style="width:100%;padding:8px;border:1px solid #333;background:#1a1a1a;color:#fff;border-radius:4px;"></textarea>
          </div>
          <div style="display:flex;gap:8px;justify-content:flex-end;">
            <button type="button" id="cancelComposeBtn" class="btn btn--secondary">Cancel</button>
            <button type="submit" class="btn btn--primary">Send</button>
          </div>
        </form>
      </div>
    </div>
  `;

  // Compose button
  const composeBtn = container.querySelector('#composeBtn');
  const composeModal = container.querySelector('#composeModal') as HTMLElement;
  const composeForm = container.querySelector('#composeForm') as HTMLFormElement;
  const cancelBtn = container.querySelector('#cancelComposeBtn');

  composeBtn?.addEventListener('click', () => {
    composeModal.style.display = 'flex';
  });

  cancelBtn?.addEventListener('click', () => {
    composeModal.style.display = 'none';
    composeForm.reset();
  });

  composeForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const from = (container.querySelector('#msgFrom') as HTMLInputElement).value;
    const subject = (container.querySelector('#msgSubject') as HTMLInputElement).value;
    const body = (container.querySelector('#msgBody') as HTMLTextAreaElement).value;
    
    const currentMessages = loadMessages();
    const newMessage: Message = {
      id: Date.now(),
      from,
      subject,
      body,
      read: true,
      date: new Date().toISOString().split('T')[0]
    };
    saveMessages([newMessage, ...currentMessages]);
    renderMessages(container);
  });

  // Mark read/unread
  container.querySelectorAll('.mark-read-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const msgId = Number((btn as HTMLElement).dataset.msgId);
      const currentMessages = loadMessages();
      const updated = currentMessages.map(m => 
        m.id === msgId ? { ...m, read: !m.read } : m
      );
      saveMessages(updated);
      renderMessages(container);
    });
  });

  // Delete message
  container.querySelectorAll('.delete-msg-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const msgId = Number((btn as HTMLElement).dataset.msgId);
      const { confirmModal, showToast } = await import('../../ui/modal');
      const ok = await confirmModal('Delete this message?', 'Delete Message');
      if (!ok) return;
      const currentMessages = loadMessages();
      const filtered = currentMessages.filter(m => m.id !== msgId);
      saveMessages(filtered);
      renderMessages(container);
      showToast('Message deleted');
    });
  });
}

