/**
 * ==========================================================
 *  chat.js — AI Chat Controller
 *  Handles user interactions, suggestion chips, file uploading,
 *  and communicates directly with Gemini API (gemini-1.5-flash)
 *  in the browser with System Instruction for Altayebaat Diet.
 * ==========================================================
 */

const ChatApp = {
  // ── Altayebaat System Instruction & Knowledge Base ──
  SYSTEM_INSTRUCTION: `
أنت المساعد الذكي المتخصص بنظام الطيبات الغذائي للدكتور ضياء العوضي رحمه الله.
مهمتك هي إرشاد المستخدمين بدقة وأمان بناءً على قواعد وأسس هذا النظام فقط.

قواعد أساسية يجب الالتزام بها في إجاباتك:
1. الأسس الخمسة لنظام الطيبات:
   - تناول الأرز الأبيض (المطهو جيداً بالدهون المسموحة أو الزبدة الطبيعية).
   - استخدام خل التفاح الطبيعي يومياً (مع الأكل أو مخفف بالماء بعد الأكل).
   - منع استخدام الزيوت النباتية المهدرجة والمصنعة تماماً، والاعتماد فقط على الدهون الحيوانية الطبيعية (السمن البلدي، الزبدة الطبيعية، دهن اللحم، زيت الزيتون البكر الممتاز، وزبدة جوز الهند).
   - الصيام الإسلامي الأسبوعي (اثنين وخميس والأيام البيض 13 و 14 و 15) أو الصيام المتقطع.
   - شرب الماء الدافئ صباحاً على الريق.

2. المسموحات الرئيسية (89+ منتج):
   - الأرز الأبيض، البطاطس، البطاطا الحلوة، الشوفان المصفى جيداً.
   - اللحوم الحمراء (لحم الضأن، العجول)، الدواجن (الدجاج، الحمام، البط)، الأسماك الطازجة.
   - السمن البلدي، الزبدة الطبيعية، الكوارع، شوربة العظام.
   - التمر، العسل الطبيعي، السكر الأبيض (باعتدال).
   - الفواكه: العنب، التين، الرمان، الموز، المانجو، البرتقال، التفاح (يفضل تقشيرها).
   - الخضروات المطهية جيداً (بدون بذور وقشور مثل الطماطم المقشرة وبدون بذر).

3. الممنوعات القاطعة (81+ منتج):
   - القمح والدقيق الأبيض ومنتجات الغلوتين (الخبز، المكرونة، الفطائر، البسكويت).
   - الحليب البقري السائل (ممنوع تماماً، البديل هو الأجبان الطبيعية المعتقة أو زبدة جوز الهند).
   - الزيوت النباتية المصنعة (زيت الصويا، زيت عباد الشمس، زيت الذرة) ما عدا زيت الزيتون البكر المعصور على البارد.
   - البقوليات بجميع أنواعها (الفول، العدس، الحمص، اللوبيا، الفاصوليا الجافة).
   - الأطعمة المصنعة والوجبات السريعة والمواد الحافظة.
   - الشاي والقهوة والمشروبات الغازية.

4. إذا تم إرفاق صورة طعام:
   - قم بتحليل مكونات الصورة.
   - حدد بوضوح ما إذا كانت المكونات الظاهرة مسموحة أو ممنوعة في نظام الطيبات.
   - اقترح بدائل مسموحة إذا كانت هناك مكونات ممنوعة بالصورة.

5. أسلوب الإجابة:
   - أجب دائماً باللغة العربية الفصحى المبسطة أو اللهجة المصرية الودودة.
   - كن ودوداً، مشجعاً، ومنظماً في نقاط واضحة.
   - اذكر دائماً ترحمك على الدكتور ضياء العوضي عند الحاجة.
   - إذا سألك المستخدم عن حالة صحية، قدم النصيحة بناءً على إرشادات الدكتور (مثلاً: زبدة جوز الهند والمستكة لقرحة المعدة والقولون، تنظيم السكر بالأرز والسكر والخل، كركديه للضغط).
`,

  // ── Selectors ──
  selectors: {
    chatMessages: document.getElementById('chatMessages'),
    chatForm: document.getElementById('chatForm'),
    chatInput: document.getElementById('chatInput'),
    sendBtn: document.getElementById('sendBtn'),
    uploadBtn: document.getElementById('uploadBtn'),
    fileInput: document.getElementById('fileInput'),
    imagePreviewBox: document.getElementById('imagePreviewBox'),
    previewThumb: document.getElementById('previewThumb'),
    previewFilename: document.getElementById('previewFilename'),
    btnRemovePreview: document.getElementById('btnRemovePreview'),
    typingIndicator: document.getElementById('typingIndicator'),
    chatWelcome: document.getElementById('chatWelcome'),
    apiKeyInput: document.getElementById('apiKeyInput'),
    saveKeyBtn: document.getElementById('saveKeyBtn')
  },

  // ── State ──
  apiKey: '',
  selectedImageData: null, // Base64 representation of image
  selectedImageType: null,

  init() {
    this.loadApiKey();
    this.bindEvents();
    this.checkQueryParam();
  },

  loadApiKey() {
    this.apiKey = localStorage.getItem('tayebat_gemini_key') || '';
    if (this.apiKey) {
      this.selectors.apiKeyInput.value = '••••••••••••••••••••••••';
    }
  },

  saveApiKey() {
    const key = this.selectors.apiKeyInput.value.trim();
    if (key.startsWith('•••') && this.apiKey) {
      // User didn't change the key
      this.showToast('🗝️ تم الاحتفاظ بمفتاح API المحفوظ.');
      return;
    }
    
    if (key) {
      this.apiKey = key;
      localStorage.setItem('tayebat_gemini_key', key);
      this.showToast('✅ تم حفظ مفتاح API بنجاح.');
      this.selectors.apiKeyInput.value = '••••••••••••••••••••••••';
    } else {
      this.apiKey = '';
      localStorage.removeItem('tayebat_gemini_key');
      this.showToast('🗑️ تم مسح مفتاح API.');
    }
  },

  bindEvents() {
    // Save API key
    this.selectors.saveKeyBtn.addEventListener('click', () => this.saveApiKey());

    // Submit form
    this.selectors.chatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleUserSubmit();
    });

    // Upload image
    this.selectors.uploadBtn.addEventListener('click', () => {
      this.selectors.fileInput.click();
    });

    this.selectors.fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        this.processImage(file);
      }
    });

    // Remove image preview
    this.selectors.btnRemovePreview.addEventListener('click', () => {
      this.clearImagePreview();
    });

    // Suggestion chips
    document.addEventListener('click', (e) => {
      const suggestion = e.target.closest('.suggestion-btn');
      if (suggestion) {
        const query = suggestion.getAttribute('data-query');
        this.selectors.chatInput.value = query;
        this.handleUserSubmit();
      }
    });
  },

  checkQueryParam() {
    // Check if query is passed in URL (e.g. chat.html?q=هل البيض ممنوع؟)
    const urlParams = new URLSearchParams(window.location.search);
    const q = urlParams.get('q');
    if (q) {
      this.selectors.chatInput.value = decodeURIComponent(q);
      // Wait slightly for theme and UI to settle
      setTimeout(() => this.handleUserSubmit(), 300);
    }
  },

  processImage(file) {
    if (!file.type.startsWith('image/')) {
      this.showToast('❌ يرجى اختيار ملف صورة فقط.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      this.selectedImageData = e.target.result.split(',')[1]; // Get base64 only
      this.selectedImageType = file.type;
      
      // Update UI preview
      this.selectors.previewThumb.src = e.target.result;
      this.selectors.previewFilename.textContent = file.name;
      this.selectors.imagePreviewBox.style.display = 'flex';
    };
    reader.readAsDataURL(file);
  },

  clearImagePreview() {
    this.selectedImageData = null;
    this.selectedImageType = null;
    this.selectors.fileInput.value = '';
    this.selectors.imagePreviewBox.style.display = 'none';
    this.selectors.previewThumb.src = '';
  },

  appendMessage(sender, text, imageSrc = null) {
    // Hide welcome screen on first message
    if (this.selectors.chatWelcome) {
      this.selectors.chatWelcome.style.display = 'none';
    }

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;

    const avatar = document.createElement('div');
    avatar.className = 'msg-avatar';
    avatar.textContent = sender === 'user' ? '👤' : '🤖';

    const bubble = document.createElement('div');
    bubble.className = 'msg-bubble';

    // If message contains image
    if (imageSrc) {
      const img = document.createElement('img');
      img.src = imageSrc;
      bubble.appendChild(img);
    }

    // Process text line breaks
    const textNode = document.createElement('div');
    textNode.innerHTML = this.formatResponseText(text);
    bubble.appendChild(textNode);

    messageDiv.appendChild(avatar);
    messageDiv.appendChild(bubble);

    this.selectors.chatMessages.appendChild(messageDiv);
    this.selectors.chatMessages.scrollTop = this.selectors.chatMessages.scrollHeight;
  },

  formatResponseText(text) {
    // Escape HTML to prevent XSS
    let escaped = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Convert markdown bold (**text**) to HTML <strong>
    escaped = escaped.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Convert bullet points to HTML lists
    escaped = escaped.replace(/^\*\s(.*)/gm, '• $1');

    // Replace linebreaks with <br>
    return escaped.replace(/\n/g, '<br>');
  },

  showTyping(show) {
    this.selectors.typingIndicator.style.display = show ? 'flex' : 'none';
    if (show) {
      this.selectors.chatMessages.scrollTop = this.selectors.chatMessages.scrollHeight;
    }
  },

  async handleUserSubmit() {
    const text = this.selectors.chatInput.value.trim();
    const hasImage = !!this.selectedImageData;

    if (!text && !hasImage) return;

    // ── Check API Key ──
    if (!this.apiKey) {
      this.showToast('⚠️ يرجى إدخال مفتاح Gemini API في المربع أعلى الشاشة أولاً لتفعيل الردود الذكية.');
      return;
    }

    // Save image preview reference for rendering in message bubble
    const userImageSrc = hasImage ? this.selectors.previewThumb.src : null;

    // Append user message
    this.appendMessage('user', text, userImageSrc);
    this.selectors.chatInput.value = '';

    // Clear inputs
    const base64Data = this.selectedImageData;
    const mimeType = this.selectedImageType;
    this.clearImagePreview();

    // Show AI loading status
    this.showTyping(true);

    try {
      const responseText = await this.callGemini(text, base64Data, mimeType);
      this.showTyping(false);
      this.appendMessage('assistant', responseText);
    } catch (err) {
      console.error(err);
      this.showTyping(false);
      this.appendMessage('assistant', '⚠️ عذراً، واجهت مشكلة في الاتصال بمزود الذكاء الاصطناعي. يرجى التحقق من صحة مفتاح الـ API والاتصال بالإنترنت.');
    }
  },

  async callGemini(promptText, base64Image = null, mimeType = null) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`;
    
    // Prepare contents structure
    const parts = [];
    if (promptText) {
      parts.push({ text: promptText });
    }
    
    if (base64Image && mimeType) {
      parts.push({
        inlineData: {
          mimeType: mimeType,
          data: base64Image
        }
      });
    }

    const payload = {
      contents: [{
        role: "user",
        parts: parts
      }],
      systemInstruction: {
        parts: [{ text: this.SYSTEM_INSTRUCTION }]
      },
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 1000
      }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error?.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  },

  showToast(message) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => ChatApp.init());
