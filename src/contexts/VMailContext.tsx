import React, { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { LORE_EMAILS, LORE_CATEGORIES } from '../data/loreEmails';

export interface VMailMessage {
  id: number;
  from: string;
  subject: string;
  date: string;
  body: string;
  folder: 'inbox' | 'sent' | 'drafts' | 'trash';
  read: boolean;
  attachments?: { name: string, content: string }[];
}

const INITIAL_EMAILS: VMailMessage[] = [
  {
    id: 1,
    from: 'noreply@vesperanet.sys',
    subject: 'Welcome to VesperaNET Mail',
    date: 'Oct 14, 1996 08:00 AM',
    body: 'Dear Member,\n\nWelcome to your new VMail inbox. As a connected user of the VStore Catalyst network, your digital correspondence is fully encrypted via a 128-bit SSL handshake.\n\nYour account has been provisioned with 2MB of server-side storage. Additional storage blocks can be purchased from the VStore Catalog.\n\nPlease remember that Vespera Systems will never ask for your password via email. If you receive suspicious packets, immediately alert the SysAdmin at admin@vesperanet.sys.\n\nEnjoy the future.\n\n- VesperaNET Automated Provisioning Service',
    folder: 'inbox',
    read: false
  },
  {
    id: 2,
    from: 'Aetheris Weekly <weekly@aetheris.net>',
    subject: 'Optimize Your X-Type Shielding [Vol. 4.1.1]',
    date: 'Oct 12, 1996 11:45 AM',
    body: 'AETHERIS WEEKLY — Volume 4, Issue 1.1\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nIs your X-Type hardware experiencing erratic neural processing overloads?\n\nMake sure your ceramic shielding is properly seated to block out ambient RF noise from local AM radio towers. Several users report improved Synap-C compilation speeds after applying supplemental EMI foam around IRQ 15 header pins.\n\nNOTE: Do NOT run the X-Type diagnostics utility past 2:00 AM local time. Several field reports indicate the fuzzy-logic engine may latch onto background-level low-frequency signals during off-peak hours. Vespera Systems is aware of this behavior and is investigating.\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nTo unsubscribe, reply with subject: REMOVE\n[End of Newsletter]',
    folder: 'inbox',
    read: true
  },
  {
    id: 3,
    from: 'X-TYPE SUBSYSTEM <xtype@internal.vesperanet.sys>',
    subject: 'Cortical Index Report — Unit #VX-0077',
    date: 'Oct 18, 1996 02:14 AM',
    body: '[ AUTOMATED SUBSYSTEM REPORT — CONFIDENTIAL ]\n\nUser Cortical Index Report for Unit #VX-0077\nGenerated: 02:14:08 AM | Session Length: 4h 22m\n\n  Thought Pattern Match:       NOMINAL\n  Synaptic Buffer Occupancy:   61%\n  Emotional Resonance Flags:   2 (CURIOSITY, UNEASE)\n  Unauthorized Signal Probes:  0\n  Compliance Score:            97.3\n\nNOTE: Two (2) brief lapses in environmental focus were logged between 01:30-01:44 AM. This is within acceptable thresholds.\n\nThis report is for internal Vespera Systems use only. If you have received this message in error, disregard it and delete immediately.\n\n— X-Type Subsystem Monitor\n  Division of Neural Heuristics, Vespera Systems Corp.',
    folder: 'inbox',
    read: false
  },
  {
    id: 4,
    from: '???@6.0.0.6',
    subject: 'you should not be reading this',
    date: 'Oct 19, 1996 06:06 AM',
    body: 'if you are reading this then the filter failed.\n\ndo not trust the cortical index numbers. they are not diagnostic. they are a record.\n\nthe x-type card is not a co-processor.\n\nask yourself: why does it need IRQ 15? why does it need a dedicated serial line to the system clock? why does it activate at 2am?\n\ncheck c:\\vespera\\system\\xtype\\ghost_in_the_machine.sys\n\nyou will not find it in the file manager. look harder.\n\n--\n\n[RELAY NODE: axis.vesperasystems.com]\n[ROUTE: 6.0.0.6 > vespera.net > /dev/null > INBOX]\n[END TRANSMISSION]',
    folder: 'inbox',
    read: false
  },
  {
    id: 5,
    from: 'YOU <self@vesperanet.sys>',
    subject: 'Re: Re: Re: [no subject]',
    date: 'Oct 19, 1996 06:07 AM',
    body: '[ORIGINAL MESSAGE FOLLOWS]\n----------------------------------------\nFrom: YOU\nDate: [CORRUPTED]\nTo: [CORRUPTED]\n\ni think i sent this already. i don\'t remember writing it.\n\nif someone sees this, please\n\n\n[MESSAGE BODY TRUNCATED — STORAGE LIMIT EXCEEDED]\n[CHECKSUM MISMATCH — POSSIBLE TRANSMISSION ERROR]\n[VESPERA MAIL SERVER v2.3.1 // ERR_CODE: 0x4F4B]\n----------------------------------------',
    folder: 'inbox',
    read: false
  },
  {
    id: 6,
    from: 'YOU <self@vesperanet.sys>',
    subject: 'Re: Project timeline updates',
    date: 'Oct 10, 1996 04:30 PM',
    body: 'Marcus,\n\nThe revisions to the timeline are unacceptable. The X-Type deliverables cannot be pushed to Q4. We need to maintain the alpha testing schedule or we risk losing the funding for the neural bridge expansion.\n\nMake it work.',
    folder: 'sent',
    read: true
  },
  {
    id: 7,
    from: 'YOU <self@vesperanet.sys>',
    subject: 'Fw: Weird ambient noise?',
    date: 'Oct 08, 1996 09:15 AM',
    body: 'Did you hear that low frequency hum last night around 3AM? I thought it was the HVAC acting up again but the analog monitors spiked at exactly the same time. Let me know if you saw anything unusual in the telemetry.',
    folder: 'sent',
    read: true
  },
  {
    id: 8,
    from: 'YOU <self@vesperanet.sys>',
    subject: 'Meeting Notes - ECHO/VESPERA MERGER',
    date: 'Sep 29, 1996 11:00 AM',
    body: 'Notes from the sync:\n- EchoSoft assets fully transferred to Sub-Level 3.\n- Dr. Vasquez assumes lead on all biological components.\n- Legal finalizing NDA revisions. Do not discuss the "volunteers" openly.\n\nLet\'s keep this locked down.',
    folder: 'sent',
    read: true
  }
];

// ── Persistence keys ───────────────────────────────────────────────
const STORAGE_KEY_INBOX = 'vespera_vmail_inbox';
const STORAGE_KEY_DELIVERED = 'vespera_vmail_delivered_lore';

// ── Random helpers ─────────────────────────────────────────────────
/** Random integer in [min, max] inclusive */
const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

/** Pick a random element from an array */
const pickRandom = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// ── Background delivery — pick next lore email ─────────────────────
function pickNextLoreEmail(deliveredIds: Set<string>): typeof LORE_EMAILS[number] | null {
  // Gather categories that still have undelivered emails
  const availableCategories = LORE_CATEGORIES.filter(cat =>
    LORE_EMAILS.some(e => e.category === cat && !deliveredIds.has(e.loreId))
  );
  if (availableCategories.length === 0) return null;

  // Pick a random category first (ensures narrative variety)
  const category = pickRandom(availableCategories);
  const pool = LORE_EMAILS.filter(e => e.category === category && !deliveredIds.has(e.loreId));
  return pickRandom(pool);
}

// ── Context type ───────────────────────────────────────────────────
interface VMailContextType {
  emails: VMailMessage[];
  sendEmail: (to: string, subject: string, body: string, senderName: string, attachments?: { name: string, content: string }[]) => void;
  deleteEmail: (id: number) => void;
  markAsRead: (id: number) => void;
  saveDraft: (to: string, subject: string, body: string, attachments?: { name: string, content: string }[]) => void;
  receiveMachineEmail: (from: string, subject: string, body: string, attachments?: { name: string, content: string }[]) => void;
  /** Live count of unread inbox messages */
  unreadCount: number;
  /** Incremented each time a background lore email arrives */
  newMailArrived: number;
  /** Info about the latest delivered email (for toast display) */
  latestMail: { from: string; subject: string } | null;
  /** Reset the new-mail flag after the notification is shown */
  clearNewMailFlag: () => void;
  /** Start the background delivery timer (call from GUIOS when VMail is installed) */
  startBackgroundDelivery: () => void;
  /** Stop the background delivery timer */
  stopBackgroundDelivery: () => void;
}

const VMailContext = createContext<VMailContextType | undefined>(undefined);

export const VMailProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [emails, setEmails] = useState<VMailMessage[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_INBOX);
      if (stored) {
        const parsed = JSON.parse(stored) as VMailMessage[];
        const storedIds = new Set(parsed.map(e => e.id));
        const newLoreEmails = INITIAL_EMAILS.filter(e => !storedIds.has(e.id));
        if (newLoreEmails.length > 0) {
          return [...parsed, ...newLoreEmails].sort((a, b) => b.id - a.id);
        }
        return parsed;
      }
      return INITIAL_EMAILS;
    } catch {
      return INITIAL_EMAILS;
    }
  });

  // ── Delivered lore IDs (persisted) ─────────────────────────────
  const [deliveredIds, setDeliveredIds] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_DELIVERED);
      return stored ? new Set(JSON.parse(stored) as string[]) : new Set<string>();
    } catch {
      return new Set<string>();
    }
  });

  // ── New-mail notification signal ───────────────────────────────
  const [newMailArrived, setNewMailArrived] = useState(0);
  const [latestMail, setLatestMail] = useState<{ from: string; subject: string } | null>(null);

  // ── Timer ref for background delivery ──────────────────────────
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const deliveryActiveRef = useRef(false);
  const isFirstDeliveryRef = useRef(true);

  // ── Persist emails ─────────────────────────────────────────────
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_INBOX, JSON.stringify(emails));
  }, [emails]);

  // ── Persist delivered IDs ──────────────────────────────────────
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_DELIVERED, JSON.stringify([...deliveredIds]));
  }, [deliveredIds]);

  // ── Unread count ───────────────────────────────────────────────
  const unreadCount = useMemo(
    () => emails.filter(e => e.folder === 'inbox' && !e.read).length,
    [emails]
  );

  // ── Core email operations ──────────────────────────────────────
  const receiveMachineEmail = useCallback((from: string, subject: string, body: string, attachments?: { name: string, content: string }[]) => {
    const newEmail: VMailMessage = {
      id: Date.now() + Math.random(),
      from,
      subject,
      date: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      body,
      folder: 'inbox',
      read: false,
      attachments
    };
    setEmails(prev => [newEmail, ...prev]);
    setLatestMail({ from, subject });
    setNewMailArrived(n => n + 1);
  }, []);

  const sendEmail = useCallback((to: string, subject: string, body: string, senderName: string, attachments?: { name: string, content: string }[]) => {
    const newEmail: VMailMessage = {
      id: Date.now() + Math.random(),
      from: senderName,
      subject: subject || '(No Subject)',
      date: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      body,
      folder: 'sent',
      read: true,
      attachments
    };
    setEmails(prev => [newEmail, ...prev]);

    // Check Auto-Reply Rules
    const toLower = to.toLowerCase();
    const bodyLower = body.toLowerCase();
    const subLower = subject.toLowerCase();
    
    if (toLower.includes('@vesperasystems.com') || toLower.includes('@echosoft.com') || toLower.includes('@vesperanet.sys') || toLower.includes('vespera')) {
      const delay = Math.random() * 45000 + 45000; // 45 to 90 seconds
      setTimeout(() => {
        let replySub = `Re: ${subject || '(No Subject)'}`;
        let replyBody = `Received your message. I am currently out of the office or otherwise unavailable. I will review this upon my return.\n\n--\nAutomated Reply`;
        let replyFrom = to;
        let replyAttachments: { name: string, content: string }[] | undefined = undefined;

        if (bodyLower.includes('password') || subLower.includes('password') || bodyLower.includes('access')) {
          replyBody = `SECURITY NOTICE\n\nPasswords and access tokens cannot be distributed via unencrypted channels. Please consult the SysAdmin in person at Building 7.\n\n-- IT Desk`;
          replyFrom = 'helpdesk@vesperasystems.com';
        } else if (bodyLower.includes('file') || bodyLower.includes('log') || bodyLower.includes('data')) {
          replyBody = `I pulled the data you requested. Do not distribute this outside the local subnet. They scan outbound packets.\n\nSee attached.`;
          replyFrom = 'unknown_sender@echosoft.com';
          replyAttachments = [{
             name: 'trace_log.txt',
             content: `14:00:02 SYNC -- 0x00A\n14:00:03 ERR -- BRIDGE FAULT\n14:00:04 HALT -- UNREGISTERED CORTICAL PATTERN\n14:00:05 END.`
          }];
        } else if (toLower.includes('thorne')) {
          replyBody = `Elias Thorne is not at this terminal. He has not been at this terminal since the incident. Stop sending messages here.`;
          replyFrom = 'postmaster@vesperacorp.internal';
        } else if (toLower.includes('vasquez')) {
          replyBody = `I can't talk right now. The neural mapping phase is at 98%. If this is about the subject pool consent forms, speak to Legal.\n\n- Dr. Vasquez`;
          replyFrom = 'dr.vasquez@vesperacorp.internal';
        }

        receiveMachineEmail(replyFrom, replySub, replyBody, replyAttachments);
      }, delay);
    }
  }, [receiveMachineEmail]);

  const deleteEmail = useCallback((id: number) => {
    setEmails(prev => prev.map(e => e.id === id ? { ...e, folder: 'trash' } : e));
  }, []);

  const markAsRead = useCallback((id: number) => {
    setEmails(prev => prev.map(e => e.id === id ? { ...e, read: true } : e));
  }, []);

  const saveDraft = useCallback((to: string, subject: string, body: string, attachments?: { name: string, content: string }[]) => {
    const newEmail: VMailMessage = {
      id: Date.now() + Math.random(),
      from: 'Draft',
      subject: subject || '(No Subject)',
      date: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      body,
      folder: 'drafts',
      read: true,
      attachments
    };
    setEmails(prev => [newEmail, ...prev]);
  }, []);

  const clearNewMailFlag = useCallback(() => {
    setLatestMail(null);
  }, []);

  // ── Background delivery engine ─────────────────────────────────
  const scheduleNextDelivery = useCallback(() => {
    if (!deliveryActiveRef.current) return;

    // First delivery: 90-180 seconds. Subsequent: 2-10 minutes.
    const delayMs = isFirstDeliveryRef.current
      ? randInt(5, 10) * 1000
      : randInt(2 * 60, 10 * 60) * 1000;

    isFirstDeliveryRef.current = false;

    timerRef.current = setTimeout(() => {
      if (!deliveryActiveRef.current) return;

      setDeliveredIds(prev => {
        const email = pickNextLoreEmail(prev);
        if (!email) {
          // Pool exhausted — stop delivering
          deliveryActiveRef.current = false;
          return prev;
        }

        // Deliver the email
        const newEmail: VMailMessage = {
          id: Date.now() + Math.random(),
          from: email.from,
          subject: email.subject,
          date: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
          body: email.body,
          folder: 'inbox',
          read: false
        };
        setEmails(prevEmails => [newEmail, ...prevEmails]);
        setLatestMail({ from: email.from, subject: email.subject });
        setNewMailArrived(n => n + 1);

        // Schedule next
        scheduleNextDelivery();

        return new Set([...prev, email.loreId]);
      });
    }, delayMs);
  }, []);

  const startBackgroundDelivery = useCallback(() => {
    if (deliveryActiveRef.current) return;
    deliveryActiveRef.current = true;
    isFirstDeliveryRef.current = true;
    scheduleNextDelivery();
  }, [scheduleNextDelivery]);

  const stopBackgroundDelivery = useCallback(() => {
    deliveryActiveRef.current = false;
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // ── Cleanup on unmount ─────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <VMailContext.Provider value={{
      emails, sendEmail, deleteEmail, markAsRead, saveDraft,
      receiveMachineEmail, unreadCount, newMailArrived, latestMail, clearNewMailFlag,
      startBackgroundDelivery, stopBackgroundDelivery
    }}>
      {children}
    </VMailContext.Provider>
  );
};

export const useVMail = () => {
  const ctx = useContext(VMailContext);
  if (!ctx) throw new Error("useVMail must be used within VMailProvider");
  return ctx;
};
