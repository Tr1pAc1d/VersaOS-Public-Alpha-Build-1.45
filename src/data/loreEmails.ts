/**
 * loreEmails.ts
 *
 * Pool of ~28 background lore emails delivered at random intervals.
 * Organized into 6 narrative categories for variety.
 */

export interface LoreEmail {
  loreId: string;
  category: 'axis' | 'xtype' | 'echosoft' | 'internal' | 'corrupted' | 'community';
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
];

/** All unique category keys */
export const LORE_CATEGORIES = [...new Set(LORE_EMAILS.map(e => e.category))] as const;
