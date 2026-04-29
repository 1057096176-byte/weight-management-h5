import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router";
import { createPortal } from "react-dom";
import { MapPin, Phone, Clock, X, QrCode, Check, UserRound, UserRoundPlus } from "lucide-react";

const services = [
  {
    id: "qa",
    name: "有问必答",
    desc: "随时问 随时答",
    iconImg: "youwenbida.png",
  },
  {
    id: "assessment",
    name: "健康评估",
    desc: "测一测您的健康状况",
    iconImg: "jiankangpinggu.png",
  },
  {
    id: "appointment",
    name: "预约挂号",
    desc: "一键预约减重医生",
    iconImg: "yuyueguahao.png",
  },
  {
    id: "prediction",
    name: "减重预测",
    desc: "预测术后体重变化",
    iconImg: "fengxianyuce.png",
  },
  {
    id: "package",
    name: "体重服务包",
    desc: "专属体重健康方案",
    iconImg: "tizhongguanli.png",
  },
];

export default function Campus() {
  const navigate = useNavigate();
  const [isNewUser, setIsNewUser] = useState(false);
  const [showUserInfoModal, setShowUserInfoModal] = useState(false);
  const [pendingServiceId, setPendingServiceId] = useState<string | null>(null);

  // 表单数据
  const [formData, setFormData] = useState({
    phone: "",
    name: "",
    age: "",
    height: "",
    weight: "",
    medicalRecord: "",
  });

  const [errors, setErrors] = useState({
    phone: "",
    name: "",
    age: "",
    height: "",
    weight: "",
  });

  const [agreed, setAgreed] = useState(false);
  const [hasRead, setHasRead] = useState(false);
  const [showAgreement, setShowAgreement] = useState(false);
  const [scrolledToBottom, setScrolledToBottom] = useState(false);

  const handleAgreementScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 8) {
      setScrolledToBottom(true);
    }
  };

  const handleServiceClick = (serviceId: string) => {
    if (isNewUser) {
      // 新用户：弹出信息填写弹窗
      setPendingServiceId(serviceId);
      setShowUserInfoModal(true);
    } else {
      // 老用户：直接进入对话
      navigate(`/chat?from=${serviceId}`);
    }
  };

  const validateForm = () => {
    const newErrors = { phone: "", name: "", age: "", height: "", weight: "" };
    let isValid = true;

    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!formData.phone.trim()) {
      newErrors.phone = "请输入手机号";
      isValid = false;
    } else if (!phoneRegex.test(formData.phone.replace(/\s/g, ""))) {
      newErrors.phone = "请输入正确的手机号格式";
      isValid = false;
    }

    if (!formData.name.trim()) {
      newErrors.name = "请输入姓名";
      isValid = false;
    }

    const age = parseInt(formData.age);
    if (!formData.age.trim()) {
      newErrors.age = "请输入年龄";
      isValid = false;
    } else if (isNaN(age) || age < 0 || age > 100) {
      newErrors.age = "年龄范围：0-100岁";
      isValid = false;
    }

    const height = parseInt(formData.height);
    if (!formData.height.trim()) {
      newErrors.height = "请输入身高";
      isValid = false;
    } else if (isNaN(height) || height < 100 || height > 250) {
      newErrors.height = "身高范围：100-250cm";
      isValid = false;
    }

    const weight = parseFloat(formData.weight);
    if (!formData.weight.trim()) {
      newErrors.weight = "请输入体重";
      isValid = false;
    } else if (isNaN(weight) || weight < 30 || weight > 300) {
      newErrors.weight = "体重范围：30-300kg";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = () => {
    if (!agreed) return;
    if (validateForm() && pendingServiceId) {
      // 将新用户信息存入 localStorage，供 Chat 页面读取
      localStorage.setItem("newUserInfo", JSON.stringify({
        phone: formData.phone,
        name: formData.name,
        age: parseInt(formData.age),
        height: parseInt(formData.height),
        weight: parseFloat(formData.weight),
        medicalRecord: formData.medicalRecord,
      }));
      setShowUserInfoModal(false);
      // 清空表单
      setFormData({ phone: "", name: "", age: "", height: "", weight: "", medicalRecord: "" });
      setErrors({ phone: "", name: "", age: "", height: "", weight: "" });
      setAgreed(false);
      setHasRead(false);
      // 提交后变成老用户，留在首页
      setIsNewUser(false);
      setPendingServiceId(null);
    }
  };

  const handleCloseModal = () => {
    setShowUserInfoModal(false);
    setPendingServiceId(null);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F5F5F7",
        position: "relative",
      }}
    >
      {/* 顶部大图区域 */}
      <div style={{ position: "relative" }}>
        <img
          src={`${import.meta.env.BASE_URL}hospital-dayunhe.jpg`}
          alt="大运河院区"
          style={{
            width: "100%",
            height: "220px",
            objectFit: "cover",
            display: "block",
          }}
        />
        {/* 渐变遮罩 */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "100px",
            background: "linear-gradient(transparent, rgba(0,0,0,0.5))",
          }}
        />
        {/* 院区名称 */}
        <div
          style={{
            position: "absolute",
            bottom: "16px",
            left: "20px",
          }}
        >
          <h1
            style={{
              fontSize: "22px",
              fontWeight: 700,
              color: "#FFFFFF",
              margin: 0,
              textShadow: "0 1px 4px rgba(0,0,0,0.3)",
            }}
          >
            体重健康管理专区
          </h1>
        </div>
      </div>

      {/* 智能体服务入口 */}
      <div style={{ padding: "16px" }}>
        <div
          style={{
            fontSize: "15px",
            fontWeight: 600,
            color: "#1A1A1A",
            marginBottom: "12px",
          }}
        >
          智能体服务
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "12px",
          }}
        >
          {services.slice(0, 4).map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              onClick={() => handleServiceClick(service.id)}
              style={{
                background: "#FFFFFF",
                borderRadius: "14px",
                padding: "18px 8px 14px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "6px",
                boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                cursor: "pointer",
                position: "relative",
              }}
            >
              <img src={`${import.meta.env.BASE_URL}${service.iconImg}`} alt={service.name} style={{ width: "42px", height: "42px" }} />
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "#1A1A1A",
                }}
              >
                {service.name}
              </span>
              <span
                style={{
                  fontSize: "11px",
                  color: "#8A8A93",
                  textAlign: "center",
                  lineHeight: "14px",
                }}
              >
                {service.desc}
              </span>
            </motion.div>
          ))}
        </div>
        {/* 体重服务包 - 单独一行 */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.32 }}
          onClick={() => handleServiceClick("package")}
          style={{
            marginTop: "12px",
            background: "#FFFFFF",
            borderRadius: "14px",
            padding: "16px",
            paddingLeft: "calc(25% - 19px)",
            display: "flex",
            alignItems: "center",
            gap: "36px",
            boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
            cursor: "pointer",
          }}
        >
          <img src={`${import.meta.env.BASE_URL}tizhongguanli.png`} alt="体重健康管理服务包" style={{ width: "48px", height: "48px", flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: "14px", fontWeight: 600, color: "#1A1A1A" }}>体重健康管理服务包</div>
            <div style={{ fontSize: "11px", color: "#8A8A93", marginTop: "4px", lineHeight: "14px" }}>专属体重健康方案</div>
          </div>
        </motion.div>
      </div>

      {/* 医院信息卡片 */}
      <div style={{ padding: "12px 16px 24px" }}>
        <div
          style={{
            background: "#FFFFFF",
            borderRadius: "16px",
            padding: "16px",
            boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
          }}
        >
          <div
            style={{
              fontSize: "15px",
              fontWeight: 600,
              color: "#1A1A1A",
              marginBottom: "14px",
            }}
          >
            邵逸夫医院（大运河院区）4楼C区<br />体重健康管理中心
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
              <MapPin className="w-4 h-4" style={{ color: "#2B5BFF", marginTop: "2px", flexShrink: 0 }} />
              <span style={{ fontSize: "13px", color: "#4A4A4A", lineHeight: "20px" }}>
                浙江省杭州市拱墅区马家桥街50号
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Phone className="w-4 h-4" style={{ color: "#2B5BFF", flexShrink: 0 }} />
              <span style={{ fontSize: "13px", color: "#4A4A4A" }}>
                0571-86090073
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Clock className="w-4 h-4" style={{ color: "#2B5BFF", flexShrink: 0 }} />
              <span style={{ fontSize: "13px", color: "#4A4A4A" }}>
                周一至周五上午、周六全天门诊
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 右下角新老用户切换按钮（仅图标） */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 260, damping: 20 }}
        onClick={() => setIsNewUser(!isNewUser)}
        style={{
          position: "fixed",
          bottom: "32px",
          right: "20px",
          width: "44px",
          height: "44px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "50%",
          background: isNewUser
            ? "linear-gradient(135deg, #FF6B35 0%, #FF8F65 100%)"
            : "linear-gradient(135deg, #2B5BFF 0%, #6B8FFF 100%)",
          color: "#FFFFFF",
          border: "none",
          cursor: "pointer",
          boxShadow: isNewUser
            ? "0 4px 16px rgba(255, 107, 53, 0.4)"
            : "0 4px 16px rgba(43, 91, 255, 0.4)",
          zIndex: 100,
          transition: "background 0.3s, box-shadow 0.3s",
        }}
      >
        {isNewUser ? (
          <UserRoundPlus style={{ width: "20px", height: "20px" }} />
        ) : (
          <UserRound style={{ width: "20px", height: "20px" }} />
        )}
      </motion.div>

      {/* 新用户信息填写弹窗 */}
      {createPortal(
        <AnimatePresence>
          {showUserInfoModal && (
            <>
              {/* 遮罩 */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={handleCloseModal}
                style={{
                  position: "fixed",
                  inset: 0,
                  background: "rgba(0,0,0,0.5)",
                  zIndex: 9998,
                }}
              />
              {/* 弹窗内容 */}
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                style={{
                  position: "fixed",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  background: "#FFFFFF",
                  borderRadius: "24px 24px 0 0",
                  zIndex: 9999,
                  maxHeight: "90vh",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {/* 弹窗标题 */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "20px 20px 16px",
                    borderBottom: "1px solid #F0F0F5",
                    flexShrink: 0,
                  }}
                >
                  <h2 style={{ fontSize: "17px", fontWeight: 600, color: "#1A1A1A", margin: 0 }}>
                    完善基本信息
                  </h2>
                  <button
                    onClick={handleCloseModal}
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      background: "#F0F0F5",
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <X style={{ width: "16px", height: "16px", color: "#8A8A93" }} />
                  </button>
                </div>

                {/* 表单内容 - 可滚动 */}
                <div style={{ overflowY: "auto", padding: "20px", flex: 1 }}>
                  <p style={{ fontSize: "13px", color: "#6B7280", marginBottom: "20px", marginTop: 0 }}>
                    为了更好地为您服务，请填写以下信息
                  </p>

                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {/* 手机号 */}
                    <div>
                      <label style={{ fontWeight: 500, fontSize: "13px", color: "#374151", display: "block", marginBottom: "8px" }}>
                        手机号 <span style={{ color: "#EF4444" }}>*</span>
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => {
                          setFormData({ ...formData, phone: e.target.value });
                          setErrors({ ...errors, phone: "" });
                        }}
                        placeholder="请输入11位手机号"
                        maxLength={11}
                        style={{
                          width: "100%",
                          padding: "14px 16px",
                          border: errors.phone ? "1.5px solid #EF4444" : "1.5px solid #E5E7EB",
                          borderRadius: "12px",
                          fontSize: "14px",
                          outline: "none",
                          boxSizing: "border-box",
                        }}
                      />
                      {errors.phone && <p style={{ fontSize: "12px", color: "#EF4444", marginTop: "6px", margin: "6px 0 0" }}>{errors.phone}</p>}
                    </div>

                    {/* 姓名 */}
                    <div>
                      <label style={{ fontWeight: 500, fontSize: "13px", color: "#374151", display: "block", marginBottom: "8px" }}>
                        姓名 <span style={{ color: "#EF4444" }}>*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => {
                          setFormData({ ...formData, name: e.target.value });
                          setErrors({ ...errors, name: "" });
                        }}
                        placeholder="请输入您的姓名"
                        style={{
                          width: "100%",
                          padding: "14px 16px",
                          border: errors.name ? "1.5px solid #EF4444" : "1.5px solid #E5E7EB",
                          borderRadius: "12px",
                          fontSize: "14px",
                          outline: "none",
                          boxSizing: "border-box",
                        }}
                      />
                      {errors.name && <p style={{ fontSize: "12px", color: "#EF4444", marginTop: "6px", margin: "6px 0 0" }}>{errors.name}</p>}
                    </div>

                    {/* 年龄 */}
                    <div>
                      <label style={{ fontWeight: 500, fontSize: "13px", color: "#374151", display: "block", marginBottom: "8px" }}>
                        年龄 <span style={{ color: "#EF4444" }}>*</span>
                      </label>
                      <input
                        type="number"
                        value={formData.age}
                        onChange={(e) => {
                          setFormData({ ...formData, age: e.target.value });
                          setErrors({ ...errors, age: "" });
                        }}
                        placeholder="25"
                        style={{
                          width: "100%",
                          padding: "14px 16px",
                          border: errors.age ? "1.5px solid #EF4444" : "1.5px solid #E5E7EB",
                          borderRadius: "12px",
                          fontSize: "14px",
                          outline: "none",
                          boxSizing: "border-box",
                        }}
                      />
                      {errors.age && <p style={{ fontSize: "12px", color: "#EF4444", marginTop: "6px", margin: "6px 0 0" }}>{errors.age}</p>}
                    </div>

                    {/* 身高和体重（并排） */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                      {/* 身高 */}
                      <div>
                        <label style={{ fontWeight: 500, fontSize: "13px", color: "#374151", display: "block", marginBottom: "8px" }}>
                          身高 <span style={{ color: "#EF4444" }}>*</span>
                        </label>
                        <div style={{ position: "relative" }}>
                          <input
                            type="number"
                            value={formData.height}
                            onChange={(e) => {
                              setFormData({ ...formData, height: e.target.value });
                              setErrors({ ...errors, height: "" });
                            }}
                            placeholder="170"
                            style={{
                              width: "100%",
                              padding: "14px 40px 14px 16px",
                              border: errors.height ? "1.5px solid #EF4444" : "1.5px solid #E5E7EB",
                              borderRadius: "12px",
                              fontSize: "14px",
                              outline: "none",
                              boxSizing: "border-box",
                            }}
                          />
                          <span style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", fontSize: "13px", color: "#9CA3AF" }}>cm</span>
                        </div>
                        {errors.height && <p style={{ fontSize: "12px", color: "#EF4444", margin: "6px 0 0" }}>{errors.height}</p>}
                      </div>

                      {/* 体重 */}
                      <div>
                        <label style={{ fontWeight: 500, fontSize: "13px", color: "#374151", display: "block", marginBottom: "8px" }}>
                          体重 <span style={{ color: "#EF4444" }}>*</span>
                        </label>
                        <div style={{ position: "relative" }}>
                          <input
                            type="number"
                            step="0.1"
                            value={formData.weight}
                            onChange={(e) => {
                              setFormData({ ...formData, weight: e.target.value });
                              setErrors({ ...errors, weight: "" });
                            }}
                            placeholder="65"
                            style={{
                              width: "100%",
                              padding: "14px 40px 14px 16px",
                              border: errors.weight ? "1.5px solid #EF4444" : "1.5px solid #E5E7EB",
                              borderRadius: "12px",
                              fontSize: "14px",
                              outline: "none",
                              boxSizing: "border-box",
                            }}
                          />
                          <span style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", fontSize: "13px", color: "#9CA3AF" }}>kg</span>
                        </div>
                        {errors.weight && <p style={{ fontSize: "12px", color: "#EF4444", margin: "6px 0 0" }}>{errors.weight}</p>}
                      </div>
                    </div>

                    {/* 病案号（选填） */}
                    <div>
                      <label style={{ fontWeight: 500, fontSize: "13px", color: "#374151", display: "block", marginBottom: "8px" }}>
                        病案号（选填）
                      </label>
                      <div style={{ position: "relative" }}>
                        <input
                          type="text"
                          value={formData.medicalRecord}
                          onChange={(e) => setFormData({ ...formData, medicalRecord: e.target.value })}
                          placeholder="请输入病案号或点击扫码"
                          style={{
                            width: "100%",
                            padding: "14px 48px 14px 16px",
                            border: "1.5px solid #E5E7EB",
                            borderRadius: "12px",
                            fontSize: "14px",
                            outline: "none",
                            boxSizing: "border-box",
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const mockRecord = Math.floor(10000000 + Math.random() * 90000000).toString();
                            setFormData({ ...formData, medicalRecord: mockRecord });
                          }}
                          style={{
                            position: "absolute",
                            right: "12px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            background: "transparent",
                            border: "none",
                            cursor: "pointer",
                            padding: "4px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <QrCode style={{ width: "20px", height: "20px", color: "#2B5BFF" }} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* 提交按钮 */}
                  <button
                    onClick={handleSubmit}
                    style={{
                      width: "100%",
                      marginTop: "24px",
                      padding: "14px 24px",
                      background: agreed
                        ? "linear-gradient(135deg, #2B5BFF 0%, #1E40AF 100%)"
                        : "linear-gradient(135deg, #C8CCDD 0%, #D8DCEE 100%)",
                      borderRadius: "12px",
                      border: "none",
                      cursor: agreed ? "pointer" : "not-allowed",
                      fontWeight: 600,
                      fontSize: "15px",
                      color: "#FFFFFF",
                      boxShadow: agreed ? "0 4px 12px rgba(43, 91, 255, 0.3)" : "none",
                    }}
                  >
                    提交信息
                  </button>

                  {/* 协议复选框 */}
                  <div
                    style={{ display: "flex", alignItems: "flex-start", gap: "8px", marginTop: "14px", cursor: "pointer", paddingBottom: "env(safe-area-inset-bottom, 20px)" }}
                    onClick={() => {
                      if (!hasRead) {
                        setScrolledToBottom(false);
                        setShowAgreement(true);
                      } else {
                        setAgreed(!agreed);
                      }
                    }}
                  >
                    <div
                      style={{
                        width: "16px",
                        height: "16px",
                        flexShrink: 0,
                        marginTop: "2px",
                        borderRadius: "4px",
                        border: agreed ? "none" : "1.5px solid #C8CCDD",
                        background: agreed ? "linear-gradient(135deg, #2B5BFF 0%, #6B8FFF 100%)" : "transparent",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {agreed && <Check style={{ width: "11px", height: "11px", color: "#fff", strokeWidth: 3 }} />}
                    </div>
                    <p style={{ fontSize: "12px", color: "#9CA3AF", lineHeight: "1.6", margin: 0 }}>
                      我已阅读并同意{" "}
                      <span
                        style={{ color: "#2B5BFF", fontWeight: 500 }}
                        onClick={(e) => { e.stopPropagation(); setScrolledToBottom(false); setShowAgreement(true); }}
                      >
                        《用户授权与隐私协议》
                      </span>
                      ，授权本应用采集和使用我的健康数据
                    </p>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* 协议弹窗 */}
      {createPortal(
        <AnimatePresence>
          {showAgreement && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowAgreement(false)}
                style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 10998 }}
              />
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                style={{
                  position: "fixed", bottom: 0, left: 0, right: 0,
                  background: "#FFFFFF", borderRadius: "24px 24px 0 0",
                  zIndex: 10999, maxHeight: "80vh", display: "flex", flexDirection: "column",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 20px 16px", borderBottom: "1px solid #F0F0F5", flexShrink: 0 }}>
                  <h2 style={{ fontSize: "17px", fontWeight: 600, color: "#1A1A1A", margin: 0 }}>用户授权与隐私协议</h2>
                  <button onClick={() => setShowAgreement(false)} style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#F0F0F5", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <X style={{ width: "16px", height: "16px", color: "#8A8A93" }} />
                  </button>
                </div>
                <div onScroll={handleAgreementScroll} style={{ overflowY: "auto", padding: "20px", flex: 1, fontSize: "13px", color: "#4A4A55", lineHeight: "1.8" }}>
                  <p style={{ color: "#8A8A93", marginBottom: "16px" }}>版本更新日期：2025年7月30日 &nbsp;|&nbsp; 版本生效日期：2025年7月20日</p>
                  <p style={{ marginBottom: "12px" }}>欢迎您使用体重管理平台（"我们"）的产品和服务，您在访问我们的平台、使用我们的产品和服务时，我们可能会收集和使用您的相关信息，我们知道任何用户的个人信息安全都是至关重要的，我们将重点关注并竭力保护好您的个人信息隐私的安全。</p>
                  <p style={{ marginBottom: "12px" }}>本隐私政策适用于您对体重管理平台的访问以及平台所提供的全部产品和服务的使用而提供或留存的信息。体重管理平台是指由【杭州易智体科技有限公司】享有所有权和运营权的移动应用【体重管理平台小程序】等平台的统称。</p>
                  <div style={{ background: "#FFF8E1", borderRadius: "8px", padding: "10px 12px", marginBottom: "12px" }}>
                    <p style={{ fontWeight: 600, color: "#1A1A1A", margin: "0 0 4px 0" }}>【重要提醒】</p>
                    <p style={{ margin: 0 }}>本次更新我们主要是进一步明确我们产品和服务收集、使用及共享个人信息的类型、方式和用途等，进一步明确关于您查询、更正和删除个人信息的方式，以及账户注销申请的方式等。</p>
                  </div>
                  <p style={{ marginBottom: "12px" }}>请您在继续使用体重管理平台产品或服务前务必认真仔细阅读并确认充分理解本隐私政策全部规则和要点，一旦您选择使用或在我们更新本隐私政策后继续使用我们的产品和服务，即视为您同意本隐私政策（含更新版本）的全部内容。</p>
                  <div style={{ textAlign: "center", padding: "12px 0", borderTop: "1px solid #F0F0F5", marginTop: "8px" }}>
                    <p style={{ fontWeight: 600, color: "#1A1A1A", margin: "0 0 4px 0" }}>感谢您对体重管理平台以及体重管理产品和服务的信任和使用！</p>
                    <p style={{ color: "#8A8A93", margin: 0 }}>杭州易智体科技有限公司</p>
                  </div>
                </div>
                <div style={{ padding: "16px 20px 32px", flexShrink: 0 }}>
                  {!scrolledToBottom && (
                    <p style={{ textAlign: "center", fontSize: "12px", color: "#9CA3AF", marginBottom: "10px" }}>
                      请滚动阅读完全部协议内容
                    </p>
                  )}
                  <button
                    onClick={() => { setHasRead(true); setAgreed(true); setShowAgreement(false); }}
                    disabled={!scrolledToBottom}
                    style={{
                      width: "100%", padding: "16px",
                      background: scrolledToBottom ? "linear-gradient(135deg, #2B5BFF 0%, #6B8FFF 100%)" : "linear-gradient(135deg, #C8CCDD 0%, #D8DCEE 100%)",
                      color: "#FFFFFF", borderRadius: "16px", fontSize: "16px", fontWeight: 600,
                      border: "none", cursor: scrolledToBottom ? "pointer" : "not-allowed",
                      boxShadow: scrolledToBottom ? "0 4px 20px rgba(43, 91, 255, 0.3)" : "none",
                    }}
                  >
                    我已阅读，同意授权
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
