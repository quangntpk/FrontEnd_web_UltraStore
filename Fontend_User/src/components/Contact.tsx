import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Send, Mail, Phone, MapPin } from "lucide-react";
import ReCAPTCHA from "react-google-recaptcha";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const Contact = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const handleRecaptchaChange = (token: string | null) => {
    setCaptchaToken(token);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    setPhone(value);
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = { name: "", email: "", phone: "", message: "" };

    if (name.length < 5) {
      newErrors.name = "Tên phải có ít nhất 5 ký tự";
      isValid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      newErrors.email = "Email không hợp lệ";
      isValid = false;
    }

    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone)) {
      newErrors.phone = "Số điện thoại phải là 10 chữ số";
      isValid = false;
    }

    if (message.length < 5) {
      newErrors.message = "Nội dung phải có ít nhất 5 ký tự";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: "Thông tin không hợp lệ",
        description: "Vui lòng kiểm tra lại các trường thông tin",
        variant: "destructive",
      });
      return;
    }

    if (!captchaToken) {
      toast({
        title: "Xác minh reCAPTCHA",
        description: "Vui lòng xác minh reCAPTCHA",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        HoTen: name,
        Email: email,
        Sdt: phone,
        NoiDung: message,
        TrangThai: "New",
        ReCaptchaToken: captchaToken,
      };

      const response = await fetch("http://localhost:5261/api/LienHe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(errorMessage);
      }

      toast({
        title: "Gửi thành công!",
        description: "Chúng tôi sẽ liên hệ với bạn sớm nhất có thể.",
      });

      setName("");
      setEmail("");
      setPhone("");
      setMessage("");
      setCaptchaToken(null);
      setErrors({ name: "", email: "", phone: "", message: "" });
      recaptchaRef.current?.reset();
    } catch (error) {
      toast({
        title: "Có lỗi xảy ra",
        description:
          error instanceof Error
            ? error.message
            : "Không thể gửi tin nhắn của bạn. Vui lòng thử lại sau.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-20 px-6" style={{ marginTop: "40px" }}>
      <Navigation />
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Liên hệ với chúng tôi</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Hãy để lại thông tin, chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
          <div className="colorful-card rounded-xl p-8 md:sticky md:top-28">
            <h3 className="text-xl font-semibold mb-6">Thông tin liên hệ</h3>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-full">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium mb-1">Email</h4>
                  <p className="text-muted-foreground">nguyenhuythien9a1@gmail.com</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-full">
                  <Phone className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium mb-1">Điện thoại</h4>
                  <p className="text-muted-foreground">+84 383 777 823</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-full">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium mb-1">Địa chỉ</h4>
                  <p className="text-muted-foreground">
                    245 Hà Huy Tập, Tân Lợi<br />
                    Thành phố Buôn Ma Thuột, Việt Nam
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-6">
              <h4 className="font-medium mb-2">Bản đồ</h4>
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d12210.24681885916!2d108.075659!3d12.7105609!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3171f7b6e379b675%3A0x72662967145555c0!2zVHJ1b25nIENhb8OqIGRhw7MgcG9seXRlY2huaWM!5e0!3m2!1svi!2s!4v1698473155913!5m2!1svi!2s"
                className="border-0 rounded w-full h-64"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>

          <div>
            <form onSubmit={handleSubmit} className="space-y-6 bg-background border rounded-xl p-8">
              <div className="space-y-2">
                <Label htmlFor="name">Họ và tên</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nhập họ và tên"
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Nhập email của bạn"
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Số điện thoại</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={handlePhoneChange}
                  placeholder="Nhập số điện thoại của bạn"
                  maxLength={10}
                  className={errors.phone ? "border-red-500" : ""}
                />
                {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Nội dung</Label>
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Nhập nội dung cần hỗ trợ"
                  rows={5}
                  className={`flex min-h-20 w-full rounded-md border bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm ${
                    errors.message ? "border-red-500" : "border-input"
                  }`}
                />
                {errors.message && <p className="text-red-500 text-sm">{errors.message}</p>}
              </div>
              <div>
                <ReCAPTCHA
                  ref={recaptchaRef}
                  sitekey="6LdMzlEqAAAAAIRD7o-nvN9bH3jPvKLaKaGW8xD4"
                  onChange={handleRecaptchaChange}
                />
              </div>
              <Button type="submit" disabled={isSubmitting} className="w-full gradient-bg">
                {isSubmitting ? "Đang gửi..." : (
                  <>
                    <Send className="h-4 w-4 mr-2" /> Gửi tin nhắn
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
      <div style={{ marginTop: "40px", marginBottom: "-100px" }}>
        <Footer />
      </div>
    </section>
  );
};

export default Contact;