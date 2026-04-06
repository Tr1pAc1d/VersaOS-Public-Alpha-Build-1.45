import React from 'react';

export const AetherisNewsNetwork: React.FC = () => {
  return (
    <div className="w-full h-full overflow-y-auto bg-[#FFFFE0] text-black font-serif">
      <style dangerouslySetInnerHTML={{__html: `
        .news-container a { text-decoration: underline; color: #0000FF; }
        .news-container a:visited { color: #800080; }
        .news-container a:active { color: #FF0000; }
        .ad-banner {
            border: 2px solid #000000;
            background-color: #000080;
            color: #FFFFFF;
            text-align: center;
            padding: 10px;
            margin-bottom: 15px;
            font-family: Arial, sans-serif;
        }
        .sidebar-header {
            background-color: #000080;
            color: #FFFFFF;
            font-weight: bold;
            padding: 3px;
            text-align: center;
        }
        .article-title {
            font-size: 18px;
            font-weight: bold;
            color: #000000;
        }
        .date {
            font-size: 12px;
            color: #555555;
            font-style: italic;
        }
      `}} />
      <div className="news-container p-4">
        {/* Ad Banner */}
        <div className="ad-banner">
            <font size="4"><b>[ AD BANNER: Click Here to win a FREE CD-ROM Drive! ]</b></font><br/>
            <font size="2"><i>Offer valid while supplies last. Powered by Vespera Ad-Serve.</i></font>
        </div>

        {/* Header */}
        <center>
            <table border={0} cellPadding="0" cellSpacing="0" width="80%">
                <tbody>
                <tr>
                    <td align="center" valign="middle" width="15%">
                        <font size="2" color="#808080">[GIF: Spinning 'NEW' Icon]</font>
                    </td>
                    <td align="center" valign="middle" width="70%">
                        <h1><font face="Times New Roman" color="#000080">The AETHERIS News Network</font></h1>
                        <font size="3"><i>"The pulse of the Information Superhighway"</i></font>
                    </td>
                    <td align="center" valign="middle" width="15%">
                        <font size="2" color="#808080">[IMG: Pixelated Globe]</font>
                    </td>
                </tr>
                </tbody>
            </table>
        </center>

        <br/>

        {/* Breaking News Marquee */}
        <table border={1} cellPadding="2" cellSpacing="0" width="100%" bgcolor="#FF0000">
            <tbody>
            <tr>
                <td>
                    <marquee scrollamount="4">
                        <font color="#FFFFFF" face="Arial"><b>*** BREAKING NEWS *** AXIS INNOVATIONS CEO DECLINES COMMENT ON SENATE PROBE *** VESPERA SYSTEMS STOCK SURGES 14% *** DEEP BLUE VICTORY SPARKS AI DEBATE *** O.J. SIMPSON CIVIL TRIAL JURY SELECTION BEGINS ***</b></font>
                    </marquee>
                </td>
            </tr>
            </tbody>
        </table>

        <br/>

        {/* Main Layout Table */}
        <table border={0} cellPadding="10" cellSpacing="0" width="100%">
            <tbody>
            <tr>
                {/* Left Sidebar */}
                <td width="25%" valign="top" bgcolor="#F0F0F0">
                    <table border={1} cellPadding="5" cellSpacing="0" width="100%" bgcolor="#FFFFFF">
                        <tbody>
                        <tr><td className="sidebar-header"><font face="Arial">Navigation</font></td></tr>
                        <tr>
                            <td>
                                <font size="2">
                                <ul>
                                    <li><a href="#">Top Stories</a></li>
                                    <li><a href="#">World News</a></li>
                                    <li><a href="#">Technology</a></li>
                                    <li><a href="#">Business</a></li>
                                    <li><a href="#">Entertainment</a></li>
                                </ul>
                                </font>
                            </td>
                        </tr>
                        </tbody>
                    </table>
                    <br/>
                    <table border={1} cellPadding="5" cellSpacing="0" width="100%" bgcolor="#FFFFFF">
                        <tbody>
                        <tr><td className="sidebar-header"><font face="Arial">Market Watch</font></td></tr>
                        <tr>
                            <td>
                                <font size="2" face="Courier New">
                                VSPR (Vespera): +14.2%<br/>
                                AXIS (Axis Inn): -2.1%<br/>
                                MSFT (Microsoft): +1.5%<br/>
                                SUNW (Sun Micro): -0.8%
                                </font>
                            </td>
                        </tr>
                        </tbody>
                    </table>
                    <br/>
                    <center><font size="1" color="#808080">[IMG: Weather Map 320x240]</font></center>
                </td>

                {/* Main Content Column */}
                <td width="75%" valign="top">
                    
                    {/* Lore: Axis Innovations Military Probe */}
                    <p>
                        <font className="article-title">Axis Innovations Faces Senate Over Missing $2.4 Billion</font><br/>
                        <font className="date">Posted: October 24, 1996</font><br/>
                        Executives from Axis Innovations are testifying before a closed Senate panel this week regarding $2.4 billion in "black budget" computational R&D that has been unaccounted for since 1975. While the defense contractor remains tight-lipped, Pentagon insiders speculate the funds were funneled into experimental electromagnetic warfare and unauthorized human trials. A spokesperson for Vespera Systems, an Axis subsidiary, denied any involvement in the legacy projects.
                    </p>
                    <hr width="80%" align="left"/>

                    {/* Flavor: Deep Blue */}
                    <p>
                        <font className="article-title">Machine Triumphs: Deep Blue Defeats Kasparov</font><br/>
                        <font className="date">Posted: October 22, 1996</font><br/>
                        In a terrifying display of the rise of machine intelligence, IBM's "Deep Blue" supercomputer has secured a historic victory against world chess champion Garry Kasparov. Pundits are already debating the philosophical implications of a machine out-thinking a human mind. "It felt like it was looking back at me," Kasparov reportedly stated, a sentiment that has sent chills down the spine of the tech community.
                    </p>
                    <hr width="80%" align="left"/>

                    {/* Lore: The Horizon PC Recall */}
                    <p>
                        <font className="article-title">Vespera Issues Minor Recall on Horizon PCs</font><br/>
                        <font className="date">Posted: October 18, 1996</font><br/>
                        Vespera Systems has issued a voluntary recall for a small batch of their flagship Horizon desktop computers. Users have flooded tech support boards complaining that the power supply units become extremely cold to the touch, rather than hot, during heavy processing. Furthermore, some users report the internal PC speaker emits a low-frequency hum that sounds eerily like whispering. Vespera's PR department vehemently denies the hum is a cause for alarm, officially blaming the anomaly on "unshielded analog interference" from nearby radio towers.
                    </p>
                    <hr width="80%" align="left"/>

                    {/* Flavor: Java vs Synap-C & Win95 Hype */}
                    <p>
                        <font className="article-title">Sun Microsystems Announces "Java" for the Web</font><br/>
                        <font className="date">Posted: October 15, 1996</font><br/>
                        As the hype surrounding Windows 95 continues to drive millions onto the "Information Superhighway," Sun Microsystems has released "Java," a new programming language aimed at web applets. Industry analysts, however, view it as weak competition to Vespera's proprietary Synap-C language. "Java is fine for simple web animations," noted one Silicon Valley insider, "but for bare-metal, neural-heuristic processing, Synap-C remains the undisputed king of the enterprise sector."
                    </p>
                    <hr width="80%" align="left"/>

                    {/* Lore: Soma-Scan */}
                    <p>
                        <font className="article-title">Soma-Scan Trials Show Promise, Raise Questions</font><br/>
                        <font className="date">Posted: October 10, 1996</font><br/>
                        Contradictory findings have emerged from the first hospital trials of Vespera's "Soma-Scan" brain mapping software. While lead doctors praise the software's incredible diagnostic speed and unprecedented resolution, an independent medical board is investigating unverified reports of "severe neurological fatigue" and sudden, localized memory loss in the surviving patients. Vespera claims the side effects are standard post-scan disorientation.
                    </p>
                    <hr width="80%" align="left"/>

                    {/* Flavor: O.J. Simpson Trial Aftermath */}
                    <p>
                        <font className="article-title">Nation Remains Divided in Post-Trial America</font><br/>
                        <font className="date">Posted: October 5, 1996</font><br/>
                        Over a year after the verdict of the century, the cultural shockwaves of the O.J. Simpson criminal trial continue to dominate watercooler conversations and early internet chat rooms. As the civil trial proceedings begin to take shape, network television ratings remain at an all-time high, proving that the American public's appetite for televised drama is far from satisfied.
                    </p>
                    <hr width="80%" align="left"/>

                    {/* Lore: Missing Programmer */}
                    <p>
                        <font className="article-title">Local Shareware Developer Reported Missing</font><br/>
                        <font className="date">Posted: October 2, 1996</font><br/>
                        Police are searching for Marcus Thorne, a popular third-party V-Script shareware developer who has mysteriously disappeared from his Seattle apartment. Thorne, known for his system optimization utilities, had grown increasingly erratic online. His final post on a Vespera developer forum claimed he was using Synap-C to monitor "impossible non-Euclidean frequencies" bouncing around his motherboard. Authorities suspect foul play, but no leads have been announced.
                    </p>

                </td>
            </tr>
            </tbody>
        </table>

        <br/><br/>

        {/* Footer */}
        <center>
            <table border={0} cellPadding="5" cellSpacing="0" width="100%" bgcolor="#000080">
                <tbody>
                <tr>
                    <td align="center">
                        <font color="#FFFFFF" face="Arial" size="2">
                            &copy; 1996 AETHERIS News Network. A subsidiary of Axis Innovations.<br/>
                            Best viewed with Vespera Navigator 2.0 at 800x600 resolution.<br/><br/>
                            <a href="#" onClick={(e) => { e.preventDefault(); window.dispatchEvent(new CustomEvent('navigate-browser', { detail: 'home' })); }}><font color="#FFFF00">&lt;- Return to Vespera Systems Web Directory</font></a>
                        </font>
                    </td>
                </tr>
                </tbody>
            </table>
        </center>
      </div>
    </div>
  );
};
