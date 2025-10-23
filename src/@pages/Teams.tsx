"use client";

import { Screen } from "@/@core/layout";
import { BreadcrumbSimple } from "@/components/breadCrumb/BreadcrumbSimple";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useState } from "react";

const breadcrumbData = [
  { link: "/", name: "Home" },
  { link: "/team", name: "Our Team" },
];

interface TeamMember {
  id: number;
  name: string;
  position: string;
  department: string;
  image: string;
  bio: string;
  social: {
    linkedin?: string;
    twitter?: string;
    github?: string;
    email?: string;
  };
}

const TeamPage = () => {
  const teamMembers: TeamMember[] = [
    {
      id: 1,
      name: "Sarah Johnson",
      position: "CEO & Founder",
      department: "Leadership",
      image: "/team/ceo.jpg",
      bio: "With over 15 years of experience in the industry, Sarah leads our company with vision and passion for innovation.",
      social: {
        linkedin: "https://linkedin.com/in/sarahjohnson",
        twitter: "https://twitter.com/sarahjohnson",
        email: "sarah@example.com",
      },
    },
    {
      id: 2,
      name: "Michael Chen",
      position: "CTO",
      department: "Technology",
      image: "/team/cto.jpg",
      bio: "Michael drives our technical strategy and ensures we stay at the forefront of technological advancements.",
      social: {
        linkedin: "https://linkedin.com/in/michaelchen",
        github: "https://github.com/michaelchen",
        email: "michael@example.com",
      },
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      position: "Head of Design",
      department: "Design",
      image: "/team/design-lead.jpg",
      bio: "Emily brings creative vision to our products, ensuring exceptional user experiences and beautiful interfaces.",
      social: {
        linkedin: "https://linkedin.com/in/emilyrodriguez",
        twitter: "https://twitter.com/emilyrodriguez",
        email: "emily@example.com",
      },
    },
    {
      id: 4,
      name: "David Kim",
      position: "Senior Developer",
      department: "Engineering",
      image: "/team/developer-1.jpg",
      bio: "David specializes in frontend development and creates seamless, responsive web applications.",
      social: {
        linkedin: "https://linkedin.com/in/davidkim",
        github: "https://github.com/davidkim",
        email: "david@example.com",
      },
    },
    {
      id: 5,
      name: "Lisa Thompson",
      position: "Product Manager",
      department: "Product",
      image: "/team/pm.jpg",
      bio: "Lisa bridges the gap between business needs and technical solutions, delivering products users love.",
      social: {
        linkedin: "https://linkedin.com/in/lisathompson",
        email: "lisa@example.com",
      },
    },
    {
      id: 6,
      name: "Alex Martinez",
      position: "Marketing Director",
      department: "Marketing",
      image: "/team/marketing.jpg",
      bio: "Alex crafts compelling brand stories and drives growth through innovative marketing strategies.",
      social: {
        linkedin: "https://linkedin.com/in/alexmartinez",
        twitter: "https://twitter.com/alexmartinez",
        email: "alex@example.com",
      },
    },
    {
      id: 7,
      name: "Rachel Green",
      position: "UX Researcher",
      department: "Design",
      image: "/team/ux-researcher.jpg",
      bio: "Rachel conducts user research to ensure our products meet real user needs and solve genuine problems.",
      social: {
        linkedin: "https://linkedin.com/in/rachelgreen",
        email: "rachel@example.com",
      },
    },
    {
      id: 8,
      name: "James Wilson",
      position: "DevOps Engineer",
      department: "Engineering",
      image: "/team/devops.jpg",
      bio: "James ensures our infrastructure is scalable, reliable, and secure for millions of users worldwide.",
      social: {
        linkedin: "https://linkedin.com/in/jameswilson",
        github: "https://github.com/jameswilson",
        email: "james@example.com",
      },
    },
  ];

  const departments = Array.from(new Set(teamMembers.map(member => member.department)));
  const [selectedDepartment, setSelectedDepartment] = useState<string>("All");

  const filteredMembers = selectedDepartment === "All" 
    ? teamMembers 
    : teamMembers.filter(member => member.department === selectedDepartment);

  return (
    <Screen>
      <BreadcrumbSimple data={breadcrumbData} className="py-6" />
      <div className="pt-12">
        <div className="container mx-auto px-4">
          {/* Header Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Meet Our Team</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We're a diverse group of passionate professionals dedicated to delivering 
              exceptional results for our clients and pushing the boundaries of innovation.
            </p>
          </div>

          {/* Department Filter */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <Button
              variant={selectedDepartment === "All" ? "default" : "outline"}
              onClick={() => setSelectedDepartment("All")}
              className="px-6"
            >
              All Teams
            </Button>
            {departments.map((department) => (
              <Button
                key={department}
                variant={selectedDepartment === department ? "default" : "outline"}
                onClick={() => setSelectedDepartment(department)}
                className="px-6"
              >
                {department}
              </Button>
            ))}
          </div>

          {/* Team Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-16">
            {filteredMembers.map((member) => (
              <div
                key={member.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden group"
              >
                {/* Member Image */}
                <div className="relative h-80 bg-gray-200 overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-300 flex items-center justify-center">
                    <span className="text-gray-400 text-lg">Team Member</span>
                  </div>
                  {/* You can replace the above div with an actual Image component:
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  */}
                </div>

                {/* Member Info */}
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">
                    {member.name}
                  </h3>
                  <p className="text-primary font-medium mb-2">{member.position}</p>
                  <p className="text-sm text-gray-500 mb-3">{member.department}</p>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {member.bio}
                  </p>

                  {/* Social Links */}
                  <div className="flex space-x-3">
                    {member.social.linkedin && (
                      <a
                        href={member.social.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        <LinkedInIcon />
                      </a>
                    )}
                    {member.social.twitter && (
                      <a
                        href={member.social.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-blue-400 transition-colors"
                      >
                        <TwitterIcon />
                      </a>
                    )}
                    {member.social.github && (
                      <a
                        href={member.social.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-gray-700 transition-colors"
                      >
                        <GitHubIcon />
                      </a>
                    )}
                    {member.social.email && (
                      <a
                        href={`mailto:${member.social.email}`}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <EmailIcon />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Stats Section */}
          <div className="bg-gray-50 rounded-2xl p-12 mb-16">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-primary mb-2">50+</div>
                <div className="text-gray-600">Team Members</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary mb-2">15+</div>
                <div className="text-gray-600">Countries</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary mb-2">98%</div>
                <div className="text-gray-600">Client Satisfaction</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary mb-2">24/7</div>
                <div className="text-gray-600">Support</div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center bg-primary rounded-2xl p-12 text-white">
            <h2 className="text-3xl font-bold mb-4">Join Our Team</h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              We're always looking for talented individuals to join our growing team. 
              Check out our open positions and become part of our success story.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                variant="secondary"
                className="bg-white text-primary hover:bg-gray-100"
              >
                View Open Positions
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-primary"
              >
                Contact HR
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Screen>
  );
};

// Social Media Icons
const LinkedInIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

const TwitterIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
  </svg>
);

const GitHubIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
  </svg>
);

const EmailIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
  </svg>
);

export default TeamPage;