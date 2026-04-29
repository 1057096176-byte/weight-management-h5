import { useNavigate } from "react-router";
import { motion } from "motion/react";
import logoEmblem from "../../assets/logo_emblem.png";
import logoText from "../../assets/logo_text.png";

export default function Auth() {
  const navigate = useNavigate();

  const handleWeChatLogin = () => {
    navigate("/campus");
  };

  return (
    <div
      className="h-screen flex flex-col relative overflow-hidden"
      style={{ backgroundColor: "#F2F3F5" }}
    >
      {/* 右上角装饰圆 */}
      <div
        className="absolute"
        style={{
          width: "420px",
          height: "420px",
          right: "-80px",
          top: "-80px",
          background: "#D4E4F7",
          borderRadius: "50%",
          opacity: 0.7,
        }}
      />

      {/* 左下角装饰圆 */}
      <div
        className="absolute"
        style={{
          width: "280px",
          height: "280px",
          left: "-80px",
          bottom: "40px",
          background: "#D5CBE8",
          borderRadius: "50%",
          opacity: 0.6,
        }}
      />

      {/* 主内容区 */}
      <div className="flex-1 flex flex-col items-center justify-center relative" style={{ zIndex: 1 }}>
        {/* 标题区域 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center mb-16"
        >
          <div className="flex items-center gap-4" style={{ marginBottom: "16px" }}>
            <img
              src={logoEmblem}
              alt="邵逸夫医院徽章"
              style={{ width: "100px", height: "auto", flexShrink: 0 }}
            />
            <img
              src={logoText}
              alt="浙江大学医学院附属邵逸夫医院"
              style={{
                height: "75px",
                width: "auto",
                filter: "brightness(0) saturate(100%) invert(25%) sepia(90%) saturate(800%) hue-rotate(194deg) brightness(95%) contrast(95%)",
              }}
            />
          </div>
          <p
            style={{
              fontSize: "15px",
              color: "#999999",
              letterSpacing: "1px",
            }}
          >
            科学管理体重，健康每一天
          </p>
        </motion.div>

        {/* 微信登录按钮 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{ width: "100%", paddingLeft: "40px", paddingRight: "40px" }}
        >
          <button
            onClick={handleWeChatLogin}
            className="w-full flex items-center justify-center gap-3 transition-transform active:scale-[0.98]"
            style={{
              height: "52px",
              background: "linear-gradient(135deg, #2BAD4E 0%, #28A745 50%, #1E8E3E 100%)",
              borderRadius: "26px",
              border: "none",
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(40, 167, 69, 0.3)",
            }}
          >
            {/* 微信图标 SVG */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M9.5 4C5.36 4 2 6.69 2 10c0 1.89 1.08 3.56 2.78 4.66L4 17l2.5-1.18C7.47 16.27 8.47 16.5 9.5 16.5c.17 0 .34-.01.5-.02C9.68 15.83 9.5 15.18 9.5 14.5c0-3.31 3.36-6 7.5-6 .17 0 .33.01.5.02C16.93 5.83 13.45 4 9.5 4Z"
                fill="white"
              />
              <path
                d="M22 14.5c0-2.76-2.69-5-6-5s-6 2.24-6 5 2.69 5 6 5c.82 0 1.6-.14 2.3-.38L20.5 20l-.6-1.95C21.2 17.13 22 15.9 22 14.5Z"
                fill="white"
              />
            </svg>
            <span
              style={{
                fontSize: "17px",
                fontWeight: 600,
                color: "#FFFFFF",
                letterSpacing: "1px",
              }}
            >
              微信授权登录
            </span>
          </button>
        </motion.div>

        {/* 协议文字 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-4"
        >
          <p style={{ fontSize: "12px", color: "#999999" }}>
            登录即代表您同意
            <span
              style={{ color: "#2B7CD3", cursor: "pointer" }}
              onClick={() => {}}
            >
              《用户授权与隐私协议》
            </span>
          </p>
        </motion.div>
      </div>

      {/* 底部文字 */}
      <div
        className="relative flex items-center justify-center"
        style={{ zIndex: 1, paddingBottom: "50px" }}
      >
        <span style={{ fontSize: "14px", color: "#999999", letterSpacing: "1px" }}>
          易智体科技提供技术支持
        </span>
      </div>
    </div>
  );
}
