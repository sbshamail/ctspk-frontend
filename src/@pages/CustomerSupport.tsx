"use client";

import { Screen } from "@/@core/layout";
import { BreadcrumbSimple } from "@/components/breadCrumb/BreadcrumbSimple";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import React, { useState, useEffect } from "react";
import { useGetGroupedFAQsQuery } from "@/store/services/faqApi";
import { useSubmitSupportMutation } from "@/store/services/contactApi";
import LayoutSkeleton from "@/components/loaders/LayoutSkeleton";

const breadcrumbData = [
  { link: "/", name: "Home" },
  { link: "/support", name: "Customer Support" },
];

const CustomerSupport = () => {
  const [activeCategory, setActiveCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    category: "",
    message: ""
  });
  const [responseMessage, setResponseMessage] = useState<{type: 'success' | 'error', message: string} | null>(null);

  const { data: faqData, isLoading: faqLoading, error: faqError } = useGetGroupedFAQsQuery();
  const [submitSupport, { isLoading: submitting }] = useSubmitSupportMutation();

  // Map API data to supportCategories format
  const supportCategories = React.useMemo(() => {
    if (!faqData?.data || !Array.isArray(faqData.data)) return [];

    return faqData.data.map(faqType => ({
      id: faqType.id,
      name: faqType.name,
      icon: faqType.icon || "?",
      questions: faqType.questions.map(faq => ({
        question: faq.question,
        answer: faq.answer
      }))
    }));
  }, [faqData]);

  // Set initial active category when data loads
  useEffect(() => {
    if (supportCategories.length > 0 && !activeCategory) {
      setActiveCategory(supportCategories[0].id);
    }
  }, [supportCategories, activeCategory]);

  // Auto-dismiss response message after 10 seconds
  useEffect(() => {
    if (responseMessage) {
      const timer = setTimeout(() => {
        setResponseMessage(null);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [responseMessage]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await submitSupport(formData).unwrap();

      if (response.success) {
        setResponseMessage({
          type: 'success',
          message: response.detail || 'Your message has been sent successfully! We will get back to you soon.'
        });
        // Reset form
        setFormData({
          name: "",
          email: "",
          subject: "",
          category: "",
          message: ""
        });
      } else {
        setResponseMessage({
          type: 'error',
          message: response.detail || 'Failed to send message. Please try again.'
        });
      }
    } catch (error: any) {
      setResponseMessage({
        type: 'error',
        message: error?.data?.detail || 'An error occurred. Please try again later.'
      });
    }
  };

  const contactMethods = [
    {
      icon: <EmailIcon />,
      title: "Email Support",
      description: "Send us an email and we'll respond within 24 hours",
      details: "support@ghertak.com",
      action: "Send Email"
    },
    {
      icon: <PhoneIcon />,
      title: "Phone Support",
      description: "Speak directly with our support agents",
      details: "+971 52 993 2054",
      action: "Call Now"
    },
    {
      icon: <HelpCenterIcon />,
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {contactMethods.map((method, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-xl p-6 text-center hover:shadow-lg transition-shadow duration-300 flex flex-col items-center"
              >
                <div className="text-3xl mb-4 text-primary">
                  {method.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {method.title}
                </h3>
                <p className="text-gray-600 text-sm mb-3 flex-grow">
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

            {faqLoading ? (
              <LayoutSkeleton />
            ) : faqError ? (
              <div className="text-center py-8">
                <p className="text-red-500">Failed to load FAQs. Please try again later.</p>
              </div>
            ) : (
              <>
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
                <div className="max-w-8xl mx-auto space-y-4">
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
              </>
            )}
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
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name *
                      </label>
                      <Input
                        type="text"
                        id="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Enter your name"
                        className="w-full"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address *
                      </label>
                      <Input
                        type="email"
                        id="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Enter your email"
                        className="w-full"
                        required
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
                      value={formData.subject}
                      onChange={handleInputChange}
                      placeholder="What can we help you with?"
                      className="w-full"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                      Category *
                    </label>
                    <select
                      id="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-primary focus:ring-1 focus:ring-primary"
                      required
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
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Please describe your issue in detail..."
                      className="w-full"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-primary text-white"
                    disabled={submitting}
                  >
                    {submitting ? "Sending..." : "Send Message"}
                  </Button>

                  {/* Response Message */}
                  {responseMessage && (
                    <div className={`p-4 rounded-lg ${
                      responseMessage.type === 'success'
                        ? 'bg-green-50 text-green-800 border border-green-200'
                        : 'bg-red-50 text-red-800 border border-red-200'
                    }`}>
                      <p className="text-sm font-medium">{responseMessage.message}</p>
                    </div>
                  )}
                </form>
              </div>
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

const EmailIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const PhoneIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);

const HelpCenterIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export default CustomerSupport;