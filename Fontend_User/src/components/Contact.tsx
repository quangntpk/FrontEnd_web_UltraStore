
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Send, Mail, Phone, MapPin } from "lucide-react";

const Contact = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !message) {
      toast({
        title: "Thiếu thông tin",
        description: "Vui lòng điền đầy đủ thông tin",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate API call
    try {
      // In a real app, you would send this data to your backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Gửi thành công!",
        description: "Chúng tôi sẽ liên hệ với bạn sớm nhất có thể.",
      });
      
      // Reset form
      setName("");
      setEmail("");
      setMessage("");
    } catch (error) {
      toast({
        title: "Có lỗi xảy ra",
        description: "Không thể gửi tin nhắn của bạn. Vui lòng thử lại sau.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-20 px-6">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Liên hệ với chúng tôi</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Hãy để lại thông tin, chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất
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
                  <p className="text-muted-foreground">contact@minimalist.com</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-full">
                  <Phone className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium mb-1">Điện thoại</h4>
                  <p className="text-muted-foreground">+84 123 456 789</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-full">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium mb-1">Địa chỉ</h4>
                  <p className="text-muted-foreground">
                    123 Nguyễn Huệ, Quận 1<br />
                    Thành phố Hồ Chí Minh, Việt Nam
                  </p>
                </div>
              </div>
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
                  placeholder="Nguyễn Văn A"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="message">Nội dung</Label>
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Nội dung tin nhắn của bạn"
                  rows={5}
                  className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                />
              </div>
              
              <Button type="submit" disabled={isSubmitting} className="w-full gradient-bg">
                {isSubmitting ? (
                  "Đang gửi..."
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" /> Gửi tin nhắn
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
