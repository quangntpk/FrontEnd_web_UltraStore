import { cn } from "@/lib/utils";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="py-16 px-6 border-t border-border bg-purple-50">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <div className="mb-4">
              <span className="text-2xl font-bold tracking-tight text-purple-700">
                UltraStore
              </span>
            </div>
            <p className="text-purple-600 max-w-xs text-lg">
              Áp dụng sự đơn giản trong thiết kế nhưng vẫn duy trì tính năng và tính thanh lịch.
            </p>
          </div>
          {[
            {
              title: "Sản phẩm",
              links: ["Tính năng", "Giá cả", "Cập nhật", "Chương trình"],
            },
            {
              title: "Công ty",
              links: ["Giới thiệu", "Nghề nghiệp", "Liên hệ", "Đối tác"],
            },
            {
              title: "Tài nguyên",
              links: ["Blog", "Bản tin", "Hỗ trợ", "Pháp lý"],
            },
          ].map((group) => (
            <div key={group.title}>
              <h3 className="font-semibold mb-4 text-xl text-purple-700">
                {group.title}
              </h3>
              <ul className="space-y-3">
                {group.links.map((link) => (
                  <li key={link}>
                    <a
                      href={`#${link.toLowerCase()}`}
                      className="text-purple-500 hover-effect hover:text-purple-700 text-lg"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
};

export default Footer;