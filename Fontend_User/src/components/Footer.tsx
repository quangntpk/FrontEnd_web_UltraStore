
import { cn } from "@/lib/utils";

const Footer = () => {
  const year = new Date().getFullYear();
  
  return (
    <footer className="py-16 px-6 border-t border-border">
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-16">
          <div>
            <div className="mb-4">
              <span className="text-xl font-medium tracking-tight">UltraStore</span>
            </div>
            <p className="text-muted-foreground max-w-xs">
            Áp dụng sự đơn giản trong thiết kế nhưng vẫn duy trì tính năng và tính thanh lịch.
            </p>
          </div>
          
          {[
            {
              title: "Sản phẩm",
              links: ["Tính năng", "Giá cả", "Cập nhật", "Chương trình", "Yêu thích"],
            },
            {
              title: "Công ty",
              links: ["Giới thiệu", "Nghề nghiệp", "Liên hệ", "Báo chí", "Đối tác"],
            },
            {
              title: "Tài nguyên",
              links: ["Blog", "Bản tin", "Hỗ trợ", "Tài liệu", "Pháp lý"],
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
            © {year} Tối giản. Đảm bảo quyền lợi của mọi người.
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
