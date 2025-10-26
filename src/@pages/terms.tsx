"use client";

import { Screen } from "@/@core/layout";
import { BreadcrumbSimple } from "@/components/breadCrumb/BreadcrumbSimple";

const breadcrumbData = [
  { link: "/", name: "Home" },
  { link: "/terms", name: "Terms of Service" },
];
const contacts = [
    {
      icon: "📧",
      label: "Support Email",
      value: "support@ghertak.com"
    },
    {
      icon: "📞", 
      label: "Customer Service Number",
      value: "+92 300 1234567"
    },
    {
      icon: "🏢",
      label: "Office Address",
      value: "Plot 123, Street 45, Sector G-8/4, Islamabad, Pakistan"
    }
  ];
const TermsOfService = () => {
  return (
    <Screen>
      <BreadcrumbSimple data={breadcrumbData} className="py-6" />
      <div className="pt-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="w-full">
              <div className="pr-8 mb-8">
                <div className="mb-6">
                  <h2 className="text-3xl font-bold">Terms & Conditions</h2>
                  <span className="font-bold">Effective Date: 01/11/2025</span>
                </div>
                <div className="mb-12 space-y-6 text-gray-700">
                  <p>
                    Welcome to GherTak.  By accessing or using our website, mobile app, or delivery services in Pakistan, you agree to comply with these Terms & Conditions. Please read them carefully before placing an order
                  </p>
                  
                  <ol className="list-decimal list-outside ml-6 space-y-2">
                    <li className="pl-2">
                  <h4 className="text-xl font-semibold mt-8 mb-4 text-gray-900">Use of Our Services</h4>
                  <ol className="list-disc list-inside space-y-3 ml-4">
                    <li>You must be at least 18 years old to create an account or place an order.</li>
                    <li>You agree to provide accurate and up-to-date information (including delivery address, contact number, and payment details).</li>
                    <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
                    
                  </ol>
                  <p>We reserve the right to suspend or terminate accounts found to be misusing our services.</p>
                  </li>
                  <li className="pl-2">
                  <h4 className="text-xl font-semibold mt-8 mb-4 text-gray-900">Placing Orders</h4>
                  <ul className="list-disc list-inside space-y-3 ml-4">
                    <li>Orders can be placed through our website or mobile app.</li>
                    <li>Once an order is placed, you’ll receive a confirmation via SMS, email, or app notification.</li>
                    <li>Acceptance of your order occurs when we confirm it.</li>
                    <li>Orders are subject to product availability, delivery slot availability, and service area coverage.</li>
                    
                  </ul>
                  
                  </li>
                  <li className="pl-2">
                  <h4 className="text-xl font-semibold mt-8 mb-4 text-gray-900">Pricing and Payments</h4>
                  <ul className="list-disc list-outside ml-6 space-y-2 mt-4">
                    <li>All prices are listed in Pakistani Rupees (PKR) and include applicable taxes (where relevant).</li>
                    <li>Prices and availability are subject to change without prior notice.</li>
                    <li>Payments can be made through Cash on Delivery, Debit/Credit Card, or Mobile Wallets / Online Payment Gateways</li>
                    <li>We do not store card or payment details — transactions are processed securely by trusted third-party providers</li>
                    
                  </ul>
                  <p>
                    In case of payment failure, your order will not be processed.
                  </p>
                  </li>
                  <li className="pl-2">
                  <h4 className="text-xl font-semibold mt-8 mb-4 text-gray-900">Delivery Policy</h4>
                  <ul className="list-disc list-outside ml-6 space-y-2 mt-4">
                    <li>Deliveries are made to eligible areas only. You’ll be informed if your location is outside our service zone.</li>
                    <li>Estimated delivery times are shown at checkout but may vary due to traffic, weather, or rider availability.</li>
                    <li>Please ensure someone is available to receive the order.</li>
                    <li>In case of failed delivery attempts, re-delivery charges may apply.</li>                    
                  </ul>
                  <p>
                    We strive to deliver all products in excellent condition. However, if you receive a damaged or incorrect item, please contact us immediately.
                  </p>
                  </li>
                  <li className="pl-2">
                  <h4 className="text-xl font-semibold mt-8 mb-4 text-gray-900">Cancellations & Returns</h4>
                  <ul className="list-disc list-outside ml-6 space-y-2 mt-4">
                    <li>Orders can be canceled before they are dispatched. Once out for delivery, cancellations may not be possible.</li>
                    <li>Certain perishable goods (like fruits, vegetables, dairy, and meat) are non-returnable unless damaged or incorrect.</li>
                    <li>Refunds (if applicable) will be processed within 3–5 working days via the original payment method.</li>                    
                  </ul>
                  </li>
                  <li className="pl-2">
                  <h4 className="text-xl font-semibold mt-8 mb-4 text-gray-900">Product Information</h4>
                  <p>
                    We make every effort to display accurate product details, images, and prices. However, errors may occasionally occur, and we reserve the right to correct such information without prior notice.
                  </p>
                  </li>
                  <li className="pl-2">
                  <h4 className="text-xl font-semibold mt-8 mb-4 text-gray-900">Offers, Discounts & Promotions</h4>
                  <ul className="list-disc list-outside ml-6 space-y-2 mt-4">
                    <li>Promotional codes and discounts are valid for limited periods and may have specific conditions.</li>
                    <li>Offers cannot be combined unless explicitly stated.</li>
                    <li>We reserve the right to withdraw or modify promotions at any time.</li>                    
                  </ul>
                  </li>
                  <li className="pl-2">
                  <h4 className="text-xl font-semibold mt-8 mb-4 text-gray-900">User Conduct</h4>
                  <p>
                    By using our platform, you agree not to:
                  </p>
                  <ul className="list-disc list-outside ml-6 space-y-2 mt-4">
                    <li>Misuse or attempt to hack our website/app.</li>
                    <li>Post false, misleading, or inappropriate content.</li>
                    <li>Interfere with the delivery process.</li>   
                    <li> Use another user’s account without permission.</li>                    
                  </ul>
                  <p>
                    Violation of these rules may result in account suspension or legal action.
                  </p>
                  </li>
                  <li className="pl-2">
                  <h4 className="text-xl font-semibold mt-8 mb-4 text-gray-900">Intellectual Property</h4>
                  <p>
                    All content on our platform — including logos, images, product listings, and software — is owned by GherTak. You may not copy, reproduce, or distribute any content without prior written permission.
                  </p>
                  </li>
                  <li className="pl-2">
                  <h4 className="text-xl font-semibold mt-8 mb-4 text-gray-900">Limitation of Liability</h4>
                  <p>
                    While we strive to provide reliable and high-quality service, GherTak is not liable for:
                  </p>
                  <ul className="list-disc list-outside ml-6 space-y-2 mt-4">
                    <li>Delays or failures due to events beyond our control (traffic, strikes, weather, etc.)</li>
                    <li>Losses resulting from misuse of our website/app</li>
                    <li>Indirect, incidental, or consequential damages</li>   
                                       
                  </ul>
                  <p>
                    Our total liability shall not exceed the amount paid for your order.
                  </p>
                  </li>
                  <li className="pl-2">
                  <h4 className="text-xl font-semibold mt-8 mb-4 text-gray-900">Privacy</h4>
                  <p>
                    Your personal data is handled in accordance with our Privacy Policy, which forms an integral part of these Terms & Conditions
                  </p>
                  </li>
                  <li className="pl-2">
                  <h4 className="text-xl font-semibold mt-8 mb-4 text-gray-900">Changes to Terms</h4>
                  <p>
                    We may update these Terms & Conditions from time to time. The updated version will be posted on our website, and continued use of our services implies acceptance of any changes.
                  </p>
                  </li>
                  <li className="pl-2">
                  <h4 className="text-xl font-semibold mt-8 mb-4 text-gray-900">Governing Law & Jurisdiction</h4>
                  <p>
                    These Terms & Conditions are governed by the laws of Pakistan. Any disputes arising under these terms shall be subject to the exclusive jurisdiction of the courts in Islamabad, Pakistan.
                  </p>
                  </li>
                  <li className="pl-2">
                  <h4 className="text-xl font-semibold mt-8 mb-4 text-gray-900">Contact Us</h4>
                  <p>
                    For questions, feedback, or complaints, please contact us:
                  </p>
                  <div className="text-left space-y-4">
                    {contacts.map((contact, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <span className="text-xl">{contact.icon}</span>
                        <div>
                          <div className="font-semibold text-gray-800">[{contact.label}]</div>
                          <div className="text-gray-600 mt-1">{contact.value}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  </li>
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

export default TermsOfService;