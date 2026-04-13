import React, { createContext, useContext, useState, useEffect } from 'react';

export interface VMailMessage {
  id: number;
  from: string;
  subject: string;
  date: string;
  body: string;
  folder: 'inbox' | 'sent' | 'drafts' | 'trash';
  read: boolean;
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
  }
];

interface VMailContextType {
  emails: VMailMessage[];
  sendEmail: (to: string, subject: string, body: string, senderName: string) => void;
  deleteEmail: (id: number) => void;
  markAsRead: (id: number) => void;
  receiveMachineEmail: (from: string, subject: string, body: string) => void;
}

const VMailContext = createContext<VMailContextType | undefined>(undefined);

export const VMailProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [emails, setEmails] = useState<VMailMessage[]>(() => {
    try {
      const stored = localStorage.getItem('vespera_vmail_inbox');
      if (stored) {
        const parsed = JSON.parse(stored) as VMailMessage[];
        // Merge: add any INITIAL_EMAILS whose IDs are not present in stored data
        // (preserves user deletions — if they deleted id:3, it stays deleted)
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

  useEffect(() => {
    localStorage.setItem('vespera_vmail_inbox', JSON.stringify(emails));
  }, [emails]);

  const sendEmail = (to: string, subject: string, body: string, senderName: string) => {
    const newEmail: VMailMessage = {
      id: Date.now(),
      from: senderName,
      subject: subject || '(No Subject)',
      date: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      body,
      folder: 'sent',
      read: true
    };
    setEmails(prev => [newEmail, ...prev]);
  };

  const deleteEmail = (id: number) => {
    setEmails(prev => prev.map(e => e.id === id ? { ...e, folder: 'trash' } : e));
  };

  const markAsRead = (id: number) => {
    setEmails(prev => prev.map(e => e.id === id ? { ...e, read: true } : e));
  };
  
  const receiveMachineEmail = (from: string, subject: string, body: string) => {
     const newEmail: VMailMessage = {
      id: Date.now(),
      from,
      subject,
      date: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      body,
      folder: 'inbox',
      read: false
    };
    setEmails(prev => [newEmail, ...prev]);
  };

  return (
    <VMailContext.Provider value={{ emails, sendEmail, deleteEmail, markAsRead, receiveMachineEmail }}>
      {children}
    </VMailContext.Provider>
  );
};

export const useVMail = () => {
  const ctx = useContext(VMailContext);
  if (!ctx) throw new Error("useVMail must be used within VMailProvider");
  return ctx;
};
