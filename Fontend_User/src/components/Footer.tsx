
import { cn } from "@/lib/utils";

const Footer = () => {
  const year = new Date().getFullYear();
  
  return (
    <footer className="py-16 px-6 border-t border-border">
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-16">
          <div>
            <div className="mb-4">
              <span className="text-xl font-medium tracking-tight">Minimalist</span>
            </div>
            <p className="text-muted-foreground max-w-xs">
              Embracing simplicity in design while maintaining functionality and elegance.
            </p>
          </div>
          
          {[
            {
              title: "Product",
              links: ["Features", "Pricing", "Updates", "Beta Program", "Roadmap"],
            },
            {
              title: "Company",
              links: ["About", "Careers", "Contact", "Press", "Partners"],
            },
            {
              title: "Resources",
              links: ["Blog", "Newsletter", "Support", "Documentation", "Legal"],
            },
          ].map((group) => (
            <div key={group.title}>
              <h3 className="font-medium mb-4">{group.title}</h3>
              <ul className="space-y-3">
                {group.links.map((link) => (
                  <li key={link}>
                    <a 
                      href={`#${link.toLowerCase()}`}
                      className="text-muted-foreground hover-effect hover:text-foreground"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground mb-4 md:mb-0">
            © {year} Minimalist. All rights reserved.
          </p>
          
          <div className="flex gap-6">
            {["Twitter", "Instagram", "LinkedIn", "GitHub"].map((social) => (
              <a 
                key={social}
                href={`#${social.toLowerCase()}`}
                className="text-sm text-muted-foreground hover-effect hover:text-foreground"
              >
                {social}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
