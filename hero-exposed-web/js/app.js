/* ==========================================================================
   MAWANG OS v1.0 Desktop Interactivity Script (Updated v7 with 3-Layer Stage)
   Retro OS Shell for Sooyoung Jang Portfolio
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // --- [0] Asset Preloading Engine (Background Caching) ---
  const assetsToPreload = [
    // Big Backgrounds (Crucial for first paint of desktop & game window)
    "./assets/backgrounds/SettlementMonitorBG.png",
    "./assets/backgrounds/Low_BG.png",
    "./assets/backgrounds/BG1.png",

    // Normal Sprites (Required for initial renders of windows)
    "./assets/characters/Superior/00_Normal.png",
    "./assets/characters/Werewolf/00_Normal.png",
    "./assets/characters/Orc/00_Normal.png",
    "./assets/characters/Goblin/00_Normal.png",
    "./assets/characters/DarkElf/00_Normal.png",
    "./assets/characters/Ghoul/00_Normal.png",
    "./assets/characters/Vampire/00_Normal.png",
    "./assets/characters/Lich/00_Normal.png",

    // Additional Werewolf expressions (Essential for smooth simulator slider lag-free)
    "./assets/characters/Werewolf/01_Angry.png",
    "./assets/characters/Werewolf/02_Nervous.png"
  ];

  function preloadAssets(urls) {
    urls.forEach(url => {
      const img = new Image();
      img.src = url; // Downloads and stores in browser image memory cache
    });
  }

  // Fire preloading immediately so download starts while user is on the login/boot screen
  preloadAssets(assetsToPreload);

  // --- [0-1] YouTube Facade: 클릭 시 실제 iframe으로 교체 ---
  // 페이지 로드 시 유튜브 서버 접속을 차단하고 썸네일만 표시.
  // 사용자가 클릭할 때 autoplay iframe을 동적 삽입.
  document.querySelectorAll('.yt-facade').forEach(facade => {
    facade.addEventListener('click', function () {
      const videoId = this.dataset.videoid;
      const playerId = this.dataset.playerId;
      const iframe = document.createElement('iframe');
      iframe.width = '100%';
      iframe.height = '100%';
      iframe.style.cssText = 'display:block; border:none;';
      iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
      iframe.title = 'YouTube video player';
      iframe.frameBorder = '0';
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
      iframe.allowFullscreen = true;
      if (playerId) iframe.id = playerId;
      this.replaceWith(iframe);
    });
  });

  // --- [1] Web Audio API Synthesizer (Zero-dependency Retro Sound) ---
  let audioCtx = null;

  function initAudio() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  // Active audio recovery on first document click to bypass Autoplay blocks safely
  document.addEventListener('click', () => {
    initAudio();
  }, { once: true });

  // --- [1-2] Mawang OS Login / Boot screen Logic ---
  const bootScreen = document.getElementById('boot-screen');
  const connectBtn = document.getElementById('connect-btn');
  const desktopEl = document.getElementById('desktop');
  const taskbarEl = document.getElementById('taskbar');

  if (connectBtn && bootScreen) {
    connectBtn.addEventListener('click', () => {
      // 1. Initialize audio context securely
      initAudio();

      // 2. Play boot chime
      playSound('boot');

      // 3. Trigger fade transitions
      bootScreen.classList.add('fade-out');

      if (desktopEl) desktopEl.classList.add('fade-in');
      if (taskbarEl) taskbarEl.classList.add('fade-in');

      // Start cascading window animations as desktop fades in
      startBootCascade();

      // 4. Remove boot screen entirely after transition
      setTimeout(() => {
        bootScreen.style.display = 'none';
      }, 850);
    });
  }

  function playSound(type) {
    try {
      initAudio();
      if (!audioCtx) return;

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      const now = audioCtx.currentTime;

      if (type === 'click') {
        // Light retro click beep
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
      }
      else if (type === 'success') {
        // Happy 8-bit double coin ring
        osc.type = 'square';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.08, now + 0.08); // E5
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      }
      else if (type === 'error') {
        // Buzzer sound
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(130, now); // Low C3
        osc.frequency.linearRampToValueAtTime(80, now + 0.2);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        osc.start(now);
        osc.stop(now + 0.22);
      }
      else if (type === 'vending') {
        // Clunky vending machine dispenser thud (double low frequency thuds)
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.setValueAtTime(75, now + 0.12);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      }
      else if (type === 'boot') {
        // Cyberpunk / Retro 8-bit boot up chime (ascending chord: C4 - E4 - G4 - C5)
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(261.63, now); // C4
        osc.frequency.setValueAtTime(329.63, now + 0.08); // E4
        osc.frequency.setValueAtTime(392.00, now + 0.16); // G4
        osc.frequency.setValueAtTime(523.25, now + 0.24); // C5

        gain.gain.setValueAtTime(0.12, now);
        gain.gain.linearRampToValueAtTime(0.12, now + 0.3);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

        osc.start(now);
        osc.stop(now + 0.5);
      }
    } catch (e) {
      console.warn("Audio Context playback failed or was blocked by browser autoplay policy.", e);
    }
  }

  // --- [2] Virtual Windows OS Core Logic (Drag & Z-Index) ---
  const windows = document.querySelectorAll('.window');
  const desktop = document.getElementById('desktop');
  const taskTabsContainer = document.getElementById('task-tabs');
  let topZIndex = 100;
  let currentStageMonsterRace = null;
  let stageBubbleTimeout = null;

  // Helper to safely display a single active speech bubble with transition (canceling previous timeouts)
  function showStageBubble(text, durationMs) {
    if (stageBubbleTimeout) {
      clearTimeout(stageBubbleTimeout);
      stageBubbleTimeout = null;
    }

    const targetParent = stage ? stage.parentElement : null;
    if (!targetParent) return;

    let bubble = document.querySelector('.bg-chat-bubble');
    if (!bubble) {
      bubble = document.createElement('div');
      bubble.className = 'bg-chat-bubble';
      targetParent.appendChild(bubble);
    }

    bubble.textContent = text;
    bubble.classList.remove('visible');
    void bubble.offsetWidth; // Force reflow
    bubble.classList.add('visible');

    // Auto fade-out & remove
    stageBubbleTimeout = setTimeout(() => {
      bubble.classList.remove('visible');
      stageBubbleTimeout = setTimeout(() => {
        bubble.remove();
      }, 300);
    }, durationMs);
  }

  // Set window focus (bringing to front)
  function focusWindow(win) {
    if (!win.classList.contains('active')) {
      windows.forEach(w => w.classList.remove('active'));
      win.classList.add('active');
      topZIndex += 1;
      win.style.zIndex = topZIndex;

      // Update taskbar tab state
      updateTaskbarActiveTab(win.id);
    }
  }

  // Window drag-and-drop mechanism
  windows.forEach(win => {
    const titleBar = win.querySelector('.window-title-bar');

    // Window click to focus
    win.addEventListener('mousedown', () => {
      focusWindow(win);
    });

    titleBar.addEventListener('mousedown', (e) => {
      // Do not drag if clicking button control
      if (e.target.classList.contains('win-btn')) return;

      focusWindow(win);

      // Safeguard: Convert right/bottom styles to left/top to prevent layout stretching bugs
      const computedStyle = window.getComputedStyle(win);
      if (win.style.bottom || win.style.right || computedStyle.bottom !== 'auto' || computedStyle.right !== 'auto') {
        const rect = win.getBoundingClientRect();
        win.style.left = `${rect.left}px`;
        win.style.top = `${rect.top}px`;
        win.style.right = 'auto';
        win.style.bottom = 'auto';
      }

      let posX = e.clientX;
      let posY = e.clientY;

      function onMouseMove(e) {
        const dx = e.clientX - posX;
        const dy = e.clientY - posY;
        posX = e.clientX;
        posY = e.clientY;

        win.style.left = `${win.offsetLeft + dx}px`;
        win.style.top = `${win.offsetTop + dy}px`;
      }

      function onMouseUp() {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      }

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    });

    // Min / Max / Close control triggers
    const closeBtn = win.querySelector('.win-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        playSound('click');

        // Trigger scale zoom-out fade animation
        win.classList.remove('window-open');
        win.classList.add('window-closing');
        removeTaskbarTab(win.id);

        setTimeout(() => {
          win.style.display = 'none';
          win.classList.remove('window-closing');
        }, 160);

        // Pause CCTV player if the window is closed
        if (win.id === 'window-media-player') {
          controlCCTVPlayer('pauseVideo');
        }
        if (win.id === 'window-media-player-figma') {
          controlFigmaPlayer('pauseVideo');
        }
        // Stop YouTube audio inside Summary Window when it closes
        if (win.id === 'window-summary') {
          const summaryIframes = win.querySelectorAll('iframe');
          summaryIframes.forEach(iframe => {
            if (iframe.src.includes('youtube.com')) {
              try {
                iframe.contentWindow.postMessage(JSON.stringify({
                  event: 'command',
                  func: 'pauseVideo'
                }), '*');
              } catch (e) { }
            }
          });
        }
        // Open mini radio widget when the main radio is closed
        if (win.id === 'window-radio') {
          const radioWidget = document.getElementById('radio-widget');
          if (radioWidget) {
            radioWidget.classList.remove('window-closing');
            radioWidget.style.display = 'block';
            void radioWidget.offsetWidth; // Force Reflow
            radioWidget.classList.add('window-open');
            updateWidgetUI();
          }
        }
      });
    }

    const minBtn = win.querySelector('.win-min');
    if (minBtn) {
      minBtn.addEventListener('click', () => {
        playSound('click');
        win.style.display = 'none';

        // Stop YouTube audio inside Summary Window when minimized
        if (win.id === 'window-summary') {
          const summaryIframes = win.querySelectorAll('iframe');
          summaryIframes.forEach(iframe => {
            if (iframe.src.includes('youtube.com')) {
              try {
                iframe.contentWindow.postMessage(JSON.stringify({
                  event: 'command',
                  func: 'pauseVideo'
                }), '*');
              } catch (e) { }
            }
          });
        }
      });
    }
  });

  // Helper to synthesize a cute 8-bit pop open chime
  function playOpenWindowSound() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'sine';
      const now = ctx.currentTime;
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.setValueAtTime(640, now + 0.08); // Ascending pop arpeggio

      gain.gain.setValueAtTime(0.015, now); // Gentle volume
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);

      osc.start();
      osc.stop(now + 0.2);
    } catch (e) { }
  }

  // Open window function
  function openWindow(winId, silent = false) {
    const win = document.getElementById(winId);
    if (win) {
      if (!silent) {
        playOpenWindowSound(); // Play pop sound!
      }

      win.classList.remove('window-closing');
      win.style.display = 'flex';
      void win.offsetWidth; // Force Reflow to trigger CSS scale transition
      win.classList.add('window-open');
      focusWindow(win);
      createTaskbarTab(winId, win.querySelector('.window-title').textContent);

      // Close the radio widget if the main radio window is reopened
      if (winId === 'window-radio') {
        const radioWidget = document.getElementById('radio-widget');
        if (radioWidget) {
          radioWidget.classList.remove('window-open');
          radioWidget.classList.add('window-closing');
          setTimeout(() => {
            radioWidget.style.display = 'none';
            radioWidget.classList.remove('window-closing');
          }, 160);
        }
      }

      // Start typing animation if boss window is opened
      if (winId === 'window-boss') {
        startBossTyping();
      }
    }
  }

  // --- [3] Start Menu & Desktop Icons Bindings ---

  // Toggle Start Menu
  const startBtn = document.getElementById('start-btn');
  const startMenu = document.getElementById('start-menu');

  startBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    playSound('click');
    startBtn.classList.toggle('active');
    startMenu.style.display = startMenu.style.display === 'none' ? 'flex' : 'none';
  });

  document.addEventListener('click', () => {
    startBtn.classList.remove('active');
    startMenu.style.display = 'none';
  });

  startMenu.addEventListener('click', (e) => {
    e.stopPropagation(); // Prevent closing when clicking inside
  });

  // Desktop Icons double-click triggers
  const desktopIcons = document.querySelectorAll('.desktop-icon');
  desktopIcons.forEach(icon => {
    const target = icon.getAttribute('data-target');

    // Support double-click for desktop feel
    icon.addEventListener('dblclick', () => {
      openWindow(target);
    });

    // Support single click for touch/mobile devices
    icon.addEventListener('click', (e) => {
      if (window.innerWidth <= 768) {
        openWindow(target);
      }
    });
  });

  // Folder grid item click triggers
  const folderItems = document.querySelectorAll('.folder-item');
  folderItems.forEach(item => {
    const target = item.getAttribute('data-target');
    item.addEventListener('click', () => {
      openWindow(target);
    });
  });

  // Start Menu sub-links
  const menuItems = startMenu.querySelectorAll('.menu-item[data-target]');
  menuItems.forEach(item => {
    const target = item.getAttribute('data-target');
    item.addEventListener('click', () => {
      openWindow(target);
      startMenu.style.display = 'none';
      startBtn.classList.remove('active');
    });
  });

  // --- [4] Dynamic Taskbar Tabs System ---

  function createTaskbarTab(winId, title) {
    // Check if tab already exists
    if (document.getElementById(`tab-${winId}`)) return;

    const tab = document.createElement('div');
    tab.className = 'task-tab';
    tab.id = `tab-${winId}`;
    tab.textContent = title;

    tab.addEventListener('click', () => {
      playSound('click');
      const win = document.getElementById(winId);
      if (win) {
        if (win.style.display === 'none') {
          win.style.display = 'flex';
          focusWindow(win);
        } else if (win.classList.contains('active')) {
          // If already active and clicked, minimize it
          win.style.display = 'none';
          tab.classList.remove('active');

          // Pause CCTV if minimized
          if (winId === 'window-media-player') {
            controlCCTVPlayer('pauseVideo');
          }
        } else {
          focusWindow(win);
        }
      }
    });

    taskTabsContainer.appendChild(tab);
    updateTaskbarActiveTab(winId);
  }

  function removeTaskbarTab(winId) {
    const tab = document.getElementById(`tab-${winId}`);
    if (tab) {
      tab.remove();
    }
  }

  function updateTaskbarActiveTab(activeWinId) {
    const tabs = taskTabsContainer.querySelectorAll('.task-tab');
    tabs.forEach(tab => {
      if (tab.id === `tab-${activeWinId}`) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });
  }

  // --- [5] Werewolf Interrogation Simulator Logic ---
  const stressRange = document.getElementById('stress-range');
  const stressNum = document.getElementById('stress-num');
  const wolfFace = document.getElementById('wolf-face');
  const statusBadge = document.getElementById('status-badge');
  const speechText = document.getElementById('speech-text');

  // Werewolf dialogues for different stress levels
  const werewolfDialogues = {
    normal: [
      "마왕물산 보안데스크 보안 주임님! 신입인턴 웨어울프입니다! 오늘 출근 허가 부탁드립니다! 열심히 킁킁!",
      "사원증이요? 여기 소속이랑 이름 정확하게 적혀있지 않습니까! 멍! 결재 부탁드립니다 선배님!",
      "오늘 급식 고기반찬 나옵니까? 킁킁.. 고기 냄새가 아래 식당에서 올라오는 거 같아서 군침이 돕니다!"
    ],
    flustered: [
      "앗, 죄송합니다..! 서류에 오타가 있었습니까? 낑낑.. 인사팀장님한테 혼나면 인턴 잘리는데.. 제발 눈감아 주십시오..!",
      "그, 그게 사실 출근 시간이 살짝 늦긴 했는데.. 차가 밀렸습니다 선배님! 꼬리치기 신공 낑낑..!",
      "귀, 귀라뇨? 이게 왜 가짜입니까! 웨어울프니까 귀가 복슬복슬 있는게 정상이지 않습니까..! 낑낑.."
    ],
    angry: [
      "크르르릉! 야근에 찌들어서 서류 좀 헷갈릴 수도 있지! 마왕물산은 인턴한테 주 120시간 일 시키고 월급은 쥐꼬리만큼 주면서 왈왈!! 사표 쓸 거야! 크르릉!",
      "인간 왕국의 스파이? 내가 왜 여우 레인저란 말인가 크르르! ..앗, 나도 모르게 비밀 임무 톤이 튀어나왔.. 아니, 야근 때문에 미친 겁니다 크르릉!!",
      "마왕이고 기획이고 디자인이고 다 덤벼라! 퇴사 선언이다! 난 늑대 숲으로 돌아갈 거야 크아아아아아앙!!"
    ]
  };

  function getDialogue(level) {
    const list = werewolfDialogues[level];
    const idx = Math.floor(Math.random() * list.length);
    return list[idx];
  }

  stressRange.addEventListener('input', (e) => {
    const val = parseInt(e.target.value);
    stressNum.textContent = val;

    // Change expression & response text based on stress thresholds
    if (val < 50) {
      if (!wolfFace.classList.contains('normal')) {
        wolfFace.src = "./assets/characters/Werewolf/00_Normal.png";
        wolfFace.className = 'npc-face-img normal';
        statusBadge.className = 'badge badge-normal';
        statusBadge.textContent = 'NORMAL';
        speechText.textContent = getDialogue('normal');
        playSound('click');
      }
    }
    else if (val >= 50 && val < 80) {
      if (!wolfFace.classList.contains('flustered')) {
        wolfFace.src = "./assets/characters/Werewolf/02_Nervous.png";
        wolfFace.className = 'npc-face-img flustered';
        statusBadge.className = 'badge badge-flustered';
        statusBadge.textContent = 'FLUSTERED';
        speechText.textContent = getDialogue('flustered');
        playSound('click');
      }
    }
    else {
      if (!wolfFace.classList.contains('angry')) {
        wolfFace.src = "./assets/characters/Werewolf/01_Angry.png";
        wolfFace.className = 'npc-face-img angry';
        statusBadge.className = 'badge badge-angry';
        statusBadge.textContent = 'ANGRY';
        speechText.textContent = getDialogue('angry');
        playSound('error'); // Play alert/roar-like buzz sound
      }
    }
  });

  // --- [6] Vending Machine (Document Shop UI Rework) Logic ---
  const invSlotsSpan = document.getElementById('inv-slots');
  const shopMsg = document.getElementById('shop-msg');
  const buyBtns = document.querySelectorAll('.buy-btn');

  buyBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const itemEl = e.target.closest('.shop-item');
      const name = itemEl.getAttribute('data-name');
      const link = itemEl.getAttribute('data-link');

      // Dispense action: Play sound & Update ticker text
      playSound('vending');

      const cleanName = name.replace(/^\d+\./, '').replace(/_/g, ' ');
      if (invSlotsSpan) invSlotsSpan.textContent = `[ ${cleanName} ]`;
      if (shopMsg) {
        shopMsg.textContent = `덜컹! '${cleanName}' 기획 음료가 배출구에 떨어졌습니다.`;
        shopMsg.style.color = '#000080';
      }

      // Open Document link in a new window after a slight 200ms delay to let thud play first
      setTimeout(() => {
        window.open(link, '_blank');
      }, 250);
    });
  });

  // --- [7] CCTV Media Player YouTube Control Logic ---
  const iframe = document.getElementById('cctv-player');
  const playBtn = document.getElementById('btn-cctv-play');
  const pauseBtn = document.getElementById('btn-cctv-pause');
  const stopBtn = document.getElementById('btn-cctv-stop');

  function controlCCTVPlayer(func) {
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage(JSON.stringify({
        event: 'command',
        func: func,
        args: ''
      }), '*');
    }
  }

  playBtn.addEventListener('click', () => {
    playSound('click');
    controlCCTVPlayer('playVideo');
  });

  pauseBtn.addEventListener('click', () => {
    playSound('click');
    controlCCTVPlayer('pauseVideo');
  });

  stopBtn.addEventListener('click', () => {
    playSound('click');
    controlCCTVPlayer('stopVideo');
  });

  // --- [7-2] Figma Media Player YouTube Control Logic ---
  const figmaIframe = document.getElementById('figma-player');
  const figmaPlayBtn = document.getElementById('btn-figma-play');
  const figmaPauseBtn = document.getElementById('btn-figma-pause');
  const figmaStopBtn = document.getElementById('btn-figma-stop');

  function controlFigmaPlayer(func) {
    if (figmaIframe && figmaIframe.contentWindow) {
      figmaIframe.contentWindow.postMessage(JSON.stringify({
        event: 'command',
        func: func,
        args: ''
      }), '*');
    }
  }

  if (figmaPlayBtn) {
    figmaPlayBtn.addEventListener('click', () => {
      playSound('click');
      controlFigmaPlayer('playVideo');
    });
  }

  if (figmaPauseBtn) {
    figmaPauseBtn.addEventListener('click', () => {
      playSound('click');
      controlFigmaPlayer('pauseVideo');
    });
  }

  if (figmaStopBtn) {
    figmaStopBtn.addEventListener('click', () => {
      playSound('click');
      controlFigmaPlayer('stopVideo');
    });
  }

  // --- [8] Interactive Monster Art Gallery Logic ---
  const monsterListItems = document.querySelectorAll('.monster-list-item');
  const galleryTabBtns = document.querySelectorAll('.gallery-tab-btn');
  const galleryMainImg = document.getElementById('gallery-main-img');
  const galleryMonsterName = document.getElementById('gallery-monster-name');
  const galleryMonsterDept = document.getElementById('gallery-monster-dept');
  const galleryMonsterDesc = document.getElementById('gallery-monster-desc');

  // Selected State
  let currentMonster = 'Werewolf';
  let currentExpression = '00_Normal';

  // Monsters Detailed Design & Prompt Specifications
  const monstersData = {
    Werewolf: {
      name: "웨어울프 (Werewolf)",
      dept: "인사관리부 인사 서기",
      desc: "의욕은 200%이나 실수는 300%인 신입 인턴사원. 군기가 든 씩씩한 다/나/까의 군대식 어투를 고집하려 하나, 은연중에 킁킁/낑낑 같은 개과의 본능적인 호흡이나 의성어가 대사에 섞여 나옵니다. 칭찬을 하거나 특히 고기 반찬 등 먹을거리 이야기를 하면 호들갑스럽게 기뻐합니다. 스트레스 폭발(Angry) 시 야근에 찌든 설움을 으르렁거리며 쏟아냅니다. 위장 용사(여우 레인저 스파이)의 경우 여유롭고 능글맞은 레인저의 어투와 조롱 섞인 가벼운 톤이 튀어나와 꼬리가 잡힙니다."
    },
    Orc: {
      name: "오크 (Orc)",
      dept: "시설관리팀 현장 용역",
      desc: "거친 반말조와 시설 공사장에서 쓰이는 노가다 은어(빠루, 공구리 등)를 구사하는 투박한 베테랑 현장직입니다. 진짜 오크는 스트레스 폭발(Angry) 시 이성이 결여되어 상대를 도륙하려 드는 살벌한 맹수의 폭력성을 보이지만, 위장 용사(기사 스파이)는 50점 이상에서 기사도적 예의가 튀어나오고 70점 이상에서는 기품 있고 깍듯한 고풍스러운 기사의 존댓말을 구사하는 결정적인 성품 반전(약점)을 노출합니다."
    },
    Goblin: {
      name: "고블린 (Goblin)",
      dept: "재무회계팀 자금 경리",
      desc: "돈 냄새를 기가 막히게 맡는 자금 담당. 말이 빠르고 앙칼진 반말과 시급, KPI 등 깐깐한 경제 용어를 내뱉으며 상대의 헛소리를 날카롭게 꼬집습니다. 진짜 고블린은 손해 발생 시 이성을 잃고 법무팀을 찾으며 징벌을 선언하는 비열한 겁쟁이지만, 위장 용사(광전사 스파이)는 내면의 살인적 파괴 욕구와 피에 굶주린 광전사의 포효를 주체하지 못하고 흘려대다 발각되는 심리적 모순이 있습니다."
    },
    DarkElf: {
      name: "다크엘프 (DarkElf)",
      dept: "전략기획팀 신임 팀장",
      desc: "유능하고 빈틈없는 엘리트 상사를 동경하지만, 실무 경험 부족으로 모든 행동과 말투가 뻣뻣하고 어리숙한 의욕 과잉의 신참 페르소나를 지니고 있습니다. 사담과 가십거리에 몹시 약해 유저가 잡담을 걸면 규정을 잊고 쉽게 휘둘립니다. 다크엘프의 탈을 쓴 위장 용사(스파이)는 겉으로는 엘리트 매니저인 척 위장하지만, 실상은 뒷골목에서 활약하던 교활하고 포악한 여도적입니다. 스트레스 지수가 극대화되면 참지 못하고 포악하고 거친 본성을 여과 없이 유출하여 꼬리가 잡히게 됩니다."
    },
    Ghoul: {
      name: "구울 (Ghoul)",
      dept: "시설관리팀 단순 잡부",
      desc: "뇌세포가 부패하여 단어 사이에 느린 숨소리(...)를 섞어 멍청하고 어눌하게 대답하는 노동자입니다. 진짜 구울은 스트레스를 극대화하면 어눌함을 지우고 상대를 식재료로 부르며 빠르게 침을 흘리는 포식자로 돌변하는 반면, 위장 용사(예술가 스파이)는 50점 이상에서 감출 수 없는 고풍스럽고 섬세한 미술/문학/음악 등의 예술가적 주관을 내뱉어 멍청한 구울의 형상과 어긋나 검거됩니다."
    },
    Vampire: {
      name: "뱀파이어 (Vampire)",
      dept: "전략사업팀 야간 정보원",
      desc: "오만하고 서늘한 귀족적 존댓말을 구사하며 영겁의 지루함을 유희로 삼는 뱀파이어 신사입니다. 진짜 뱀파이어는 스트레스 폭발 시 가학적인 피의 갈증을 뿜어내는 상위 포식자이지만, 위장 용사(성직자 스파이)는 50점 이상에서 죄 사함과 참회를 권고하며 70점 이상이 되면 뱀파이어가 가장 혐오하는 '성수', '기도문', '이교도 정화' 같은 맹렬한 종교적 단어들을 소리쳐 파문당합니다."
    },
    Lich: {
      name: "리치 (Lich)",
      dept: "마력전산팀 시스템 관리자",
      desc: "감정을 배제한 차갑고 딱딱한 지적 반말로 상대의 논리적 오류를 검증하는 마법 전산 시스템 관리자입니다. 진짜 리치는 스트레스 폭발 시 상대를 데이터 오류로 보아 영혼 소멸을 선언하지만, 위장 용사(무속인 스파이)는 50점 이상에서 액운이나 흉조에 대한 미신적 공포로 호들갑을 떨며 70점 이상에서는 부적과 신령, 살풀이 등의 무속 행세를 시전해 정체가 탄로납니다."
    }
  };

  function updateGalleryDisplay() {
    let fileSuffix = currentExpression;
    galleryMainImg.src = `./assets/characters/${currentMonster}/${fileSuffix}.png`;

    const mData = monstersData[currentMonster];
    if (mData) {
      galleryMonsterName.textContent = mData.name;
      galleryMonsterDept.textContent = mData.dept;
      galleryMonsterDesc.textContent = mData.desc;
    }
  }

  monsterListItems.forEach(item => {
    item.addEventListener('click', () => {
      playSound('click');
      monsterListItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');

      currentMonster = item.getAttribute('data-monster');
      updateGalleryDisplay();
    });
  });

  galleryTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      playSound('click');
      galleryTabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      currentExpression = btn.getAttribute('data-expression');
      updateGalleryDisplay();
    });
  });

  updateGalleryDisplay();

  // --- [9] 3-Layer Desktop Stage Animation Logic (Walking & Breathing Monsters) ---
  const stage = document.getElementById('bg-characters-stage');
  const monsterRaces = ['Werewolf', 'Orc', 'Goblin', 'DarkElf', 'Ghoul', 'Vampire', 'Lich'];

  // Custom stage dialogues for walking background monsters (matching their prompts/personalities)
  const stageDialogues = {
    Werewolf: [
      "선배님! 킁킁... 사원증 여기 있습니다! 멍! 오늘 야근도 각오하고 왔습니다!",
      "제 꼬리가 흔들리는 건 기분 탓입니다..! 낑낑.. 출근 허가 부탁드립니다!"
    ],
    Orc: [
      "어이 보안관, 사원증 여기 던진다! 바쁘니까 빨리빨리 도장 찍으라고!",
      "야근 수당만 두둑하면 철근도 씹어먹지! 크어어, 퇴근 마렵네!"
    ],
    Goblin: [
      "자금 경리가 공짜로 도장 찍어줄 줄 알아? 헷, 월급이나 올려달라구!",
      "야근 특근 다 G단위 경비 처리 해줄 거지? 돈 안 주면 바로 고소야!"
    ],
    DarkElf: [
      "전략기획팀 안건 브리핑하러 왔습니다. 보안 검사는 신속하게 랩업(Wrap-up)해 주시죠.",
      "이번 마왕님 브랜딩 컨셉은 럭셔리(Luxury)입니다. 비인가 마력 조사는 사절하겠습니다."
    ],
    Ghoul: [
      "어어어... 배... 배고파... 밥... 고기...",
      "사원증... 잃어... 버렸다... 어어어..."
    ],
    Vampire: [
      "나른한 밤이로군. 하등한 스켈레톤 보안관에게 사원증을 내밀어야 하다니.",
      "어두운 그늘이 마왕물산의 유일한 안식처지. 낮 근무는 피하고 싶군요."
    ],
    Lich: [
      "마력 전산 네트워크 보안 무결성 상태 점검 중이다. 쓸데없는 말로 내 마력을 낭비 마라.",
      "에러 코드 404... 마법 방화벽 패치가 지연되고 있으니 신속히 승인해라."
    ]
  };

  function spawnStageMonster() {
    if (!stage) return;

    // Choose random monster
    const race = monsterRaces[Math.floor(Math.random() * monsterRaces.length)];
    currentStageMonsterRace = race;

    // Create elements
    const charImg = document.createElement('img');
    charImg.className = 'stage-char';
    charImg.src = `./assets/characters/${race}/00_Normal.png`;
    charImg.alt = `${race} stage walker`;

    // Setup initial spawn state
    charImg.style.left = '-150px'; // Offscreen left
    stage.appendChild(charImg);

    // Start Walk in
    setTimeout(() => {
      charImg.classList.add('walking');
      charImg.style.left = '50%'; // Exact horizontal center of the window hole
    }, 100);

    // 3 seconds walk in complete
    setTimeout(() => {
      charImg.classList.remove('walking');
      charImg.classList.add('breathe');

      // Spawn Speech Bubble using unified safety helper (6.5s duration)
      const quotes = stageDialogues[race];
      showStageBubble(quotes[Math.floor(Math.random() * quotes.length)], 6500);

      // Let speech display for 6.5 seconds, then fade out and exit character
      setTimeout(() => {
        charImg.classList.remove('breathe');
        charImg.classList.add('walking');
        charImg.style.left = '135%'; // Offscreen right

        // Complete walk out (3s)
        setTimeout(() => {
          charImg.remove();
          currentStageMonsterRace = null; // Reset

          // Wait 1.5 seconds and spawn the next monster!
          setTimeout(spawnStageMonster, 1500);
        }, 3000);
      }, 6800); // 6.5s text display + 300ms transition buffer

    }, 3200);
  }

  // Start the background loop after desktop load (1 second delay for snappy spawning)
  setTimeout(spawnStageMonster, 1000);

  // --- [10] System Time Tray Clock ---
  function updateTime() {
    const timeSpan = document.getElementById('system-time');
    if (timeSpan) {
      const now = new Date();
      let hours = now.getHours();
      let minutes = now.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // 0 hour should be 12
      minutes = minutes < 10 ? '0' + minutes : minutes;
      timeSpan.textContent = `${hours}:${minutes} ${ampm}`;
    }
  }

  // --- [11] Mawang OS Radio Audio Player Logic ---
  const radioAudio = new Audio();
  let currentTrackIndex = 0;
  const trackFiles = [
    "Radio1.mp3", "Radio2.mp3", "Radio3.mp3", "Radio4.mp3",
    "Radio5.mp3", "Radio6.mp3", "Radio7.mp3", "Radio8.mp3",
    "Radio9.mp3", "Radio10.mp3", "Radio11.mp3", "Radio12.mp3"
  ];
  const trackNames = [
    "월요일 아침의 마왕성",
    "커피 없이 버티는 인턴십",
    "야근 확정의 퓨처베이스",
    "상사 몰래 피우는 담배 한 대",
    "뇌물 봉투와 보안 주임",
    "웨어울프의 밤샘 보고서",
    "마이너스 통장 탈출기",
    "데이터 에러와 리치 대리",
    "감사관 몰래 마시는 마력 드링크",
    "가짜 신분증 감별사의 고충",
    "퇴사 충동 100% Lo-Fi",
    "마왕 사장님의 최종 지시사항"
  ];

  // Set initial volume
  radioAudio.volume = 0.8;

  // DOM Elements
  const radioPlayBtn = document.getElementById('radio-play');
  const radioPauseBtn = document.getElementById('radio-pause');
  const radioStopBtn = document.getElementById('radio-stop');
  const radioPrevBtn = document.getElementById('radio-prev');
  const radioNextBtn = document.getElementById('radio-next');
  const radioVolSlider = document.getElementById('radio-vol');
  const radioStatusText = document.getElementById('radio-status-text');
  const radioTimeInfo = document.getElementById('radio-time-info');
  const radioSeekTrack = document.getElementById('radio-seek-track');
  const radioSeekFill = document.getElementById('radio-seek-fill');
  const radioSeekThumb = document.getElementById('radio-seek-thumb');
  const playlistItems = document.querySelectorAll('.playlist-item');

  function formatTime(seconds) {
    if (isNaN(seconds)) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins < 10 ? '0' + mins : mins}:${secs < 10 ? '0' + secs : secs}`;
  }

  function updatePlaylistUI() {
    playlistItems.forEach((item, idx) => {
      if (idx === currentTrackIndex) {
        item.classList.add('active');
        item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      } else {
        item.classList.remove('active');
      }
    });
  }

  function playTrack(index) {
    if (index < 0 || index >= trackFiles.length) return;
    currentTrackIndex = index;

    // Swap audio source
    radioAudio.src = `./assets/bgm/${trackFiles[index]}`;
    radioAudio.load();

    radioAudio.play()
      .then(() => {
        radioStatusText.textContent = `▶ ON AIR - Track ${index + 1} (${trackNames[index]})`;
        updatePlaylistUI();
        updateWidgetUI();
      })
      .catch(err => {
        console.warn("Audio autoplay blocked or file missing: ", err);
        radioStatusText.textContent = `⚠️ ERR - '${trackNames[index]}' 로드 실패`;
      });
  }

  // Playback Control Handlers
  if (radioPlayBtn) {
    radioPlayBtn.addEventListener('click', () => {
      if (!radioAudio.src || radioAudio.src === '') {
        playTrack(currentTrackIndex);
      } else {
        radioAudio.play()
          .then(() => {
            radioStatusText.textContent = `▶ ON AIR - Track ${currentTrackIndex + 1} (${trackNames[currentTrackIndex]})`;
            updateWidgetUI();
          })
          .catch(err => console.warn(err));
      }
    });
  }

  if (radioPauseBtn) {
    radioPauseBtn.addEventListener('click', () => {
      radioAudio.pause();
      radioStatusText.textContent = `⏸ PAUSED - ${trackNames[currentTrackIndex]}`;
      updateWidgetUI();
    });
  }

  if (radioStopBtn) {
    radioStopBtn.addEventListener('click', () => {
      radioAudio.pause();
      radioAudio.currentTime = 0;
      radioStatusText.textContent = `■ STOPPED - ${trackNames[currentTrackIndex]}`;
      if (radioSeekFill) radioSeekFill.style.width = '0%';
      if (radioSeekThumb) radioSeekThumb.style.left = '0%';
      if (radioTimeInfo) radioTimeInfo.textContent = `00:00 / 00:00`;
      updateWidgetUI();
    });
  }

  if (radioPrevBtn) {
    radioPrevBtn.addEventListener('click', () => {
      let prevIdx = currentTrackIndex - 1;
      if (prevIdx < 0) prevIdx = trackFiles.length - 1;
      playTrack(prevIdx);
    });
  }

  if (radioNextBtn) {
    radioNextBtn.addEventListener('click', () => {
      let nextIdx = (currentTrackIndex + 1) % trackFiles.length;
      playTrack(nextIdx);
    });
  }

  // Playlist Item Click Handlers
  playlistItems.forEach((item, idx) => {
    item.addEventListener('click', () => {
      playTrack(idx);
    });
  });

  // Volume Slider Control
  if (radioVolSlider) {
    radioVolSlider.addEventListener('input', function () {
      radioAudio.volume = this.value / 100;
    });
  }

  // Seek bar & Time Update Event Listener
  radioAudio.addEventListener('timeupdate', () => {
    const cur = radioAudio.currentTime;
    const dur = radioAudio.duration;
    if (radioTimeInfo) {
      radioTimeInfo.textContent = `${formatTime(cur)} / ${formatTime(dur)}`;
    }
    if (dur > 0) {
      const pct = (cur / dur) * 100;
      if (radioSeekFill) radioSeekFill.style.width = `${pct}%`;
      if (radioSeekThumb) radioSeekThumb.style.left = `${pct}%`;
    }
  });

  // Click on seek track to jump time
  if (radioSeekTrack) {
    radioSeekTrack.addEventListener('click', function (e) {
      if (!radioAudio.duration) return;
      const rect = this.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const width = rect.width;
      const pct = clickX / width;
      radioAudio.currentTime = pct * radioAudio.duration;
    });
  }

  // Auto-play Next Track when track ends
  radioAudio.addEventListener('ended', () => {
    const nextIdx = (currentTrackIndex + 1) % trackFiles.length;
    playTrack(nextIdx);
  });

  // --- [11-2] Mini Radio Widget Controller Logic ---
  function updateWidgetUI() {
    const widgetTickerText = document.getElementById('widget-ticker-text');
    if (!widgetTickerText) return;

    if (radioAudio.paused) {
      if (radioAudio.currentTime === 0) {
        widgetTickerText.textContent = "■ OFFLINE";
      } else {
        widgetTickerText.textContent = `⏸ PAUSED: ${trackNames[currentTrackIndex]}`;
      }
    } else {
      widgetTickerText.textContent = `▶ PLAYING: ${trackNames[currentTrackIndex]}`;
    }
  }

  const widgetPlay = document.getElementById('widget-play');
  const widgetPause = document.getElementById('widget-pause');
  const widgetStop = document.getElementById('widget-stop');
  const widgetClose = document.getElementById('widget-close');
  const radioWidget = document.getElementById('radio-widget');

  if (widgetPlay) {
    widgetPlay.addEventListener('click', () => {
      if (radioPlayBtn) radioPlayBtn.click();
    });
  }

  if (widgetPause) {
    widgetPause.addEventListener('click', () => {
      if (radioPauseBtn) radioPauseBtn.click();
    });
  }

  if (widgetStop) {
    widgetStop.addEventListener('click', () => {
      if (radioStopBtn) radioStopBtn.click();
    });
  }

  if (widgetClose) {
    widgetClose.addEventListener('click', () => {
      playSound('click');
      // Completely pause and reset audio playback
      if (radioStopBtn) radioStopBtn.click();
      if (radioWidget) {
        radioWidget.classList.remove('window-open');
        radioWidget.classList.add('window-closing');
        setTimeout(() => {
          radioWidget.style.display = 'none';
          radioWidget.classList.remove('window-closing');
        }, 160);
      }
    });
  }

  const widgetRestore = document.getElementById('widget-restore');
  if (widgetRestore) {
    widgetRestore.addEventListener('click', () => {
      playSound('click');
      if (radioWidget) {
        radioWidget.classList.remove('window-open');
        radioWidget.classList.add('window-closing');
        setTimeout(() => {
          radioWidget.style.display = 'none';
          radioWidget.classList.remove('window-closing');
        }, 160);
      }
      // Restore the main radio window
      openWindow('window-radio');
    });
  }

  // --- [11-3] Mawang Boss Window Typewriter & Accordion Logic ---
  let bossTypingInterval = null;

  function startBossTyping() {
    const sourceEl = document.getElementById('boss-source-text');
    const targetEl = document.getElementById('boss-typing-area');
    if (!sourceEl || !targetEl) return;

    // Reset target content
    targetEl.innerHTML = '';
    if (bossTypingInterval) clearTimeout(bossTypingInterval);

    const text = sourceEl.innerHTML.trim();
    let index = 0;

    function playTypeSound() {
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(450 + Math.random() * 150, ctx.currentTime);

        gain.gain.setValueAtTime(0.012, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.03);

        osc.start();
        osc.stop(ctx.currentTime + 0.03);
      } catch (e) { }
    }

    function type() {
      if (index < text.length) {
        if (text.charAt(index) === '<') {
          const tagEnd = text.indexOf('>', index);
          if (tagEnd !== -1) {
            targetEl.innerHTML += text.substring(index, tagEnd + 1);
            index = tagEnd + 1;
          } else {
            targetEl.innerHTML += text.charAt(index);
            index++;
          }
        } else if (text.charAt(index) === '&') {
          // Capture HTML Entity blocks (like &amp; or &quot;) and print them together
          const entityEnd = text.indexOf(';', index);
          if (entityEnd !== -1 && (entityEnd - index) < 10) {
            targetEl.innerHTML += text.substring(index, entityEnd + 1);
            index = entityEnd + 1;
          } else {
            targetEl.innerHTML += text.charAt(index);
            index++;
          }
        } else {
          targetEl.innerHTML += text.charAt(index);
          index++;
        }

        // Play typing key sound has been disabled to prevent sound cluttering and audio buffer saturation

        bossTypingInterval = setTimeout(type, 12); // Snappy 12ms typing rate
      }
    }

    // Tiny delay before starting the print
    bossTypingInterval = setTimeout(type, 150);
  }

  // Bind accordion actions
  const bossAccTriggers = document.querySelectorAll('.boss-acc-trigger');
  bossAccTriggers.forEach(trigger => {
    trigger.addEventListener('click', function () {
      playSound('click');
      const parent = this.closest('.boss-acc-item');
      const content = parent.querySelector('.boss-acc-content');

      // Close other items for single-open accord style
      document.querySelectorAll('.boss-acc-item').forEach(item => {
        if (item !== parent) {
          item.classList.remove('active');
          const innerContent = item.querySelector('.boss-acc-content');
          if (innerContent) innerContent.classList.remove('open');
        }
      });

      // Toggle self
      parent.classList.toggle('active');
      content.classList.toggle('open');
    });
  });

  // --- [11-4] Summary Window Interactive Gallery Bindings ---
  const sMonsterListItems = document.querySelectorAll('.s-monster-list-item');
  const sGalleryTabBtns = document.querySelectorAll('.s-gallery-tab-btn');
  const sGalleryMainImg = document.getElementById('s-gallery-main-img');
  const sGalleryMonsterName = document.getElementById('s-gallery-monster-name');
  const sGalleryMonsterDept = document.getElementById('s-gallery-monster-dept');
  const sGalleryMonsterDesc = document.getElementById('s-gallery-monster-desc');

  let currentSMonster = 'Werewolf';
  let currentSExpression = '00_Normal';

  function updateSummaryGalleryDisplay() {
    let fileSuffix = currentSExpression;
    if (sGalleryMainImg) {
      sGalleryMainImg.src = `./assets/characters/${currentSMonster}/${fileSuffix}.png`;
    }

    const mData = monstersData[currentSMonster];
    if (mData) {
      if (sGalleryMonsterName) sGalleryMonsterName.textContent = mData.name;
      if (sGalleryMonsterDept) sGalleryMonsterDept.textContent = mData.dept;
      if (sGalleryMonsterDesc) sGalleryMonsterDesc.textContent = mData.desc;
    }
  }

  sMonsterListItems.forEach(item => {
    item.addEventListener('click', () => {
      playSound('click');
      sMonsterListItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');

      currentSMonster = item.getAttribute('data-monster');
      // Reset expression tab to Normal on monster swap
      currentSExpression = '00_Normal';
      sGalleryTabBtns.forEach(b => {
        if (b.getAttribute('data-expression') === '00_Normal') {
          b.classList.add('active');
        } else {
          b.classList.remove('active');
        }
      });

      updateSummaryGalleryDisplay();
    });
  });

  sGalleryTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      playSound('click');
      sGalleryTabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      currentSExpression = btn.getAttribute('data-expression');
      updateSummaryGalleryDisplay();
    });
  });

  // Initialize Summary Gallery
  updateSummaryGalleryDisplay();

  // --- [11-5] Sequential Boot Cascade Sequence ---
  // Define cascading windows animation triggered AFTER connect action
  function startBootCascade() {
    // Wait for the desktop fade-in to establish (e.g., 450ms delay for the first window)
    setTimeout(() => {
      openWindow('window-boss', true);
    }, 450);

    setTimeout(() => {
      openWindow('window-radio');
    }, 950);

    setTimeout(() => {
      openWindow('window-game');
    }, 1450);

    setTimeout(() => {
      openWindow('window-summary');
    }, 1950);
  }

  // Global wrapper function for Werewolf Interrogation click event
  window.openBossInstructionWindow = function () {
    openWindow('window-boss');
  };

  // --- [11-6] Game Simulator Input & Download Highlight Logic ---
  const gameSimInput = document.getElementById('game-sim-input');
  const gameSimSendBtn = document.getElementById('game-sim-send-btn');
  const gameDownloadBtn = document.querySelector('.game-download-btn');
  let downloadHighlightTimeout = null;

  const downloadGuideQuotes = {
    Werewolf: "선배님! 킁킁... 여기는 그냥 구동화면(예시)입니다! 저랑 진짜 심문을 나누고 싶다면 우측 하단의 [빌드파일 다운로드] 버튼으로 직접 플레이해 보십시오! 멍!\n\n(※ 답변을 받으시려면 빌드를 직접 다운받아 플레이하세요!)",
    Orc: "야, 신입! 여긴 그냥 배경(예시)이다! 나한테 직접 질문을 던지려면 저기 반짝이는 노란 버튼을 눌러서 진짜 게임을 받아가라고! 어이!\n\n(※ 답변을 받으시려면 빌드를 직접 다운받아 플레이하세요!)",
    Goblin: "흥, 이 화면에 아무리 질문을 쳐봤자 AI 연동 안 돼 있다구! 진짜 내 사원증 뇌물을 확인하고 싶다면 우측 하단의 다운로드 캔을 뽑아가!\n\n(※ 답변을 받으시려면 빌드를 직접 다운받아 플레이하세요!)",
    DarkElf: "보안 주임님, 이곳은 구동 연출 화면(Mockup)입니다. 실제 LLM 심문 검증 시나리오를 구동하시려면 우측 하단의 다운로드 버튼을 클릭해 빌드를 확보해 주세요.\n\n(※ 답변을 받으시려면 빌드를 직접 다운받아 플레이하세요!)",
    Ghoul: "어어어... 여기... 가짜... 진짜... 고기... 플레이... 다운로드... 버튼... 눌러...\n\n(※ 답변을 받으시려면 빌드를 직접 다운받아 플레이하세요!)",
    Vampire: "바보 같은 스켈레톤 같으니. 이 예시 창에서 날 심문할 수 있을 줄 알았나? 진짜 내 어둠의 대화를 원한다면 우측 하단의 버튼으로 본 게임을 받도록 해.\n\n(※ 답변을 받으시려면 빌드를 직접 다운받아 플레이하세요!)",
    Lich: "전산망 연동 대기 모드다. 실제 LLM 추리 엔진과의 트랜잭션을 수립하려면 우측 하단에 노출된 보안 클라이언트 빌드를 즉시 다운로드해라.\n\n(※ 답변을 받으시려면 빌드를 직접 다운받아 플레이하세요!)"
  };

  function triggerDownloadHighlight() {
    if (!gameDownloadBtn) return;

    // Backup user input text before clearing
    const userText = gameSimInput ? gameSimInput.value.trim() : '';

    // Play error buzz to signal mockup limitation
    playSound('error');

    // Add visual bouncing/flashing effect to download button
    gameDownloadBtn.classList.add('highlight-active');

    if (downloadHighlightTimeout) clearTimeout(downloadHighlightTimeout);
    downloadHighlightTimeout = setTimeout(() => {
      gameDownloadBtn.classList.remove('highlight-active');
    }, 8000); // Highlight now matches bubble duration (8 seconds)

    // Spawn floating user bubble moving upwards
    if (userText) {
      const floatTextEl = document.createElement('div');
      floatTextEl.className = 'floating-user-text';
      floatTextEl.textContent = `💬 "${userText}"`;

      const gameWindowBody = document.querySelector('.game-window-body');
      if (gameWindowBody) {
        gameWindowBody.appendChild(floatTextEl);

        // Auto remove after animation completes
        setTimeout(() => {
          floatTextEl.remove();
        }, 2500);
      }
    }

    // Input text reset
    if (gameSimInput) gameSimInput.value = '';

    // Guide text selection (Wording changed to "우측 하단")
    let guideText = "⚠️ [시스템 안내]: 이곳은 구동 예시 화면입니다. 진짜 AI NPC와의 심문 및 플레이를 진행하려면 우측 하단의 [빌드파일 다운로드] 버튼을 클릭해 다운로드받아 주십시오!\n\n(※ 답변을 받으시려면 빌드를 직접 다운받아 플레이하세요!)";

    if (currentStageMonsterRace && downloadGuideQuotes[currentStageMonsterRace]) {
      guideText = downloadGuideQuotes[currentStageMonsterRace];
    }

    // Safely trigger speech bubble using unified single bubble controller (8s duration)
    showStageBubble(guideText, 8000);
  }

  if (gameSimSendBtn) {
    gameSimSendBtn.addEventListener('click', () => {
      if (gameSimInput && gameSimInput.value.trim() !== '') {
        triggerDownloadHighlight();
      }
    });
  }

  if (gameSimInput) {
    gameSimInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && gameSimInput.value.trim() !== '') {
        triggerDownloadHighlight();
      }
    });
  }

  // --- [11-8] Responsive Icon Grid: column-first layout that fits the viewport ---
  // Calculates how many rows fit in the desktop and sets --icon-rows on .icon-grid
  // so that icons fill top→bottom then wrap to new columns (Windows 95 style).
  function resizeIconGrid() {
    const iconGrid = document.querySelector('.icon-grid');
    const desktopArea = document.getElementById('desktop');
    if (!iconGrid || !desktopArea) return;

    const ICON_ROW_H = 125;  // px — matches grid-template-rows value in CSS
    const GAP = 20;           // px — matches gap value in CSS
    const PADDING_TOP = 30;   // px — padding-top on .icon-grid
    const PADDING_BOTTOM = 20; // px — breathing room above taskbar

    // Available height inside the desktop element (excludes taskbar)
    const desktopH = desktopArea.clientHeight;
    const available = desktopH - PADDING_TOP - PADDING_BOTTOM;

    // How many full rows fit?
    const rows = Math.max(1, Math.floor((available + GAP) / (ICON_ROW_H + GAP)));
    iconGrid.style.setProperty('--icon-rows', rows);
  }

  // Run once immediately so icons are sized correctly before any resize
  resizeIconGrid();

  // Re-run on every window resize for live responsiveness
  window.addEventListener('resize', resizeIconGrid);

  // ============================================================
  // [12] Guide Sidebar Panel
  // ============================================================

  const GUIDE_DATA = [
    // ── 핵심 탐색 (권장 순서) ──────────────────────────────────
    {
      id: 'window-summary',
      label: '★요약_포트폴리오.exe',
      desc: '장수영 포트폴리오 원클릭 통합 요약 — 처음 보실 분은 여기부터!',
      bonus: false
    },
    {
      id: 'window-profile',
      label: '보안주임_장수영.exe',
      desc: '기획자 프로필, 담당 업무별 기여 비중, 이메일/GitHub 링크',
      bonus: false
    },
    {
      id: 'window-boss',
      label: '사장실_특별지시.sys',
      desc: '마왕물산 세계관 스토리와 Day별 용사 감별 지침 아코디언',
      bonus: false
    },
    {
      id: 'window-game',
      label: '마왕물산_보안데스크.exe',
      desc: 'Unity AI 추리 게임 실제 구동 시뮬레이터 — 빌드 다운로드 포함',
      bonus: false
    },
    {
      id: 'window-portfolio-folder',
      label: '보안_작업_일지',
      desc: 'PM·기획·AI 프롬프트·디자인·사운드 상세 기획 문서 5종',
      bonus: false
    },
    {
      id: 'window-interrogation',
      label: '인턴_웨어울프_심문기.exe',
      desc: '6레이어 AI 프롬프트 및 감정 시스템 인터랙티브 슬라이더 체험',
      bonus: false
    },
    {
      id: 'window-vending',
      label: '마왕물산_기획_자판기.exe',
      desc: '8종 기획 산출물 GitHub 문서 자판기 — 캔을 뽑으면 새 탭 열림',
      bonus: false
    },
    // ── 보너스 콘텐츠 ──────────────────────────────────────────
    {
      id: 'window-gallery',
      label: '사내_직원도감.exe',
      desc: '7종 종족 캐릭터 원화 및 3단계 감정 표정 갤러리',
      bonus: true
    },
    {
      id: 'window-media-player',
      label: '최종_시연영상.mp4',
      desc: '최종 빌드 플레이 시연 유튜브 영상 (약 2분)',
      bonus: true
    },
    {
      id: 'window-media-player-figma',
      label: '기획_피그마_시연영상.mp4',
      desc: 'Figma UI/UX 기획 연출 시연 영상',
      bonus: true
    },
    {
      id: 'window-presentation',
      label: '최종_발표자료.pdf',
      desc: '프로젝트 최종 발표 슬라이드 전체 (전체화면 PDF 뷰어)',
      bonus: true
    },
    {
      id: 'window-radio',
      label: '사내_라디오.exe',
      desc: '직접 믹싱·작곡한 Lo-Fi BGM 12트랙 사내 라디오 플레이어',
      bonus: true
    },
  ];

  const GUIDE_MAIN_COUNT = GUIDE_DATA.filter(d => !d.bonus).length; // 7
  const guideVisited = new Set();

  const guidePanelEl   = document.getElementById('guide-panel');
  const guideTabBtnEl  = document.getElementById('guide-tab-btn');
  const guideCloseBtnEl = document.getElementById('guide-close-btn');
  const guidePanelBody = document.getElementById('guide-panel-body');

  // ── Render guide items ─────────────────────────────────────
  function renderGuide() {
    if (!guidePanelBody) return;

    const mainItems  = GUIDE_DATA.filter(d => !d.bonus);
    const bonusItems = GUIDE_DATA.filter(d =>  d.bonus);
    const visitedMain = mainItems.filter(d => guideVisited.has(d.id)).length;
    const pct = GUIDE_MAIN_COUNT > 0
      ? Math.round((visitedMain / GUIDE_MAIN_COUNT) * 100)
      : 0;

    let html = '';

    // Intro banner
    html += `
      <p class="guide-intro">
        💡 파일명을 클릭하면 해당 창이 열립니다.<br>
        아래 순서로 탐색하면 포트폴리오를<br>빠르게 파악할 수 있습니다.
      </p>`;

    // Progress bar
    html += `
      <div class="guide-progress-wrap">
        <span class="guide-progress-label">핵심 ${visitedMain}/${GUIDE_MAIN_COUNT}</span>
        <div class="guide-progress-track">
          <div class="guide-progress-fill" style="width:${pct}%"></div>
        </div>
      </div>`;

    // ─ Main section ─
    html += `<div class="guide-section-label">📌 핵심 탐색 (권장 순서)</div>`;
    mainItems.forEach((item, i) => {
      const checked = guideVisited.has(item.id);
      html += `
        <div class="guide-item${checked ? ' visited' : ''}" data-guide-target="${item.id}">
          <div class="guide-check">${checked ? '✓' : ''}</div>
          <div class="guide-item-content">
            <span class="guide-item-name">${i + 1}. ${item.label}</span>
            <span class="guide-item-desc">${item.desc}</span>
          </div>
        </div>`;
    });

    // ─ Bonus section ─
    html += `<div class="guide-section-label bonus">🎁 보너스 콘텐츠</div>`;
    bonusItems.forEach(item => {
      const checked = guideVisited.has(item.id);
      html += `
        <div class="guide-item${checked ? ' visited' : ''}" data-guide-target="${item.id}">
          <div class="guide-check">${checked ? '✓' : ''}</div>
          <div class="guide-item-content">
            <span class="guide-item-name">${item.label}</span>
            <span class="guide-item-desc">${item.desc}</span>
          </div>
        </div>`;
    });

    guidePanelBody.innerHTML = html;

    // Attach click → openWindow for each item
    guidePanelBody.querySelectorAll('.guide-item').forEach(el => {
      el.addEventListener('click', () => {
        const targetId = el.dataset.guideTarget;
        if (targetId) openWindow(targetId); // reuse existing openWindow()
      });
    });
  }

  // ── Mark a window as visited & re-render ──────────────────
  function guideMarkVisited(windowId) {
    if (guideVisited.has(windowId)) return;
    guideVisited.add(windowId);
    renderGuide();
  }

  // ── Observe style changes on every guide window ────────────
  // Catches visits from icons, start menu, folder items, etc.
  GUIDE_DATA.forEach(item => {
    const winEl = document.getElementById(item.id);
    if (!winEl) return;

    const obs = new MutationObserver(() => {
      const d = winEl.style.display;
      if (d && d !== 'none') {
        guideMarkVisited(item.id);
      }
    });
    obs.observe(winEl, { attributes: true, attributeFilter: ['style'] });
  });

  // ── Panel open / close ─────────────────────────────────────
  function openGuidePanel() {
    if (!guidePanelEl) return;
    guidePanelEl.classList.add('open');
    if (guideTabBtnEl) guideTabBtnEl.classList.add('hidden');
  }

  function closeGuidePanel() {
    if (!guidePanelEl) return;
    guidePanelEl.classList.remove('open');
    if (guideTabBtnEl) guideTabBtnEl.classList.remove('hidden');
  }

  if (guideTabBtnEl)  guideTabBtnEl.addEventListener('click',  openGuidePanel);
  if (guideCloseBtnEl) guideCloseBtnEl.addEventListener('click', closeGuidePanel);

  // ── Initial render ─────────────────────────────────────────
  renderGuide();

  // Check windows already visible after boot cascade (e.g. window-boss auto-opens)
  setTimeout(() => {
    GUIDE_DATA.forEach(item => {
      const winEl = document.getElementById(item.id);
      if (winEl && winEl.style.display && winEl.style.display !== 'none') {
        guideMarkVisited(item.id);
      }
    });
  }, 1500);

});

