"use client";

import { TSocialLink } from "@/lib/validations";
import {
  Facebook,
  Github,
  Globe,
  Instagram,
  Link2,
  Linkedin,
  Mail,
  Twitter,
} from "lucide-react";
import { useEffect, useState } from "react";

const platformsIcon = [
  {
    name: "GitHub",
    icon: Github,
  },
  {
    name: "LinkedIn",
    icon: Linkedin,
  },
  {
    name: "Twitter",
    icon: Twitter,
  },
  {
    name: "Instagram",
    icon: Instagram,
  },
  {
    name: "Facebook",
    icon: Facebook,
  },
  {
    name: "Portfolio",
    icon: Globe,
  },
  {
    name: "Email",
    icon: Mail,
  },
  {
    name: "Other",
    icon: Link2,
  },
];

export function Footer() {
  const [socialMediaLinks, setSocialMediaLinks] = useState<TSocialLink[]>([]);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    // Fetch social media links from an API or configuration file
    const fetchSocialMediaLinks = async () => {
      try {
        const response = await fetch("/api/social-media");
        const data = await response.json();
        setSocialMediaLinks(data);
      } catch (error) {
        console.error("Error fetching social media links:", error);
      }
    };

    fetchSocialMediaLinks();
  }, []);

  return (
    <footer className="bg-card border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* About */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">About</h3>
            <p className="text-foreground/70 text-sm leading-relaxed">
              Web developer passionate about creating beautiful and functional
              digital experiences.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="#projects"
                  className="text-foreground/70 hover:text-foreground transition-colors"
                >
                  Projects
                </a>
              </li>
              <li>
                <a
                  href="#experience"
                  className="text-foreground/70 hover:text-foreground transition-colors"
                >
                  Experience
                </a>
              </li>
              <li>
                <a
                  href="#blog"
                  className="text-foreground/70 hover:text-foreground transition-colors"
                >
                  Blog
                </a>
              </li>
              <li>
                <a
                  href="#contact"
                  className="text-foreground/70 hover:text-foreground transition-colors"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="#"
                  className="text-foreground/70 hover:text-foreground transition-colors"
                >
                  Documentation
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-foreground/70 hover:text-foreground transition-colors"
                >
                  GitHub
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-foreground/70 hover:text-foreground transition-colors"
                >
                  Resume
                </a>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Connect</h3>
            <div className="flex gap-4">
              {socialMediaLinks.length > 0 &&
                socialMediaLinks?.map((link) => {
                  const IconComponent =
                    platformsIcon?.find((p) => p.name === link.platform)
                      ?.icon || Link2;
                  return (
                    <a
                      key={link.id}
                      href={link.url}
                      className="text-foreground/70 hover:text-primary transition-colors"
                      aria-label={link.platform}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <IconComponent size={20} />
                    </a>
                  );
                })}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border pt-8">
          <p className="text-center text-foreground/60 text-sm">
            © {currentYear} Portfolio. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
