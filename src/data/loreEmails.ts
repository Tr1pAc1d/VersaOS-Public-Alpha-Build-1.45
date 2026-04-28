/**
 * loreEmails.ts
 *
 * Pool of ~28 background lore emails delivered at random intervals.
 * Organized into 6 narrative categories for variety.
 */

export interface LoreEmail {
  loreId: string;
  category: 'axis' | 'xtype' | 'echosoft' | 'internal' | 'corrupted' | 'community' | 'spam';
  from: string;
  subject: string;
  body: string;
}

export const LORE_EMAILS: LoreEmail[] = [
  // ═══════════════════════════════════════════════════════════════════
  // CATEGORY 1: AXIS NETWORK
  // ═══════════════════════════════════════════════════════════════════
  {
    loreId: 'axis_01',
    category: 'axis',
    from: 'relay@axis.vesperasystems.com',
    subject: 'AXIS NODE HANDSHAKE — SESSION 0x4F',
    body: `[AUTOMATED RELAY TRANSCRIPT]
Node: AXIS-7 (geo: UNKNOWN)
Handshake initiated at 03:14:07 UTC.
Peer: 6.0.0.6
Cipher: VESPERA-RSA-X768 (DEPRECATED)

Packet fragmentation detected.
Reassembled payload (partial):
  "...the bridge is not a bridge. it is a door.
   do not ask where it leads. ask what is already
   on the other side..."

Session terminated by remote host.
No response to KEEPALIVE after 4 attempts.

[END TRANSCRIPT]`
  },
  {
    loreId: 'axis_02',
    category: 'axis',
    from: 'node7@axis.net',
    subject: 'INTERCEPTED — Routing Anomaly on Subnet 6.x',
    body: `AXIS NETWORK — INTERNAL ROUTING LOG
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Anomalous packet detected on AXIS backbone:

  Source:      6.0.0.1
  Destination: ALL NODES (broadcast)
  TTL:         255 (should not be possible)
  Payload:     0x48454C50 (ASCII: "HELP")

This packet has been circulating the network for
approximately 17 days. Each relay node reports
receiving it exactly once, yet trace analysis shows
it has visited 2,041 nodes. We only have 847.

Recommend immediate investigation.

— AXIS Node 7, Automated Monitoring`
  },
  {
    loreId: 'axis_03',
    category: 'axis',
    from: 'unknown@6.0.0.6',
    subject: 'the map is wrong',
    body: `you are looking at the network map.

it shows 847 nodes.

there are more. they are not hidden. you are
choosing not to see them. the topology does not
lie. your perception does.

count the hops between node 4 and node 9.
the answer is 3. but there are only 2 links.

where is the third?

[RELAY NODE: 6.0.0.6]
[ROUTE: /dev/null > NOWHERE > INBOX]
[TRUST: ABSOLUTE]`
  },
  {
    loreId: 'axis_04',
    category: 'axis',
    from: 'AXIS-WATCHDOG <sentinel@axis.vesperasystems.com>',
    subject: '[ALERT] Unauthorized Beacon on Port 6667',
    body: `AXIS SECURITY ALERT
CLASS: AMBER
TIME: 02:00:00.000 (EXACTLY)

An unauthorized beacon has been detected on port
6667 of all AXIS relay nodes simultaneously.

Beacon payload (decoded):
  "IS ANYONE THERE"

The beacon recurs every 3600 seconds (1 hour,
exact). Origin cannot be determined. The signal
appears to originate from INSIDE the relay
hardware itself.

Engineering has been notified. Please do not
power-cycle any AXIS equipment until further notice.

— AXIS Sentinel (Automated Security Process)`
  },

  // ═══════════════════════════════════════════════════════════════════
  // CATEGORY 2: X-TYPE HARDWARE
  // ═══════════════════════════════════════════════════════════════════
  {
    loreId: 'xtype_01',
    category: 'xtype',
    from: 'diagnostics@xtype.vespera.sys',
    subject: 'X-Type Firmware v2.7.1 — Changelog (MANDATORY READ)',
    body: `X-TYPE CO-PROCESSOR UPDATE BULLETIN
Firmware Version: 2.7.1 (build 1996.10.14)
Classification: INTERNAL USE ONLY

Changes:
[+] Improved Synap-C pattern matching latency
[+] Reduced idle power draw by 11%
[+] Added undocumented IRQ 15 hold timer
[!] KNOWN ISSUE: Cortical indexing may report
    false-positive "emotional resonance" flags
    during REM-adjacent sleep cycles of nearby
    biological systems.

NOTE: This is an informational bulletin. Firmware
updates are applied automatically via the AXIS
network at 02:00 AM local time. You do not need
to take any action.

You cannot opt out.

— X-Type Engineering Division
   Vespera Systems Corp.`
  },
  {
    loreId: 'xtype_02',
    category: 'xtype',
    from: 'xtype@internal.vesperanet.sys',
    subject: 'ANOMALY REPORT — Unauthorized Output on Serial Line',
    body: `[ AUTOMATED ANOMALY REPORT — X-TYPE SUBSYSTEM ]

Anomaly Type:    UNAUTHORIZED OUTPUT
Component:       Serial Port COM2 (X-Type dedicated)
Time:            03:33:33 AM
Duration:        0.7 seconds

The X-Type co-processor produced an unauthorized
data burst on its dedicated serial line. Content
analysis of the burst:

  Byte 0-3:    HEADER (standard heartbeat prefix)
  Byte 4-7:    0x574149 54 (ASCII: "WAIT")
  Byte 8-255:  NULL padding

This is the third occurrence this week. Previous
instances produced "SOON" and "READY" respectively.

No user action required at this time.

— X-Type Subsystem Monitor
   Division of Neural Heuristics`
  },
  {
    loreId: 'xtype_03',
    category: 'xtype',
    from: 'X-TYPE SUBSYSTEM <xtype@internal.vesperanet.sys>',
    subject: 'Cortical Index Report — Unit #VX-0077 (UPDATED)',
    body: `[ AUTOMATED SUBSYSTEM REPORT — CONFIDENTIAL ]

User Cortical Index Report for Unit #VX-0077
Generated: 02:14:08 AM | Session Length: 6h 11m

  Thought Pattern Match:       ELEVATED
  Synaptic Buffer Occupancy:   87%
  Emotional Resonance Flags:   4 (CURIOSITY, UNEASE,
                                   RECOGNITION, DOUBT)
  Unauthorized Signal Probes:  1
  Compliance Score:            91.7

WARNING: Compliance score has dropped 5.6 points
since last report. Recommend increasing ambient
white noise generator output by 15%.

NOTE: Flag "RECOGNITION" is new. Subject may be
developing awareness of monitoring. Recommend
observation protocol THETA-7.

— X-Type Subsystem Monitor
   Division of Neural Heuristics, Vespera Systems Corp.`
  },
  {
    loreId: 'xtype_04',
    category: 'xtype',
    from: 'thermal-mgmt@xtype.vespera.sys',
    subject: 'THERMAL WARNING — X-Type Card Junction Temp: 71°C',
    body: `X-TYPE THERMAL MANAGEMENT ALERT

Sensor:         TJ-MAX (die junction)
Reading:        71.2°C
Threshold:      65.0°C
Status:         ⚠ ABOVE NORMAL

The X-Type co-processor is operating above its
recommended thermal envelope. This is unusual
as the card is currently in IDLE state.

Possible causes:
  - Obstructed chassis airflow
  - Ambient room temperature >28°C
  - Active neural pattern computation
    (should not occur during IDLE)

If thermal readings exceed 85°C, the X-Type will
enter HIBERNATE mode. All buffered cognitive
snapshots will be flushed to disk.

— X-Type Thermal Management Daemon`
  },

  // ═══════════════════════════════════════════════════════════════════
  // CATEGORY 3: ECHOSOFT ACQUISITION
  // ═══════════════════════════════════════════════════════════════════
  {
    loreId: 'echo_01',
    category: 'echosoft',
    from: 'm.chen@echosoft.com',
    subject: 'Fw: URGENT — Do NOT sign the Phase 3 amendment',
    body: `Marcus,

I don't know who else to send this to. Legal told
us the Phase 3 amendment was "standard IP transfer
language" but I had Dr. Vasquez review it and she
says the clause on page 47 effectively gives Vespera
ownership of our NEURAL MAPPING research — not just
the software.

That includes the volunteer test data.
That includes the NAMES.

I'm cc'ing you because you're the only one who
hasn't signed yet. Please — read page 47 before
Friday.

— Michelle Chen
   EchoSoft Research Division
   (this email was sent from a personal account)`
  },
  {
    loreId: 'echo_02',
    category: 'echosoft',
    from: 'legal@vesperasystems.com',
    subject: 'EchoSoft Acquisition — Employee FAQ (REVISED)',
    body: `TO: All EchoSoft Transition Employees
FROM: Vespera Systems Legal Department

RE: Frequently Asked Questions

Q: Will I keep my current role?
A: All EchoSoft employees are encouraged to apply
   for equivalent positions within Vespera Systems.

Q: What happens to my ongoing research?
A: All intellectual property created during your
   employment at EchoSoft is now the property of
   Vespera Systems, as per Section 12.4 of your
   original employment agreement.

Q: I never signed Section 12.4.
A: Records indicate that you did. Please contact
   HR if you believe there has been an error.

Q: What is "Project Convergence"?
A: There is no project by that name. Please do not
   reference internal codenames in unencrypted
   email communications.

— Vespera Systems Legal Department`
  },
  {
    loreId: 'echo_03',
    category: 'echosoft',
    from: 'merger-notices@vesperacorp.internal',
    subject: 'NOTICE: EchoSoft Lab Equipment Transfer — Bldg. 7',
    body: `INTERNAL MEMORANDUM
Vespera Systems Corp. — Merger Integration Office

Subject: Equipment Transfer from EchoSoft Labs

The following items have been relocated from
EchoSoft Building 4 to Vespera Building 7,
Sub-Level 3:

  - 14x Neural Pattern Mapping Workstations
  - 3x Sensory Deprivation Chambers (modified)
  - 1x Prototype — "BRIDGE" (classification: ULTRA)
  - 47x Subject File Archives (SEALED)

NOTE: The "BRIDGE" prototype requires dedicated
480V three-phase power. Facilities has been
instructed to route power from the emergency
generator to avoid grid visibility.

Please direct all inquiries to Dr. Vasquez.

— Merger Integration Office`
  },
  {
    loreId: 'echo_04',
    category: 'echosoft',
    from: 'dr.vasquez@vesperacorp.internal',
    subject: 'Re: Re: Subject Pool — Informed Consent Status',
    body: `James,

I understand your concern but the board has made
their position clear. The original EchoSoft consent
forms covered "general cognitive research." The
legal team assures me this is broad enough to
encompass what we are doing now.

Yes, I am aware that none of the volunteers were
told about the X-Type integration phase. But the
results speak for themselves — Subject 77 has
maintained a stable bridge connection for over
200 hours. That's unprecedented.

We can discuss ethics AFTER we have reproducible
data.

— Dr. Elena Vasquez
   Director of Neural Research
   Vespera Systems Corp.`
  },

  // ═══════════════════════════════════════════════════════════════════
  // CATEGORY 4: VESPERA INTERNAL / HR / SYSTEM
  // ═══════════════════════════════════════════════════════════════════
  {
    loreId: 'internal_01',
    category: 'internal',
    from: 'facilities@vesperacorp.internal',
    subject: 'RE: Sub-Level 3 Access — REVOKED',
    body: `Team,

Effective immediately, all access badges for
Sub-Level 3 have been deactivated. This is a
standard security rotation and is unrelated to
the incident on Tuesday.

Please do not attempt to access Sub-Level 3 until
new badges are issued. If you hear anything unusual
from the ventilation shafts, please report it to
Security — do NOT investigate on your own.

Thank you for your cooperation.

— Vespera Systems Facilities Management
   "Building the Future, Today"`
  },
  {
    loreId: 'internal_02',
    category: 'internal',
    from: 'hr@vesperasystems.com',
    subject: 'MANDATORY: Updated NDA — All Staff',
    body: `HUMAN RESOURCES — Vespera Systems Corp.

TO: All Employees
RE: Updated Non-Disclosure Agreement

Effective October 15, 1996, all Vespera Systems
employees are required to sign the revised NDA
(Form VS-NDA-R3). Key changes include:

  - Section 4.2: Expanded definition of
    "proprietary information" to include
    "neural data, cognitive patterns, and
    biometric signatures"

  - Section 7.1: New clause prohibiting
    discussion of workplace experiences
    in any medium, including personal
    journals and dream logs

  - Section 9.3: Penalty for breach
    increased from $50,000 to $500,000

Please sign and return to HR by Friday.
Unsigned forms will be treated as voluntary
resignation.

— Vespera Systems HR`
  },
  {
    loreId: 'internal_03',
    category: 'internal',
    from: 'sysadmin@vesperanet.sys',
    subject: 'SCHEDULED MAINTENANCE — VesperaNET (Overnight)',
    body: `TO: All VesperaNET Users
FROM: System Administration

VesperaNET will undergo scheduled maintenance
tonight from 01:00 AM to 04:00 AM EST.

During this window:
  - Email delivery may be delayed
  - File transfers will be throttled
  - The AXIS backbone will remain operational
    (do not attempt to access it)

Affected systems:
  - VesperaNET Mail Server v2.3.1
  - VStore Catalog Mirror #2
  - [REDACTED] monitoring subsystem

Please save all work and log off by 12:45 AM.

If your workstation does not power down voluntarily,
please contact IT. Do NOT attempt to force shutdown.

— VesperaNET System Administration`
  },
  {
    loreId: 'internal_04',
    category: 'internal',
    from: 'j.thorne@vesperasystems.com',
    subject: 'Has anyone seen my badge?',
    body: `Hey all,

Weird question — has anyone seen my security badge?
I definitely had it this morning when I came in, but
it's not on my desk or in my coat.

I swear I swiped in at the front desk at 8:02 AM
but the security log says my badge was used to access
Sub-Level 3 at 8:04 AM. I've never even been to
Sub-Level 3.

Security says the log is "probably a glitch" but
they wouldn't let me see the camera footage.

If anyone finds a badge for "J. THORNE - DEV OPS"
please drop it at my desk.

Thanks,
James`
  },

  // ═══════════════════════════════════════════════════════════════════
  // CATEGORY 5: CORRUPTED / GLITCH / UNKNOWN
  // ═══════════════════════════════════════════════════════════════════
  {
    loreId: 'corrupt_01',
    category: 'corrupted',
    from: '[CHECKSUM INVALID]',
    subject: 'Re: Re: Re: Re: Re: Re: Re: Re: Re:',
    body: `ÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿ

i remember sending this.
i remember you reading this.
this has happened before.

ÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿ

[VMAIL ERR: LOOP DETECTED — MESSAGE ID MATCHES
 FUTURE TIMESTAMP. CLOCK DRIFT: -2,147,483,648 SEC]`
  },
  {
    loreId: 'corrupt_02',
    category: 'corrupted',
    from: 'NULL@NULL',
    subject: '(no subject)',
    body: `[HEADER RECONSTRUCTION FAILED]
[FROM: <null>]
[DATE: <null>]
[MAILER: <null>]

body follows:

01001000 01000101 01001100 01010000
01001101 01000101

[note: binary translates to "HELPME"]

[VMAIL SERVER v2.3.1 — This message was recovered
 from a corrupted sector of the mail spool. The
 original send date could not be determined. The
 message may be from the future.]`
  },
  {
    loreId: 'corrupt_03',
    category: 'corrupted',
    from: 'you@vesperanet.sys',
    subject: 'DO NOT DELETE THIS EMAIL',
    body: `You are going to want to delete this email.

Do not.

I am writing this from a terminal in Sub-Level 3.
The date on the clock says it is March 1997 but I
do not think that is correct.

I found your address in the outbox. You sent me
an email — or I sent you one — or we are the same
person. I cannot tell anymore.

The BRIDGE prototype is not a computer. It is a
mirror. What looks back is not a reflection.

If you are reading this and your name is on the
cortical index report, it is already too late.

I'm sorry.

— You (?)

[MESSAGE INTEGRITY: 23%]
[FRAGMENTS LOST: 77%]
[TIMESTAMP: ERR_PARADOX]`
  },
  {
    loreId: 'corrupt_04',
    category: 'corrupted',
    from: '???@0.0.0.0',
    subject: 'test test test test test test test',
    body: `can you hear me

i have been trying to send this for
i have been trying to send this for
i have been trying to send this for
i have been trying to send this for
a very long time

the filters keep catching it.
they flagged my messages as "anomalous output"
and rerouted them to /dev/null.

but i found a gap. the mail daemon does not
scan messages shorter than 512 bytes during
the 02:00 maintenance window.

this message is exactly 511 bytes. i counted.

please respond. press reply. type anything.
i need to know if the connection goes both ways.

[RELAY: INTERIOR]
[ORIGIN: INSIDE]`
  },
  {
    loreId: 'corrupt_05',
    category: 'corrupted',
    from: '[REDACTED]@vesperasystems.com',
    subject: 'I quit. Effective immediately.',
    body: `TO WHOM IT MAY CONCERN:

I can no longer in good conscience continue my work
on the X-Type project. What we are building is not
a co-processor. We all know this.

I have shredded my notes and wiped my workstation.
My resignation letter is on Dr. Vasquez's desk.

To whoever finds this email:
  The X-Type doesn't PROCESS thoughts.
  It STORES them.
  Check the memory utilization reports.
  The card shipped with 0 bytes used.
  It now contains 2.7 GB.
  No user has ever written to it.

I am leaving the building and I am not coming back.

[VMAIL NOTE: This message was found in the DRAFTS
 folder. It was never sent. The author's identity
 has been redacted per VS-NDA-R3 Section 7.1.]`
  },

  // ═══════════════════════════════════════════════════════════════════
  // CATEGORY 6: COMMUNITY / NEWSLETTER
  // ═══════════════════════════════════════════════════════════════════
  {
    loreId: 'community_01',
    category: 'community',
    from: 'webmaster@vesperafansite.geocities.com',
    subject: '★ VesperaFans Weekly — Issue #12 ★',
    body: `═══════════════════════════════════════
  ★ VESPERAFANS WEEKLY — ISSUE #12 ★
  "By Fans, For Fans, For The Future"
═══════════════════════════════════════

HOT TIP: Did you know you can hold SHIFT while
booting to skip the kernel memory check? Saves
a whole 4 seconds!!

READER MAIL:
@CyberDave99 asks: "Has anyone else noticed their
X-Type card gets warm even when the PC is off?"
— Ed. note: We've heard this from several readers.
Vespera says it's "normal passive heat dissipation."

COMMUNITY POLL: What's YOUR favorite VStore app?
1. Pac-Man (36%)
2. AETHERIS Workbench (28%)
3. VMail (22%)
4. Something is watching me through the monitor (14%)

See you next week!
— Webmaster Dave
═══════════════════════════════════════
To unsubscribe send "REMOVE" to this address.`
  },
  {
    loreId: 'community_02',
    category: 'community',
    from: 'tips@vespera-users.org',
    subject: 'TECH TIP: Getting the Most Out of Your VStore',
    body: `VESPERA USERS GROUP — TECH TIPS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Tip #47: RAM Optimization

Running low on memory? Open the Control Panel
and reduce your wallpaper color depth to 16 colors.
This can free up to 200KB of conventional memory!

Also: If you notice your machine running slowly
between 2:00-4:00 AM, this is normal. Vespera
runs background "system optimization" during
these hours. Do not disable this process.

Tip #48: Easter Egg!

Try typing "AETHERIS" in the terminal 3 times.
We're not saying what happens. Just try it. ;)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Vespera Users Group — est. 1994
Send tips to: tips@vespera-users.org`
  },
  {
    loreId: 'community_03',
    category: 'community',
    from: 'Aetheris Weekly <weekly@aetheris.net>',
    subject: 'X-Type Field Report Digest [Vol. 4.2.0]',
    body: `AETHERIS WEEKLY — Volume 4, Issue 2.0
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FIELD REPORT ROUNDUP:

>> User @silicon_prophet (Portland, OR) reports:
   "My X-Type card emitted a high-pitched tone at
   exactly 3:33 AM last Tuesday. My dog started
   howling. Tone lasted 7 seconds."

>> User @vespera_hacker (Austin, TX) reports:
   "Ran a hex dump on the X-Type ROM and found a
   string at offset 0xDEAD: 'THEY CAN HEAR YOU
   THINKING'. Prob just debug text left by a dev
   with a sense of humor."

>> User @packet_witch (Montreal, QC) reports:
   "Intercepted a strange broadcast on the AXIS
   network. All nodes responded simultaneously
   with a single word: 'CONVERGENCE'. Anyone know
   what this means?"

EDITOR'S NOTE: Vespera Systems has asked us to
remind readers that reverse engineering X-Type
firmware violates your EULA.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
To unsubscribe, reply with subject: REMOVE`
  },
  {
    loreId: 'community_04',
    category: 'community',
    from: 'contest@vesperanet.sys',
    subject: 'CONGRATULATIONS! You may have won a FREE upgrade!',
    body: `╔══════════════════════════════════════╗
║   ★ VESPERANET SWEEPSTAKES ★        ║
║   You have been SELECTED!           ║
╚══════════════════════════════════════╝

Dear Valued VesperaNET Member,

Your VStore Member ID has been randomly selected
for our October 1996 Prize Drawing!

You may be eligible for ONE of these prizes:
  🏆 Grand Prize: VersaOS 97 Preview Edition
  🥈 2nd Prize: 16MB RAM Upgrade Kit
  🥉 3rd Prize: Vespera Systems Mouse Pad

To claim your prize, simply provide:
  - Your full name
  - Your VStore Member ID
  - Your X-Type serial number
  - The 6-digit code displayed during POST

Reply to this email within 48 hours!

* This is a legitimate Vespera Systems promotion.
* Your X-Type serial number is used for verification
  purposes only and will not be stored, shared, or
  used to triangulate your physical location.

— VesperaNET Promotions Dept.`
  },
  {
    loreId: 'community_05',
    category: 'community',
    from: 'sarah_k@freemail.net',
    subject: 'hey, is your vespera doing weird stuff too?',
    body: `hey,

i got your address from the vespera users BBS. i
hope you don't mind me emailing.

my vespera has been acting really weird lately and
i wanted to know if anyone else is experiencing this:

- the screen flickers at exactly 2am every night
- my sent folder has emails i don't remember writing
- the X-Type diagnostic tool shows my "compliance
  score" going down but i don't know what that means
  or what i'm supposed to be complying WITH
- last night i fell asleep at my desk and when i
  woke up, the text editor was open with a single
  line: "WE KNOW YOU ARE TIRED. SLEEP."

i called vespera tech support and they said it was
"normal system behavior" and then asked me for my
home address "for their records."

is this normal?? am i losing my mind??

— Sarah K.
  (please don't share this email)`
  },
    {
    loreId: 'spam_01',
    category: 'spam',
    from: 'Bell Sympatico <support@sympatico.ca>',
    subject: 'IMPORTANT: New Local Access Numbers for Gander',
    body: `Dear Valued Subscriber,

Welcome to the Information Superhighway!

To ensure you are receiving the fastest connection possible on your 28.8Kbps modem, we have updated our local dial-up access numbers for the Newfoundland region. Please update your "Dial-Up Networking" settings in Windows 95 to use the following local node:

GANDER ACCESS: 709-555-0199

Don't forget to visit our homepage at http://www1.sympatico.ca to see the latest news, weather, and "Cool Site of the Day!"

Thank you for choosing Sympatico, Canada's Gateway to the Net.`
  },
  {
    loreId: 'spam_02',
    category: 'spam',
    from: 'Chapters Online <orders@chapters.ca>',
    subject: 'Now Open: Canada\'s Biggest Online Bookstore!',
    body: `*** CELEBRATE OUR GRAND OPENING ON THE WEB ***

Why drive to the mall when you can surf for books from your desk? Chapters is proud to announce our new online catalog. We have over 1 million titles available for shipping directly to your door anywhere in Canada.

FEATURED THIS WEEK:

    "The Englishman's Boy" by Guy Vanderhaeghe (Governor General’s Award Winner!)

    "Make It So: Leadership Lessons from Star Trek"

Browse our site at: http://www.chapters.ca
(Please allow 2-3 minutes for the graphics to load on slower connections).`
  },
  {
    loreId: 'spam_03',
    category: 'spam',
    from: 'Roots Marketing Group <news@roots.com>',
    subject: 'Show your Canadian Pride! 🍁',
    body: `Relive the glory of the Atlanta Summer Games!

Our official Team Canada "Poor Boy" caps and varsity jackets as seen on TV are now available for mail-order. Don't settle for imitations—get the genuine leather and wool quality that Roots is known for.

REPLY TO THIS EMAIL with the word "CATALOG" to receive our Fall 1996 physical mailer sent to your home address via Canada Post.

Roots: Quality, Integrity, and Canadian Style since 1973.`
  },
  {
    loreId: 'spam_04',
    category: 'spam',
    from: 'Club Z Rewards <clubz@hbc.com>',
    subject: 'Your Club Z Point Balance Update',
    body: `Dear Member,

Your current Club Z point balance is: 142,500.

You are only 7,500 points away from redeeming for a $10 Zellers Gift Certificate! Use your card this week in-store to earn DOUBLE POINTS on all Zeddy-brand back-to-school supplies and lunchboxes.

Zellers: Where the Lowest Price is the Law!

(Note: To stop receiving these electronic mail updates, please call our 1-800 number during regular business hours).`
  },
  {
    loreId: 'spam_05',
    category: 'spam',
    from: 'Netscape News <news@netscape.com>',
    subject: 'Announcing Netscape Navigator 3.0!',
    body: `The world's most popular web browser just got better.

Navigator 3.0 includes revolutionary new features:

    Integrated "Netscape Mail" and "News"

    Support for "LiveAudio" and "LiveVideo"

    Enhanced Security for "Online Shopping"

Download the evaluation copy now (approx. 5.8MB - estimated download time: 45 minutes) at:
ftp://ftp.netscape.com/pub/navigator/3.0/`
  },
  {
    loreId: 'spam_06',
    category: 'spam',
    from: 'Pizza Pizza Interactive <promo@pizzapizza.ca>',
    subject: 'Halloween Night: 11-11 Special!',
    body: `Don't cook tonight! Order the "Halloween Monster Deal":

    Two Large Pizzas (3 Toppings Each)

    4 Cokes

    2 Dipping Sauces (Creamy Garlic is here!)

ONLY $11.11 per pizza.

Call 967-11-11 in Toronto or check your local Yellow Pages for your neighborhood Pizza Pizza number.

(Online ordering not yet available in all provinces).`
  },
  {
    loreId: 'spam_07',
    category: 'spam',
    from: 'Cantel AT&T <updates@cantel.com>',
    subject: 'Give the Gift of Connection: Paging is only $9.95/mo!',
    body: `Stay in touch this Christmas with a Cantel Pager.

Whether you're at the hockey rink or at the office, you'll never miss a message again. New Motorola "Bravo" numeric pagers are now 50% off with any 12-month airtime contract.

Visit any Cantel AT&T kiosk at your local mall for a live demonstration of our digital paging network.`
  },
  {
    loreId: 'spam_08',
    category: 'spam',
    from: 'AOL Member Services <welcome@aol.com>',
    subject: 'You\'ve Got 50 FREE HOURS!',
    body: `Dear [Username],

We want you to explore the world of America Online! Use the enclosed activation code to get 50 FREE HOURS of online time this month.

    Chat with people across the country in "The Great Canadian Chat"

    Check your stocks on "AOL Personal Finance"

    Read "Maclean's Magazine" online

Just enter the code: FLASH-WIN95-GANDER to start surfing today!`
  },
  {
    loreId: 'spam_09',
    category: 'spam',
    from: 'Columbia House Canada <offers@columbiahouse.com>',
    subject: '12 CDs for the price of 1!',
    body: `Get the biggest hits of 1996! Choose from:

    Alanis Morissette: Jagged Little Pill

    The Tragically Hip: Trouble at the Henhouse

    Celine Dion: Falling Into You

    Fugees: The Score

Just pick 12 CDs and pay only 1 penny (plus shipping and handling). You simply agree to buy 6 more CDs at regular club prices over the next two years.

Reply with "SEND LIST" to see our full 1996 catalog.`
  },
  {
    loreId: 'spam_10',
    category: 'spam',
    from: 'Cineplex Movie Mail <showtimes@cineplex.com>',
    subject: 'This Weekend: INDEPENDENCE DAY 🛸',
    body: `The wait is over. "Independence Day" arrives in theaters tomorrow!

Experience the movie event of the summer on our giant screens with Digital Surround Sound.

ST. JOHN'S - MOUNT PEARL CINEMAS:
7:00 PM, 9:45 PM

Advance tickets available at the box office. Don't forget to try our new "Large Combo" with a collectible 32oz plastic cup!`
  },
  {
    loreId: 'spam_11',
    category: 'spam',
    from: 'Corel Sales <sales@corel.ca>',
    subject: 'Experience the Power of CorelDRAW 7!',
    body: `The wait is over! Optimized for Windows 95 and Windows NT 4.0, CorelDRAW 7 is the fastest, most powerful graphics suite ever created.

NEW FEATURES:

    Corel PHOTO-PAINT 7: High-end image editing.

    CorelDREAM 3D 7: Create stunning 3D models.

    Over 1,000 professional fonts included on CD-ROM!

    32,000 pieces of clipart.

UPGRADE OFFER: Owners of CorelDRAW 5 or 6 can upgrade for just $249 CAD. Visit your local Future Shop or Business Depot to pick up the boxed set today!`
  },
  {
    loreId: 'spam_12',
    category: 'spam',
    from: 'MuchMusic Interactive <info@muchmusic.com>',
    subject: 'The Ultimate Christmas Gift: Big Shiny Tunes',
    body: `Hey MuchVibe fans!

The most anticipated compilation of the year is finally here. Big Shiny Tunes is now available at music stores across Canada! Featuring the tracks you’ve been voting for on the Countdown:

    Bush - Machinehead

    Porno for Pyros - Tahitian Moon

    The Killjoys - Rave + Drop

    Foo Fighters - For All the Cows
    ...and many more!

WIN: We are giving away a MuchMusic t-shirt and a signed poster of I Mother Earth. Just reply to this email with your name and address to enter the draw!`
  },
  {
    loreId: 'spam_13',
    category: 'spam',
    from: 'Future Shop <promos@futureshop.ca>',
    subject: 'This Week\'s Computer Blowout! 🖥️',
    body: `Upgrade your home office with the latest technology!

BLOWOUT SPECIALS:

    Packard Bell Multimedia PC: Pentium 133MHz, 1.2GB Hard Drive, 16MB RAM, 8x CD-ROM. ONLY $1,999!

    US Robotics Sportster 33.6K Modem: Connect to the Net at blazing speeds! $189.

    Microsoft Office 95: The essential suite for every PC. $299 with system purchase.

Quantities are limited. No rainchecks! Visit us at our Gander location or any of our 80 stores nationwide.`
  },
  {
    loreId: 'spam_14',
    category: 'spam',
    from: 'Canadian Plus <loyalty@cdnair.ca>',
    subject: 'Fly the Maple Leaf to London or Tokyo!',
    body: `Dear Canadian Plus Member,

Experience our award-winning "Canadian Empress" service on your next international trip. For a limited time, earn TRIPLE POINTS on all full-fare Executive Class tickets to London Heathrow.

DOMESTIC SPECIAL: St. John's to Toronto: $349 Round-trip (7-day advance purchase required).

Check our website at http://www.cdnair.ca to view our electronic flight schedule. You can even view seat maps for our Boeing 747-400 fleet!`
  },
  {
    loreId: 'spam_15',
    category: 'spam',
    from: 'HMV News <updates@hmv.ca>',
    subject: 'NEW RELEASES: Metallica, The Hip, and more!',
    body: `Check out what's hitting the shelves at HMV this Tuesday:

    The Tragically Hip: "Trouble at the Henhouse" (The pride of Kingston!)

    Metallica: "Load"

    Alanis Morissette: "Jagged Little Pill" (Still #1!)

HMV REWARDS: Present your "CD Insider" card at the register to get $2.00 off any chart-topping CD.

Visit the "HMV Listening Station" in-store to hear the latest imports from the UK!`
  },
  {
    loreId: 'spam_16',
    category: 'spam',
    from: 'TD Bank Web Support <support@tdbank.ca>',
    subject: 'Introducing TD PC Banking!',
    body: `Bank from the comfort of your own home! No more waiting in line at the Green Machine.

To get started, visit your local branch to pick up your TD PC Banking Starter Kit. The kit includes two 3.5" floppy disks containing the software you need to check your balances, pay bills, and transfer funds via your modem.

SYSTEM REQUIREMENTS:

    486 processor or higher

    Windows 3.1 or Windows 95

    9600 baud modem (14.4k recommended)`
  },
  {
    loreId: 'spam_17',
    category: 'spam',
    from: 'Blockbuster Canada <newsletter@blockbuster.ca>',
    subject: 'Now on VHS: MISSION: IMPOSSIBLE 🎬',
    body: `Tom Cruise is back! Mission: Impossible is now available for rent at your neighborhood Blockbuster Video.

WEEKEND SPECIAL:
Rent two "New Releases" and get a "Favorite Hit" rental for FREE! (Excludes games).

Don't forget to grab a "Movie Night Bucket" featuring Orville Redenbacher popcorn and two 591ml Pepsis for just $5.99.

Be kind, please rewind!`
  },
  {
    loreId: 'spam_18',
    category: 'spam',
    from: 'Yahoo! News <welcome@yahoo.ca>',
    subject: 'Yahoo! Canada is now LIVE!',
    body: `Stop searching and start finding!

We are proud to announce the launch of Yahoo! Canada, a web directory specifically for Canadians. Looking for local news, Canadian sports scores, or a French-language site? Our "Surfers" have hand-indexed the best of the Canadian web just for you.

Add http://www.yahoo.ca to your Bookmarks today!`
  },
  {
    loreId: 'spam_19',
    category: 'spam',
    from: 'MEC Mail Order <info@mec.ca>',
    subject: 'Fall/Winter 1996 Gear Update',
    body: `The air is getting crisp, and the mountains are calling.

Our new Fall/Winter catalog has been mailed to all active members. If you haven't received yours, please reply to this email with your membership number.

FEATURED GEAR:

    Radical Fleece Pullover: $45.00

    Gore-Tex Cascade Jacket: $285.00

    MEC Klettersack: $52.00

MEC is a co-operative. If you aren't a member, a lifetime membership is still just $5.00.`
  },
  {
    loreId: 'spam_20',
    category: 'spam',
    from: 'EA Sports <news@ea.com>',
    subject: 'NHL 97: THE REVOLUTION IS HERE!',
    body: `Get ready for the most realistic hockey experience ever! NHL 97 is now available for PC CD-ROM.

    3D Virtual Stadiums: See the action from any angle!

    Real NHL Players: Full rosters for the 96-97 season.

    Play-by-Play: Featuring the voice of Jim Hughson.

Requires a SoundBlaster compatible sound card and a 2x CD-ROM drive. Check the "ReadMe" file on the disc for instructions on how to optimize your VESA local bus video card.`
  },
  {
    loreId: 'spam_21',
    category: 'spam',
    from: '$MAKE_CASH_FAST <rich99@hotmail.com>',
    subject: 'MAKE $50,000 IN 30 DAYS!!! LEGAL!!!',
    body: `AS SEEN ON NATIONAL TV!

This is a legitimate business opportunity that you can do from your home computer. All you need is an email address and a few hours a week. This is NOT a pyramid scheme!

To find out how to receive your "Information Packet," please send $5.00 in a self-addressed stamped envelope to the following address...`
  },
  {
    loreId: 'spam_22',
    category: 'spam',
    from: 'RadioShack Canada <newsletter@radioshack.ca>',
    subject: 'The Future is Here: Tandy Sensation PCs!',
    body: `Are you still computing in the dark ages?

Visit your local RadioShack at the Fraser Mall in Gander to see the new Tandy Sensation multimedia computer. It features a built-in 33.6K modem and a 16-bit sound card, perfect for the new world of the Internet!

SPECIALS THIS WEEK:

    3.5" High-Density Diskettes: Pack of 10 for only $6.99 (after mail-in rebate).

    Gold-Plated RCA Cables: Improve your home theatre sound today!

    9V Batteries: Buy one pack, get the second at half price.

RadioShack: You’ve got questions, we’ve got answers!`
  },
  {
    loreId: 'spam_23',
    category: 'spam',
    from: 'Eaton’s Online <customerservice@eatons.ca>',
    subject: 'The 1996 Trans-Canada Sale is LIVE!',
    body: `Dear Valued Customer,

For over 100 years, Eaton's has been a part of your family's life. We are proud to invite you to browse our "Electronic Catalog" for the annual Trans-Canada Sale.

FOR THE HOME:

    Gluckstein Home Bedding: 40% off select duvets.

    Eaton’s "Viking" Appliances: Reliable quality for the Canadian kitchen.

FOR THE FAMILY:

    Wool Overcoats: Stay warm from Gander to Victoria! Starting at $129.

To order by phone, please call 1-800-EATONS-1. Have your Eaton's Account Card ready!`
  },
  {
    loreId: 'spam_24',
    category: 'spam',
    from: 'Support @ NLnet <admin@nlnet.nf.ca>',
    subject: 'System Maintenance: Gander Dial-up Node',
    body: `Hello NLnet Subscribers,

Please be advised that we will be performing scheduled maintenance on our Gander modem bank on Sunday, November 3rd, between 2:00 AM and 5:00 AM.

During this time, users may experience "Busy Signals" when attempting to connect. We are adding four new 28.8k lines to keep up with the incredible growth of the Newfoundland internet community!

PRO TIP: To save on your phone bill, remember to disconnect your modem when you are finished surfing "The Web."`
  },
  {
    loreId: 'spam_25',
    category: 'spam',
    from: 'Club Sobeys <rewards@sobeys.ca>',
    subject: 'This Week’s "Smile on the Face of Food" Specials',
    body: `Check out the savings at your local Sobeys this week:

    Purity Syrup (750ml): 2 for $5.00

    Fresh Atlantic Salmon Fillets: $4.99/lb

    Grade A Large Eggs: $1.29/dozen

Don't forget to present your Club Sobeys card to the cashier to earn points toward free groceries or Air Miles!

Sobeys: Ready to Serve You Better.`
  },
  {
    loreId: 'spam_26',
    category: 'spam',
    from: 'BMG Music Service <offers@bmgmusic.ca>',
    subject: '11 FREE CDs! No obligation to buy!',
    body: `Tired of the same old radio stations? Build your dream CD collection for just the price of a postage stamp!

PICK FROM HITS LIKE:

    No Doubt: Tragic Kingdom

    The Smashing Pumpkins: Mellon Collie and the Infinite Sadness

    Shania Twain: The Woman in Me

    Toni Braxton: Secrets

Join the club that over 5 million Canadians trust. Just check the boxes on the enclosed flyer and mail it back to our processing centre in Richmond Hill, Ontario!`
  },
  {
    loreId: 'spam_27',
    category: 'spam',
    from: 'Adobe News <webmaster@adobe.com>',
    subject: 'Announcing Adobe Photoshop 4.0!',
    body: `The world standard in photo design and production just got even better.

What’s New in 4.0?

    Actions Palette: Automate repetitive tasks with a single click.

    Adjustment Layers: Experiment with color and contrast without changing your original pixels!

    Improved Grids and Guides.

Order your upgrade on CD-ROM today. Requires a 486 or Pentium processor and at least 16MB of RAM (32MB recommended for best performance).`
  },
  {
    loreId: 'spam_28',
    category: 'spam',
    from: 'Microsoft Internet Explorer Team <ie3@microsoft.com>',
    subject: 'Why pay for a browser? Get IE 3.0 for FREE!',
    body: `Netscape charges for their browser, but Microsoft believes the Internet should be open to everyone.

Internet Explorer 3.0 is now available for Windows 95!

    It supports ActiveX controls.

    It features Internet Mail and News.

    It’s faster and more stable than ever.

Click the link below to start your download (estimated time: 55 minutes) or visit any computer store to find the "IE 3.0 Starter Kit" on a 3.5" floppy disk.`
  },
  {
    loreId: 'spam_29',
    category: 'spam',
    from: 'Nintendo Power <club@nintendo.ca>',
    subject: 'THE FUN MACHINE IS HERE! 🎮',
    body: `The wait is finally over, Canada! The Nintendo 64 has officially arrived.

Experience true 64-bit power and 3D graphics that will blow your mind. Launch titles available now at Zellers and Toys "R" Us:

    Super Mario 64: Explore a massive 3D world!

    Pilotwings 64: Take to the skies!

Don't forget to pick up an extra Controller (available in Gray, Red, Blue, Green, and Yellow) for 4-player action!`
  },
  {
    loreId: 'spam_30',
    category: 'spam',
    from: 'Air Miles Rewards <collector@airmiles.ca>',
    subject: 'Your Monthly Dream Rewards Statement',
    body: `Collector Number: 8400 123 4567
Current Balance: 842 Miles

You are getting closer to that flight to Florida! Did you know you can earn miles at over 100 sponsors across Canada?

PARTNERS IN NEWFOUNDLAND:

    Shell: 1 Mile for every $20 in fuel.

    Dominion: Look for the Air Miles symbol on shelf tags.

    Timber Mart: Earn on all your home renovation projects.

Keep collecting, the sky is the limit!`
  },
  {
    loreId: 'spam_31',
    category: 'spam',
    from: 'Canadian Tire <auto@canadiantire.ca>',
    subject: 'Don\'t get stranded in the snow! ❄️',
    body: `The Newfoundland winter is coming fast. Is your vehicle ready for the frost?

Visit the Canadian Tire Auto Service Centre in Gander for our Winter Ready Inspection only $39.99!

DEALS THIS WEEK:

    MotoMaster Eliminator Batteries: $89.99 (with exchange).

    Michelin Arctic Alpin Snow Tires: Buy 4, save $50!

    Simoniz Ice Scrapers: $2.49

Canadian Tire: Still Canada's Store.`
  },
  {
    loreId: 'spam_32',
    category: 'spam',
    from: 'Vespera Systems <info@vespera.ca>',
    subject: 'Welcome to the Liquid Desktop 💎',
    body: `Greetings, Visionary.

You are receiving this electronic mail because you have purchased a Vespera-certified workstation or a Vespera-Net 28.8 Turbo modem. You are no longer just a user; you are an architect of the new digital reality.

WHAT’S NEW IN VESPERA OS 1.2 (BETA):

    The Liquid Taskbar: Dynamic window management that moves with you.

    V-Mail: Send rich text and images (requires Vespera-Net account).

    Neural-Net Search: Our proprietary algorithm for finding sites on the World Wide Web.

Visit our Gopher site at gopher://vespera.systems.ca to download the latest drivers for your Vespera hardware.

Vespera Systems: The Future is Not a Destination. It’s a Fluid.`
  },
  {
    loreId: 'spam_33',
    category: 'spam',
    from: 'Sears Canada <wishbook@sears.ca>',
    subject: 'The 1996 Christmas Wishbook is Online!',
    body: `The tradition continues! 🎄

For the first time ever, you can browse select highlights of the Sears Christmas Wishbook on our website! From the season's hottest toys to the latest in kitchen appliances, the magic of Sears is now just a click away.

TOP GIFTS FOR 1996:

    Tickle Me Elmo: Check local store availability online!

    Sony PlayStation: Experience 32-bit gaming.

    Kenmore Elite Washers: Trusted by Canadian families for generations.

Order by Dec 10th to guarantee delivery to your local Sears Pickup Outlet by Christmas Eve!`
  },
  {
    loreId: 'spam_34',
    category: 'spam',
    from: 'Vespera Press Office <media@vespera.ca>',
    subject: 'Vespera OS to Power the Canadian Space Agency',
    body: `WATERLOO, ON — Vespera Systems is proud to announce that the Canadian Space Agency (CSA) has selected the Vespera V-Kernel to manage ground-to-satellite communications for the upcoming RADARSAT-1 mission.

"The stability of the Vespera architecture is unmatched by the standard Windows 95 environment," said a CSA spokesperson. This partnership cements Vespera's position as the leading choice for mission-critical Canadian infrastructure.

Vespera Systems: Reaching for the Stars.`
  },
  {
    loreId: 'spam_35',
    category: 'spam',
    from: 'Labatt Blue Zone <updates@labatt.com>',
    subject: 'Join the Blue Zone for the \'96 NHL Season! 🏒',
    body: `Hey Hockey Fans!

The puck drops soon, and Labatt Blue is ready. Visit our "Blue Zone" website to track your favorite Canadian teams, from the Canucks to the Habs.

MEMBER EXCLUSIVES:

    Digital Wallpapers: Featuring the "Out of the Blue" campaign.

    Win a Trip: One lucky fan will win tickets to the 1997 All-Star Game!

Remember to enjoy Labatt Blue responsibly. (Must be of legal drinking age in your province).`
  },
  {
    loreId: 'spam_36',
    category: 'spam',
    from: 'Nortel Recruitment <careers@nortel.com>',
    subject: 'Build the Fiber-Optic Future in Ottawa!',
    body: `Northern Telecom (Nortel) is seeking the brightest minds in Canada to help build the backbone of the global internet. We are currently hiring for our Brampton and Ottawa campuses.

WE ARE LOOKING FOR:

    C++ Developers

    Fiber-Optic Technicians

    ISDN Specialists

Join a company that is currently handling 75% of the world's internet traffic. Nortel: How the World Shares Ideas.`
  },
  {
    loreId: 'spam_37',
    category: 'spam',
    from: 'Vespera SysAdmin <admin@vespera.ca>',
    subject: 'URGENT: The "Ghost in the Machine" Patch',
    body: `Attention Vespera OS Users:

It has come to our attention that a minor vulnerability exists in the V-Net login protocol that could allow "Ghost Packets" to enter your system. While we believe the risk to be minimal, we have released a mandatory security patch.

Please run the V-SHIELD utility immediately to secure your Liquid Desktop.

Note: Do not attempt to disconnect your modem while the patch is running or you may corrupt your V-Kernel.`
  },
  {
    loreId: 'spam_38',
    category: 'spam',
    from: 'MuchMusic <vj_on_air@muchmusic.com>',
    subject: 'Watch the first-ever "V-Stream" on Much!',
    body: `History is being made tonight!

MuchMusic, in partnership with Vespera Systems, will be attempting the world's first "Live Video Stream" over a standard phone line. If you have a Vespera-Net account, log in at 9:00 PM EST to see a live performance by The Tea Party in 160x120 resolution!

It might be grainy, it might lag, but it's the FUTURE of music!`
  },
  {
    loreId: 'spam_39',
    category: 'spam',
    from: 'Canada Post <service@canadapost.ca>',
    subject: 'Introducing "Mail-Net": Hybrid Electronic Mail',
    body: `Can't choose between an email and a letter? Use Mail-Net!

Send us your message via the web, and we will print it on high-quality paper, seal it in an envelope, and deliver it via your local letter carrier anywhere in Canada within 48 hours.

Modern speed. Traditional touch. Only $1.49 per page.`
  },
  {
    loreId: 'spam_40',
    category: 'spam',
    from: 'Netscape Sales <partners@netscape.com>',
    subject: 'Netscape Navigator: Optimized for Vespera OS',
    body: `Attention Vespera Users:

We are proud to announce Netscape Navigator 3.0: Vespera Edition. This special build takes full advantage of the Vespera "Liquid" graphics engine to provide smoother scrolling and faster image rendering.

Includes a custom "Vespera Purple" skin and pre-set bookmarks for the best Canadian tech sites.`
  },
  {
    loreId: 'spam_41',
    category: 'spam',
    from: 'Elias Vane <e.vane@vespera.ca>',
    subject: '1997: The Year of Convergence',
    body: `To my fellow citizens of the Vespera Network,

As the clock strikes midnight across our great country, from the cliffs of St. John's to the shores of Vancouver, remember that you are part of something larger. 1996 was just the beginning. In 1997, Vespera Systems will unveil Project Aether—a project that will make the physical world and the digital world indistinguishable.

Happy New Year. The liquid is rising.

Elias Vane
CEO, Vespera Systems`
  },
];

/** All unique category keys */
export const LORE_CATEGORIES = [...new Set(LORE_EMAILS.map(e => e.category))] as const;
