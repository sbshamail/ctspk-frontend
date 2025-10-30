"use client";

import { Screen } from "@/@core/layout";
import { BreadcrumbSimple } from "@/components/breadCrumb/BreadcrumbSimple";

const breadcrumbData = [
  { link: "/", name: "Home" },
  { link: "/privacy", name: "Privacy Policy" },
];
const contacts = [
    {
      icon: "📧",
      label: "Support Email",
      value: "support@ghartak.com"
    },
    {
      icon: "📞",
      label: "Customer Service", 
      value: "+92 300 1234567"
    },
    {
      icon: "🏢",
      label: "Office Address",
      value: "DHA Phase 3, Islamabad"
    }
  ];

const PrivacyPolicy = () => {
  return (
    <Screen>
      <BreadcrumbSimple data={breadcrumbData} className="py-6" />
      <div className="pt-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="w-full">
              <div className="pr-8 mb-8">
                <div className="mb-6">
                  <h2 className="text-3xl font-bold">Privacy Policy</h2>
                  <div className="flex flex-wrap items-center gap-4 mt-4 mb-6 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      By <a href="#" className="text-primary hover:underline">Ghartak</a>
                    </span>
                    <span className="flex items-center before:content-['·'] before:mr-2">1 November 2025</span>
                    <span className="flex items-center before:content-['·'] before:mr-2">8 mins read</span>
                    <span className="flex items-center before:content-['·'] before:mr-2">29k Views</span>
                  </div>
                </div>
                <div className="mb-12 space-y-6 text-gray-700">
                  <h4 className="text-xl font-semibold mt-8 mb-4 text-gray-900">Welcome to GherTak</h4>
                  <p>
                    Your privacy matters to us. This Privacy Policy explains how we collect, use, and protect your personal data when you use our website, mobile app, and delivery services within Pakistan.
                  </p>
                  <p>
                    By using our platform, you agree to this policy.
                  </p>
                  <ol className="list-decimal list-inside space-y-3 ml-4"> 
                  <li>
                  <h4 className="text-xl font-semibold mt-8 mb-4 text-gray-900  inline-block">Information We Collect</h4>
                  <p>
                    We collect information to provide and improve your shopping and delivery experience.
                  </p>
                  <ol className="list-[lower-alpha] list-outside ml-6 space-y-2">
                    <li><strong>Personal Information</strong></li>
                    <ul className="list-disc list-inside space-y-3 ml-4">
                      <li>Full name</li>
                      <li>Mobile number</li>
                      <li>Email address</li>
                      <li>Delivery address(es)</li>
                      <li>Payment details (processed securely via payment gateways; we do not store your card information)</li>
                      <li>Geo Location</li>
                    </ul>
                    <li><strong>Automatically Collected Information</strong></li>
                    <ul className="list-disc list-inside space-y-3 ml-4">
                      <li>Device information (model, operating system, browser type)</li>
                      <li>IP address and general location</li>
                      <li>Cookies and session data</li>
                      <li>Usage analytics (pages viewed, clicks, and actions)</li>
                    </ul>
                    <li><strong>Optional Information</strong></li>
                    <ul className="list-disc list-inside space-y-3 ml-4">
                      <li>Feedback, product ratings, and reviews</li>
                      <li>Communication via live chat or customer support</li>
                     
                    </ul>
                  </ol>
                  </li>
                  
                  <li>
                  <h4 className="text-xl font-semibold mt-8 mb-4 text-gray-900  inline-block">How We Use Your Information</h4>
                  <p>
                    We use your information to:
                  </p>
                  <ul  className="list-disc list-inside space-y-3 ml-4">
                    <li>Process and deliver your orders 🛒</li>
                    <li>Communicate order status and delivery updates 🚚</li>
                    <li>Improve our products, services, and user experience</li>
                    <li>Send promotional offers (only if you opt in)</li>
                    <li>Detect and prevent fraudulent transactions</li>
                    <li>Comply with Pakistani laws and regulations</li>
                    
                  </ul>
                  </li>
                  <li>
                  <h4 className="text-xl font-semibold mt-8 mb-4 text-gray-900 inline-block">How We Share Your Information</h4>
                  <p>
                    We <strong>never sell, rent, or trade</strong> your personal information.<br></br>
                    We may share limited data only with:
                  </p>
                  <ul className="list-disc list-inside space-y-3 ml-4">
                    <li><strong>Delivery riders / partners</strong> (to fulfill your order)</li>
                    <li><strong>Payment processors</strong> (for secure payments)</li>
                    <li><strong>IT and analytics providers</strong> (to improve our app and website performance)</li>
                    <li><strong>Law enforcement or government agencies</strong> (if required by law or court order)</li>
                  </ul>
                  
                  <p>
                    All third parties we work with are required to protect your data and use it only for authorized purposes.
                  </p>
                  </li>
                  <li>
                  <h4 className="text-xl font-semibold mt-8 mb-4 text-gray-900 inline-block">Cookies and Tracking</h4>
                  <p>
                    We use cookies to:
                  </p>
                  <ul className="list-disc list-inside space-y-3 ml-4">
                    <li>Keep you signed in</li>
                    <li>Save items in your shopping cart</li>
                    <li>Understand site traffic and behavior</li>
                    <li>Show relevant offers</li>
                  </ul>
                  <p>
                    You can choose to disable cookies in your browser settings, but some parts of our website/app may not function properly without them.
                  </p>
                  </li>
                  <li>
                  <h4 className="text-xl font-semibold mt-8 mb-4 text-gray-900 inline-block">Data Security</h4>
                  <p>
                    We follow industry-standard security measures to safeguard your data, including encryption and secure connections (HTTPS).
                  </p>
                  <p>
                    While we strive to protect your information, please note that no method of online transmission is 100% secure.
                  </p>
                 
                  </li>
                  <li>
                  <h4 className="text-xl font-semibold mt-8 mb-4 text-gray-900 inline-block">Your Rights (Under Pakistan’s Data Protection Bill)</h4>
                  <p>
                    You have the right to:
                  </p>
                  <ul className="list-disc list-inside space-y-3 ml-4">
                    <li>Access your personal data</li>
                    <li>Correct or update inaccurate data</li>
                    <li>Request deletion of your account or data</li>
                    <li>Withdraw consent for marketing messages</li>
                    <li>File a complaint with the <strong>National Commission for Personal Data Protection (NCPDP)</strong> once established under Pakistan’s law</li>
                  </ul>
                  <p>
                    To exercise any of these rights, please email us at <strong>support@ghartak.com</strong>
                  </p>
                  </li>
                  <li>
                  <h4 className="text-xl font-semibold mt-8 mb-4 text-gray-900 inline-block"> Data Retention</h4>
                  <p>
                    We keep your information only for as long as necessary to:
                  </p>
                  <ul className="list-disc list-inside space-y-3 ml-4">
                    <li>Deliver your orders</li>
                    <li>Meet legal, accounting, or business requirements</li>
                    <li>Resolve disputes or customer support issues</li>
                  </ul>
                  <p>
                    When no longer needed, we delete or anonymize your data securely.
                  </p>
                  </li>
                  <li>
                  <h4 className="text-xl font-semibold mt-8 mb-4 text-gray-900 inline-block">Children’s Privacy</h4>
                  <p>
                    Our services are not intended for children under 13.<br></br>
                    We do not knowingly collect data from minors. If we learn we’ve collected data from a child, we delete it immediately.
                  </p>
                  
                  </li>
                  <li>
                  <h4 className="text-xl font-semibold mt-8 mb-4 text-gray-900 inline-block">Updates to This Policy</h4>
                  <p>
                    We may occasionally update this Privacy Policy to reflect new legal requirements or service changes.<br></br>
                    The latest version will always be available on our website, with the <strong>“Effective Date”</strong> at the top.
                  </p>
                  </li>
                  <li>
                  <h4 className="text-xl font-semibold mt-8 mb-4 text-gray-900  inline-block">Contact Us</h4>
                  <p>
                    If you have questions, concerns, or data requests, please contact:
                  </p>
                  <div className="text-left space-x-6 mt-10">
                      {contacts.map((contact, index) => (
                        <div key={index} className="inline-block align-top w-64">
                          <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg">
                            <span className="text-2xl">{contact.icon}</span>
                            <div>
                              <div className="font-semibold text-gray-800 text-sm">[{contact.label}]</div>
                              <div className="text-gray-600 text-sm mt-1">{contact.value}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    </li>
                  </ol>
                  

                  <h4 className="text-xl font-semibold mt-8 mb-4 text-gray-900  inline-block">⚖️ Legal Note:</h4>
                  <p>
                    This Privacy Policy complies with the principles of the <strong>Personal Data Protection Bill, 2023 (Pakistan)</strong>, including:
                  </p>
                      <ul className="list-disc list-inside space-y-3 ml-4">                        
                          <li>Lawful processing</li>
                          <li>Data minimization</li>
                          <li>Purpose limitation</li>
                          <li>User consent</li>
                          <li>Right to access and correction</li>                        
                      </ul>
                  
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