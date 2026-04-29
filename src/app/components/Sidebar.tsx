import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Stethoscope, Settings, Clock, Trash2 } from "lucide-react";
import { Link } from "react-router";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onTriageStart?: () => void;
}

export function Sidebar({ isOpen, onClose, onTriageStart }: SidebarProps) {
  const [recentChats, setRecentChats] = useState([
    { id: "1", title: "关于运动计划的问题", time: "2小时前" },
    { id: "2", title: "饮食建议咨询", time: "昨天" },
  ]);

  const [longPressId, setLongPressId] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleTouchStart = useCallback((id: string) => {
    longPressTimer.current = setTimeout(() => {
      setLongPressId(id);
    }, 500);
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const handleDeleteOne = (id: string) => {
    setRecentChats(prev => prev.filter(c => c.id !== id));
    setLongPressId(null);
  };

  const handleClearAll = () => {
    setRecentChats([]);
    setShowClearConfirm(false);
  };

  return (
    <>
      {/* 遮罩层 */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.3)"
          }}
          onClick={onClose}
        />
      )}

      {/* 侧边栏 */}
      <motion.div
        initial={{ x: "-100%" }}
        animate={{ x: isOpen ? 0 : "-100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed top-0 left-0 h-full w-80 z-50 overflow-y-auto backdrop-blur-xl"
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.98)",
          boxShadow: "4px 0 20px rgba(0, 0, 0, 0.05)"
        }}
      >
        <div style={{ padding: "24px" }}>
          {/* 头部 */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center text-xl"
                style={{
                  background: "linear-gradient(135deg, #2B5BFF 0%, #8B5CF6 100%)",
                  color: "#FFFFFF",
                  fontWeight: 600
                }}
              >
                张
              </div>
              <div>
                <div style={{ fontWeight: 500, fontSize: "15px", color: "#1A1A1A" }}>张小明</div>
                <div style={{ fontSize: "13px", color: "#8A8A93" }}>体重管理中</div>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="p-2 rounded-lg transition-all"
              style={{
                backgroundColor: "transparent"
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#EAEBFF"}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
            >
              <X className="w-5 h-5" style={{ color: "#1A1A1A" }} />
            </button>
          </div>

          {/* 主要功能入口 */}
          <div className="space-y-2 mb-8">
            <button
              onClick={() => {
                onClose();
                onTriageStart?.();
              }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all w-full"
              style={{
                backgroundColor: "transparent"
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#EAEBFF"}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
            >
              <Stethoscope className="w-5 h-5" style={{ color: "#2B5BFF" }} />
              <span style={{ fontSize: "14px", color: "#1A1A1A", fontWeight: 500 }}>智能导诊</span>
            </button>
            <Link
              to="/profile"
              onClick={onClose}
              className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all"
              style={{
                backgroundColor: "transparent"
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#EAEBFF"}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
            >
              <Settings className="w-5 h-5" style={{ color: "#2B5BFF" }} />
              <span style={{ fontSize: "14px", color: "#1A1A1A", fontWeight: 500 }}>个人中心</span>
            </Link>
          </div>

          {/* 最近对话记录 */}
          <div>
            <div
              className="flex items-center justify-between mb-3"
            >
              <div
                className="flex items-center gap-2"
                style={{
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "#8A8A93"
                }}
              >
                <Clock className="w-4 h-4" />
                最近对话记录
              </div>
              {recentChats.length > 0 && (
                <button
                  onClick={() => setShowClearConfirm(true)}
                  className="flex items-center gap-1 transition-colors"
                  style={{
                    fontSize: "12px",
                    color: "#C0C0C8",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    padding: "2px 4px"
                  }}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  清空
                </button>
              )}
            </div>
            <div className="space-y-2">
              <AnimatePresence>
                {recentChats.map((chat) => (
                  <motion.div
                    key={chat.id}
                    layout
                    initial={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    transition={{ duration: 0.25 }}
                    className="relative"
                    onTouchStart={() => handleTouchStart(chat.id)}
                    onTouchEnd={handleTouchEnd}
                    onTouchCancel={handleTouchEnd}
                    onMouseDown={() => handleTouchStart(chat.id)}
                    onMouseUp={handleTouchEnd}
                    onMouseLeave={handleTouchEnd}
                  >
                    <Link
                      to={longPressId ? "#" : `/chat-history/${chat.id}`}
                      onClick={(e) => {
                        if (longPressId) {
                          e.preventDefault();
                          return;
                        }
                        onClose();
                      }}
                      className="block px-3 py-2 rounded-xl transition-all cursor-pointer"
                      style={{
                        backgroundColor: "transparent"
                      }}
                      onMouseEnter={(e) => { if (!longPressId) e.currentTarget.style.backgroundColor = "#EAEBFF"; }}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                    >
                      <div style={{ fontSize: "14px", fontWeight: 500, color: "#1A1A1A", marginBottom: "4px" }}>{chat.title}</div>
                      <div style={{ fontSize: "12px", color: "#8A8A93" }}>{chat.time}</div>
                    </Link>
                  </motion.div>
                ))}
              </AnimatePresence>
              {recentChats.length === 0 && (
                <div style={{ fontSize: "13px", color: "#C0C0C8", textAlign: "center", padding: "20px 0" }}>
                  暂无对话记录
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 长按删除确认浮层 */}
        <AnimatePresence>
          {longPressId && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 flex items-center justify-center"
              style={{ zIndex: 100, backgroundColor: "rgba(0,0,0,0.4)" }}
              onClick={() => setLongPressId(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="rounded-2xl overflow-hidden"
                style={{ background: "#fff", width: "280px", padding: "24px" }}
                onClick={(e) => e.stopPropagation()}
              >
                <div style={{ fontSize: "16px", fontWeight: 600, color: "#1A1A1A", marginBottom: "8px", textAlign: "center" }}>
                  删除对话
                </div>
                <div style={{ fontSize: "14px", color: "#8A8A93", marginBottom: "20px", textAlign: "center" }}>
                  确定要删除这条对话记录吗？
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setLongPressId(null)}
                    className="flex-1 rounded-xl transition-colors"
                    style={{ padding: "10px", fontSize: "14px", fontWeight: 500, color: "#1A1A1A", background: "#F3F4F6", border: "none", cursor: "pointer" }}
                  >
                    取消
                  </button>
                  <button
                    onClick={() => handleDeleteOne(longPressId)}
                    className="flex-1 rounded-xl transition-colors"
                    style={{ padding: "10px", fontSize: "14px", fontWeight: 500, color: "#fff", background: "#EF4444", border: "none", cursor: "pointer" }}
                  >
                    删除
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 清空全部确认浮层 */}
        <AnimatePresence>
          {showClearConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 flex items-center justify-center"
              style={{ zIndex: 100, backgroundColor: "rgba(0,0,0,0.4)" }}
              onClick={() => setShowClearConfirm(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="rounded-2xl overflow-hidden"
                style={{ background: "#fff", width: "280px", padding: "24px" }}
                onClick={(e) => e.stopPropagation()}
              >
                <div style={{ fontSize: "16px", fontWeight: 600, color: "#1A1A1A", marginBottom: "8px", textAlign: "center" }}>
                  清空对话记录
                </div>
                <div style={{ fontSize: "14px", color: "#8A8A93", marginBottom: "20px", textAlign: "center" }}>
                  确定要清空全部对话记录吗？此操作不可恢复。
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowClearConfirm(false)}
                    className="flex-1 rounded-xl transition-colors"
                    style={{ padding: "10px", fontSize: "14px", fontWeight: 500, color: "#1A1A1A", background: "#F3F4F6", border: "none", cursor: "pointer" }}
                  >
                    取消
                  </button>
                  <button
                    onClick={handleClearAll}
                    className="flex-1 rounded-xl transition-colors"
                    style={{ padding: "10px", fontSize: "14px", fontWeight: 500, color: "#fff", background: "#EF4444", border: "none", cursor: "pointer" }}
                  >
                    清空
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
}
