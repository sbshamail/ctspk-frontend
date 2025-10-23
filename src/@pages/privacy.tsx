"use client";

import { Screen } from "@/@core/layout";
import { BreadcrumbSimple } from "@/components/breadCrumb/BreadcrumbSimple";

const breadcrumbData = [
  { link: "/", name: "Home" },
  { link: "/privacy", name: "Privacy Policy" },
];

const PrivacyPolicy = () => {
  return (
    <Screen>
      <BreadcrumbSimple data={breadcrumbData} className="py-6" />
      <div className="pt-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="w-full">
              <div className="pr-8 mb-8">
                <div className="mb-6">
                  <h2 className="text-3xl font-bold">Privacy Policy</h2>
                  <div className="flex flex-wrap items-center gap-4 mt-4 mb-6 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      By <a href="#" className="text-primary hover:underline">Jonh</a>
                    </span>
                    <span className="flex items-center before:content-['·'] before:mr-2">9 April 2020</span>
                    <span className="flex items-center before:content-['·'] before:mr-2">8 mins read</span>
                    <span className="flex items-center before:content-['·'] before:mr-2">29k Views</span>
                  </div>
                </div>
                <div className="mb-12 space-y-6 text-gray-700">
                  <h4 className="text-xl font-semibold mt-8 mb-4 text-gray-900">Welcome to Our Privacy Policy</h4>
                  <ol className="list-decimal list-inside space-y-3 ml-4">
                    <li>Hi there, we're our company of Level 1, 121 King Street Melbourne, 3000, Australia ("Company") and welcome to our privacy policy which also applies to our Affiliate Companies. This policy sets out how we handle your personal information if you're a user or visitor to our Sites.</li>
                    <li>When we say 'we', 'us' or 'Company' it's because that's who we are and we own and run the Sites.</li>
                    <li>If we say 'policy' we're talking about this privacy policy. If we say 'user terms' we're talking about the rules for using each of the Sites.</li>
                  </ol>

                  <h4 className="text-xl font-semibold mt-8 mb-4 text-gray-900">The type of personal information we collect</h4>
                  <ol start={4} className="list-decimal list-inside space-y-3 ml-4">
                    <li>We collect certain personal information about visitors and users of our Sites.</li>
                    <li>The most common types of information we collect include things like: user-names, member names, email addresses, IP addresses, other contact details, survey responses, blogs, photos, payment information such as payment agent details, transactional details, tax information, support queries, forum comments (if applicable), content you direct us to make available on our Sites (such as item descriptions), your actions on our Sites (including any selections or inputs into items) and web and email analytics data. We will also collect personal information from job applications (such as, your CV, the application form itself, cover letter and interview notes).</li>
                  </ol>

                  <h4 className="text-xl font-semibold mt-8 mb-4 text-gray-900">How we collect personal information</h4>
                  <ol start={6} className="list-decimal list-inside space-y-3 ml-4">
                    <li>We collect personal information directly when you provide it to us, automatically as you navigate through the Sites, or through other people when you use services associated with the Sites.</li>
                    <li>We collect your personal information when you provide it to us when you complete membership registration and buy or provide items or services on our Sites, subscribe to a newsletter, email list, submit feedback, enter a contest, fill out a survey, or send us a communication.</li>
                    <li>
                      As the operator of digital content marketplaces, we have a legitimate interest in verifying the identity of our authors. We believe that knowing who our authors are will strengthen the integrity of our marketplaces by reducing fraud, making authors more accountable for their content and giving us and customers the ability to enforce contracts for authors who break the rules. We also have certain legal obligations that require us to know who our authors are in certain circumstances.
                    </li>
                  </ol>

                  <h4 className="text-xl font-semibold mt-8 mb-4 text-gray-900">Personal information we collect about you from others</h4>
                  <ol start={9} className="list-decimal list-inside space-y-3 ml-4">
                    <li>
                      Although we generally collect personal information directly from you, on occasion, we also collect certain categories of personal information about you from other sources. In particular:
                      <ol className="list-decimal list-inside space-y-2 ml-6 mt-2">
                        <li>financial and/or transaction details from payment providers located in various countries in order to process a transaction;</li>
                        <li>third party service providers (like Google, Facebook) which may provide information about you when you link, connect, or login to your account with the third party provider and they send us information such as your registration and profile from that service;</li>
                        <li>
                          other third party sources/and or partners whereby we receive additional information about you (to the extent permitted by applicable law), such as demographic data or fraud detection information, and combine it with information we have about you.
                        </li>
                      </ol>
                    </li>
                  </ol>

                  <h4 className="text-xl font-semibold mt-8 mb-4 text-gray-900">How we use personal information</h4>
                  <ol start={10} className="list-decimal list-inside space-y-3 ml-4">
                    <li>
                      We will use your personal information:
                      <ol className="list-decimal list-inside space-y-2 ml-6 mt-2">
                        <li>To fulfil a contract, or take steps linked to a contract: in particular, in facilitating and processing transactions that take place on the Sites.</li>
                        <li>
                          Where this is necessary for purposes which are in our, or third parties', legitimate interests. These interests include operating the Sites, providing you with services described on the Sites, verifying your identity, responding to support tickets, and ensuring compliance with user terms.
                        </li>
                        <li>
                          Where you give us consent for marketing communications and personalized experiences.
                        </li>
                        <li>For purposes which are required by law.</li>
                        <li>For the purpose of responding to requests by government, a court of law, or law enforcement authorities conducting an investigation.</li>
                      </ol>
                    </li>
                  </ol>

                  <h4 className="text-xl font-semibold mt-8 mb-4 text-gray-900">When we disclose your personal information</h4>
                  <ol start={11} className="list-decimal list-inside space-y-3 ml-4">
                    <li>
                      We will disclose personal information to the following recipients:
                      <ol className="list-decimal list-inside space-y-2 ml-6 mt-2">
                        <li>companies that are in our group;</li>
                        <li>subcontractors and service providers who assist us in connection with the ways we use personal information;</li>
                        <li>our professional advisers (lawyers, accountants, financial advisers etc.);</li>
                        <li>regulators and government authorities in connection with our compliance procedures and obligations;</li>
                        <li>a purchaser or prospective purchaser of all or part of our assets or our business, and their professional advisers, in connection with the purchase;</li>
                      </ol>
                    </li>
                  </ol>

                  <h4 className="text-xl font-semibold mt-8 mb-4 text-gray-900">Where we transfer and/or store your personal information</h4>
                  <ol start={12} className="list-decimal list-inside space-y-3 ml-4">
                    <li>We are based in various locations so your data will be processed in multiple countries. We take care where possible to work with subcontractors and service providers who we believe maintain an acceptable standard of data security compliance.</li>
                  </ol>

                  <h4 className="text-xl font-semibold mt-8 mb-4 text-gray-900">How we keep your personal information secure</h4>
                  <ol start={13} className="list-decimal list-inside space-y-3 ml-4">
                    <li>We store personal information on secure servers that are managed by us and our service providers. Personal information that we store or transmit is protected by security and access controls, including username and password authentication, two-factor authentication, and data encryption where appropriate.</li>
                  </ol>

                  <h4 className="text-xl font-semibold mt-8 mb-4 text-gray-900">How you can access your personal information</h4>
                  <ol start={14} className="list-decimal list-inside space-y-3 ml-4">
                    <li>You can access some of the personal information that we collect about you by logging in to your account. You also have the right to make a request to access other personal information we hold about you and to request corrections of any errors in that data.</li>
                  </ol>

                  <h4 className="text-xl font-semibold mt-8 mb-4 text-gray-900">Marketing Choices regarding your personal information</h4>
                  <ol start={15} className="list-decimal list-inside space-y-3 ml-4">
                    <li>Where we have your consent to do so, we send you marketing communications by email about products and services that we feel may be of interest to you. You can 'opt-out' of such communications if you would prefer not to receive them in the future by using the "unsubscribe" facility provided in the communication itself.</li>
                    <li>You also have choices about cookies. By modifying your browser preferences, you have the choice to accept all cookies, to be notified when a cookie is set, or to reject all cookies. If you choose to reject cookies some parts of our Sites may not work properly in your case.</li>
                  </ol>

                  <h4 className="text-xl font-semibold mt-8 mb-4 text-gray-900">Cookies and web analytics</h4>
                  <ol start={17} className="list-decimal list-inside space-y-3 ml-4">
                    <li>For more information about how we use cookies, web beacons and similar technologies see our cookie policy.</li>
                    <li>
                      When you visit our Sites, there's certain information that's recorded which is generally anonymous information and does not reveal your identity. This includes your IP address, domain name, date and time of visit, pages accessed, and technical information about your device and browser.
                    </li>
                  </ol>

                  <h4 className="text-xl font-semibold mt-8 mb-4 text-gray-900">Information about children</h4>
                  <ol start={20} className="list-decimal list-inside space-y-3 ml-4">
                    <li>Our Sites are not suitable for children under the age of 16 years. If you are from 16 to 18 years, you can browse the Sites but you'll need the supervision of a parent or guardian to become a registered user.</li>
                  </ol>

                  <h4 className="text-xl font-semibold mt-8 mb-4 text-gray-900">How long we keep your personal information</h4>
                  <ol start={22} className="list-decimal list-inside space-y-3 ml-4">
                    <li>We retain your personal information for as long as is necessary to provide the services to you and others, and to comply with our legal obligations.</li>
                  </ol>

                  <h4 className="text-xl font-semibold mt-8 mb-4 text-gray-900">When we need to update this policy</h4>
                  <ol start={23} className="list-decimal list-inside space-y-3 ml-4">
                    <li>We will need to change this policy from time to time in order to make sure it stays up to date with the latest legal requirements and any changes to our privacy management practices.</li>
                    <li>When we do change the policy, we'll make sure to notify you about such changes, where required. A copy of the latest version of this policy will always be available on this page.</li>
                  </ol>

                  <h4 className="text-xl font-semibold mt-8 mb-4 text-gray-900">How you can contact us</h4>
                  <ol start={25} className="list-decimal list-inside space-y-3 ml-4">
                    <li>If you have any questions about our privacy practices or the way in which we have been managing your personal information, please contact our privacy team.</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Screen>
  );
};

export default PrivacyPolicy;