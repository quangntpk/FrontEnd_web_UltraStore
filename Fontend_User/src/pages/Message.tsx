import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MessageSquare, Trash2 } from "lucide-react";

// Hàm giả lập lấy danh sách người dùng (thay bằng API thực tế nếu có)
const fetchUsers = async () => {
  return [
    { id: "user1", name: "User One", isOnline: true },
    { id: "user2", name: "User Two", isOnline: false },
  ];
};

// Hàm lấy lịch sử tin nhắn từ backend
const fetchConversation = async (nguoiGuiId, nguoiNhanId) => {
  try {
    const response = await fetch(
      `http://localhost:5261/api/TinNhan/Conversation?nguoiGuiId=${nguoiGuiId}&nguoiNhanId=${nguoiNhanId}`
    );
    if (!response.ok) throw new Error("Lỗi khi lấy tin nhắn");
    return await response.json();
  } catch (error) {
    console.error(error);
    return [];
  }
};

const Message = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messageContent, setMessageContent] = useState("");
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);

  // Giả sử ID của người dùng hiện tại (lấy từ context hoặc auth nếu có)
  const currentUserId = "admin";

  // API endpoint để gửi tin nhắn
  const apiEndpoint = "http://localhost:5261/api/TinNhan/Send";

  // Lấy danh sách người dùng khi component khởi tạo
  useEffect(() => {
    fetchUsers().then(setUsers).catch(console.error);
  }, []);

  // Tải tin nhắn khi chọn người dùng
  useEffect(() => {
    if (selectedUser) {
      fetchConversation(currentUserId, selectedUser.id).then((data) => {
        const formattedMessages = data.map((msg) => ({
          id: msg.MaTinNhan,
          sender: msg.NguoiGuiId === currentUserId ? "Bạn" : selectedUser.name,
          recipient: msg.NguoiNhanId === currentUserId ? "Bạn" : selectedUser.name,
          content: msg.NoiDung,
          timestamp: new Date(msg.NgayTao).toLocaleTimeString(),
        }));
        setMessages(formattedMessages);
      });
    }
  }, [selectedUser]);

  // Gửi tin nhắn
  const handleSendMessage = async () => {
    if (!selectedUser || !messageContent.trim()) return;

    try {
      const payload = {
        NguoiGuiId: currentUserId, // ID người gửi (động)
        NguoiNhanId: selectedUser.id, // ID người nhận
        NoiDung: messageContent,
        NgayTao: new Date(),
        TrangThai: "Unread",
      };

      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Lỗi khi gửi tin nhắn");
      const result = await response.json();

      // Thêm tin nhắn vừa gửi vào danh sách
      setMessages((prev) => [
        ...prev,
        {
          id: result.MaTinNhan,
          sender: "Bạn",
          recipient: selectedUser.name,
          content: result.NoiDung,
          timestamp: new Date(result.NgayTao).toLocaleTimeString(),
        },
      ]);
      setMessageContent("");
    } catch (error) {
      console.error(error);
    }
  };

  // Xóa tin nhắn (local)
  const handleClearMessages = () => {
    setMessages([]);
    // Nếu muốn xóa trên backend, thêm API call tại đây
  };

  // Đóng modal và reset state
  const handleClose = () => {
    setIsOpen(false);
    setSelectedUser(null);
    setMessages([]);
    setMessageContent("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          Nhắn Tin
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-4xl p-0 overflow-hidden">
        <div className="flex h-[500px]">
          {/* Danh sách người dùng - Bên trái */}
          <div className="w-1/3 bg-gray-100 border-r border-gray-200 p-4 overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold">
                Danh Sách Người Dùng
              </DialogTitle>
            </DialogHeader>
            <div className="mt-4 space-y-2">
              {users.map((user) => (
                <div
                  key={user.id}
                  className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedUser?.id === user.id
                      ? "bg-blue-500 text-white"
                      : "bg-white hover:bg-gray-200"
                  }`}
                  onClick={() => setSelectedUser(user)}
                >
                  <div className="flex items-center gap-3 w-full">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        user.isOnline ? "bg-green-500" : "bg-gray-400"
                      }`}
                    />
                    <span className="text-sm font-medium">{user.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Khu vực nhắn tin - Bên phải */}
          <div className="w-2/3 flex flex-col">
            <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
              <h3 className="text-lg font-semibold">
                {selectedUser
                  ? `Trò chuyện với ${selectedUser.name}`
                  : "Chọn người để nhắn tin"}
              </h3>
              {selectedUser && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearMessages}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Xóa cuộc trò chuyện
                </Button>
              )}
            </div>

            {/* Hiển thị tin nhắn */}
            <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
              {selectedUser ? (
                messages.length === 0 ? (
                  <p className="text-muted-foreground text-center mt-10">
                    Chưa có tin nhắn nào với {selectedUser.name}.
                  </p>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${
                        msg.sender === "Bạn" ? "justify-end" : "justify-start"
                      } mb-4`}
                    >
                      <div
                        className={`max-w-[70%] p-3 rounded-lg shadow-sm ${
                          msg.sender === "Bạn"
                            ? "bg-blue-500 text-white"
                            : "bg-white text-gray-800"
                        }`}
                      >
                        <p className="text-sm font-semibold">{msg.sender}</p>
                        <p className="text-sm">{msg.content}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {msg.timestamp}
                        </p>
                      </div>
                    </div>
                  ))
                )
              ) : (
                <p className="text-muted-foreground text-center mt-10">
                  Vui lòng chọn một người dùng để bắt đầu nhắn tin.
                </p>
              )}
            </div>

            {/* Form nhập tin nhắn */}
            {selectedUser && (
              <div className="p-4 bg-white border-t border-gray-200">
                <div className="flex gap-2">
                  <Input
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                    placeholder="Nhập tin nhắn của bạn..."
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSendMessage();
                    }}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!messageContent.trim()}
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    Gửi
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="p-4 bg-white border-t border-gray-200">
          <Button variant="ghost" onClick={handleClose}>
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default Message;