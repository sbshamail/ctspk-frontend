"use client";

import { Screen } from "@/@core/layout";
import { BreadcrumbSimple } from "@/components/breadCrumb/BreadcrumbSimple";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const breadcrumbData = [
  { link: "/", name: "Home" },
  { link: "/return-policy", name: "Return Policy" },
];

const ReturnPolicy = () => {
  const [activeSection, setActiveSection] = useState("overview");

  const policySections = [
    {
      id: "overview",
      title: "Overview",
      content: "We want you to be completely satisfied with your purchase. If you're not happy with your order, we're here to help with our straightforward return process."
    },
    {
      id: "timeframe",
      title: "Return Timeframe",
      content: "You have 30 days from the date of delivery to return your items for a refund or exchange. Some items may have different return windows as specified at the time of purchase."
    },
    {
      id: "eligibility",
      title: "Eligibility Conditions",
      content: "To be eligible for a return, your item must be unused, in the same condition that you received it, and in its original packaging. You'll also need the receipt or proof of purchase."
    },
    {
      id: "non-returnable",
      title: "Non-Returnable Items",
      content: "Certain items cannot be returned for hygiene or safety reasons, including perishable goods, personalized items, intimate apparel, and digital products. Gift cards are also final sale."
    },
    {
      id: "process",
      title: "Return Process",
      content: "To start a return, contact our customer service team with your order number. We'll provide you with a return authorization and shipping instructions. Once we receive your return, we'll process your refund within 5-7 business days."
    },
    {
      id: "refunds",
      title: "Refunds",
      content: "Refunds will be issued to your original payment method. Shipping costs are non-refundable. If you received a damaged or incorrect item, we'll cover return shipping costs."
    },
    {
      id: "exchanges",
      title: "Exchanges",
      content: "We replace items if they are defective or damaged. If you need to exchange an item for a different size or color, contact us and we'll guide you through the process."
    },
    {
      id: "shipping",
      title: "Return Shipping",
      content: "Customers are responsible for return shipping costs unless the return is due to our error. We recommend using a trackable shipping service and purchasing shipping insurance for valuable items."
    }
  ];

  const quickFacts = [
    { fact: "Return Window", value: "30 Days" },
    { fact: "Refund Processing", value: "5-7 Business Days" },
    { fact: "Return Shipping", value: "Customer's Responsibility" },
    { fact: "Condition", value: "Unused & Original Packaging" }
  ];

  const commonQuestions = [
    {
      question: "How do I start a return?",
      answer: "Contact our customer service team with your order number and reason for return. We'll provide you with a return authorization and shipping instructions."
    },
    {
      question: "What if my item is damaged or defective?",
      answer: "If you receive a damaged or defective item, contact us immediately. We'll arrange for a free return and send you a replacement or issue a full refund, including shipping costs."
    },
    {
      question: "Can I return sale items?",
      answer: "Yes, sale items can be returned within 30 days of delivery, provided they meet our return conditions. Some clearance items may be marked as final sale."
    },
    {
      question: "How long does it take to receive my refund?",
      answer: "Once we receive your return, we process refunds within 5-7 business days. It may take additional time for the refund to appear on your account depending on your payment method."
    },
    {
      question: "What if I miss the 30-day return window?",
      answer: "Returns received after 30 days may be accepted at our discretion, possibly for store credit rather than a refund. Contact our customer service team to discuss your situation."
    },
    {
      question: "Do you offer free returns?",
      answer: "We offer free returns only when the return is due to our error (wrong item, damaged product, etc.). Otherwise, return shipping is the customer's responsibility."
    }
  ];

  const steps = [
    {
      step: 1,
      title: "Contact Support",
      description: "Reach out to our customer service team within 30 days of delivery"
    },
    {
      step: 2,
      title: "Get Authorization",
      description: "Receive your return authorization and shipping label if applicable"
    },
    {
      step: 3,
      title: "Package Items",
      description: "Pack items securely in original packaging with all accessories"
    },
    {
      step: 4,
      title: "Ship Return",
      description: "Ship your return using the provided instructions"
    },
    {
      step: 5,
      title: "Receive Refund",
      description: "Get your refund processed within 5-7 business days after we receive your return"
    }
  ];

  return (
    <Screen>
      <BreadcrumbSimple data={breadcrumbData} className="py-6" />
      
      <div className="pt-12">
        <div className="container mx-auto px-4">
          {/* Header Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Return Policy</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We stand behind our products and want you to be completely satisfied with your purchase. 
              Our return policy is designed to be fair and straightforward.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1">
              <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-24">
                <h3 className="font-semibold text-gray-900 mb-4">Policy Sections</h3>
                <nav className="space-y-2">
                  {policySections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                        activeSection === section.id
                          ? "bg-primary text-white"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {section.title}
                    </button>
                  ))}
                </nav>

                {/* Quick Facts */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-4">Quick Facts</h4>
                  <div className="space-y-3">
                    {quickFacts.map((item, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">{item.fact}</span>
                        <span className="text-sm font-medium text-gray-900">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Active Section Content */}
              <div className="bg-white border border-gray-200 rounded-lg p-8 mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {policySections.find(s => s.id === activeSection)?.title}
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  {policySections.find(s => s.id === activeSection)?.content}
                </p>
              </div>

              {/* Return Process Steps */}
              <div className="bg-white border border-gray-200 rounded-lg p-8 mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
                  Simple Return Process
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {steps.map((step) => (
                    <div key={step.step} className="text-center">
                      <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-3">
                        {step.step}
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
                      <p className="text-sm text-gray-600">{step.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* FAQ Section */}
              <div className="bg-white border border-gray-200 rounded-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Common Questions</h2>
                <div className="space-y-4">
                  {commonQuestions.map((item, index) => (
                    <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0">
                      <h3 className="font-semibold text-gray-900 mb-2">{item.question}</h3>
                      <p className="text-gray-600">{item.answer}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Important Notes */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
                <div className="flex items-start gap-4">
                  <div className="text-blue-600 text-xl">💡</div>
                  <div>
                    <h3 className="font-semibold text-blue-900 mb-2">Important Notes</h3>
                    <ul className="text-blue-800 space-y-2">
                      <li>• Keep your original packaging until you're sure you want to keep the item</li>
                      <li>• Take photos of damaged items before contacting support</li>
                      <li>• Include all original accessories and documentation with your return</li>
                      <li>• Use trackable shipping for your return package</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* CTA Section */}
              <div className="text-center mt-12 p-8 bg-gray-50 rounded-lg">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Ready to Start a Return?
                </h3>
                <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                  Have your order number ready and contact our support team to begin the return process.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button className="bg-primary text-white hover:bg-primary-dark">
                    Contact Support Team
                  </Button>
                  <Button variant="outline">
                    Check Order Status
                  </Button>
                </div>
                <p className="text-sm text-gray-500 mt-4">
                  Support available Monday-Friday, 9AM-6PM EST
                </p>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
            <div className="text-center p-6 border border-gray-200 rounded-lg">
              <div className="text-2xl mb-3">📧</div>
              <h4 className="font-semibold text-gray-900 mb-2">Email Support</h4>
              <p className="text-gray-600">returns@example.com</p>
              <p className="text-sm text-gray-500 mt-2">Response within 24 hours</p>
            </div>
            <div className="text-center p-6 border border-gray-200 rounded-lg">
              <div className="text-2xl mb-3">📞</div>
              <h4 className="font-semibold text-gray-900 mb-2">Phone Support</h4>
              <p className="text-gray-600">1-800-RETURNS</p>
              <p className="text-sm text-gray-500 mt-2">Mon-Fri, 9AM-6PM EST</p>
            </div>
            <div className="text-center p-6 border border-gray-200 rounded-lg">
              <div className="text-2xl mb-3">💬</div>
              <h4 className="font-semibold text-gray-900 mb-2">Live Chat</h4>
              <p className="text-gray-600">Available on website</p>
              <p className="text-sm text-gray-500 mt-2">Instant support during business hours</p>
            </div>
          </div>
        </div>
      </div>
    </Screen>
  );
};

export default ReturnPolicy;