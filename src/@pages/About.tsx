"use client";

import { Screen } from "@/@core/layout";
import { BreadcrumbSimple } from "@/components/breadCrumb/BreadcrumbSimple";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useState } from "react";
import Link from "next/link";

const breadcrumbData = [
  { link: "/", name: "Home" },
  { link: "/about", name: "About Us" },
];

const AboutUs = () => {
  const [activeTab, setActiveTab] = useState("mission");

  const stats = [
    { number: "50+", label: "Team Members" },
    { number: "1000+", label: "Happy Clients" },
    { number: "15+", label: "Countries" },
    { number: "98%", label: "Success Rate" },
  ];

  const values = [
    {
      icon: "🎯",
      title: "Excellence",
      description: "We strive for excellence in everything we do, delivering the highest quality solutions to our clients."
    },
    {
      icon: "🤝",
      title: "Collaboration",
      description: "We believe in the power of teamwork and building strong partnerships with our clients and community."
    },
    {
      icon: "💡",
      title: "Innovation",
      description: "We embrace creativity and continuously seek new ways to solve problems and drive progress."
    },
    {
      icon: "❤️",
      title: "Integrity",
      description: "We conduct our business with honesty, transparency, and respect for all stakeholders."
    },
  ];

  const timeline = [
    {
      year: "2018",
      title: "Company Founded",
      description: "Started with a small team and big dreams to revolutionize the industry."
    },
    {
      year: "2019",
      title: "First Major Client",
      description: "Landed our first enterprise client, marking a significant milestone in our growth."
    },
    {
      year: "2020",
      title: "Global Expansion",
      description: "Expanded our operations to serve clients across three continents."
    },
    {
      year: "2022",
      title: "Product Launch",
      description: "Launched our flagship product, receiving industry recognition and awards."
    },
    {
      year: "2024",
      title: "Current Growth",
      description: "Continuing to innovate and serve clients worldwide with cutting-edge solutions."
    },
  ];
  const values2 = [
    {
      title: "Easy",
      description: "We simplify life by removing friction for consumers and partners."
    },
    {
      title: "Reliable",
      description: "We deliver what we promise with consistent quality and build trust with every interaction."
    },
    {
      title: "Ownership", 
      description: "We take responsibility for outcomes and consumer experience."
    }
  ];
  return (
    <Screen>
      <BreadcrumbSimple data={breadcrumbData} className="py-6" />
      
      {/* Mission & Vision Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Purpose</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              To transform everyday household shopping into an easy, reliable , enjoyable, and delightful experience through consistent fulfilment through technology and human touch.
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            <div className="flex border-b border-gray-200 mb-8">
              <button
                onClick={() => setActiveTab("mission")}
                className={`px-6 py-3 font-medium text-lg border-b-2 transition-colors ${
                  activeTab === "mission"
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Our Mission
              </button>
              <button
                onClick={() => setActiveTab("vision")}
                className={`px-6 py-3 font-medium text-lg border-b-2 transition-colors ${
                  activeTab === "vision"
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Our Vision
              </button>
              <button
                onClick={() => setActiveTab("everyday")}
                className={`px-6 py-3 font-medium text-lg border-b-2 transition-colors ${
                  activeTab === "everyday"
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Our everyday LIFE
              </button>
              <button
                onClick={() => setActiveTab("culture")}
                className={`px-6 py-3 font-medium text-lg border-b-2 transition-colors ${
                  activeTab === "culture"
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Our Culture
              </button>
              <button
                onClick={() => setActiveTab("Leadership")}
                className={`px-6 py-3 font-medium text-lg border-b-2 transition-colors ${
                  activeTab === "Leadership"
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Leadership We Demonstrate
              </button>
              <button
                onClick={() => setActiveTab("People")}
                className={`px-6 py-3 font-medium text-lg border-b-2 transition-colors ${
                  activeTab === "People"
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Our People
              </button>
            </div>

            <div className="text-center">
              {activeTab === "mission" && (
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-gray-900">Empowering Progress Through Innovation</h3>
                  <p className="text-lg text-gray-600 leading-relaxed text-left">
                    Our mission is to deliver cutting-edge solutions that solve complex challenges, 
                    empower businesses to thrive in the digital age, and create meaningful impact 
                    for our clients and their customers. We combine technical expertise with 
                    creative thinking to build products that matter.
                  </p>
                </div>
              )}

              {activeTab === "vision" && (
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-gray-900">Shaping a Better Future</h3>
                  <p className="text-lg text-gray-600 leading-relaxed  text-left">
                    We envision a world where technology seamlessly enhances human potential, 
                    where businesses operate with greater efficiency and purpose, and where 
                    innovative solutions create sustainable value for generations to come. 
                    We strive to be the catalyst for positive change in every industry we touch.
                  </p>
                </div>
              )}
              {activeTab === "everyday" && (
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-gray-900">Our everyday LIFE</h3>
                  <p className="text-lg text-gray-600 leading-relaxed text-left">
                    <ol className="list-decimal list-outside ml-6 space-y-2">
                      {values2.map((value, index) => (
                        <li key={index} className="pl-2">
                          <strong>{value.title}:</strong> {value.description}
                        </li>
                      ))}
                    </ol>
                  </p>
                </div>
              )}
              {activeTab === "culture" && (
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-gray-900">Our culture</h3>
                  <p className="text-lg text-gray-600 leading-relaxed text-left">
                    We are known for continuous learning, data-driven decision-making, and bold experimentation. Our teams collaborate across operations, technology, and partner management to respond rapidly to real-world insights. We celebrate curiosity, encourage feedback, and empower people to make decisions close to the consumer.
                    <ul className="list-disc list-outside ml-6 space-y-2 mt-4">
                      <li  className="pl-2">Human-centric, digitally fluent, and purpose-driven.</li>
                      <li  className="pl-2">A place where everyone’s voice matters</li>
                      <li  className="pl-2">Performance and kindness coexist; learning never stops.</li>
                      <li  className="pl-2">Teams delight customers and enable each other.</li>
                      </ul>
                  </p>
                </div>
              )}
              {activeTab === "Leadership" && (
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-gray-900">Leadership We Demonstrate</h3>
                  <p className="text-lg text-gray-600 leading-relaxed  text-left">
                    Our leaders are digitally confident, emotionally intelligent, and relentlessly consumer-centric, shaping Gher Tak into one of Pakistan’s most admired tech-enabled consumer service brands.
                    <ul className="list-disc list-outside ml-6 space-y-2 mt-4">
                      <li  className="pl-2">Inspire trust through transparency and consistency.</li>
                      <li  className="pl-2">Foster innovation with safe experimentation and rapid iteration.</li>
                      <li  className="pl-2">Balance digital precision with human empathy.</li>
                      <li  className="pl-2">Create clarity amid complexity and act with accountability.</li>
                      </ul>
                  </p>
                </div>
              )}
              {activeTab === "People" && (
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-gray-900">Our People</h3>
                  <p className="text-lg text-gray-600 leading-relaxed  text-left">
                    Our people are the energy behind Gher Tak’s promise to every household. They are riders, planners, designers, technologists, and dreamers who share one mission: to make everyday life simpler for our consumers. We invest in people who believe that technology should serve humanity, not replace it.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Values</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div
                key={index}
                className="text-center p-6 rounded-lg hover:shadow-lg transition-shadow duration-300"
              >
                <div className="text-4xl mb-4">{value.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {value.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      

      {/* CTA Section */}
      <section className="py-16 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Work Together?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Let's discuss how we can help you achieve your goals and drive your business forward.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              variant="secondary"
              className="bg-white text-primary hover:bg-gray-100"
              asChild
            >
              <Link href="/contact">  
              Get In Touch
              </Link>
            </Button>            
          </div>
        </div>
      </section>

      
    </Screen>
  );
};

export default AboutUs;