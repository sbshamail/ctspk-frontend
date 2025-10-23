"use client";

import { Screen } from "@/@core/layout";
import { BreadcrumbSimple } from "@/components/breadCrumb/BreadcrumbSimple";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

const breadcrumbData = [
  { link: "/", name: "Home" },
  { link: "/support", name: "Customer Support" },
];

const CustomerSupport = () => {
  const [activeCategory, setActiveCategory] = useState("general");
  const [searchQuery, setSearchQuery] = useState("");

  const supportCategories = [
    {
      id: "general",
      name: "General Help",
      icon: "?",
      questions: [
        {
          question: "How do I create an account?",
          answer: "Click on the 'Sign Up' button in the top right corner, fill in your details, and verify your email address to get started."
        },
        {
          question: "What payment methods do you accept?",
          answer: "We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers for certain services."
        },
        {
          question: "How can I reset my password?",
          answer: "Click 'Forgot Password' on the login page, enter your email, and follow the instructions sent to your inbox."
        }
      ]
    },
    {
      id: "billing",
      name: "Billing & Payments",
      icon: "??",
      questions: [
        {
          question: "When will I be charged?",
          answer: "For subscriptions, you'll be charged on the same date each month or year based on your billing cycle. One-time purchases are charged immediately."
        },
        {
          question: "How do I update my payment method?",
          answer: "Go to your account settings, select 'Billing', and click 'Update Payment Method' to add or change your payment details."
        },
        {
          question: "Can I get a refund?",
          answer: "We offer a 30-day money-back guarantee for most services. Contact our support team with your order details to request a refund."
        }
      ]
    },
    {
      id: "technical",
      name: "Technical Support",
      icon: "??",
      questions: [
        {
          question: "The website is not loading properly",
          answer: "Try clearing your browser cache and cookies, or use a different browser. If the issue persists, contact our technical team."
        },
        {
          question: "How do I report a bug?",
          answer: "Use the 'Report Issue' feature in your account settings or email our technical team with details about the problem you're experiencing."
        },
        {
          question: "Is there a mobile app?",
          answer: "Yes! You can download our mobile app from the Apple App Store or Google Play Store for a better mobile experience."
        }
      ]
    },
    {
      id: "account",
      name: "Account Management",
      icon: "??",
      questions: [
        {
          question: "How do I delete my account?",
          answer: "Go to Account Settings, scroll to the bottom, and click 'Delete Account'. Note: This action is permanent and cannot be undone."
        },
        {
          question: "Can I change my username?",
          answer: "Yes, you can change your username once every 30 days from your account settings under the 'Profile' section."
        },
        {
          question: "How do I update my email address?",
          answer: "Navigate to Account Settings, click on 'Email', and follow the verification process to update your email address."
        }
      ]
    }
  ];

  const contactMethods = [
    {
      icon: "??",
      title: "Email Support",
      description: "Send us an email and we'll respond within 24 hours",
      details: "support@example.com",
      action: "Send Email"
    },
    {
      icon: "??",
      title: "Live Chat",
      description: "Get instant help from our support team",
      details: "Available 9AM-6PM EST",
      action: "Start Chat"
    },
    {
      icon: "??",
      title: "Phone Support",
      description: "Speak directly with our support agents",
      details: "+1 (555) 123-HELP",
      action: "Call Now"
    },
    {
      icon: "??",
      title: "Help Center",
      description: "Browse our comprehensive knowledge base",
      details: "500+ articles",
      action: "Browse Articles"
    }
  ];

  const filteredQuestions = supportCategories
    .find(cat => cat.id === activeCategory)
    ?.questions.filter(q => 
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.answer.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  return (
    <Screen>
      <BreadcrumbSimple data={breadcrumbData} className="py-6" />
      
      <div className="pt-12">
        <div className="container mx-auto px-4">
          {/* Header Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">How Can We Help You?</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get answers to your questions, troubleshoot issues, or contact our support team directly.
            </p>
          </div>

          {/* Search Section */}
          <div className="max-w-2xl mx-auto mb-16">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search for answers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-0"
              />
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                <SearchIcon />
              </div>
            </div>
          </div>

          {/* Quick Help Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {contactMethods.map((method, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-xl p-6 text-center hover:shadow-lg transition-shadow duration-300"
              >
                <div className="text-3xl mb-4">{method.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {method.title}
                </h3>
                <p className="text-gray-600 text-sm mb-3">
                  {method.description}
                </p>
                <p className="text-primary font-medium text-sm mb-4">
                  {method.details}
                </p>
                <Button variant="outline" className="w-full">
                  {method.action}
                </Button>
              </div>
            ))}
          </div>

          {/* FAQ Section */}
          <div className="mb-16">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
              <p className="text-gray-600">Quick answers to common questions</p>
            </div>

            {/* Category Tabs */}
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {supportCategories.map((category) => (
                <Button
                  key={category.id}
                  variant={activeCategory === category.id ? "default" : "outline"}
                  onClick={() => setActiveCategory(category.id)}
                  className="flex items-center gap-2 px-6"
                >
                  <span>{category.icon}</span>
                  {category.name}
                </Button>
              ))}
            </div>

            {/* FAQ Items */}
            <div className="max-w-4xl mx-auto space-y-4">
              {filteredQuestions.length > 0 ? (
                filteredQuestions.map((item, index) => (
                  <FAQItem
                    key={index}
                    question={item.question}
                    answer={item.answer}
                  />
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No results found for "{searchQuery}"</p>
                  <Button 
                    variant="outline" 
                    onClick={() => setSearchQuery("")}
                    className="mt-4"
                  >
                    Clear Search
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Contact Form Section */}
          <div className="bg-gray-50 rounded-2xl p-8 mb-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Still Need Help?</h2>
                <p className="text-gray-600 mb-6">
                  Can't find what you're looking for? Send us a message and our support team 
                  will get back to you as soon as possible.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-gray-700">Typically responds within 2 hours</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-gray-700">Available 24/7 for urgent issues</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-gray-700">Expert assistance guaranteed</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm">
                <form className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name *
                      </label>
                      <Input
                        type="text"
                        id="name"
                        placeholder="Enter your name"
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address *
                      </label>
                      <Input
                        type="email"
                        id="email"
                        placeholder="Enter your email"
                        className="w-full"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                      Subject *
                    </label>
                    <Input
                      type="text"
                      id="subject"
                      placeholder="What can we help you with?"
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                      Category *
                    </label>
                    <select
                      id="category"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-primary focus:ring-1 focus:ring-primary"
                    >
                      <option value="">Select a category</option>
                      <option value="general">General Inquiry</option>
                      <option value="billing">Billing Issue</option>
                      <option value="technical">Technical Problem</option>
                      <option value="account">Account Help</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                      Message *
                    </label>
                    <Textarea
                      id="message"
                      rows={5}
                      placeholder="Please describe your issue in detail..."
                      className="w-full"
                    />
                  </div>

                  <Button type="submit" className="w-full bg-primary text-white">
                    Send Message
                  </Button>
                </form>
              </div>
            </div>
          </div>

          {/* Support Status */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 mb-16">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <div>
                  <h3 className="font-semibold text-gray-900">All Systems Operational</h3>
                  <p className="text-gray-600 text-sm">Last updated: Just now</p>
                </div>
              </div>
              <Button variant="outline">View Status Page</Button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h3>
            <div className="flex flex-wrap justify-center gap-4">
              <Button variant="link" className="text-primary">Privacy Policy</Button>
              <Button variant="link" className="text-primary">Terms of Service</Button>
              <Button variant="link" className="text-primary">Community Forum</Button>
              <Button variant="link" className="text-primary">API Documentation</Button>
            </div>
          </div>
        </div>
      </div>
    </Screen>
  );
};

// FAQ Item Component
const FAQItem = ({ question, answer }: { question: string; answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
      >
        <span className="font-medium text-gray-900">{question}</span>
        <span className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          <ChevronDownIcon />
        </span>
      </button>
      {isOpen && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <p className="text-gray-600 leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  );
};

// Icons
const SearchIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

export default CustomerSupport;