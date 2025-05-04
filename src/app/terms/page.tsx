import { Metadata, Viewport } from "next";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of Service for Tensorify.io - Please read these terms carefully before using our platform.",
  openGraph: {
    // TODO: og image, url; and description too short.
    title: "Terms of Service | Tensorify.io",
    description: "Terms of Service for Tensorify.io - Please read these terms carefully before using our platform.",
    type: "website",
  },
  alternates: {
    canonical: "https://tensorify.io/terms",
  },
};

export default function TermsOfServicePage() {
  return (
    <div className="container mx-auto px-4 md:px-6 py-12">
      {/* Breadcrumb Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://tensorify.io"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "Terms of Service",
                "item": "https://tensorify.io/terms"
              }
            ]
          })
        }}
      />

      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">Terms of Service</h1>

        <div className="prose dark:prose-invert max-w-none">
          <div className="mb-8">
            <p className="text-center font-semibold mb-4">WEBSITE TERMS OF USE</p>
            <p className="text-center font-semibold mb-4">VERSION 1.0</p>
            <p className="text-center font-semibold mb-6">LAST REVISED ON: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
          </div>

          <div className="mb-8">
            <p className="mb-4">
              The website located at <a href="https://tensorify.io" className="text-primary hover:underline">https://tensorify.io</a> and all of its subdomains, including but not limited to <a href="https://plugins.tensorify.io" className="text-primary hover:underline">plugins.tensorify.io</a> (collectively, the &ldquo;Site&rdquo;) is a copyrighted work belonging to ALPHAWOLF VENTURES, INC. (&ldquo;Company&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;, and &ldquo;we&rdquo;). Certain features of the Site may be subject to additional guidelines, terms, or rules, which will be posted on the Site in connection with such features. All such additional terms, guidelines, and rules are incorporated by reference into these Terms.
            </p>

            <p className="mb-4 font-semibold">
              THESE TERMS OF USE (THESE &ldquo;TERMS&rdquo;) SET FORTH THE LEGALLY BINDING TERMS AND CONDITIONS THAT GOVERN YOUR USE OF THE SITE. BY ACCESSING OR USING THE SITE, YOU ARE ACCEPTING THESE TERMS (ON BEHALF OF YOURSELF OR THE ENTITY THAT YOU REPRESENT), AND YOU REPRESENT AND WARRANT THAT YOU HAVE THE RIGHT, AUTHORITY, AND CAPACITY TO ENTER INTO THESE TERMS (ON BEHALF OF YOURSELF OR THE ENTITY THAT YOU REPRESENT). YOU MAY NOT ACCESS OR USE THE SITE OR ACCEPT THE TERMS IF YOU ARE NOT AT LEAST 18 YEARS OLD. IF YOU DO NOT AGREE WITH ALL OF THE PROVISIONS OF THESE TERMS, DO NOT ACCESS AND/OR USE THE SITE.
            </p>

            <p className="mb-4 font-semibold">
              PLEASE BE AWARE THAT SECTION 10.2 CONTAINS PROVISIONS GOVERNING HOW TO RESOLVE DISPUTES BETWEEN YOU AND COMPANY. AMONG OTHER THINGS, SECTION 10.2 INCLUDES AN AGREEMENT TO ARBITRATE WHICH REQUIRES, WITH LIMITED EXCEPTIONS, THAT ALL DISPUTES BETWEEN YOU AND US SHALL BE RESOLVED BY BINDING AND FINAL ARBITRATION. SECTION 10.2 ALSO CONTAINS A CLASS ACTION AND JURY TRIAL WAIVER. PLEASE READ SECTION 10.2 CAREFULLY.
            </p>

            <p className="mb-4 font-semibold">
              UNLESS YOU OPT OUT OF THE AGREEMENT TO ARBITRATE WITHIN 30 DAYS: (1) YOU WILL ONLY BE PERMITTED TO PURSUE DISPUTES OR CLAIMS AND SEEK RELIEF AGAINST US ON AN INDIVIDUAL BASIS, NOT AS A PLAINTIFF OR CLASS MEMBER IN ANY CLASS OR REPRESENTATIVE ACTION OR PROCEEDING AND YOU WAIVE YOUR RIGHT TO PARTICIPATE IN A CLASS ACTION LAWSUIT OR CLASS-WIDE ARBITRATION; AND (2) YOU ARE WAIVING YOUR RIGHT TO PURSUE DISPUTES OR CLAIMS AND SEEK RELIEF IN A COURT OF LAW AND TO HAVE A JURY TRIAL.
            </p>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">1. ACCOUNTS</h2>

            <div className="mb-4">
              <p className="font-semibold">1.1 Account Creation.</p>
              <p>
                In order to use certain features of the Site, you must register for an account (&ldquo;Account&rdquo;) and provide certain information about yourself as prompted by the account registration form. You represent and warrant that: (a) all required registration information you submit is truthful and accurate; (b) you will maintain the accuracy of such information. You may delete your Account at any time, for any reason, by following the instructions on the Site. Company may suspend or terminate your Account in accordance with Section 8.
              </p>
            </div>

            <div className="mb-4">
              <p className="font-semibold">1.2 Account Responsibilities.</p>
              <p>
                You are responsible for maintaining the confidentiality of your Account login information and are fully responsible for all activities that occur under your Account. You agree to immediately notify Company of any unauthorized use, or suspected unauthorized use of your Account or any other breach of security. Company cannot and will not be liable for any loss or damage arising from your failure to comply with the above requirements.
              </p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">2. ACCESS TO THE SITE</h2>

            <div className="mb-4">
              <p className="font-semibold">2.1 License.</p>
              <p>
                Subject to these Terms, Company grants you a non-transferable, non-exclusive, revocable, limited license to use and access the Site solely for your own personal, noncommercial use.
              </p>
            </div>

            <div className="mb-4">
              <p className="font-semibold">2.2 Certain Restrictions.</p>
              <p>
                The rights granted to you in these Terms are subject to the following restrictions: (a) you shall not license, sell, rent, lease, transfer, assign, distribute, host, or otherwise commercially exploit the Site, whether in whole or in part, or any content displayed on the Site; (b) you shall not modify, make derivative works of, disassemble, reverse compile or reverse engineer any part of the Site; (c) you shall not access the Site in order to build a similar or competitive website, product, or service; and (d) except as expressly stated herein, no part of the Site may be copied, reproduced, distributed, republished, downloaded, displayed, posted or transmitted in any form or by any means. Unless otherwise indicated, any future release, update, or other addition to functionality of the Site shall be subject to these Terms. All copyright and other proprietary notices on the Site (or on any content displayed on the Site) must be retained on all copies thereof.
              </p>
            </div>

            <div className="mb-4">
              <p className="font-semibold">2.3 Modification.</p>
              <p>
                Company reserves the right, at any time, to modify, suspend, or discontinue the Site (in whole or in part) with or without notice to you. You agree that Company will not be liable to you or to any third party for any modification, suspension, or discontinuation of the Site or any part thereof.
              </p>
            </div>

            <div className="mb-4">
              <p className="font-semibold">2.4 No Support or Maintenance.</p>
              <p>
                You acknowledge and agree that Company will have no obligation to provide you with any support or maintenance in connection with the Site.
              </p>
            </div>

            <div className="mb-4">
              <p className="font-semibold">2.5 Ownership.</p>
              <p>
                Excluding any User Content that you may provide (defined below), you acknowledge that all the intellectual property rights, including copyrights, patents, trade marks, and trade secrets, in the Site and its content are owned by Company or Company&apos;s suppliers. Neither these Terms (nor your access to the Site) transfers to you or any third party any rights, title or interest in or to such intellectual property rights, except for the limited access rights expressly set forth in Section 2.1. Company and its suppliers reserve all rights not granted in these Terms. There are no implied licenses granted under these Terms.
              </p>
            </div>

            <div className="mb-4">
              <p className="font-semibold">2.6 Feedback.</p>
              <p>
                If you provide Company with any feedback or suggestions regarding the Site (&ldquo;Feedback&rdquo;), you hereby assign to Company all rights in such Feedback and agree that Company shall have the right to use and fully exploit such Feedback and related information in any manner it deems appropriate. Company will treat any Feedback you provide to Company as non-confidential and non-proprietary. You agree that you will not submit to Company any information or ideas that you consider to be confidential or proprietary.
              </p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">3. USER CONTENT</h2>

            <div className="mb-4">
              <p className="font-semibold">3.1 User Content.</p>
              <p>
                &ldquo;User Content&rdquo; means any and all information and content that a user submits to, or uses with, the Site (e.g., content in the user&apos;s profile or postings). You are solely responsible for your User Content. You assume all risks associated with use of your User Content, including any reliance on its accuracy, completeness or usefulness by others, or any disclosure of your User Content that personally identifies you or any third party. You hereby represent and warrant that your User Content does not violate our Acceptable Use Policy (defined in Section 3.3). You may not represent or imply to others that your User Content is in any way provided, sponsored or endorsed by Company. Since you alone are responsible for your User Content, you may expose yourself to liability if, for example, your User Content violates the Acceptable Use Policy. Company is not obligated to backup any User Content, and your User Content may be deleted at any time without prior notice. You are solely responsible for creating and maintaining your own backup copies of your User Content if you desire.
              </p>
            </div>

            <div className="mb-4">
              <p className="font-semibold">3.2 License.</p>
              <p>
                You hereby grant (and you represent and warrant that you have the right to grant) to Company an irrevocable, nonexclusive, royalty-free and fully paid, worldwide license to reproduce, distribute, publicly display and perform, prepare derivative works of, incorporate into other works, and otherwise use and exploit your User Content, and to grant sublicenses of the foregoing rights, solely for the purposes of including your User Content in the Site. You hereby irrevocably waive (and agree to cause to be waived) any claims and assertions of moral rights or attribution with respect to your User Content.
              </p>
            </div>

            <div className="mb-4">
              <p className="font-semibold">3.3 Acceptable Use Policy.</p>
              <p>The following terms constitute our &ldquo;Acceptable Use Policy&rdquo;:</p>

              <p className="mt-2 ml-6">
                (a) You agree not to use the Site to collect, upload, transmit, display, or distribute any User Content (i) that violates any third-party right, including any copyright, trademark, patent, trade secret, moral right, privacy right, right of publicity, or any other intellectual property or proprietary right, (ii) that is unlawful, harassing, abusive, tortious, threatening, harmful, invasive of another&apos;s privacy, vulgar, defamatory, false, intentionally misleading, trade libelous, pornographic, obscene, patently offensive, promotes racism, bigotry, hatred, or physical harm of any kind against any group or individual or is otherwise objectionable, (iii) that is harmful to minors in any way, or (iv) that is in violation of any law, regulation, or obligations or restrictions imposed by any third party.
              </p>

              <p className="mt-2 ml-6">
                (b) In addition, you agree not to: (i) upload, transmit, or distribute to or through the Site any computer viruses, worms, or any software intended to damage or alter a computer system or data; (ii) send through the Site unsolicited or unauthorized advertising, promotional materials, junk mail, spam, chain letters, pyramid schemes, or any other form of duplicative or unsolicited messages, whether commercial or otherwise; (iii) use the Site to harvest, collect, gather or assemble information or data regarding other users, including e-mail addresses, without their consent; (iv) interfere with, disrupt, or create an undue burden on servers or networks connected to the Site, or violate the regulations, policies or procedures of such networks; (v) attempt to gain unauthorized access to the Site (or to other computer systems or networks connected to or used together with the Site), whether through password mining or any other means; (vi) harass or interfere with any other user&apos;s use and enjoyment of the Site; or (vii) use software or automated agents or scripts to produce multiple accounts on the Site, or to generate automated searches, requests, or queries to (or to strip, scrape, or mine data from) the Site (provided, however, that we conditionally grant to the operators of public search engines revocable permission to use spiders to copy materials from the Site for the sole purpose of and solely to the extent necessary for creating publicly available searchable indices of the materials, but not caches or archives of such materials, subject to the parameters set forth in our robots.txt file).
              </p>
            </div>

            <div className="mb-4">
              <p className="font-semibold">3.4 Enforcement.</p>
              <p>
                We reserve the right (but have no obligation) to review, refuse and/or remove any User Content in our sole discretion, and to investigate and/or take appropriate action against you in our sole discretion if you violate the Acceptable Use Policy or any other provision of these Terms or otherwise create liability for us or any other person. Such action may include removing or modifying your User Content, terminating your Account in accordance with Section 8, and/or reporting you to law enforcement authorities.
              </p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">4. INDEMNIFICATION</h2>
            <p>
              You agree to indemnify and hold Company (and its officers, employees, and agents) harmless, including costs and attorneys&apos; fees, from any claim or demand made by any third party due to or arising out of (a) your use of the Site, (b) your violation of these Terms, (c) your violation of applicable laws or regulations or (d) your User Content. Company reserves the right, at your expense, to assume the exclusive defense and control of any matter for which you are required to indemnify us, and you agree to cooperate with our defense of these claims. You agree not to settle any matter without the prior written consent of Company. Company will use reasonable efforts to notify you of any such claim, action or proceeding upon becoming aware of it.
            </p>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">5. THIRD-PARTY LINKS & ADS; OTHER USERS</h2>

            <div className="mb-4">
              <p className="font-semibold">5.1 Third-Party Links & Ads.</p>
              <p>
                The Site may contain links to third-party websites and services, and/or display advertisements for third parties (collectively, &ldquo;Third-Party Links & Ads&rdquo;). Such Third-Party Links & Ads are not under the control of Company, and Company is not responsible for any Third-Party Links & Ads. Company provides access to these Third-Party Links & Ads only as a convenience to you, and does not review, approve, monitor, endorse, warrant, or make any representations with respect to Third-Party Links & Ads. You use all Third-Party Links & Ads at your own risk, and should apply a suitable level of caution and discretion in doing so. When you click on any of the Third-Party Links & Ads, the applicable third party&apos;s terms and policies apply, including the third party&apos;s privacy and data gathering practices. You should make whatever investigation you feel necessary or appropriate before proceeding with any transaction in connection with such Third-Party Links & Ads.
              </p>
            </div>

            <div className="mb-4">
              <p className="font-semibold">5.2 Other Users.</p>
              <p>
                Each Site user is solely responsible for any and all of its own User Content. Since we do not control User Content, you acknowledge and agree that we are not responsible for any User Content, whether provided by you or by others. We make no guarantees regarding the accuracy, currency, suitability, appropriateness, or quality of any User Content. Your interactions with other Site users are solely between you and such users. You agree that Company will not be responsible for any loss or damage incurred as the result of any such interactions. If there is a dispute between you and any Site user, we are under no obligation to become involved.
              </p>
            </div>

            <div className="mb-4">
              <p className="font-semibold">5.3 Release.</p>
              <p>
                You hereby release and forever discharge Company (and our officers, employees, agents, successors, and assigns) from, and hereby waive and relinquish, each and every past, present and future dispute, claim, controversy, demand, right, obligation, liability, action and cause of action of every kind and nature (including personal injuries, death, and property damage), that has arisen or arises directly or indirectly out of, or that relates directly or indirectly to, the Site (including any interactions with, or act or omission of, other Site users or any Third-Party Links & Ads). IF YOU ARE A CALIFORNIA RESIDENT, YOU HEREBY WAIVE CALIFORNIA CIVIL CODE SECTION 1542 IN CONNECTION WITH THE FOREGOING, WHICH STATES: &ldquo;A GENERAL RELEASE DOES NOT EXTEND TO CLAIMS WHICH THE CREDITOR OR RELEASING PARTY DOES NOT KNOW OR SUSPECT TO EXIST IN HIS OR HER FAVOR AT THE TIME OF EXECUTING THE RELEASE, WHICH IF KNOWN BY HIM OR HER MUST HAVE MATERIALLY AFFECTED HIS OR HER SETTLEMENT WITH THE DEBTOR OR RELEASED PARTY.&rdquo;
              </p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">6. DISCLAIMERS</h2>
            <p className="font-semibold">
              THE SITE IS PROVIDED ON AN &ldquo;AS-IS&rdquo; AND &ldquo;AS AVAILABLE&rdquo; BASIS, AND COMPANY (AND OUR SUPPLIERS) EXPRESSLY DISCLAIM ANY AND ALL WARRANTIES AND CONDITIONS OF ANY KIND, WHETHER EXPRESS, IMPLIED, OR STATUTORY, INCLUDING ALL WARRANTIES OR CONDITIONS OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, QUIET ENJOYMENT, ACCURACY, OR NON-INFRINGEMENT. WE (AND OUR SUPPLIERS) MAKE NO WARRANTY THAT THE SITE WILL MEET YOUR REQUIREMENTS, WILL BE AVAILABLE ON AN UNINTERRUPTED, TIMELY, SECURE, OR ERROR-FREE BASIS, OR WILL BE ACCURATE, RELIABLE, FREE OF VIRUSES OR OTHER HARMFUL CODE, COMPLETE, LEGAL, OR SAFE. IF APPLICABLE LAW REQUIRES ANY WARRANTIES WITH RESPECT TO THE SITE, ALL SUCH WARRANTIES ARE LIMITED IN DURATION TO 90 DAYS FROM THE DATE OF FIRST USE.
            </p>
            <p className="mt-4 font-semibold">
              SOME JURISDICTIONS DO NOT ALLOW THE EXCLUSION OF IMPLIED WARRANTIES, SO THE ABOVE EXCLUSION MAY NOT APPLY TO YOU. SOME JURISDICTIONS DO NOT ALLOW LIMITATIONS ON HOW LONG AN IMPLIED WARRANTY LASTS, SO THE ABOVE LIMITATION MAY NOT APPLY TO YOU.
            </p>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">7. LIMITATION ON LIABILITY</h2>
            <p className="font-semibold">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT SHALL COMPANY (OR OUR SUPPLIERS) BE LIABLE TO YOU OR ANY THIRD PARTY FOR ANY LOST PROFITS, LOST DATA, COSTS OF PROCUREMENT OF SUBSTITUTE PRODUCTS, OR ANY INDIRECT, CONSEQUENTIAL, EXEMPLARY, INCIDENTAL, SPECIAL OR PUNITIVE DAMAGES ARISING FROM OR RELATING TO THESE TERMS OR YOUR USE OF, OR INABILITY TO USE, THE SITE, EVEN IF COMPANY HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. ACCESS TO, AND USE OF, THE SITE IS AT YOUR OWN DISCRETION AND RISK, AND YOU WILL BE SOLELY RESPONSIBLE FOR ANY DAMAGE TO YOUR DEVICE OR COMPUTER SYSTEM, OR LOSS OF DATA RESULTING THEREFROM.
            </p>
            <p className="mt-4 font-semibold">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, NOTWITHSTANDING ANYTHING TO THE CONTRARY CONTAINED HEREIN, OUR LIABILITY TO YOU FOR ANY DAMAGES ARISING FROM OR RELATED TO THESE TERMS (FOR ANY CAUSE WHATSOEVER AND REGARDLESS OF THE FORM OF THE ACTION), WILL AT ALL TIMES BE LIMITED TO A MAXIMUM OF FIFTY US DOLLARS. THE EXISTENCE OF MORE THAN ONE CLAIM WILL NOT ENLARGE THIS LIMIT. YOU AGREE THAT OUR SUPPLIERS WILL HAVE NO LIABILITY OF ANY KIND ARISING FROM OR RELATING TO THESE TERMS.
            </p>
            <p className="mt-4 font-semibold">
              SOME JURISDICTIONS DO NOT ALLOW THE LIMITATION OR EXCLUSION OF LIABILITY FOR INCIDENTAL OR CONSEQUENTIAL DAMAGES, SO THE ABOVE LIMITATION OR EXCLUSION MAY NOT APPLY TO YOU.
            </p>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">8. TERM AND TERMINATION</h2>
            <p>
              Subject to this Section, these Terms will remain in full force and effect while you use the Site. We may suspend or terminate your rights to use the Site (including your Account) at any time for any reason at our sole discretion, including for any use of the Site in violation of these Terms. Upon termination of your rights under these Terms, your Account and right to access and use the Site will terminate immediately. You understand that any termination of your Account may involve deletion of your User Content associated with your Account from our live databases. Company will not have any liability whatsoever to you for any termination of your rights under these Terms, including for termination of your Account or deletion of your User Content. Even after your rights under these Terms are terminated, the following provisions of these Terms will remain in effect: Sections 2.2 through 2.6, Section 3 and Sections 4 through 10.
            </p>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">9. COPYRIGHT POLICY</h2>
            <p>
              Company respects the intellectual property of others and asks that users of our Site do the same. In connection with our Site, we have adopted and implemented a policy respecting copyright law that provides for the removal of any infringing materials and for the termination, in appropriate circumstances, of users of our online Site who are repeat infringers of intellectual property rights, including copyrights. If you believe that one of our users is, through the use of our Site, unlawfully infringing the copyright(s) in a work, and wish to have the allegedly infringing material removed, the following information in the form of a written notification (pursuant to 17 U.S.C. § 512(c)) must be provided to our designated Copyright Agent:
            </p>

            <ol className="list-decimal pl-8 mt-4 space-y-2">
              <li>your physical or electronic signature;</li>
              <li>identification of the copyrighted work(s) that you claim to have been infringed;</li>
              <li>identification of the material on our services that you claim is infringing and that you request us to remove;</li>
              <li>sufficient information to permit us to locate such material;</li>
              <li>your address, telephone number, and e-mail address;</li>
              <li>a statement that you have a good faith belief that use of the objectionable material is not authorized by the copyright owner, its agent, or under the law; and</li>
              <li>a statement that the information in the notification is accurate, and under penalty of perjury, that you are either the owner of the copyright that has allegedly been infringed or that you are authorized to act on behalf of the copyright owner.</li>
            </ol>

            <p className="mt-4">
              Please note that, pursuant to 17 U.S.C. § 512(f), any misrepresentation of material fact (falsities) in a written notification automatically subjects the complaining party to liability for any damages, costs and attorney&apos;s fees incurred by us in connection with the written notification and allegation of copyright infringement.
            </p>

          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">10. GENERAL</h2>

            <div className="mb-4">
              <p className="font-semibold">10.1 Changes.</p>
              <p>
                These Terms are subject to occasional revision, and if we make any substantial changes, we may notify you by sending you an e-mail to the last e-mail address you provided to us (if any), and/or by prominently posting notice of the changes on our Site. You are responsible for providing us with your most current e-mail address. In the event that the last e-mail address that you have provided us is not valid, or for any reason is not capable of delivering to you the notice described above, our dispatch of the e-mail containing such notice will nonetheless constitute effective notice of the changes described in the notice. Continued use of our Site following notice of such changes shall indicate your acknowledgement of such changes and agreement to be bound by the terms and conditions of such changes.
              </p>
            </div>

            <div className="mb-4">
              <p className="font-semibold">10.2 Dispute Resolution.</p>
              <p>
                Please read the following arbitration agreement in this Section (the &ldquo;Arbitration Agreement&rdquo;) carefully. It requires you to arbitrate disputes with Company, its parent companies, subsidiaries, affiliates, successors and assigns and all of their respective officers, directors, employees, agents, and representatives (collectively, the &ldquo;Company Parties&rdquo;) and limits the manner in which you can seek relief from the Company Parties.
              </p>

              <p className="mt-2 ml-6">
                <span className="font-semibold">(a) Applicability of Arbitration Agreement.</span> You agree that any dispute between you and any of the Company Parties relating in any way to the Site, the services offered on the Site (the &ldquo;Services&rdquo;) or these Terms will be resolved by binding arbitration, rather than in court, except that (1) you and the Company Parties may assert individualized claims in small claims court if the claims qualify, remain in such court and advance solely on an individual, non-class basis; and (2) you or the Company Parties may seek equitable relief in court for infringement or other misuse of intellectual property rights (such as trademarks, trade dress, domain names, trade secrets, copyrights, and patents). This Arbitration Agreement shall survive the expiration or termination of these Terms and shall apply, without limitation, to all claims that arose or were asserted before you agreed to these Terms (in accordance with the preamble) or any prior version of these Terms. This Arbitration Agreement does not preclude you from bringing issues to the attention of federal, state or local agencies. Such agencies can, if the law allows, seek relief against the Company Parties on your behalf. For purposes of this Arbitration Agreement, &ldquo;Dispute&rdquo; will also include disputes that arose or involve facts occurring before the existence of this or any prior versions of the Agreement as well as claims that may arise after the termination of these Terms.
              </p>

              <p className="mt-2 ml-6">
                <span className="font-semibold">(b) Informal Dispute Resolution.</span> There might be instances when a Dispute arises between you and Company. If that occurs, Company is committed to working with you to reach a reasonable resolution. You and Company agree that good faith informal efforts to resolve Disputes can result in a prompt, low-cost and mutually beneficial outcome. You and Company therefore agree that before either party commences arbitration against the other (or initiates an action in small claims court if a party so elects), we will personally meet and confer telephonically or via videoconference, in a good faith effort to resolve informally any Dispute covered by this Arbitration Agreement (&ldquo;Informal Dispute Resolution Conference&rdquo;). If you are represented by counsel, your counsel may participate in the conference, but you will also participate in the conference.
              </p>

              <p className="mt-2 ml-6">
                The party initiating a Dispute must give notice to the other party in writing of its intent to initiate an Informal Dispute Resolution Conference (&ldquo;Notice&rdquo;), which shall occur within 45 days after the other party receives such Notice, unless an extension is mutually agreed upon by the parties. Notice to Company that you intend to initiate an Informal Dispute Resolution Conference should be sent by email to: faisalahmed531@gmail.com, or by regular mail to 131 Continental Dr, Suite 305, Newark, Delaware 19702. The Notice must include: (1) your name, telephone number, mailing address, e-mail address associated with your account (if you have one); (2) the name, telephone number, mailing address and e-mail address of your counsel, if any; and (3) a description of your Dispute.
              </p>

              <p className="mt-2 ml-6">
                The Informal Dispute Resolution Conference shall be individualized such that a separate conference must be held each time either party initiates a Dispute, even if the same law firm or group of law firms represents multiple users in similar cases, unless all parties agree; multiple individuals initiating a Dispute cannot participate in the same Informal Dispute Resolution Conference unless all parties agree. In the time between a party receiving the Notice and the Informal Dispute Resolution Conference, nothing in this Arbitration Agreement shall prohibit the parties from engaging in informal communications to resolve the initiating party&apos;s Dispute. Engaging in the Informal Dispute Resolution Conference is a condition precedent and requirement that must be fulfilled before commencing arbitration. The statute of limitations and any filing fee deadlines shall be tolled while the parties engage in the Informal Dispute Resolution Conference process required by this section.
              </p>
            </div>

            <div className="mb-4">
              <p className="font-semibold">10.3 Export.</p>
              <p>
                The Site may be subject to U.S. export control laws and may be subject to export or import regulations in other countries. You agree not to export, reexport, or transfer, directly or indirectly, any U.S. technical data acquired from Company, or any products utilizing such data, in violation of the United States export laws or regulations.
              </p>
            </div>

            <div className="mb-4">
              <p className="font-semibold">10.4 Disclosures.</p>
              <p>
                Company is located at the address in Section 10.8. If you are a California resident, you may report complaints to the Complaint Assistance Unit of the Division of Consumer Product of the California Department of Consumer Affairs by contacting them in writing at 400 R Street, Sacramento, CA 95814, or by telephone at (800) 952-5210.
              </p>
            </div>

            <div className="mb-4">
              <p className="font-semibold">10.5 Electronic Communications.</p>
              <p>
                The communications between you and Company use electronic means, whether you use the Site or send us emails, or whether Company posts notices on the Site or communicates with you via email. For contractual purposes, you (a) consent to receive communications from Company in an electronic form; and (b) agree that all terms and conditions, agreements, notices, disclosures, and other communications that Company provides to you electronically satisfy any legal requirement that such communications would satisfy if it were be in a hardcopy writing. The foregoing does not affect your non-waivable rights.
              </p>
            </div>

            <div className="mb-4">
              <p className="font-semibold">10.6 Entire Terms.</p>
              <p>
                These Terms constitute the entire agreement between you and us regarding the use of the Site. Our failure to exercise or enforce any right or provision of these Terms shall not operate as a waiver of such right or provision. The section titles in these Terms are for convenience only and have no legal or contractual effect. The word &ldquo;including&rdquo; means &ldquo;including without limitation&rdquo;. If any provision of these Terms is, for any reason, held to be invalid or unenforceable, the other provisions of these Terms will be unimpaired and the invalid or unenforceable provision will be deemed modified so that it is valid and enforceable to the maximum extent permitted by law. Your relationship to Company is that of an independent contractor, and neither party is an agent or partner of the other. These Terms, and your rights and obligations herein, may not be assigned, subcontracted, delegated, or otherwise transferred by you without Company&apos;s prior written consent, and any attempted assignment, subcontract, delegation, or transfer in violation of the foregoing will be null and void. Company may freely assign these Terms. The terms and conditions set forth in these Terms shall be binding upon assignees.
              </p>
            </div>

            <div className="mb-4">
              <p className="font-semibold">10.7 Copyright/Trademark Information.</p>
              <p>
                Copyright © {new Date().getFullYear()} ALPHAWOLF VENTURES, INC. All rights reserved. All trademarks, logos and service marks (&ldquo;Marks&rdquo;) displayed on the Site are our property or the property of other third parties. You are not permitted to use these Marks without our prior written consent or the consent of such third party which may own the Marks.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 text-sm text-muted-foreground">
          <p>Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
        </div>
      </div>
    </div>
  );
} 