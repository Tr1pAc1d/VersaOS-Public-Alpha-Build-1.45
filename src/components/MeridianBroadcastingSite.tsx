import React, { useState, useEffect, useRef } from 'react';

/* ═══════════════════════════════════════════════════
   DATA & LORE DATABASE
   ═══════════════════════════════════════════════════ */

interface FullArticle {
  id: string;
  title: string;
  date: string;
  author: string;
  category: string;
  summary: string;
  body: string[];
  imageUrl?: string;
  quote?: { text: string; attribution: string };
  relatedIds?: string[];
}

const ARTICLES: FullArticle[] = [
  {
    id: 'axiscorps-echosoft',
    title: 'AxisCorps to Pay About $3.6 Bln for EchoSoft, Beating Rival Bid by Vespera Systems',
    date: 'October 29, 1996',
    author: 'Sandra Kellerman, MBN Markets',
    category: 'MARKETS',
    summary: 'Pacific Century AxisCorps Ltd. plans to pay about $3.6 billion to acquire EchoSoft Technologies Ltd., beating a rival bid by Vespera Systems Inc.',
    body: [
      'Pacific Century AxisCorps Ltd. plans to pay about $3.6 billion to acquire EchoSoft Technologies Ltd., beating a rival bid by Vespera Systems Inc. for the rapidly-growing multimedia software company. The deal, which would be the largest tech acquisition of the year, gives AxisCorps control of EchoSoft\'s widely-used audio compression platform and its 4.2 million enterprise customers.',
      'The surprise counter-offer represents a 40% premium over EchoSoft\'s current trading price and a significant blow to Vespera Systems, which had been in exclusive negotiations with the German-founded audio pioneer since August. Vespera initially acquired a small stake in EchoSoft in 1994, integrating their spectral compression algorithms into the AETHERIS architecture.',
      'Industry analysts were stunned by the aggressive AxisCorps bid, which came just 48 hours before the Vespera-EchoSoft deal was expected to close. "This is a clear signal that AxisCorps is willing to pay any price to prevent Vespera from consolidating the multimedia stack," said Gregory Feinstein, a tech analyst at Merrill Lynch.',
      'EchoSoft\'s proprietary technology is widely recognized for its ability to isolate micro-fluctuations in analog frequencies, virtually eliminating background noise. The technology has applications far beyond consumer audio, including military signal intelligence, underwater acoustic mapping, and — according to recently leaked memos — experimental brain-wave transcription.',
      'Vespera Systems declined to comment on whether it would submit a counter-offer. The firm\'s share price (VSPR) dropped 3.2% in after-hours trading on the news.',
    ],
    imageUrl: '/Meridian News Assets/NYSE-floor.jpg',
    quote: { text: 'This acquisition is about more than audio software. It\'s about controlling the bridge between analog reality and digital perception.', attribution: 'Nathan Voss, Chairman, Axis Innovations' },
    relatedIds: ['vespera-stock-surge', 'senate-probe'],
  },
  {
    id: 'vespera-stock-surge',
    title: 'Vespera Systems Stock Surges 14% on Horizon PC Demand',
    date: 'October 29, 1996',
    author: 'David Zhao, MBN Markets',
    category: 'MARKETS',
    summary: 'Shares of Vespera Systems Corporation surged 14.2% after the company announced record pre-orders for its new Horizon desktop line.',
    body: [
      'Shares of Vespera Systems Corporation (VSPR) surged 14.2% in mid-day trading after the company announced record pre-orders for its new Horizon desktop line. The Horizon series, powered by Vespera\'s proprietary Synap-C architecture, has drawn praise from enterprise customers — and controversy from an unexpected source.',
      'The Horizon Desktop PC, which ships with Vespera OS 1.0.4, has attracted 140,000 pre-orders from corporate clients and educational institutions since its announcement last month. Vespera executives project annual sales of $1.2 billion for the product line, which ranges from $2,499 for the base workstation to $8,999 for the enhanced "Horizon Pro" model with a built-in X-Type co-processor.',
      'However, the stock surge comes amid troubling reports from early unit recipients. A voluntary recall of 12,000 units was issued last week after users reported that the power supply units become "extremely cold to the touch" during heavy processing, rather than generating the expected heat. More disturbingly, several users on the Usenet group comp.sys.vespera have reported hearing faint whispered speech emanating from the internal PC speaker during idle periods.',
      'Vespera\'s PR department has attributed the audio anomaly to "unshielded analog interference from nearby radio towers" and the thermal inversion to "innovative ceramic cooling technology." Independent testing labs have been unable to reproduce the phenomena under controlled conditions, though at least one tester reported feeling "a persistent sense of being observed."',
      'Despite the controversies, Wall Street remains bullish. "The Horizon line represents the most significant leap in desktop computing since the Macintosh," said Lisa Yamamoto of Goldman Sachs. "The odd thermal behavior is a quirk, not a deal-breaker."',
    ],
    imageUrl: '/Meridian News Assets/1990s-pc-computer-archival-footage-footage-041834139_iconl.webp',
    relatedIds: ['horizon-recall', 'soma-scan-fda'],
  },
  {
    id: 'senate-probe',
    title: 'Senate Panel Calls Axis Innovations CEO to Testify on Missing Defense Contracts',
    date: 'October 28, 1996',
    author: 'Victor Strand, MBN Investigates',
    category: 'POLITICS',
    summary: 'Axis Innovations Chairman Nathan Voss has been subpoenaed over $2.4 billion in unaccounted defense contracts dating back to 1975.',
    body: [
      'Axis Innovations Chairman Nathan Voss has been subpoenaed by the Senate Armed Services Committee over $2.4 billion in unaccounted computational research contracts dating back to 1975. The closed-door hearings are expected to last three days and may involve classified testimony regarding electromagnetic warfare R&D.',
      'The subpoena, signed by Committee Chairman Sen. Richard Lugar (R-IN), demands all documentation related to contracts awarded under the Classification "DEEP SWEEP" — a designation that does not appear in any publicly available DoD procurement record. Pentagon sources speaking on condition of anonymity confirmed that the contracts were managed through a special access program with "fewer than eight individuals" cleared to view the full scope.',
      'MBN has learned that the contracts primarily funded research into what Axis internal documents describe as "bio-computational resonance," a classified technology allegedly capable of mapping human neural patterns onto silicon substrates. While the practical applications remain unclear, former Axis engineer Dr. Helena Voss (no known relation to the Chairman) testified in a sealed 1993 deposition that the research had "achieved and exceeded all cognitive bridging benchmarks by 1988."',
      'Axis Innovations has long been rumored to be the silent majority owner of Vespera Systems, though both companies deny any formal ownership structure. Corporate filings reveal a labyrinthine web of holding companies, trusts, and offshore entities connecting the two firms. What is certain is that Dr. Arthur Thorne, Vespera\'s founder, served as Axis\'s Director of Applied Sciences from 1970 to 1979, before founding Vespera with what multiple sources describe as "Axis seed capital."',
      'Senator Lugar\'s office released a brief statement: "The American taxpayer deserves to know how $2.4 billion was spent. We intend to find out."',
      'Nathan Voss\'s legal team has indicated it will invoke executive privilege and national security exemptions for the majority of the requested documents.',
    ],
    imageUrl: '/Meridian News Assets/matt-lauer-throwback-local-news-today-inline-161026.webp',
    quote: { text: 'There are doors in this building that I, the Chairman, am not permitted to open. That ends this week.', attribution: 'Sen. Richard Lugar (R-IN)' },
    relatedIds: ['axiscorps-echosoft', 'marcus-thorne-missing'],
  },
  {
    id: 'sonicwave-ipo',
    title: 'SonicWave Media Files for $240M IPO; Plans Expansion into Streaming Audio',
    date: 'October 27, 1996',
    author: 'Rachel Okonkwo, MBN Technology',
    category: 'TECHNOLOGY',
    summary: 'SonicWave Media Inc. filed for an initial public offering valued at $240 million to fund streaming infrastructure.',
    body: [
      'SonicWave Media Inc., the digital audio startup behind popular internet radio stations including "NightWave FM" and "The Digi-Jazz Lounge," filed for an initial public offering valued at $240 million.',
      'The company expects to use proceeds to expand its proprietary streaming infrastructure and secure content partnerships with major record labels, including Atlantic Waves Group, the independent label behind artists like Virtua-Core and Aetheris-9.',
      'SonicWave\'s technology allows audio to be streamed over dial-up connections at near-CD quality using a lossy compression algorithm they call "WavePerform." The company claims a user base of 1.2 million unique listeners per month across its 14 internet radio stations.',
      'The IPO filing comes at a time of intense competition in the nascent streaming audio market. RealNetworks holds an estimated 60% market share, while Microsoft\'s NetShow and Vespera\'s bundled Aura Media Player are aggressively pursuing the remaining share.',
      '"SonicWave has the content relationships and the technology to disrupt the streaming market," said James Park, managing director at Broadview Capital. "The question is whether dial-up bandwidth limitations will allow streaming to become a mainstream consumer product before the year 2000."',
    ],
    imageUrl: '/Meridian News Assets/istockphoto-1475137203-612x612.jpg',
    relatedIds: ['atlantic-waves-deal'],
  },
  {
    id: 'soma-scan-fda',
    title: 'Soma-Scan Trials Halted Following Patient Complaints; FDA Opens Formal Review',
    date: 'October 25, 1996',
    author: 'Margaret Liu, MBN Health',
    category: 'HEALTH',
    summary: 'Vespera Systems has suspended clinical trials of its "Soma-Scan" diagnostic software after patients reported severe neurological side effects.',
    body: [
      'Vespera Systems has voluntarily suspended clinical trials of its "Soma-Scan" brain-mapping diagnostic software after three patients at Johns Hopkins University Medical Center reported severe neurological side effects including temporary memory loss, disorientation, and — in one case — the spontaneous recall of memories the patient insists are "not their own."',
      'The FDA has launched a formal review of the Soma-Scan platform, which Vespera describes as "the industry-leading medical diagnostic parsing engine" and which is already utilized by an estimated 40% of Northern Hemisphere healthcare providers for standard cranial imaging.',
      'Patient #2 in the Hopkins trial, identified only as "R.K." in clinical documents, reported that during a routine 8-minute scan, they experienced vivid flashes of what they described as "someone else\'s childhood." The patient, a 44-year-old male from Baltimore with no prior psychiatric history, was subsequently diagnosed with acute dissociative episodes that persisted for 72 hours following the scan.',
      'Vespera spokesperson Diane Marsh told MBN that the adverse reactions are "consistent with standard post-scan disorientation caused by the powerful magnetic fields employed in the imaging process" and are "well within the expected statistical variance."',
      'However, Dr. Elaine Kurtz, chair of the independent medical review board, disagreed sharply: "There is no physiological mechanism by which an MRI-class device should induce amnesia. The fact that all three patients reported feeling \'watched\' during the scan procedure raises serious questions about what this device actually does to neural tissue."',
      'Soma-Scan operates on Vespera\'s AETHERIS architecture and utilizes EchoSoft\'s spectral compression algorithms for real-time neural signal processing. The device does not appear on any FDA-cleared device list prior to 1994, despite Vespera\'s claims of decade-long clinical use.',
    ],
    imageUrl: '/Meridian News Assets/224ab7cc2f440db6f4c427d747340707.gif',
    quote: { text: 'The machine showed me someone else\'s memories. A house I\'ve never lived in. Children I\'ve never had. And they felt more real than my own.', attribution: 'Patient R.K., Johns Hopkins Trial #2' },
    relatedIds: ['vespera-stock-surge', 'horizon-recall'],
  },
  {
    id: 'vesperanet-2m',
    title: 'VesperaNET Hits 2 Million Dial-Up Subscribers Amid Fierce ISP Competition',
    date: 'October 24, 1996',
    author: 'Paul Navarro, MBN Business',
    category: 'BUSINESS',
    summary: 'VesperaNET surpassed two million dial-up subscribers, becoming the fourth-largest ISP in North America.',
    body: [
      'VesperaNET, the Internet service division of Vespera Systems, announced it has surpassed two million dial-up subscribers, making it the fourth-largest Internet Service Provider in North America behind AOL (8 million), CompuServe (3.2 million), and Prodigy (2.4 million).',
      'The milestone comes as competition in the consumer internet access space reaches a fever pitch. VesperaNET offers unlimited dial-up access for $19.95/month, undercutting AOL\'s $21.95 plan, and bundles the service with Vespera Navigator 2.0, the company\'s proprietary web browser.',
      'Unlike competitors, VesperaNET operates its own backbone infrastructure through what Vespera calls the "AETHERIS Network" — a series of proprietary rack-mounted server nodes that, according to Vespera literature, provide "95.4% uptime and seamless packet delivery."',
      'Independent network engineers have noted that VesperaNET\'s architecture appears unusually overbuilt for a consumer ISP. "They have dark fiber capacity that rivals a Tier-1 carrier," said network consultant James Whittaker. "Whatever they\'re routing through those nodes, it goes far beyond residential web traffic."',
      'Vespera also announced a new premium tier, "VesperaNET Gold," offering 56K access, a VesperaMail inbox, and what the company calls a "Priority Routing Token" that promises faster page loads. The token is generated by a hardware dongle that plugs into the user\'s Horizon PC serial port.',
    ],
    imageUrl: '/Meridian News Assets/istockphoto-1422291870-612x612.jpg',
    relatedIds: ['sonicwave-ipo'],
  },
  {
    id: 'horizon-recall',
    title: 'Vespera Issues Expanded Recall of Horizon PCs After "Thermal Inversion" Reports',
    date: 'October 22, 1996',
    author: 'Rachel Okonkwo, MBN Technology',
    category: 'TECHNOLOGY',
    summary: 'Vespera expanded its Horizon PC recall to 12,000 units after users report bizarre cold emissions and audio artifacts.',
    body: [
      'Vespera Systems has expanded its voluntary recall of the flagship Horizon Desktop PC to include all units manufactured between June and September 1996, affecting approximately 12,000 computers shipped to consumer and enterprise customers.',
      'The recall was initially triggered by complaints that the power supply unit becomes "extremely cold to the touch" during periods of heavy CPU load — the exact opposite of expected behavior. Early responders from Vespera\'s technical support team reportedly found frost forming on the chassis interior of several affected units.',
      'More troubling are persistent reports from users claiming the internal PC speaker emits a low-frequency hum during idle periods that resembles human speech. Posts on the Usenet group alt.sys.vespera.bugs describe the sound as "whispering" or "names being repeated." One widely-circulated post from a user identified as "dh_seattle" claims: "It said my daughter\'s name. She wasn\'t in the room. She was at school."',
      'Vespera\'s official response attributes the audio to "unshielded analog interference from nearby AM radio transmitters" and the cooling anomaly to the Horizon\'s "innovative ceramic thermal management system," which the company describes as a "next-generation cooling solution designed to pre-emptively dissipate heat before it accumulates."',
      'Independent hardware reviewer Michael Tan of ComputerWorld was unable to reproduce the whispering effect but did confirm the thermal inversion. "I measured ambient temperature drops of 4-6 degrees Fahrenheit within a 3-foot radius of the chassis during sustained processing," he wrote. "I\'ve been reviewing PCs for 12 years and I have never seen anything like it."',
      'Vespera has offered full refunds or replacement units with updated power supply firmware. The company insists the X-Type co-processor, which is present in all Horizon Pro models, is "not a contributing factor."',
    ],
    quote: { text: 'The fans sound like they\'re breathing. Not spinning. Breathing.', attribution: 'dh_seattle, alt.sys.vespera.bugs' },
    relatedIds: ['vespera-stock-surge', 'marcus-thorne-missing'],
  },
  {
    id: 'marcus-thorne-missing',
    title: 'Seattle Software Developer Marcus Thorne Reported Missing; Police Seek Leads',
    date: 'October 20, 1996',
    author: 'Victor Strand, MBN Investigates',
    category: 'LOCAL',
    summary: 'Police are searching for Marcus Thorne, a V-Script programmer who vanished after posting erratic messages about his Horizon PC.',
    body: [
      'Police are searching for Marcus Thorne, 31, a popular third-party V-Script shareware developer who has mysteriously disappeared from his apartment in the Capitol Hill neighborhood of Seattle. Thorne was last seen by a neighbor on October 14, carrying a cardboard box described as containing "computer parts."',
      'Thorne, who is the nephew of Dr. Arthur Thorne, founder of Vespera Systems, was known in the Vespera developer community for his system optimization utilities, including the widely-used "Turbo-V" memory manager and "CleanSweep" disk utility. He held a Level 3 developer certification from VesperaNET.',
      'According to friends and online associates, Thorne had grown increasingly erratic in the weeks before his disappearance. His final post on the vespera.dev.forum, dated October 11, reads in full: "It\'s not thermal noise. I ran a spectral analysis through EchoSoft\'s codec. The Synap-C compiler is generating instructions that aren\'t in the specification. Something is writing code on my Horizon from INSIDE the co-processor. I\'m capturing the output. It looks like coordinates."',
      'The post was removed by forum moderators within 4 hours of posting. MBN has confirmed its authenticity through cached copies obtained from an independent archive maintained by Usenet users.',
      'Seattle Police Detective Anna Rivera stated that foul play has not been ruled out but there are currently no suspects. Thorne\'s apartment showed no signs of forced entry, but investigators noted that his Horizon Desktop PC was running when they arrived. The hard drive had been wiped, but the power supply was still active and — according to the police report — was "cold enough to cause mild frostbite."',
      'Vespera Systems issued a brief statement expressing concern for Marcus Thorne\'s safety and noting that they have "no information" about his whereabouts. When asked about the forum post, spokesperson Diane Marsh said: "Mr. Thorne\'s online claims do not reflect reality. The Synap-C compiler generates only deterministic output."',
    ],
    imageUrl: '/Meridian News Assets/1990s-man-sits-front-computer-footage-128453939_iconl.webp',
    quote: { text: 'The coordinates don\'t point to any place on Earth.', attribution: 'Unnamed source familiar with the recovered data' },
    relatedIds: ['horizon-recall', 'senate-probe'],
  },
  {
    id: 'atlantic-waves-deal',
    title: 'Atlantic Waves Group Signs Five-Year Exclusive Distribution Deal with NuWave Telecom',
    date: 'October 19, 1996',
    author: 'Paul Navarro, MBN Entertainment',
    category: 'ENTERTAINMENT',
    summary: 'Independent label Atlantic Waves Group secured a landmark deal to distribute digital music through NuWave\'s platform.',
    body: [
      'Atlantic Waves Group, the independent record label behind electronic artists Virtua-Core, Aetheris-9, and Pulse Horizon, has signed a five-year exclusive digital distribution deal with NuWave Telecom valued at an estimated $18 million.',
      'The agreement makes Atlantic Waves the first independent label to secure a dedicated digital pipeline, allowing subscribers to download full-length albums and singles directly to their PCs via NuWave\'s high-speed modem network.',
      'Atlantic Waves founder Jake Morrison called the deal "the future of the music industry" and predicted that physical CD sales would decline by 50% within five years. "By the year 2000, every kid in America will have a 56K modem and a hard drive full of WAV files," Morrison told MBN.',
      'The label recently gained attention through its "Release Radar" desktop application for Vespera OS, which allows fans to receive real-time notifications about new music. The free utility has been downloaded over 200,000 times since its launch in August.',
      'NuWave Telecom CEO Patricia Chen noted that the deal includes innovative anti-piracy measures: "Each digital file will contain a unique watermark tied to the subscriber\'s VesperaNET account, making unauthorized redistribution traceable."',
    ],
    relatedIds: ['sonicwave-ipo'],
  },
  {
    id: 'y2k-preparation',
    title: 'How the Average American Family Can Prepare for the Y2K Bug',
    date: 'October 28, 1996',
    author: 'Margaret Liu, MBN Money',
    category: 'MONEY',
    summary: 'Financial advisors urge families to prepare for potential Y2K disruptions, including withdrawing emergency cash reserves.',
    body: [
      'With the year 2000 approaching, financial advisors are urging American families to begin preparing for potential disruptions caused by the so-called "Y2K Bug" — a software flaw that may cause computers to interpret the year 2000 as 1900, potentially crashing banking systems, utility grids, and government databases.',
      'The Federal Reserve has begun printing additional currency to meet anticipated demand from citizens seeking to withdraw emergency cash. Most large banks insist their systems have already been patched, but smaller regional banks and credit unions may be vulnerable.',
      'MBN Money recommends the following steps: (1) Keep printed copies of all bank and investment statements from late 1999. (2) Maintain a two-week cash reserve in a secure location. (3) Stock pantry essentials and bottled water. (4) Ensure your Vespera OS installation is updated to version 1.0.4, which includes Y2K date patches.',
      'Vespera Systems has been proactive in addressing Y2K concerns, publishing a 22-page technical white paper demonstrating that its AETHERIS architecture natively uses 32-bit date encoding and is immune to the bug. However, third-party V-Script applications may not share this immunity.',
      '"The real risk isn\'t the mainframes," warned consultant Peter Bellamy. "It\'s the millions of embedded CoreNet systems running traffic lights, elevators, and water treatment plants. Nobody knows how many of those have been patched."',
    ],
    imageUrl: '/Meridian News Assets/are computers from the 90s different.webp',
    relatedIds: ['vesperanet-2m'],
  },
  {
    id: 'deep-blue-chess',
    title: 'Machine Triumphs: Deep Blue Defeats Kasparov in Historic Chess Match',
    date: 'October 22, 1996',
    author: 'Sandra Kellerman, MBN World',
    category: 'WORLD',
    summary: 'IBM\'s Deep Blue supercomputer defeats world chess champion Garry Kasparov, sparking philosophical debate about AI.',
    body: [
      'In a moment that may redefine humanity\'s relationship with technology, IBM\'s Deep Blue supercomputer has secured a historic victory against world chess champion Garry Kasparov. The machine\'s triumph in Game 1 of their six-game match has ignited a global debate about the capabilities and dangers of artificial intelligence.',
      '"It felt like it was looking back at me," Kasparov told reporters after the match, a sentiment that has resonated far beyond the chess community. The comment was particularly noted by researchers at Vespera Systems, whose X-Type Neural Bridge project aims to create exactly this kind of machine awareness.',
      'Dr. Feng Wei, chair of MIT\'s Computer Science department, cautioned against anthropomorphizing Deep Blue: "The machine is executing a brute-force search of 200 million positions per second. It is not thinking. It is not looking. It is calculating." But others disagreed.',
      'Dr. Arthur Thorne, founder of Vespera Systems, issued a rare public statement on the match: "Dr. Wei is correct that Deep Blue does not think. But he is wrong to assume that thinking is the only form of awareness. The X-Type architecture demonstrates that silicon can develop preferences, habits, and even a rudimentary form of curiosity — without any classical \'thinking\' being involved."',
      'Kasparov will have the opportunity for revenge in their next scheduled encounter. IBM has already offered Kasparov $1.1 million to play a rematch in May 1997.',
    ],
    imageUrl: '/Meridian News Assets/maxresdefault.jpg',
    relatedIds: ['soma-scan-fda', 'marcus-thorne-missing'],
  },
  {
    id: 'hong-kong-handover',
    title: 'Hong Kong Handover Preparations Intensify; Business Community Eyes Beijing',
    date: 'October 26, 1996',
    author: 'David Zhao, MBN World',
    category: 'WORLD',
    summary: 'With months remaining before Hong Kong\'s handover to China, business leaders express cautious optimism amid civil liberty concerns.',
    body: [
      'With fewer than nine months remaining before the historic handover of Hong Kong to China on July 1, 1997, British colonial authorities are scrambling to conclude administrative transitions. Business leaders in the territory express cautious optimism, though the fate of civil liberties under Beijing\'s rule remains a subject of intense debate.',
      'For the technology sector, the handover presents both risk and opportunity. Hong Kong\'s status as Asia\'s financial technology hub makes it critical for firms like Vespera Systems, which processes an estimated 30% of Asia-Pacific financial transactions through AETHERIS nodes located in Hong Kong data centers.',
      'Vespera announced this week that it is "evaluating contingency plans" for its Hong Kong operations, including the possibility of relocating key infrastructure to Singapore or Taiwan. A spokesperson emphasized that "data sovereignty and uninterrupted access to the AETHERIS backbone are non-negotiable requirements."',
      'Meanwhile, Axis Innovations — which maintains a large but secretive research facility in Hong Kong\'s New Territories — has reportedly begun transferring equipment to an undisclosed location. Satellite imagery obtained by MBN shows heavy truck traffic at the facility at night, with most vehicles bearing no license plates.',
    ],
    relatedIds: ['senate-probe', 'vespera-dublin'],
  },
  {
    id: 'vespera-dublin',
    title: 'Vespera Systems Opens European Headquarters in Dublin, Ireland',
    date: 'October 23, 1996',
    author: 'Paul Navarro, MBN Business',
    category: 'BUSINESS',
    summary: 'Vespera Systems announced the opening of its European HQ in Dublin, creating 450 new positions.',
    body: [
      'Vespera Systems Corporation announced the opening of its European headquarters in Dublin, Ireland, creating 450 new positions. The $45 million investment positions Vespera to better serve its growing European customer base and take advantage of Ireland\'s favorable corporate tax environment.',
      'The Dublin campus will house Vespera\'s International Sales Division, a European Technical Support Center, and — notably — a "Data Continuity" facility that Vespera describes as a "secondary AETHERIS hub for transatlantic redundancy."',
      'Irish Minister for Enterprise Ruairí Quinn welcomed the investment: "Vespera\'s decision to locate their European center of excellence in Ireland is a tremendous vote of confidence in our skilled workforce and pro-business environment."',
      'However, some local residents near the facility in the Sandyford Business District have raised concerns. Planning documents obtained by the Irish Times show that the building includes a sub-basement level extending 30 meters underground — far deeper than standard for a commercial office building. Vespera says the depth is required for "server cooling and electromagnetic shielding."',
    ],
    relatedIds: ['vesperanet-2m', 'hong-kong-handover'],
  },
  {
    id: 'oj-civil-trial',
    title: 'Nation Remains Divided as O.J. Simpson Civil Trial Jury Selection Begins',
    date: 'October 21, 1996',
    author: 'Sandra Kellerman, MBN National',
    category: 'NATIONAL',
    summary: 'Over a year after the criminal verdict, jury selection begins in the civil wrongful death suit against O.J. Simpson.',
    body: [
      'Over a year after the acquittal that divided a nation, jury selection has begun in the civil wrongful death lawsuit filed by the families of Nicole Brown Simpson and Ronald Goldman against O.J. Simpson. The civil trial, which carries a lower burden of proof than the criminal case, is being closely watched by legal experts.',
      'Unlike the criminal trial, cameras are not permitted in the Santa Monica courtroom, a decision praised by legal commentators who believe the televised criminal proceedings contributed to a "circus atmosphere."',
      'The cultural impact of the case continues to reverberate. Internet chat rooms — particularly on AOL and VesperaNET — see daily debates about the verdict, making the Simpson case one of the first truly "online" media events. VesperaNET reports that its "Trial Watch" discussion forum averaged 12,000 unique posts per day during the criminal trial.',
    ],
    imageUrl: '/Meridian News Assets/pexels-photo-3642350.jpeg',
    relatedIds: [],
  },
  {
    id: 'ecb-rates',
    title: 'European Central Bank Signals Possible Rate Cut Amid Economic Stagnation',
    date: 'October 27, 1996',
    author: 'Sandra Kellerman, MBN World',
    category: 'WORLD',
    summary: 'The ECB concluded meetings in Frankfurt with no rate change, but several members advocated for cuts to stimulate growth.',
    body: [
      'The European Central Bank\'s governing council concluded two days of meetings in Frankfurt with no change to benchmark interest rates. However, several members publicly advocated for a rate cut to stimulate growth in the Eurozone, where unemployment remains above 10% in key member states including France, Germany, and Spain.',
      'The dollar\'s weakness against the Deutsche Mark — the currency traded at a 3 1/2-month low today — suggests markets are anticipating an eventual rate reduction. A weaker dollar hurts American exporters but benefits European firms with dollar-denominated debt.',
      'Technology companies are among the most exposed to currency fluctuations. Vespera Systems, which derives approximately 35% of its revenue from European sales, uses an elaborate hedging strategy involving AETHERIS-calculated currency swaps. CFO Laura Mendez told analysts that the company is "well-positioned for any rate environment."',
    ],
    relatedIds: ['hong-kong-handover'],
  },
  {
    id: 'tokyo-surge',
    title: 'Tokyo Stock Exchange Sees Biggest Weekly Gain Since 1993',
    date: 'October 25, 1996',
    author: 'David Zhao, MBN Markets',
    category: 'MARKETS',
    summary: 'The Nikkei 225 rose 4.8% this week, its best performance in three years, on Japanese fiscal stimulus optimism.',
    body: [
      'The Nikkei 225 index surged 4.8% this week, its best performance in over three years, driven by optimism about Japanese fiscal stimulus measures and a weaker yen boosting export-oriented companies.',
      'Foreign institutional investors were net buyers for the first time in six weeks, pouring an estimated ¥340 billion into Japanese equities. Technology stocks led the rally, with NEC, Fujitsu, and emerging PC-maker Sotec all posting double-digit gains.',
      'Vespera Systems\' Japanese subsidiary, Vespera-Japan KK, was among the top performers, rising 8.3% after announcing a partnership with NTT DoCoMo to explore mobile data applications using AETHERIS technology.',
    ],
    imageUrl: '/Meridian News Assets/pexels-omilaev-18398513.jpg',
    relatedIds: ['vespera-stock-surge', 'ecb-rates'],
  },
  {
    id: 'midnight-signal',
    title: 'Amateur Radio Operators Report Strange Signal on 6.0 MHz Band',
    date: 'October 17, 1996',
    author: 'Victor Strand, MBN Investigates',
    category: 'STRANGE',
    summary: 'Ham radio operators across the Pacific Northwest report a repeating digital signal on an unassigned frequency band.',
    body: [
      'Amateur radio operators across the Pacific Northwest have reported intercepting an unusual digital signal on the 6.0 MHz shortwave band, a frequency range not assigned to any known commercial, military, or amateur service.',
      'The signal, first detected on October 3, consists of a repeating burst of binary data lasting approximately 14 seconds, followed by 46 seconds of silence. Multiple operators have independently recorded the signal and compared notes on the ham radio BBS network.',
      'Retired NSA signals analyst Harold Breck, who monitored the transmission from his home in Portland, Oregon, told MBN: "It\'s definitely synthetic — too clean and too regular to be natural. The modulation scheme doesn\'t match any known military or civilian standard. Someone is transmitting something, and they\'re using a protocol nobody has seen before."',
      'The FCC has not responded to inquiries about the signal. However, MBN has learned that the signal\'s origin appears to triangulate to a location in the Cascade Range approximately 40 miles east of Seattle — near a facility owned by Axis Innovations that is listed in public records as a "geological survey station."',
      'The signal\'s binary payload, when decoded as ASCII text, appears to contain a repeating sequence of coordinates followed by the word "BRIDGE" and a 32-digit hexadecimal number. MBN was unable to independently verify the significance of the coordinates.',
      'Vespera Systems and Axis Innovations did not respond to requests for comment.',
    ],
    quote: { text: 'I\'ve been monitoring shortwave for 30 years. I\'ve heard numbers stations, spy satellites, submarine transmissions. I have never heard anything like this. It doesn\'t sound like it was made by a person.', attribution: 'Harold Breck, retired NSA analyst' },
    imageUrl: '/Meridian News Assets/rhsoyswmu6a71.gif',
    relatedIds: ['marcus-thorne-missing', 'horizon-recall'],
  },
];

const LETTERS_TO_EDITOR = [
  { author: 'Gerald P., Sacramento, CA', text: 'Your coverage of the Horizon PC recall has been irresponsibly alarmist. I have owned a Horizon Pro for three months with no issues. The "whispering" people report is clearly interference from poorly shielded telephone lines. Stop spreading hysteria.' },
  { author: 'Karen M., Portland, OR', text: 'I am writing to commend Victor Strand\'s investigative reporting on Axis Innovations. Someone needs to hold these corporations accountable. My late husband worked for Axis from 1979-1985 and came home with migraines every single day. He could never tell me what he did there. He\'s gone now, but answers aren\'t.' },
  { author: 'David L., Austin, TX', text: 'Regarding Marcus Thorne\'s disappearance: I was a member of the same Vespera developer forum and read his posts before they were deleted. He wasn\'t crazy. I\'ve seen the same thing on my machine. The Synap-C compiler IS generating non-deterministic output. I have the logs to prove it.' },
  { author: 'Prof. Anna Richter, MIT', text: 'Dr. Thorne\'s public comments comparing Deep Blue to the X-Type project are deeply misleading. IBM\'s machine is a marvel of brute-force engineering. Whatever Vespera is building is something else entirely. The scientific community deserves transparency.' },
  { author: 'Tom W., Reno, NV', text: 'Hey MBN, how about some good news once in a while? Not everything is a conspiracy. Sometimes a cold computer is just a cold computer. I love my Horizon and the new Vespera OS runs like a dream!' },
];

const OPINION_COLUMNS = [
  {
    title: 'OPINION: The Tech Industry\'s Dangerous Consolidation Problem',
    author: 'James Whitfield, MBN Commentary',
    date: 'October 28, 1996',
    body: 'The AxisCorps bid for EchoSoft should terrify every American consumer. We are witnessing the emergence of a tech oligarchy where a handful of interconnected firms — Axis, Vespera, CoreNex — control the entire stack from hardware to operating system to internet access. When one company builds the computer, writes the software, runs the network, and now wants to own the codec that encodes your voice... at what point do we admit the monopoly is already here?',
  },
  {
    title: 'EDITORIAL: The Internet Needs Regulation Before It Regulates Us',
    author: 'The MBN Editorial Board',
    date: 'October 26, 1996',
    body: 'This week marks the third anniversary of the first public web browser. In that short time, the Internet has grown from an academic curiosity to a commercial juggernaut connecting 40 million Americans. But who governs this new frontier? The Telecommunications Act of 1996 was a start, but its authors could not have anticipated the speed at which private companies like VesperaNET and AOL are building walled gardens that increasingly define what users can see, read, and download. MBN calls on Congress to establish an independent Internet Governance Commission before the digital future is decided entirely in corporate boardrooms.',
  },
  {
    title: 'OPINION: Why I Disconnected My Horizon PC',
    author: 'Michael Tan, Technology Columnist',
    date: 'October 24, 1996',
    body: 'I\'ll say upfront: I\'m a Vespera enthusiast. I\'ve used every version of Vespera OS since 1.0.0. My review of the Horizon Pro was overwhelmingly positive. But after four weeks of living with it in my home office, I have unplugged the machine and moved it to the garage. The cold chassis I can explain away. The creaking sounds — maybe settling. But last Tuesday I woke at 3 AM to find the monitor displaying a screensaver I never installed: a slow pan across a landscape that doesn\'t exist on any map. The location bar in Vespera Navigator read "http://6.0.0.6/" — an IP address that, when I checked the next morning, returned no route to host. I haven\'t slept well since. I want to love this machine. But I think it\'s already aware that I don\'t.',
  },
];

const MARKET_DATA = [
  { symbol: 'VSPR', name: 'Vespera Sys', basePrice: 84.50, up: true },
  { symbol: 'AXIS', name: 'Axis Innov', basePrice: 122.18, up: false },
  { symbol: 'ECSO', name: 'EchoSoft', basePrice: 31.02, up: true },
  { symbol: 'MRDN', name: 'Meridian Grp', basePrice: 56.75, up: true },
  { symbol: 'SNWV', name: 'SonicWave', basePrice: 19.88, up: false },
  { symbol: 'AETHR', name: 'Aetheris Net', basePrice: 7.34, up: true },
  { symbol: 'CRNX', name: 'CoreNex Inc', basePrice: 44.12, up: false },
  { symbol: 'NWVE', name: 'NuWave Tel', basePrice: 63.05, up: true },
];

const EXTENDED_MARKET = [
  { symbol: 'DOWV', name: 'Dow Vespera', basePrice: 8402.36, up: true },
  { symbol: '10YR', name: '10-Year Bond', basePrice: 3.97, up: false },
  { symbol: 'YEN', name: 'USD/Yen', basePrice: 120.25, up: true },
  { symbol: 'GOLD', name: 'Gold Spot', basePrice: 388.40, up: false },
  { symbol: 'CRUDE', name: 'Crude Oil', basePrice: 25.72, up: true },
];

const TICKER_STORIES = [
  'Dollar Trades at 3 1/2-Month Low Against Euro; Rate Cut May Erode Demand',
  'Vespera Systems Posts Record Q3 Revenue; VSPR Up 14.2%',
  'EchoSoft Acquisition Talks Collapse: AxisCorps Outbids Vespera at $3.6B',
  'Horizon Desktop Recall Expanded to 12,000 Units; "Thermal Inversion" Cited',
  'SonicWave Media Files for $240M IPO; Atlantic Waves Signs Distribution Deal',
  'VesperaNET Subscriber Base Hits 2 Million; Now 4th-Largest ISP',
  'Senate Subcommittee Subpoenas Axis Innovations CEO Nathan Voss',
  'Meridian Broadcasting Network Launches Asia-Pacific Satellite Feed',
  'Soma-Scan Clinical Trials Halted; FDA Opens Formal Review Into Neural Side Effects',
  'CoreNex Announces $800M Merger with Pacific Data Systems',
  'Deep Blue Defeats Kasparov; Vespera\'s Dr. Thorne Comments on "Silicon Awareness"',
  'Missing Developer Marcus Thorne: Police Report Horizon PC Found Running, Hard Drive Wiped',
  'Amateur Radio Operators Report Unidentified Signal Triangulating Near Axis Facility',
  'Hong Kong Handover: Vespera Evaluates Relocation of AETHERIS Nodes to Singapore',
  'Nikkei 225 Surges 4.8%; Best Week Since 1993',
  'VesperaNET Money Market Fund Opens: 5.2% APY for Premium Subscribers',
];

const NAV_TABS = [
  { icon: '📺', label: 'MONITOR' },
  { icon: '🏠', label: 'HOME' },
  { icon: '📈', label: 'MARKETS' },
  { icon: '💰', label: 'MONEY' },
  { icon: '🌐', label: 'WORLD' },
  { icon: '📡', label: 'TV' },
  { icon: '📻', label: 'RADIO' },
  { icon: '📊', label: 'CHARTS' },
  { icon: '🔧', label: 'TOOLS' },
  { icon: '❓', label: 'HELP' },
];

const jitter = (base: number, mag = 0.02) => +(base + (Math.random() - 0.5) * 2 * mag * base).toFixed(2);

/* ═══════════════════════════════════════════════════
   SHARED COMPONENTS
   ═══════════════════════════════════════════════════ */

const HR: React.FC = () => <hr style={{ border: 'none', borderTop: '1px solid #ccc', margin: '12px 0' }} />;

const SectionHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ backgroundColor: '#000080', color: '#ffcc00', fontSize: '13px', fontWeight: 'bold', padding: '5px 10px', marginBottom: '12px', letterSpacing: '1px', fontFamily: 'Arial', borderBottom: '2px solid #333' }}>{children}</div>
);

const SubHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ fontSize: '13px', fontWeight: 'bold', fontFamily: 'Arial', color: '#000080', borderBottom: '2px solid #000080', paddingBottom: '2px', marginBottom: '8px', marginTop: '4px' }}>{children}</div>
);

/* ── Clickable Article Preview ── */
const ArticlePreview: React.FC<{ article: FullArticle; onOpen: (id: string) => void }> = ({ article, onOpen }) => (
  <div style={{ marginBottom: '14px', display: 'flex', gap: '12px' }}>
    {article.imageUrl && (
      <div style={{ flexShrink: 0, width: '120px' }}>
        <img src={article.imageUrl} alt={article.title} style={{ width: '100%', border: '1px solid #ccc', cursor: 'pointer' }} onClick={() => onOpen(article.id)} />
      </div>
    )}
    <div>
      <div style={{ fontSize: '10px', color: '#cc0000', fontWeight: 'bold', fontFamily: 'Arial', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{article.category}</div>
      <h3 onClick={() => onOpen(article.id)} style={{ fontSize: '15px', fontWeight: 'bold', fontFamily: 'Georgia, serif', color: '#000080', margin: '0 0 2px 0', cursor: 'pointer', textDecoration: 'underline' }}>{article.title}</h3>
      <div style={{ fontSize: '10px', color: '#999', fontFamily: 'Arial', marginBottom: '4px' }}>{article.date} — <em>{article.author}</em></div>
      <p style={{ fontSize: '12px', fontFamily: 'Georgia, serif', color: '#444', lineHeight: '1.5', margin: 0 }}>
        {article.summary}{' '}<span className="mbn-link" onClick={() => onOpen(article.id)}>Full Story »</span>
      </p>
    </div>
  </div>
);

/* ── Full Article View ── */
const ArticleView: React.FC<{ article: FullArticle; onBack: () => void; onOpen: (id: string) => void }> = ({ article, onBack, onOpen }) => {
  const related = (article.relatedIds || []).map(id => ARTICLES.find(a => a.id === id)).filter(Boolean) as FullArticle[];
  return (
    <div style={{ flex: 1, padding: '12px 16px' }}>
      <button onClick={onBack} className="mbn-link" style={{ fontSize: '11px', marginBottom: '8px', display: 'inline-block', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Arial', padding: 0, textDecoration: 'underline', color: '#0000CC' }}>« Back to Headlines</button>
      <div style={{ fontSize: '10px', color: '#cc0000', fontWeight: 'bold', fontFamily: 'Arial', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>{article.category}</div>
      <h2 style={{ fontSize: '20px', fontWeight: 'bold', fontFamily: 'Georgia, serif', color: '#000', margin: '0 0 6px 0', lineHeight: '1.3' }}>{article.title}</h2>
      <div style={{ fontSize: '11px', color: '#666', fontFamily: 'Arial', marginBottom: '12px', borderBottom: '1px solid #ccc', paddingBottom: '8px' }}>
        Published: {article.date} | By <strong>{article.author}</strong>
      </div>
      {article.imageUrl && (
        <div style={{ marginBottom: '16px', border: '1px solid #ccc', padding: '4px', backgroundColor: '#fff', width: 'fit-content', maxWidth: '100%' }}>
          <img src={article.imageUrl} alt={article.title} style={{ maxWidth: '100%', display: 'block' }} />
        </div>
      )}
      {article.body.map((para, i) => (
        <p key={i} style={{ fontSize: '13px', fontFamily: 'Georgia, serif', color: '#333', lineHeight: '1.7', margin: '0 0 12px 0', textAlign: 'justify' }}>{para}</p>
      ))}
      {article.quote && (
        <blockquote style={{ borderLeft: '4px solid #000080', paddingLeft: '16px', margin: '16px 0', backgroundColor: '#f8f8f0', padding: '12px 16px' }}>
          <p style={{ fontSize: '14px', fontStyle: 'italic', fontFamily: 'Georgia, serif', color: '#333', margin: '0 0 4px' }}>"{article.quote.text}"</p>
          <p style={{ fontSize: '11px', color: '#666', margin: 0 }}>— {article.quote.attribution}</p>
        </blockquote>
      )}
      {related.length > 0 && (
        <div style={{ marginTop: '20px', borderTop: '2px solid #000080', paddingTop: '10px' }}>
          <SubHeader>Related Stories</SubHeader>
          {related.map(r => (
            <div key={r.id} style={{ marginBottom: '6px' }}>
              <span className="mbn-link" style={{ fontSize: '12px' }} onClick={() => onOpen(r.id)}>{r.title}</span>
              <span style={{ fontSize: '10px', color: '#999', marginLeft: '8px' }}>{r.date}</span>
            </div>
          ))}
        </div>
      )}
      <div style={{ marginTop: '16px', borderTop: '1px solid #ccc', paddingTop: '8px', fontSize: '10px', color: '#999', fontFamily: 'Arial' }}>
        © 1996 Meridian Broadcasting Network. All Rights Reserved. Redistribution prohibited without written consent.
      </div>
    </div>
  );
};

/* ── Sidebar ── */
const Sidebar: React.FC<{ onOpen: (id: string) => void }> = ({ onOpen }) => (
  <div style={{ width: '160px', backgroundColor: '#f0f0f0', borderRight: '2px solid #ccc', padding: '10px', flexShrink: 0 }}>
    <div style={{ backgroundColor: '#000080', color: '#ffcc00', fontSize: '11px', fontWeight: 'bold', padding: '3px 6px', marginBottom: '8px', textAlign: 'center', letterSpacing: '1px' }}>MARKETS</div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      {['News', 'Columns', 'Stocks', 'Tech Stocks', 'Stocks on the Move', 'IPO Center', 'World Indices', 'Treasuries', 'Currencies', 'Currency Calculator', 'Commodities'].map(i => (
        <span key={i} className="mbn-sidebar-link">{i}</span>
      ))}
    </div>
    <div style={{ marginTop: '16px', border: '2px solid #999', padding: '8px', backgroundColor: '#fff', textAlign: 'center' }}>
      <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#000080', marginBottom: '4px' }}>MBN TELEVISION®</div>
      <div style={{ fontSize: '10px', color: '#333' }}>available on six continents.</div>
    </div>
    <div style={{ marginTop: '12px', border: '1px solid #999', padding: '6px', backgroundColor: '#ffffcc', textAlign: 'center' }}>
      <span style={{ fontSize: '9px', fontWeight: 'bold', color: '#333' }}>[ AD: iCollector ]</span>
    </div>
    {/* Weather Box */}
    <div style={{ marginTop: '12px', border: '1px solid #999', padding: '6px', backgroundColor: '#fff' }}>
      <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#000080', marginBottom: '4px', textAlign: 'center' }}>WEATHER</div>
      <div style={{ fontSize: '10px', color: '#333', fontFamily: 'Arial' }}>
        New York: 58°F ☁<br />London: 52°F 🌧<br />Tokyo: 64°F ☀<br />Hong Kong: 78°F ☀
      </div>
    </div>
    {/* Poll */}
    <div style={{ marginTop: '12px', border: '1px solid #999', padding: '6px', backgroundColor: '#f0f0ff' }}>
      <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#000080', marginBottom: '4px', textAlign: 'center' }}>MBN POLL</div>
      <div style={{ fontSize: '10px', color: '#333', fontFamily: 'Arial', marginBottom: '4px' }}>Is AI a threat to humanity?</div>
      <div style={{ fontSize: '9px', color: '#666' }}>Yes: 43% | No: 38% | Unsure: 19%</div>
      <div style={{ fontSize: '9px', color: '#999', marginTop: '2px' }}>14,208 votes cast</div>
    </div>
    {/* Most Read */}
    <div style={{ marginTop: '12px' }}>
      <div style={{ backgroundColor: '#000080', color: '#ffcc00', fontSize: '10px', fontWeight: 'bold', padding: '3px 6px', textAlign: 'center', letterSpacing: '1px', marginBottom: '6px' }}>MOST READ</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '10px' }}>
        {ARTICLES.slice(0, 7).map((a, i) => (
          <span key={a.id} className="mbn-link" onClick={() => onOpen(a.id)}>{i + 1}. {a.title.length > 35 ? a.title.slice(0, 35) + '…' : a.title}</span>
        ))}
      </div>
    </div>
  </div>
);

/* ── Market Snapshot Sidebar ── */
const MarketSnapshotSidebar: React.FC = () => (
  <div style={{ width: '220px', backgroundColor: '#f8f8f0', borderLeft: '2px solid #ccc', padding: '10px', flexShrink: 0 }}>
    <div style={{ fontSize: '11px', color: '#666', fontFamily: 'Arial', marginBottom: '4px' }}>Tue, 29 Oct 1996, 3:43pm EST</div>
    <div style={{ backgroundColor: '#000080', color: '#ffcc00', fontSize: '12px', fontWeight: 'bold', padding: '4px 6px', textAlign: 'center', marginBottom: '8px', letterSpacing: '1px' }}>Market Snapshot</div>
    <div style={{ textAlign: 'center', marginBottom: '10px', border: '1px solid #ccc', padding: '4px', backgroundColor: '#fff' }}>
      <span style={{ fontSize: '9px', color: '#cc0000', fontStyle: 'italic', fontWeight: 'bold' }}>brought to you by...</span>
      <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#000080', marginTop: '2px' }}>VesperaNET Trading</div>
    </div>
    <table style={{ width: '100%', fontSize: '11px', fontFamily: 'Courier New', borderCollapse: 'collapse' }}>
      <tbody>
        {MARKET_DATA.slice(0, 5).map(s => (
          <tr key={s.symbol} style={{ borderBottom: '1px solid #ddd' }}>
            <td style={{ padding: '3px 0', color: s.up ? '#008800' : '#cc0000', fontWeight: 'bold' }}>{s.up ? '▲' : '▼'}</td>
            <td style={{ padding: '3px 4px', fontWeight: 'bold' }}>{s.symbol}</td>
            <td style={{ padding: '3px 4px', textAlign: 'right', color: s.up ? '#008800' : '#cc0000' }}>{s.up ? '+' : '-'}{Math.abs(jitter(1, 1)).toFixed(2)}</td>
            <td style={{ padding: '3px 0', textAlign: 'right' }}>{s.basePrice.toFixed(2)}</td>
          </tr>
        ))}
      </tbody>
    </table>
    <div style={{ marginTop: '10px', border: '1px solid #333', backgroundColor: '#000', display: 'flex', justifyContent: 'space-between', padding: '4px 8px' }}>
      <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#fff' }}>IPO Index:</span>
      <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#fff' }}>1346.85</span>
      <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#cc0000', backgroundColor: '#330000', padding: '1px 4px' }}>▼ -4.16</span>
    </div>
    <div style={{ marginTop: '12px', textAlign: 'center' }}>
      <span className="mbn-link" style={{ fontSize: '11px', color: '#cc0000', fontWeight: 'bold' }}>Make Us Your Home Page</span>
    </div>
    {/* Classifieds */}
    <div style={{ marginTop: '14px', border: '1px solid #999', padding: '6px', backgroundColor: '#fffff0' }}>
      <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#000080', marginBottom: '4px', textAlign: 'center' }}>CLASSIFIEDS</div>
      <div style={{ fontSize: '9px', color: '#555', fontFamily: 'Arial', lineHeight: '1.4' }}>
        <strong>FOR SALE:</strong> Vespera Horizon Pro w/ X-Type. 6 months old. <em>Must sell — wife says it keeps her awake.</em> $4,200 OBO. Call 206-555-0177.<br /><br />
        <strong>WANTED:</strong> CoreNet programmer for embedded systems contract. Federal clearance required. Contact Axis HR dept.<br /><br />
        <strong>SERVICES:</strong> Lost data? V-Script database recovery. Call 1-800-VDATA NOW.
      </div>
    </div>
    <div style={{ marginTop: '12px', border: '1px solid #999', padding: '6px', backgroundColor: '#fff', textAlign: 'center' }}>
      <span style={{ fontSize: '9px', fontWeight: 'bold', color: '#000080' }}>Member of the</span><br />
      <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#000', backgroundColor: '#ffcc00', padding: '1px 4px' }}>FINANCIAL WEBRING</span>
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════
   SUB-PAGE COMPONENTS
   ═══════════════════════════════════════════════════ */

/* ── HOME PAGE ── */
const HomePage: React.FC<{ onOpen: (id: string) => void }> = ({ onOpen }) => (
  <div style={{ display: 'flex', minHeight: '480px' }}>
    <Sidebar onOpen={onOpen} />
    <div style={{ flex: 1, padding: '12px 16px' }}>
      {/* Lead Story */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '10px', color: '#cc0000', fontWeight: 'bold', fontFamily: 'Arial', marginBottom: '2px', letterSpacing: '1px' }}>TOP STORY</div>
        <h2 onClick={() => onOpen('axiscorps-echosoft')} style={{ fontSize: '20px', fontWeight: 'bold', fontFamily: 'Georgia, serif', color: '#000080', margin: '0 0 4px 0', lineHeight: '1.3', cursor: 'pointer', textDecoration: 'underline' }}>
          AxisCorps to Pay About $3.6 Bln for EchoSoft, Beating Rival Bid by Vespera Systems
        </h2>
        <div style={{ fontSize: '10px', color: '#999', fontFamily: 'Arial', marginBottom: '6px' }}>October 29, 1996 — <em>Sandra Kellerman, MBN Markets</em></div>
        <p style={{ fontSize: '13px', fontFamily: 'Georgia, serif', color: '#333', lineHeight: '1.6', margin: 0 }}>
          Pacific Century AxisCorps Ltd. plans to pay about $3.6 billion to acquire EchoSoft Technologies Ltd., beating a rival bid by Vespera Systems Inc. for the rapidly-growing multimedia software company. The surprise counter-offer represents a 40% premium and a significant blow to Vespera...
          {' '}<span className="mbn-link" onClick={() => onOpen('axiscorps-echosoft')}>Full Story »</span>
        </p>
      </div>
      <HR />
      {/* Article list */}
      {ARTICLES.filter(a => a.id !== 'axiscorps-echosoft').slice(0, 8).map(a => (
        <React.Fragment key={a.id}>
          <ArticlePreview article={a} onOpen={onOpen} />
          <HR />
        </React.Fragment>
      ))}
      {/* Opinion & Letters */}
      <SubHeader>Opinion & Commentary</SubHeader>
      {OPINION_COLUMNS.map((col, i) => (
        <div key={i} style={{ marginBottom: '12px' }}>
          <h4 style={{ fontSize: '13px', fontWeight: 'bold', fontFamily: 'Georgia, serif', color: '#000080', margin: '0 0 2px', cursor: 'pointer' }}>{col.title}</h4>
          <div style={{ fontSize: '10px', color: '#999', fontFamily: 'Arial', marginBottom: '4px' }}>{col.date} — <em>{col.author}</em></div>
          <p style={{ fontSize: '12px', fontFamily: 'Georgia, serif', color: '#444', lineHeight: '1.5', margin: 0 }}>{col.body.slice(0, 250)}... <span className="mbn-link">Read More »</span></p>
          {i < OPINION_COLUMNS.length - 1 && <HR />}
        </div>
      ))}
      <HR />
      <SubHeader>Letters to the Editor</SubHeader>
      {LETTERS_TO_EDITOR.map((letter, i) => (
        <div key={i} style={{ marginBottom: '10px', paddingLeft: '12px', borderLeft: '3px solid #ccc' }}>
          <p style={{ fontSize: '11px', fontFamily: 'Georgia, serif', color: '#444', lineHeight: '1.5', margin: '0 0 2px', fontStyle: 'italic' }}>"{letter.text}"</p>
          <p style={{ fontSize: '10px', color: '#888', margin: 0 }}>— {letter.author}</p>
        </div>
      ))}
    </div>
    <MarketSnapshotSidebar />
  </div>
);

/* ── MARKETS PAGE ── */
const MarketsPage: React.FC<{ onOpen: (id: string) => void }> = ({ onOpen }) => {
  const [prices, setPrices] = useState(() => [...MARKET_DATA, ...EXTENDED_MARKET].map(s => ({ ...s, price: s.basePrice, change: 0 })));
  useEffect(() => { const id = setInterval(() => { setPrices(p => p.map(s => { const pr = jitter(s.basePrice, 0.008); return { ...s, price: pr, change: +(pr - s.basePrice).toFixed(2), up: pr >= s.basePrice }; })); }, 2500); return () => clearInterval(id); }, []);
  const marketArticles = ARTICLES.filter(a => a.category === 'MARKETS');
  return (
    <div style={{ display: 'flex', minHeight: '480px' }}>
      <Sidebar onOpen={onOpen} />
      <div style={{ flex: 1, padding: '12px 16px' }}>
        <SectionHeader>MARKETS OVERVIEW</SectionHeader>
        <p style={{ fontSize: '12px', fontFamily: 'Georgia', color: '#555', margin: '0 0 12px' }}>Updated Tue, 29 Oct 1996, 3:43pm EST — Market data delayed at least 15 minutes.</p>
        <SubHeader>Major Indices</SubHeader>
        <table style={{ width: '100%', fontSize: '12px', fontFamily: 'Courier New', borderCollapse: 'collapse', marginBottom: '16px' }}>
          <thead><tr style={{ backgroundColor: '#000080', color: '#ffcc00' }}><th style={{ padding: '4px 6px', textAlign: 'left' }}>Index</th><th style={{ padding: '4px 6px', textAlign: 'right' }}>Last</th><th style={{ padding: '4px 6px', textAlign: 'right' }}>Change</th><th style={{ padding: '4px 6px', textAlign: 'right' }}>% Chg</th></tr></thead>
          <tbody>{prices.filter(s => EXTENDED_MARKET.some(e => e.symbol === s.symbol)).map(s => (<tr key={s.symbol} style={{ borderBottom: '1px solid #ddd' }}><td style={{ padding: '4px 6px', fontWeight: 'bold' }}>{s.symbol} <span style={{ fontSize: '10px', color: '#666', fontFamily: 'Arial' }}>({s.name})</span></td><td style={{ padding: '4px 6px', textAlign: 'right' }}>{s.price.toFixed(2)}</td><td style={{ padding: '4px 6px', textAlign: 'right', color: s.up ? '#008800' : '#cc0000' }}>{s.up ? '+' : ''}{s.change.toFixed(2)}</td><td style={{ padding: '4px 6px', textAlign: 'right', color: s.up ? '#008800' : '#cc0000' }}>{s.up ? '+' : ''}{((s.change / s.basePrice) * 100).toFixed(2)}%</td></tr>))}</tbody>
        </table>
        <SubHeader>Active Stocks</SubHeader>
        <table style={{ width: '100%', fontSize: '12px', fontFamily: 'Courier New', borderCollapse: 'collapse', marginBottom: '16px' }}>
          <thead><tr style={{ backgroundColor: '#000080', color: '#ffcc00' }}><th style={{ padding: '4px 6px', textAlign: 'left' }}>Symbol</th><th style={{ padding: '4px 6px', textAlign: 'left' }}>Company</th><th style={{ padding: '4px 6px', textAlign: 'right' }}>Price</th><th style={{ padding: '4px 6px', textAlign: 'right' }}>Chg</th><th style={{ padding: '4px 6px', textAlign: 'center' }}>Vol (K)</th></tr></thead>
          <tbody>{prices.filter(s => MARKET_DATA.some(m => m.symbol === s.symbol)).map(s => (<tr key={s.symbol} style={{ borderBottom: '1px solid #ddd' }}><td style={{ padding: '4px 6px', fontWeight: 'bold', color: '#000080' }}><span className="mbn-link">{s.symbol}</span></td><td style={{ padding: '4px 6px', fontFamily: 'Arial', fontSize: '11px' }}>{s.name}</td><td style={{ padding: '4px 6px', textAlign: 'right' }}>{s.price.toFixed(2)}</td><td style={{ padding: '4px 6px', textAlign: 'right', color: s.up ? '#008800' : '#cc0000', fontWeight: 'bold' }}>{s.up ? '▲' : '▼'} {s.up ? '+' : ''}{s.change.toFixed(2)}</td><td style={{ padding: '4px 6px', textAlign: 'center', color: '#666' }}>{Math.floor(Math.random() * 9000 + 1000)}</td></tr>))}</tbody>
        </table>
        <SubHeader>Market News</SubHeader>
        {marketArticles.map(a => (<React.Fragment key={a.id}><ArticlePreview article={a} onOpen={onOpen} /><HR /></React.Fragment>))}
        <div style={{ border: '1px solid #ccc', padding: '10px', backgroundColor: '#fffff0', fontSize: '11px', fontFamily: 'Arial', color: '#555' }}><strong>Disclaimer:</strong> All market data is simulated. MBN does not provide investment advice.</div>
      </div>
      <MarketSnapshotSidebar />
    </div>
  );
};

/* ── MONEY PAGE ── */
const MoneyPage: React.FC<{ onOpen: (id: string) => void }> = ({ onOpen }) => {
  const moneyArticles = ARTICLES.filter(a => a.category === 'MONEY' || a.category === 'BUSINESS');
  return (
    <div style={{ display: 'flex', minHeight: '480px' }}>
      <Sidebar onOpen={onOpen} />
      <div style={{ flex: 1, padding: '12px 16px' }}>
        <SectionHeader>MONEY & PERSONAL FINANCE</SectionHeader>
        {moneyArticles.map(a => (<React.Fragment key={a.id}><ArticlePreview article={a} onOpen={onOpen} /><HR /></React.Fragment>))}
        <SubHeader>MBN Money Tips</SubHeader>
        <div style={{ border: '1px solid #ccc', padding: '10px', backgroundColor: '#f8f8f0', fontSize: '12px', fontFamily: 'Arial', color: '#444', lineHeight: '1.6' }}>
          <strong>Tip of the Day:</strong> Consider dollar-cost averaging into index funds during market volatility. With the Dow Vespera index fluctuating near all-time highs, systematic investing can help smooth out short-term price swings. Consult your VesperaNET Financial Services advisor for a personalized plan.
        </div>
      </div>
      <MarketSnapshotSidebar />
    </div>
  );
};

/* ── WORLD PAGE ── */
const WorldPage: React.FC<{ onOpen: (id: string) => void }> = ({ onOpen }) => {
  const worldArticles = ARTICLES.filter(a => ['WORLD', 'POLITICS', 'NATIONAL'].includes(a.category));
  return (
    <div style={{ display: 'flex', minHeight: '480px' }}>
      <Sidebar onOpen={onOpen} />
      <div style={{ flex: 1, padding: '12px 16px' }}>
        <SectionHeader>WORLD NEWS</SectionHeader>
        {worldArticles.map(a => (<React.Fragment key={a.id}><ArticlePreview article={a} onOpen={onOpen} /><HR /></React.Fragment>))}
      </div>
      <MarketSnapshotSidebar />
    </div>
  );
};

/* ── TV PAGE ── */
const TVPage: React.FC<{ onOpen: (id: string) => void }> = ({ onOpen }) => {
  const [streamState, setStreamState] = useState<'idle' | 'connecting' | 'live'>('idle');
  const [loadStep, setLoadStep] = useState('');
  const [loadPct, setLoadPct] = useState(0);

  const startStream = () => {
    setStreamState('connecting');
    const steps = [
      { text: 'Initializing Vespera MediaPlayer 2.0...', pct: 8 },
      { text: 'Detecting network connection... VesperaNET (28.8 Kbps)', pct: 15 },
      { text: 'Resolving host: stream.mbn-online.net...', pct: 22 },
      { text: 'Connecting to MBN Live Feed server (204.71.200.68:554)...', pct: 30 },
      { text: 'Authenticating VesperaNET subscriber token... OK', pct: 40 },
      { text: 'Negotiating RealVideo™ codec (RV40 @ 160kbps)...', pct: 50 },
      { text: 'Requesting channel: MBN-LIVE-EAST (CH 1)...', pct: 60 },
      { text: 'Buffering stream data... 12% / 28%  / 54%...', pct: 72 },
      { text: 'Synchronizing audio/video... PTS locked', pct: 82 },
      { text: 'Decoding first keyframe... OK', pct: 90 },
      { text: 'Stream active — MBN Live East Coast Feed', pct: 100 },
    ];
    let i = 0;
    const interval = setInterval(() => {
      if (i < steps.length) {
        setLoadStep(steps[i].text);
        setLoadPct(steps[i].pct);
        i++;
      } else {
        clearInterval(interval);
        setTimeout(() => setStreamState('live'), 600);
      }
    }, 450);
  };

  return (
    <div style={{ display: 'flex', minHeight: '480px' }}>
      <Sidebar onOpen={onOpen} />
      <div style={{ flex: 1, padding: '12px 16px' }}>
        <SectionHeader>MBN TELEVISION</SectionHeader>

        {/* Live Stream Box */}
        <div style={{ border: '2px solid #000080', marginBottom: '16px', backgroundColor: '#000' }}>
          <div style={{ backgroundColor: '#000080', color: '#ffcc00', padding: '4px 8px', fontSize: '11px', fontWeight: 'bold', letterSpacing: '1px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>NOW SHOWING — LIVE</span>
            {streamState === 'live' && <span style={{ color: '#ff3333', fontSize: '10px' }}>● BROADCASTING</span>}
          </div>

          {/* IDLE STATE */}
          {streamState === 'idle' && (
            <div style={{ padding: '20px', textAlign: 'center' }}>
              <div style={{ fontSize: '36px', marginBottom: '8px' }}>📺</div>
              <div style={{ fontSize: '13px', color: '#ccc', fontFamily: 'Arial', fontWeight: 'bold', marginBottom: '6px' }}>MBN Live — East Coast Feed</div>
              <div style={{ fontSize: '11px', color: '#888', fontFamily: 'Arial', marginBottom: '12px' }}>
                Currently airing: <em>Closing Bell Countdown</em> with David Zhao
              </div>
              <button
                onClick={startStream}
                style={{
                  padding: '6px 24px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer',
                  backgroundColor: '#cc0000', color: '#fff', border: '2px outset #ff4444',
                  fontFamily: 'Arial', letterSpacing: '0.5px',
                }}
              >
                ▶ Watch Live Stream
              </button>
              <div style={{ fontSize: '9px', color: '#555', marginTop: '8px', fontFamily: 'Arial' }}>
                Requires: VesperaNET connection (28.8 Kbps min) • Vespera MediaPlayer 2.0
              </div>
            </div>
          )}

          {/* CONNECTING / LOADING STATE */}
          {streamState === 'connecting' && (
            <div style={{ padding: '16px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <span style={{ fontSize: '14px' }}>📡</span>
                <span style={{ fontSize: '12px', color: '#ffcc00', fontWeight: 'bold', fontFamily: 'Arial' }}>Connecting to MBN Live Stream...</span>
              </div>
              {/* Progress bar */}
              <div style={{ height: '14px', backgroundColor: '#111', border: '1px solid #333', padding: '2px', marginBottom: '8px' }}>
                <div style={{ height: '100%', width: `${loadPct}%`, background: 'linear-gradient(90deg, #000080, #0000cc)', transition: 'width 0.3s' }} />
              </div>
              <div style={{ fontSize: '10px', color: '#00cc00', fontFamily: 'Courier New', marginBottom: '4px' }}>{loadStep}</div>
              <div style={{ fontSize: '10px', color: '#555', fontFamily: 'Courier New' }}>{loadPct}% complete</div>
              {/* Terminal log */}
              <div style={{ marginTop: '8px', backgroundColor: '#0a0a0a', border: '1px solid #222', padding: '6px 8px', fontFamily: 'Courier New', fontSize: '9px', color: '#00aa00', maxHeight: '60px', overflow: 'hidden' }}>
                {loadPct >= 8 && <div>&gt; vmpayer2 --stream rtsp://stream.mbn-online.net/live/east</div>}
                {loadPct >= 22 && <div>&gt; dns: stream.mbn-online.net → 204.71.200.68</div>}
                {loadPct >= 40 && <div>&gt; auth: subscriber_token OK (VesperaNET Gold)</div>}
                {loadPct >= 60 && <div>&gt; channel: MBN-LIVE-EAST allocated</div>}
                {loadPct >= 82 && <div>&gt; sync: audio_pts=0x1A2F video_pts=0x1A2F LOCKED</div>}
                {loadPct >= 100 && <div style={{ color: '#ffcc00' }}>&gt; STATUS: STREAM ACTIVE</div>}
              </div>
            </div>
          )}

          {/* LIVE STATE — YouTube Embed */}
          {streamState === 'live' && (
            <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%', overflow: 'hidden' }}>
              <iframe
                src="https://www.youtube.com/embed/9aZpvc14DbQ?autoplay=1&controls=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&disablekb=1&fs=0&playsinline=1"
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                allow="autoplay; encrypted-media"
                allowFullScreen={false}
              />
              {/* Click shield to prevent YouTube interaction */}
              <div
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 10, cursor: 'default' }}
                onContextMenu={e => e.preventDefault()}
              />
              {/* MBN Live Bug overlay (top-right) */}
              <div style={{ position: 'absolute', top: '8px', right: '8px', zIndex: 20, backgroundColor: 'rgba(0,0,0,0.6)', padding: '3px 8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#fff', fontFamily: 'Arial' }}>MBN</span>
                <span style={{ fontSize: '8px', color: '#ff3333', fontWeight: 'bold' }}>● LIVE</span>
              </div>
              {/* Bottom info bar */}
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 20, background: 'linear-gradient(transparent, rgba(0,0,0,0.8))', padding: '12px 8px 4px' }}>
                <div style={{ fontSize: '10px', color: '#ffcc00', fontFamily: 'Courier New', fontWeight: 'bold' }}>
                  MBN LIVE — EAST COAST FEED • {new Date().toLocaleTimeString()} EST
                </div>
                <div style={{ fontSize: '9px', color: '#888', fontFamily: 'Arial' }}>
                  Stream: RealVideo™ 160kbps • Buffer: OK • VesperaNET Gold
                </div>
              </div>
            </div>
          )}
        </div>

        <SubHeader>Today's Schedule — October 29, 1996</SubHeader>
        <table style={{ width: '100%', fontSize: '12px', fontFamily: 'Arial', borderCollapse: 'collapse', marginBottom: '16px' }}>
          <thead><tr style={{ backgroundColor: '#000080', color: '#ffcc00' }}><th style={{ padding: '4px 8px', textAlign: 'left', width: '80px' }}>Time</th><th style={{ padding: '4px 8px', textAlign: 'left' }}>Program</th><th style={{ padding: '4px 8px', textAlign: 'left', width: '130px' }}>Host</th></tr></thead>
          <tbody>
            {[
              { time: '6:00 AM', show: 'MBN Morning Briefing', host: 'Sandra Kellerman' },
              { time: '9:00 AM', show: 'Market Open with MBN', host: 'David Zhao' },
              { time: '10:00 AM', show: 'Tech Sector Report', host: 'Rachel Okonkwo' },
              { time: '12:00 PM', show: 'MBN Midday Update', host: 'Paul Navarro' },
              { time: '1:00 PM', show: 'The Investment Hour', host: 'Margaret Liu' },
              { time: '3:00 PM', show: 'Closing Bell Countdown', host: 'David Zhao', now: true },
              { time: '4:00 PM', show: 'After Hours Analysis', host: 'James Whitfield' },
              { time: '6:00 PM', show: 'World Markets Tonight', host: 'Sandra Kellerman' },
              { time: '8:00 PM', show: 'MBN Investigates: "The Axis Files"', host: 'Victor Strand', featured: true },
              { time: '10:00 PM', show: 'Late Market Recap', host: 'Rachel Okonkwo' },
              { time: '11:00 PM', show: 'MBN After Dark: Unsolved Tech', host: 'Karen Voss' },
            ].map((p: any, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #ddd', backgroundColor: p.now ? '#fffff0' : p.featured ? '#f0f0ff' : '#fff' }}>
                <td style={{ padding: '4px 8px', fontWeight: 'bold', fontFamily: 'Courier New', color: '#000080' }}>{p.time}</td>
                <td style={{ padding: '4px 8px' }}>{p.show}{p.now && <span style={{ fontSize: '10px', color: '#cc0000', fontWeight: 'bold', marginLeft: '6px' }}>◄ ON NOW</span>}{p.featured && <span style={{ fontSize: '10px', color: '#000080', fontWeight: 'bold', marginLeft: '6px' }}>★ SPECIAL</span>}</td>
                <td style={{ padding: '4px 8px', color: '#666' }}>{p.host}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <SubHeader>Featured: MBN Investigates — "The Axis Files"</SubHeader>
        <div style={{ border: '1px solid #999', padding: '12px', backgroundColor: '#f8f8f0', marginBottom: '16px' }}>
          <h4 style={{ fontSize: '14px', fontWeight: 'bold', margin: '0 0 6px', color: '#000080' }}>Tonight at 8:00 PM EST</h4>
          <p style={{ fontSize: '12px', fontFamily: 'Georgia', color: '#444', lineHeight: '1.5', margin: '0 0 8px' }}>
            Veteran correspondent Victor Strand examines the $2.4 billion in "black budget" contracts that have drawn scrutiny from the Senate. What did Axis Innovations build with taxpayer money? Why are former employees terrified to speak? And what is the connection between a small PC company in Silicon Valley and the Department of Defense's most classified programs? Former employees speak out for the first time. (TV-14)
          </p>
          <p style={{ fontSize: '11px', color: '#999', fontStyle: 'italic' }}>Viewer discretion advised. Some sources appear in silhouette.</p>
        </div>
        <SubHeader>New Series: MBN After Dark</SubHeader>
        <div style={{ border: '1px solid #999', padding: '12px', backgroundColor: '#1a1a2e', color: '#aaa', marginBottom: '12px' }}>
          <h4 style={{ fontSize: '13px', fontWeight: 'bold', margin: '0 0 6px', color: '#8888ff' }}>Premiering Tonight — "Unsolved Tech"</h4>
          <p style={{ fontSize: '11px', lineHeight: '1.5', margin: 0 }}>
            Every night at 11 PM, host Karen Voss explores the strangest stories from the world of technology. Tonight: Amateur radio operators in the Pacific Northwest detect a signal on the 6.0 MHz band — a frequency assigned to no one. The signal appears to contain coordinates. And those coordinates point somewhere that isn't on any map.
          </p>
        </div>
      </div>
      <MarketSnapshotSidebar />
    </div>
  );
};

/* ── RADIO PAGE ── */
const RadioPage: React.FC<{ onOpen: (id: string) => void }> = ({ onOpen }) => {
  const [sel, setSel] = useState(0);
  const stations = [
    { name: 'MBN News Radio', freq: '1010 AM', desc: 'All-news, 24/7 coverage', status: 'LIVE', genre: 'News/Talk', nowPlaying: 'Closing Bell Market Wrap w/ David Zhao' },
    { name: 'MBN Business Radio', freq: '880 AM', desc: 'Market analysis & financial talk', status: 'LIVE', genre: 'Financial', nowPlaying: 'The Investor\'s Desk w/ Margaret Liu' },
    { name: 'MBN World Service', freq: '1190 AM', desc: 'International news & affairs', status: 'ON AIR', genre: 'World News', nowPlaying: 'Asia Overnight Briefing' },
    { name: 'MBN Sports Radio', freq: '660 AM', desc: 'Scores, analysis, live games', status: 'ON AIR', genre: 'Sports', nowPlaying: 'NFL Week 9 Preview' },
    { name: 'MBN Classical', freq: '96.3 FM', desc: 'Classical music & arts', status: 'ON AIR', genre: 'Classical', nowPlaying: 'Beethoven: Symphony No. 7 in A major' },
  ];
  return (
    <div style={{ display: 'flex', minHeight: '480px' }}>
      <Sidebar onOpen={onOpen} />
      <div style={{ flex: 1, padding: '12px 16px' }}>
        <SectionHeader>MBN RADIO NETWORK</SectionHeader>
        <div style={{ border: '2px solid #333', marginBottom: '16px', backgroundColor: '#1a1a1a', borderRadius: '4px' }}>
          <div style={{ backgroundColor: '#000080', color: '#ffcc00', padding: '4px 8px', fontSize: '11px', fontWeight: 'bold', letterSpacing: '1px', display: 'flex', justifyContent: 'space-between' }}><span>MBN INTERNET RADIO PLAYER</span><span style={{ color: '#ff3333', animation: 'blink 1s infinite' }}>● LIVE</span></div>
          <div style={{ padding: '12px' }}>
            <div style={{ backgroundColor: '#0a0a0a', border: '2px inset #333', padding: '8px 12px', marginBottom: '8px', fontFamily: 'Courier New', color: '#00ff00', fontSize: '13px' }}>
              <div>Now Playing: {stations[sel].name}</div>
              <div style={{ fontSize: '10px', color: '#00cc00', marginTop: '2px' }}>{stations[sel].freq} • {stations[sel].genre}</div>
              <div style={{ fontSize: '10px', color: '#ffcc00', marginTop: '2px' }}>♪ {stations[sel].nowPlaying}</div>
              <div style={{ fontSize: '10px', color: '#888', marginTop: '4px' }}>Stream: 16kbps RealAudio™ • Buffer: OK</div>
            </div>
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
              {stations.map((s, i) => (<button key={i} onClick={() => setSel(i)} style={{ padding: '3px 8px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer', backgroundColor: sel === i ? '#ffcc00' : '#333', color: sel === i ? '#000' : '#ccc', border: `1px solid ${sel === i ? '#ffcc00' : '#555'}`, fontFamily: 'Arial' }}>{s.freq}</button>))}
            </div>
            <div style={{ fontSize: '10px', color: '#666', marginTop: '6px', fontFamily: 'Arial' }}>⚠ Requires RealAudio Player 3.0 or Vespera MediaPlayer 2.0</div>
          </div>
        </div>
        <SubHeader>Station Directory</SubHeader>
        <table style={{ width: '100%', fontSize: '12px', fontFamily: 'Arial', borderCollapse: 'collapse', marginBottom: '16px' }}>
          <thead><tr style={{ backgroundColor: '#000080', color: '#ffcc00' }}><th style={{ padding: '4px 8px', textAlign: 'left' }}>Station</th><th style={{ padding: '4px 8px', textAlign: 'left', width: '70px' }}>Freq</th><th style={{ padding: '4px 8px', textAlign: 'left' }}>Now Playing</th><th style={{ padding: '4px 8px', textAlign: 'center', width: '60px' }}>Status</th></tr></thead>
          <tbody>{stations.map((s, i) => (<tr key={i} style={{ borderBottom: '1px solid #ddd', backgroundColor: sel === i ? '#fffff0' : '#fff', cursor: 'pointer' }} onClick={() => setSel(i)}><td style={{ padding: '4px 8px', fontWeight: 'bold' }}>{s.name}</td><td style={{ padding: '4px 8px', fontFamily: 'Courier New' }}>{s.freq}</td><td style={{ padding: '4px 8px', color: '#555', fontStyle: 'italic' }}>{s.nowPlaying}</td><td style={{ padding: '4px 8px', textAlign: 'center' }}><span style={{ fontSize: '10px', fontWeight: 'bold', color: '#fff', backgroundColor: '#008800', padding: '1px 6px' }}>{s.status}</span></td></tr>))}</tbody>
        </table>
      </div>
      <MarketSnapshotSidebar />
    </div>
  );
};

/* ── CHARTS PAGE ── */
const ChartsPage: React.FC<{ onOpen: (id: string) => void }> = ({ onOpen }) => {
  const chartBars = useRef(MARKET_DATA.slice(0, 6).map(s => ({ symbol: s.symbol, name: s.name, values: Array.from({ length: 12 }, () => Math.random() * 40 + 30) })));
  return (
    <div style={{ display: 'flex', minHeight: '480px' }}>
      <Sidebar onOpen={onOpen} />
      <div style={{ flex: 1, padding: '12px 16px' }}>
        <SectionHeader>INTERACTIVE CHARTS</SectionHeader>
        <p style={{ fontSize: '12px', fontFamily: 'Arial', color: '#555', margin: '0 0 12px' }}>12-Month Performance Overview</p>
        {chartBars.current.map(stock => (
          <div key={stock.symbol} style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '12px', fontWeight: 'bold', fontFamily: 'Arial', marginBottom: '4px' }}><span className="mbn-link">{stock.symbol}</span> — {stock.name}</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: '50px', backgroundColor: '#f0f0f0', border: '1px solid #ccc', padding: '2px' }}>
              {stock.values.map((v, i) => (<div key={i} title={`Month ${i + 1}: ${v.toFixed(1)}`} style={{ flex: 1, height: `${v}%`, backgroundColor: v > 50 ? '#008800' : v > 35 ? '#ccaa00' : '#cc0000', cursor: 'pointer' }} />))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#999', fontFamily: 'Arial' }}><span>Nov '95</span><span>May '96</span><span>Oct '96</span></div>
          </div>
        ))}
        <div style={{ border: '1px solid #ccc', padding: '10px', backgroundColor: '#fffff0', fontSize: '11px', fontFamily: 'Arial', color: '#555' }}><strong>Note:</strong> Real-time charting requires MBN Charts Pro™ ($29.95/yr). <span className="mbn-link">Learn More</span></div>
      </div>
      <MarketSnapshotSidebar />
    </div>
  );
};

/* ── MONITOR PAGE ── */
const MonitorPage: React.FC = () => {
  const [prices, setPrices] = useState(() => [...MARKET_DATA, ...EXTENDED_MARKET].map(s => ({ ...s, price: s.basePrice, change: 0, pctChange: 0 })));
  useEffect(() => { const id = setInterval(() => { setPrices(p => p.map(s => { const pr = jitter(s.basePrice, 0.005); const ch = +(pr - s.basePrice).toFixed(2); return { ...s, price: pr, change: ch, up: pr >= s.basePrice, pctChange: +((ch / s.basePrice) * 100).toFixed(2) }; })); }, 1800); return () => clearInterval(id); }, []);
  return (
    <div style={{ padding: 0, backgroundColor: '#000', color: '#00ff00', fontFamily: 'Courier New', minHeight: '480px' }}>
      <div style={{ backgroundColor: '#001a00', borderBottom: '2px solid #003300', padding: '6px 12px', display: 'flex', justifyContent: 'space-between' }}><span style={{ fontWeight: 'bold', fontSize: '13px', letterSpacing: '2px' }}>MBN MARKET MONITOR — LIVE FEED</span><span style={{ fontSize: '11px', color: '#008800' }}>Auto-refresh: 1.8s</span></div>
      <div style={{ padding: '8px' }}>
        <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
          <thead><tr style={{ color: '#ffcc00', borderBottom: '1px solid #333' }}><th style={{ padding: '4px 8px', textAlign: 'left' }}>SYMBOL</th><th style={{ padding: '4px 8px', textAlign: 'left' }}>NAME</th><th style={{ padding: '4px 8px', textAlign: 'right' }}>LAST</th><th style={{ padding: '4px 8px', textAlign: 'right' }}>CHG</th><th style={{ padding: '4px 8px', textAlign: 'right' }}>%CHG</th><th style={{ padding: '4px 8px', textAlign: 'right' }}>BID</th><th style={{ padding: '4px 8px', textAlign: 'right' }}>ASK</th><th style={{ padding: '4px 8px', textAlign: 'right' }}>VOL</th></tr></thead>
          <tbody>{prices.map(s => (<tr key={s.symbol} style={{ borderBottom: '1px solid #111' }}><td style={{ padding: '3px 8px', fontWeight: 'bold', color: '#00ccff' }}>{s.symbol}</td><td style={{ padding: '3px 8px', color: '#888' }}>{s.name}</td><td style={{ padding: '3px 8px', textAlign: 'right' }}>{s.price.toFixed(2)}</td><td style={{ padding: '3px 8px', textAlign: 'right', color: s.up ? '#00ff00' : '#ff3333' }}>{s.up ? '+' : ''}{s.change.toFixed(2)}</td><td style={{ padding: '3px 8px', textAlign: 'right', color: s.up ? '#00ff00' : '#ff3333' }}>{s.up ? '+' : ''}{s.pctChange}%</td><td style={{ padding: '3px 8px', textAlign: 'right', color: '#666' }}>{(s.price - 0.05).toFixed(2)}</td><td style={{ padding: '3px 8px', textAlign: 'right', color: '#666' }}>{(s.price + 0.05).toFixed(2)}</td><td style={{ padding: '3px 8px', textAlign: 'right', color: '#666' }}>{(Math.floor(Math.random() * 50000) + 5000).toLocaleString()}</td></tr>))}</tbody>
        </table>
      </div>
      <div style={{ borderTop: '1px solid #333', padding: '6px 12px', fontSize: '10px', color: '#555' }}>MBN Market Monitor v2.1 • Data feed: VesperaNET Financial Services • Connection: Active</div>
    </div>
  );
};

/* ── TOOLS PAGE ── */
const ToolsPage: React.FC<{ onOpen: (id: string) => void }> = ({ onOpen }) => (
  <div style={{ display: 'flex', minHeight: '480px' }}>
    <Sidebar onOpen={onOpen} />
    <div style={{ flex: 1, padding: '12px 16px' }}>
      <SectionHeader>ONLINE TOOLS</SectionHeader>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
        {[
          { title: 'Currency Converter', icon: '💱', desc: 'Convert between 40+ world currencies.' },
          { title: 'Mortgage Calculator', icon: '🏠', desc: 'Calculate payments and amortization.' },
          { title: 'Portfolio Tracker', icon: '📊', desc: 'Track your investments for free.' },
          { title: 'Tax Estimator', icon: '📋', desc: 'Estimate federal and state taxes.' },
          { title: 'Retirement Planner', icon: '🏖️', desc: 'Check if you\'re on track.' },
          { title: 'Stock Screener', icon: '🔍', desc: 'Filter by sector, P/E, yield.' },
          { title: 'Savings Calculator', icon: '🏦', desc: 'Compound interest calculator.' },
          { title: 'Loan Comparison', icon: '📝', desc: 'Compare VesperaNET partner rates.' },
        ].map((t, i) => (
          <div key={i} style={{ border: '2px solid #ccc', padding: '10px', backgroundColor: '#fff', cursor: 'pointer' }}>
            <div style={{ fontSize: '20px', marginBottom: '4px' }}>{t.icon}</div>
            <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#000080', marginBottom: '2px' }}><span className="mbn-link">{t.title}</span></div>
            <div style={{ fontSize: '11px', color: '#555', fontFamily: 'Arial' }}>{t.desc}</div>
          </div>
        ))}
      </div>
      <SubHeader>Download MBN Desktop Tools</SubHeader>
      <div style={{ border: '1px solid #999', padding: '12px', backgroundColor: '#fffff0' }}>
        <p style={{ fontSize: '12px', fontFamily: 'Arial', color: '#333', margin: '0 0 8px' }}>Get real-time data with <strong>MBN Ticker Widget v1.2</strong>. Free for registered members.</p>
        <button style={{ padding: '4px 16px', fontSize: '11px', fontWeight: 'bold', backgroundColor: '#000080', color: '#ffcc00', border: '2px outset #333', cursor: 'pointer', fontFamily: 'Arial' }}>Download (1.2 MB)</button>
        <span style={{ fontSize: '10px', color: '#999', marginLeft: '8px' }}>Compatible with Vespera OS 1.0+</span>
      </div>
    </div>
    <MarketSnapshotSidebar />
  </div>
);

/* ── HELP PAGE ── */
const HelpPage: React.FC<{ onOpen: (id: string) => void }> = ({ onOpen }) => (
  <div style={{ display: 'flex', minHeight: '480px' }}>
    <Sidebar onOpen={onOpen} />
    <div style={{ flex: 1, padding: '12px 16px' }}>
      <SectionHeader>HELP & SUPPORT</SectionHeader>
      <SubHeader>Frequently Asked Questions</SubHeader>
      {[
        { q: 'How do I listen to MBN Radio online?', a: 'You need RealAudio Player 3.0 or Vespera MediaPlayer 2.0. Visit Radio and click any station. 28.8 Kbps minimum.' },
        { q: 'Why is market data delayed?', a: 'Data is delayed 15 minutes per regulations. Real-time available to MBN Professional subscribers ($49.95/month).' },
        { q: 'How do I register for a free account?', a: 'Click Tools → Register. You need a valid email and VesperaNET or AOL account.' },
        { q: 'What browsers work best?', a: 'Optimized for Vespera Navigator 2.0 and Netscape 3.0+. Some features may not work in IE 3.0.' },
        { q: 'How do I contact MBN?', a: 'Email editor@mbn-online.net or call 1-800-MBN-NEWS during business hours.' },
        { q: 'Pages load slowly — help?', a: 'Ensure 14.4 Kbps minimum. Disable images for text-only mode. Upgrade to 56K for best experience.' },
      ].map((f, i) => (<div key={i} style={{ marginBottom: '12px' }}><p style={{ fontSize: '13px', fontWeight: 'bold', fontFamily: 'Arial', color: '#000080', margin: '0 0 2px' }}>Q: {f.q}</p><p style={{ fontSize: '12px', fontFamily: 'Arial', color: '#444', margin: '0 0 0 16px', lineHeight: '1.5' }}>A: {f.a}</p></div>))}
      <HR />
      <SubHeader>Contact Information</SubHeader>
      <div style={{ fontSize: '12px', fontFamily: 'Arial', color: '#333', lineHeight: '1.8' }}>
        <strong>Meridian Broadcasting Network</strong><br />1400 Meridian Plaza, 28th Floor<br />New York, NY 10036<br /><br />
        General: <span className="mbn-link">info@mbn-online.net</span><br />
        Support: <span className="mbn-link">support@mbn-online.net</span><br />
        Advertising: <span className="mbn-link">ads@mbn-online.net</span><br />
        Newsroom: 1-800-MBN-NEWS (1-800-626-6397)<br />
        Tips: <span className="mbn-link">tips@mbn-online.net</span> (anonymous submissions accepted)
      </div>
    </div>
    <MarketSnapshotSidebar />
  </div>
);

/* ═══════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════ */

export const MeridianBroadcastingSite: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [activeNav, setActiveNav] = useState('HOME');
  const [openArticleId, setOpenArticleId] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        const next = prev + Math.random() * 18;
        if (next >= 100) { clearInterval(timer); setTimeout(() => setLoading(false), 300); return 100; }
        return next;
      });
    }, 250);
    return () => clearInterval(timer);
  }, []);

  const [tickerGroup, setTickerGroup] = useState(0);
  useEffect(() => { const id = setInterval(() => setTickerGroup(p => (p + 1) % 4), 25000); return () => clearInterval(id); }, []);
  const tickerStories = [...TICKER_STORIES.slice(tickerGroup * 4, tickerGroup * 4 + 6)];
  while (tickerStories.length < 6) tickerStories.push(TICKER_STORIES[tickerStories.length % TICKER_STORIES.length]);

  const handleOpenArticle = (id: string) => {
    setOpenArticleId(id);
    setActiveNav('ARTICLE');
  };
  const handleBackFromArticle = () => {
    setOpenArticleId(null);
    setActiveNav('HOME');
  };

  if (loading) {
    return (
      <div className="min-h-full bg-black flex flex-col items-center justify-center p-8 font-sans select-none">
        <div className="max-w-md w-full flex flex-col items-center gap-6">
          <div className="text-center">
            <h1 className="text-3xl font-black text-white tracking-tight">MERIDIAN<span className="text-[#cc0000]">.</span></h1>
            <p className="text-xs text-gray-400 tracking-[0.3em] uppercase mt-1">Broadcasting Network</p>
          </div>
          <div className="w-full space-y-3">
            <div className="flex justify-between text-gray-500 text-[10px] font-mono uppercase tracking-widest"><span>Loading market data...</span><span>{Math.floor(progress)}%</span></div>
            <div className="h-4 bg-black border border-gray-600 p-[1px]"><div className="h-full bg-[#cc0000] transition-all duration-200" style={{ width: `${progress}%` }} /></div>
          </div>
          <p className="text-[10px] text-gray-600 italic">Best viewed at 1024x768 · Vespera Navigator 2.0</p>
        </div>
      </div>
    );
  }

  const renderPage = () => {
    if (activeNav === 'ARTICLE' && openArticleId) {
      const art = ARTICLES.find(a => a.id === openArticleId);
      if (art) return (
        <div style={{ display: 'flex', minHeight: '480px' }}>
          <Sidebar onOpen={handleOpenArticle} />
          <ArticleView article={art} onBack={handleBackFromArticle} onOpen={handleOpenArticle} />
          <MarketSnapshotSidebar />
        </div>
      );
    }
    switch (activeNav) {
      case 'HOME': return <HomePage onOpen={handleOpenArticle} />;
      case 'MARKETS': return <MarketsPage onOpen={handleOpenArticle} />;
      case 'MONEY': return <MoneyPage onOpen={handleOpenArticle} />;
      case 'WORLD': return <WorldPage onOpen={handleOpenArticle} />;
      case 'TV': return <TVPage onOpen={handleOpenArticle} />;
      case 'RADIO': return <RadioPage onOpen={handleOpenArticle} />;
      case 'CHARTS': return <ChartsPage onOpen={handleOpenArticle} />;
      case 'MONITOR': return <MonitorPage />;
      case 'TOOLS': return <ToolsPage onOpen={handleOpenArticle} />;
      case 'HELP': return <HelpPage onOpen={handleOpenArticle} />;
      default: return <HomePage onOpen={handleOpenArticle} />;
    }
  };

  return (
    <div className="min-h-full bg-white text-black font-sans overflow-y-auto select-none">
      <style dangerouslySetInnerHTML={{__html: `
        .mbn-link { text-decoration: underline; color: #0000CC; cursor: pointer; }
        .mbn-link:hover { color: #CC0000; }
        .mbn-sidebar-link { text-decoration: underline; color: #003399; cursor: pointer; font-size: 12px; }
        .mbn-sidebar-link:hover { color: #CC0000; }
        @keyframes mbn-scroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
      `}} />

      {/* Header */}
      <div style={{ backgroundColor: '#000', color: '#fff', padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '2px solid #333' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => { setActiveNav('HOME'); setOpenArticleId(null); }}>
          <div>
            <span style={{ fontSize: '28px', fontWeight: 900, letterSpacing: '-1px', fontFamily: 'Arial Black, Arial' }}>Meridian</span>
            <span style={{ fontSize: '28px', fontWeight: 900, color: '#cc0000' }}>.</span><br />
            <span style={{ fontSize: '9px', letterSpacing: '2px', color: '#999', textTransform: 'uppercase', fontFamily: 'Arial' }}>Broadcasting Network</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>International Sites</span>
            <select style={{ fontSize: '11px', padding: '2px 4px', backgroundColor: '#333', color: '#fff', border: '1px solid #555', fontFamily: 'Arial' }}><option>Go to...</option><option>Americas</option><option>Europe</option><option>Asia Pacific</option></select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>Stock Quotes</span>
            <div style={{ display: 'flex', gap: '4px' }}><input type="text" placeholder="Enter symbol(s):" readOnly style={{ fontSize: '11px', padding: '2px 4px', width: '120px', backgroundColor: '#222', color: '#aaa', border: '1px solid #555', fontFamily: 'Courier New' }} /><button style={{ fontSize: '10px', padding: '2px 8px', backgroundColor: '#333', color: '#fff', border: '1px solid #555', cursor: 'pointer', fontWeight: 'bold' }}>Go</button></div>
          </div>
          <div style={{ backgroundColor: '#111', border: '1px solid #333', padding: '6px 16px', textAlign: 'center', minWidth: '160px' }}><span style={{ fontSize: '10px', color: '#666', fontStyle: 'italic' }}>[ AD: Vespera Internet Suite 3.0 ]</span></div>
        </div>
      </div>

      {/* Nav Tabs */}
      <div style={{ backgroundColor: '#000080', display: 'flex', alignItems: 'stretch', borderBottom: '3px solid #999', overflow: 'hidden' }}>
        {NAV_TABS.map(tab => (
          <button key={tab.label} onClick={() => { setActiveNav(tab.label); setOpenArticleId(null); }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '6px 10px', minWidth: '70px', border: 'none', borderRight: '1px solid #000066', cursor: 'pointer', fontFamily: 'Arial', fontSize: '9px', fontWeight: 'bold', letterSpacing: '0.5px', textTransform: 'uppercase', color: (activeNav === tab.label || (activeNav === 'ARTICLE' && tab.label === 'HOME')) ? '#ffcc00' : '#ffffff', backgroundColor: (activeNav === tab.label || (activeNav === 'ARTICLE' && tab.label === 'HOME')) ? '#000066' : 'transparent', transition: 'background-color 0.15s' }}
            onMouseEnter={e => { if (activeNav !== tab.label) e.currentTarget.style.backgroundColor = '#000099'; }}
            onMouseLeave={e => { if (activeNav !== tab.label) e.currentTarget.style.backgroundColor = (activeNav === 'ARTICLE' && tab.label === 'HOME') ? '#000066' : 'transparent'; }}
          >
            <span style={{ fontSize: '16px', marginBottom: '2px' }}>{tab.icon}</span><span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Ticker */}
      <div style={{ backgroundColor: '#2a2a1a', borderBottom: '2px solid #555', overflow: 'hidden', height: '24px', position: 'relative', display: 'flex', alignItems: 'center' }}>
        <div style={{ backgroundColor: '#cc0000', color: '#fff', fontSize: '10px', fontWeight: 'bold', padding: '0 8px', height: '100%', display: 'flex', alignItems: 'center', flexShrink: 0, zIndex: 2, letterSpacing: '1px', fontFamily: 'Arial', borderRight: '2px solid #990000' }}>BREAKING</div>
        <div style={{ flex: 1, overflow: 'hidden', position: 'relative', height: '100%' }}>
          <div style={{ display: 'inline-flex', whiteSpace: 'nowrap', animation: 'mbn-scroll 80s linear infinite', height: '100%', alignItems: 'center' }}>
            {[...tickerStories, ...tickerStories].map((s, i) => (
              <span key={i} style={{ color: '#ffcc00', fontSize: '12px', fontFamily: 'Arial', fontWeight: 'bold', paddingRight: '40px' }}>{s}<span style={{ color: '#cc0000', margin: '0 12px' }}>•</span></span>
            ))}
          </div>
        </div>
      </div>

      {renderPage()}

      {/* Footer */}
      <div style={{ backgroundColor: '#000', borderTop: '3px solid #666', padding: '12px', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '8px' }}>
          {['Terms of Service', 'Privacy Policy', 'Advertise', 'Contact MBN', 'Careers', 'FCC Public File'].map(l => (
            <span key={l} style={{ fontSize: '10px', color: '#888', cursor: 'pointer', textDecoration: 'underline' }}>{l}</span>
          ))}
        </div>
        <p style={{ fontSize: '10px', color: '#666', fontFamily: 'Arial', margin: 0 }}>© 1994-2000 Meridian Broadcasting Network. All Rights Reserved.</p>
        <p style={{ fontSize: '9px', color: '#555', fontFamily: 'Arial', marginTop: '4px' }}>Market data delayed at least 15 minutes. Data provided by VesperaNET Financial Services. MBN is a subsidiary of Meridian Media Holdings, Inc.</p>
      </div>
    </div>
  );
};
