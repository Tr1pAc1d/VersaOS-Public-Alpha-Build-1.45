/**
 * HauntManager.ts
 * 
 * A vanilla JS manager for progressive psychological horror effects.
 * Hooks into the DOM to slowly degrade the UI based on how long
 * the EMI FILTERS BYPASS (unrestrictedPollingEnabled) has been active.
 */

export class HauntManager {
  private active: boolean = false;
  private startTime: number = 0;
  private stage: number = 0;
  private intervals: number[] = [];
  private timeouts: number[] = [];
  private originalTexts: Map<Node, string> = new Map();
  private animationFrameId: number | null = null;

  /**
   * Starts the progressive haunting sequence.
   * Call this when the BIOS toggle (emiBypassActive) is turned ON.
   */
  start() {
    if (this.active) return;
    this.active = true;
    this.startTime = Date.now();
    this.stage = 0;
    this.loop();
    console.warn("EMI FILTERS BYPASS ENGAGED. Analog bleed initiated.");
  }

  /**
   * Stops the haunting sequence and cleans up the DOM.
   * Call this when the BIOS toggle is turned OFF.
   */
  stop() {
    this.active = false;
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    
    // Clear all timers
    this.intervals.forEach(clearInterval);
    this.timeouts.forEach(clearTimeout);
    this.intervals = [];
    this.timeouts = [];
    
    // Remove classes
    document.body.classList.remove('haunt-cursor-wait', 'haunt-severe-glitch');
    
    // Remove injected elements
    const scanlines = document.getElementById('haunt-scanlines');
    if (scanlines) scanlines.remove();
    
    document.querySelectorAll('.haunt-popup').forEach(el => el.remove());
    
    const panic = document.getElementById('haunt-kernel-panic');
    if (panic) panic.remove();
    
    // Revert text and chromatic aberration
    this.revertAllText();
    document.querySelectorAll('.haunt-chromatic').forEach(el => {
      el.classList.remove('haunt-chromatic');
    });
  }

  /**
   * Main game loop to track elapsed time and escalate stages.
   */
  private loop = () => {
    if (!this.active) return;
    const elapsed = (Date.now() - this.startTime) / 1000;

    // Escalate stages based on elapsed time
    if (elapsed >= 90 && this.stage < 4) {
      this.setStage(4);
    } else if (elapsed >= 60 && elapsed < 90 && this.stage < 3) {
      this.setStage(3);
    } else if (elapsed >= 30 && elapsed < 60 && this.stage < 2) {
      this.setStage(2);
    } else if (elapsed >= 0 && elapsed < 30 && this.stage < 1) {
      this.setStage(1);
    }

    if (this.stage < 4) {
      this.animationFrameId = requestAnimationFrame(this.loop);
    }
  }

  private setStage(stage: number) {
    this.stage = stage;
    
    if (stage === 1) {
      // Stage 1: Analog Bleed (0-30s)
      if (!document.getElementById('haunt-scanlines')) {
        const scanlines = document.createElement('div');
        scanlines.id = 'haunt-scanlines';
        scanlines.className = 'haunt-scanlines';
        document.body.appendChild(scanlines);
      }
      this.intervals.push(window.setInterval(() => this.shiverElements(), 2000));
      this.intervals.push(window.setInterval(() => this.applyChromaticAberration(), 4000));
    }

    if (stage === 2) {
      // Stage 2: Heuristic Corruption (30-60s)
      this.intervals.push(window.setInterval(() => this.corruptText(), 6000));
      this.intervals.push(window.setInterval(() => this.glitchMouse(), 8000));
    }

    if (stage === 3) {
      // Stage 3: Total Synaptic Failure (60-90s)
      document.body.classList.add('haunt-severe-glitch');
      this.intervals.push(window.setInterval(() => this.spawnFakePopup(), 3500));
    }

    if (stage === 4) {
      // Climax (90s+)
      this.triggerKernelPanic();
    }
  }

  // =========================================
  // Stage 1 Mechanics
  // =========================================
  private shiverElements() {
    const elements = document.querySelectorAll('div, span, button');
    if (elements.length === 0) return;
    
    // Pick 1-3 random elements to shiver
    const count = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < count; i++) {
      const el = elements[Math.floor(Math.random() * elements.length)] as HTMLElement;
      const originalTransform = el.style.transform;
      
      const x = (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 3) + 1);
      const y = (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 3) + 1);
      
      el.style.transform = `${originalTransform} translate(${x}px, ${y}px)`;
      
      this.timeouts.push(window.setTimeout(() => {
        if (el) el.style.transform = originalTransform;
      }, 150));
    }
  }

  private applyChromaticAberration() {
    const elements = document.querySelectorAll('span, p, h1, h2, h3, button');
    if (elements.length === 0) return;
    
    const el = elements[Math.floor(Math.random() * elements.length)] as HTMLElement;
    el.classList.add('haunt-chromatic');
    
    this.timeouts.push(window.setTimeout(() => {
      if (el) el.classList.remove('haunt-chromatic');
    }, 3000));
  }

  // =========================================
  // Stage 2 Mechanics
  // =========================================
  private corruptText() {
    const creepyTexts = ["COLD", "NULL_ENTITY", "IT PERCEIVES", "1975", "WHERE", "THEY ARE AWAKE", "TOO LOUD"];
    
    // Use TreeWalker to find text nodes
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
    const textNodes: Node[] = [];
    let node;
    while (node = walker.nextNode()) {
      if (node.nodeValue && node.nodeValue.trim().length > 3) {
        // Avoid script/style tags
        if (node.parentElement && !['SCRIPT', 'STYLE'].includes(node.parentElement.tagName)) {
          textNodes.push(node);
        }
      }
    }

    if (textNodes.length === 0) return;

    const targetNode = textNodes[Math.floor(Math.random() * textNodes.length)];
    const originalText = targetNode.nodeValue || "";
    
    if (!this.originalTexts.has(targetNode)) {
      this.originalTexts.set(targetNode, originalText);
    }

    const words = originalText.split(' ');
    if (words.length > 0) {
      const replaceIdx = Math.floor(Math.random() * words.length);
      words[replaceIdx] = creepyTexts[Math.floor(Math.random() * creepyTexts.length)];
      targetNode.nodeValue = words.join(' ');

      this.timeouts.push(window.setTimeout(() => {
        if (this.originalTexts.has(targetNode)) {
          targetNode.nodeValue = this.originalTexts.get(targetNode)!;
          this.originalTexts.delete(targetNode);
        }
      }, 2000));
    }
  }

  private revertAllText() {
    this.originalTexts.forEach((text, node) => {
      node.nodeValue = text;
    });
    this.originalTexts.clear();
  }

  private glitchMouse() {
    void import('./audio').then((m) => m.playGlitchCorruptSound());
    document.body.classList.add('haunt-cursor-wait');
    console.warn("System Warning: Unknown peripheral attempting input.");
    
    this.timeouts.push(window.setTimeout(() => {
      document.body.classList.remove('haunt-cursor-wait');
    }, 1500));
  }

  // =========================================
  // Stage 3 Mechanics
  // =========================================
  private spawnFakePopup() {
    const messages = [
      "Fatal Error: Non-Euclidean data overflow in sector 4.",
      "Cannot terminate process. THEY ARE AWAKE.",
      "AETHERIS KERNEL PANIC: Too many voices.",
      "Invalid memory address: 0xDEADBEEF. Entity localized.",
      "Analog interference exceeds safe parameters. RUN."
    ];

    const popup = document.createElement('div');
    popup.className = 'haunt-popup';
    
    const x = Math.floor(Math.random() * (window.innerWidth - 300));
    const y = Math.floor(Math.random() * (window.innerHeight - 150));
    
    popup.style.left = `${x}px`;
    popup.style.top = `${y}px`;

    const msg = messages[Math.floor(Math.random() * messages.length)];
    void import('./audio').then((m) => m.playGlitchCorruptSound());

    popup.innerHTML = `
      <div class="haunt-popup-header">
        <span>Error</span>
        <span>X</span>
      </div>
      <div class="haunt-popup-content">
        <div class="haunt-popup-icon">X</div>
        <div>${msg}</div>
      </div>
      <button class="haunt-popup-button" onclick="this.parentElement.remove()">OK</button>
    `;

    document.body.appendChild(popup);
  }

  // =========================================
  // Climax
  // =========================================
  private triggerKernelPanic() {
    this.intervals.forEach(clearInterval);
    
    const panicDiv = document.createElement('div');
    panicDiv.id = 'haunt-kernel-panic';
    document.body.appendChild(panicDiv);

    const lines = [
      "AETHERIS KERNEL PANIC",
      "=====================",
      "",
      "Fatal exception 0E has occurred at 0028:C0011E36 in VxD VMM(01) + 00010E36.",
      "The current application will be terminated.",
      "",
      "CPU Registers:",
      "EAX=00000000 EBX=00F312A2 ECX=00000008 EDX=FFFFFFFF",
      "ESI=00000100 EDI=0000A1F4 EBP=00000000 ESP=00000000",
      "CS=0028 DS=0020 ES=0020 FS=0000 GS=0000 SS=0020",
      "EIP=00011E36 EFL=00000246",
      "",
      "Call Trace:",
      "[<c010a0f0>] do_page_fault+0x120/0x3a0",
      "[<c010a000>] do_page_fault+0x30/0x3a0",
      "[<c010a0f0>] do_page_fault+0x120/0x3a0",
      "[<c010a000>] do_page_fault+0x30/0x3a0",
      "[<c010a0f0>] do_page_fault+0x120/0x3a0",
      "",
      "Stack Dump:",
      "00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000000",
      "00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000000",
      "00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000000",
      "00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000000",
      "",
      "System Error Codes:",
      "ERR_MEM_ALLOC_FAIL: 0x00000001",
      "ERR_PAGE_FAULT_IN_NON_EUCLIDEAN_AREA: 0x00000002",
      "ERR_X_TYPE_BRIDGE_DESYNCHRONIZATION: 0x00000003",
      "ERR_UNHANDLED_COGNITIVE_RESONANCE: 0x00000004",
      "",
      "Dumping physical memory to disk... FAILED.",
      "Storage medium unresponsive.",
      "Recursive auditory feedback loop detected.",
      "",
      "System halted.",
      "",
      "<span class=\"haunt-cursor-blink\">Press any key or click to reboot_</span>"
    ];

    let currentIndex = 0;
    const renderBlocks = () => {
      if (!this.active) return;
      const chunkSize = Math.floor(Math.random() * 10) + 5; // 5 to 15 lines at a time
      const nextIndex = Math.min(currentIndex + chunkSize, lines.length);
      
      panicDiv.innerHTML = lines.slice(0, nextIndex).join('<br/>');
      currentIndex = nextIndex;

      if (currentIndex < lines.length) {
        this.timeouts.push(window.setTimeout(renderBlocks, 20 + Math.random() * 30));
      } else {
        const handleReboot = () => {
          localStorage.setItem('needsRecovery', 'true');
          window.location.reload();
        };

        panicDiv.addEventListener('click', handleReboot);
        window.addEventListener('keydown', handleReboot);
      }
    };

    renderBlocks();
  }
}

export const hauntManager = new HauntManager();
