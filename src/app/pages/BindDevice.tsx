import { useState } from "react";
import { useNavigate } from "react-router";
import { Eye, EyeOff, ChevronLeft } from "lucide-react";

export default function BindDevice() {
  const navigate = useNavigate();
  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showCookie, setShowCookie] = useState(true);

  const handleLogin = () => {
    if (account && password) {
      navigate("/campus");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#FFFFFF",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* 顶部导航栏 */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 16px",
          paddingTop: "calc(env(safe-area-inset-top, 0px) + 12px)",
        }}
      >
        <button
          onClick={() => navigate(-1)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "4px",
            display: "flex",
            alignItems: "center",
          }}
        >
          <ChevronLeft style={{ width: "24px", height: "24px", color: "#333" }} />
        </button>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "16px", fontWeight: 600, color: "#333" }}>
            华为账号-登录
          </div>
          <div style={{ fontSize: "11px", color: "#999", marginTop: "2px" }}>
            id1.cloud.huawei.com
          </div>
        </div>
        <div style={{ width: "32px" }} />
      </div>

      {/* Cookie 提示 */}
      {showCookie && (
        <div
          style={{
            margin: "8px 16px 0",
            padding: "14px 16px",
            background: "#F5F5F5",
            borderRadius: "12px",
            display: "flex",
            alignItems: "flex-start",
            gap: "12px",
          }}
        >
          <div style={{ flex: 1, fontSize: "13px", color: "#333", lineHeight: "20px" }}>
            本网站使用 Cookie 功能，为您提供最佳的用户体验。
            <span style={{ color: "#007DFF" }}>了解更多</span>
          </div>
          <button
            onClick={() => setShowCookie(false)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "18px",
              color: "#999",
              padding: "0",
              lineHeight: 1,
              flexShrink: 0,
            }}
          >
            ×
          </button>
        </div>
      )}

      {/* 主内容 */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          padding: "0 40px",
        }}
      >
        {/* 华为 Logo */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "40px",
            marginBottom: "16px",
          }}
        >
          <div
            style={{
              width: "56px",
              height: "56px",
              background: "#CF0A2C",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span
              style={{
                color: "#FFFFFF",
                fontSize: "9px",
                fontWeight: 700,
                letterSpacing: "0.5px",
              }}
            >
              HUAWEI
            </span>
          </div>
        </div>

        {/* 标题 */}
        <h1
          style={{
            fontSize: "24px",
            fontWeight: 700,
            color: "#000",
            textAlign: "center",
            margin: "0 0 8px",
          }}
        >
          华为账号
        </h1>
        <p
          style={{
            fontSize: "14px",
            color: "#999",
            textAlign: "center",
            margin: "0 0 40px",
          }}
        >
          登录账号以使用云空间、应用市场及更多服务
        </p>

        {/* 账号输入 */}
        <div style={{ marginBottom: "0" }}>
          <input
            type="text"
            value={account}
            onChange={(e) => setAccount(e.target.value)}
            placeholder="手机号/邮件地址/账号名"
            style={{
              width: "100%",
              padding: "16px 0",
              border: "none",
              borderBottom: "1px solid #E5E5E5",
              fontSize: "16px",
              color: "#333",
              outline: "none",
              background: "transparent",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* 密码输入 */}
        <div style={{ position: "relative", marginBottom: "16px" }}>
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="密码"
            style={{
              width: "100%",
              padding: "16px 40px 16px 0",
              border: "none",
              borderBottom: "1px solid #E5E5E5",
              fontSize: "16px",
              color: "#333",
              outline: "none",
              background: "transparent",
              boxSizing: "border-box",
            }}
          />
          <button
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: "absolute",
              right: "0",
              top: "50%",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px",
              display: "flex",
              alignItems: "center",
            }}
          >
            {showPassword ? (
              <Eye style={{ width: "20px", height: "20px", color: "#666" }} />
            ) : (
              <EyeOff style={{ width: "20px", height: "20px", color: "#666" }} />
            )}
          </button>
        </div>

        {/* 短信验证码 / 忘记密码 */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "32px",
          }}
        >
          <span
            style={{
              fontSize: "14px",
              color: "#007DFF",
              cursor: "pointer",
            }}
          >
            短信验证码登录
          </span>
          <span
            style={{
              fontSize: "14px",
              color: "#007DFF",
              cursor: "pointer",
            }}
          >
            忘记密码
          </span>
        </div>

        {/* 登录按钮 */}
        <button
          onClick={handleLogin}
          style={{
            width: "100%",
            padding: "14px",
            background: account && password ? "#007DFF" : "#B3DAFF",
            border: "none",
            borderRadius: "24px",
            fontSize: "16px",
            fontWeight: 500,
            color: "#FFFFFF",
            cursor: account && password ? "pointer" : "default",
            marginBottom: "16px",
          }}
        >
          登录
        </button>

        {/* 注册账号按钮 */}
        <button
          style={{
            width: "100%",
            padding: "14px",
            background: "#FFFFFF",
            border: "1px solid #E5E5E5",
            borderRadius: "24px",
            fontSize: "16px",
            fontWeight: 500,
            color: "#333",
            cursor: "pointer",
          }}
        >
          注册账号
        </button>
      </div>

      {/* 底部链接 */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "0",
          padding: "20px 0",
          paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 20px)",
        }}
      >
        <span style={{ fontSize: "13px", color: "#007DFF", cursor: "pointer" }}>
          遇到问题
        </span>
        <span style={{ fontSize: "13px", color: "#CCC", margin: "0 16px" }}>|</span>
        <span style={{ fontSize: "13px", color: "#007DFF", cursor: "pointer" }}>
          用户协议
        </span>
        <span style={{ fontSize: "13px", color: "#CCC", margin: "0 16px" }}>|</span>
        <span style={{ fontSize: "13px", color: "#007DFF", cursor: "pointer" }}>
          隐私声明
        </span>
      </div>
    </div>
  );
}
