import { motion } from "motion/react";
import { useNavigate } from "react-router";

const hospitals = [
  {
    id: "qingchun",
    name: "庆春院区",
    image: `${import.meta.env.BASE_URL}hospital-qingchun.jpg`,
    clickable: false,
  },
  {
    id: "qiantang",
    name: "钱塘院区",
    image: `${import.meta.env.BASE_URL}hospital-qiantang.jpg`,
    clickable: false,
  },
  {
    id: "dayunhe",
    name: "大运河院区",
    image: `${import.meta.env.BASE_URL}hospital-dayunhe.jpg`,
    clickable: true,
  },
  {
    id: "shaoxing",
    name: "绍兴院区",
    image: `${import.meta.env.BASE_URL}hospital-shaoxing.jpg`,
    clickable: false,
  },
];

export default function HospitalList() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #F0F4FF 0%, #FFFFFF 40%)",
      }}
    >
      {/* 顶部标题栏 */}
      <div
        style={{
          padding: "0 20px",
          paddingTop: "env(safe-area-inset-top, 20px)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "56px",
          }}
        >
          <h1
            style={{
              fontSize: "17px",
              fontWeight: 600,
              color: "#1A1A1A",
              margin: 0,
            }}
          >
            体重管理智能体
          </h1>
        </div>
      </div>

      {/* 副标题 */}
      <div style={{ padding: "4px 20px 16px" }}>
        <p
          style={{
            fontSize: "14px",
            color: "#8A8A93",
            margin: 0,
          }}
        >
          请选择您所在的院区
        </p>
      </div>

      {/* 医院卡片列表 */}
      <div style={{ padding: "0 16px" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          {hospitals.map((hospital, index) => (
            <motion.div
              key={hospital.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => {
                if (hospital.clickable) {
                  navigate("/campus");
                }
              }}
              style={{
                borderRadius: "16px",
                overflow: "hidden",
                background: "#FFFFFF",
                boxShadow: "0 2px 12px rgba(0, 0, 0, 0.06)",
                cursor: hospital.clickable ? "pointer" : "default",
                opacity: hospital.clickable ? 1 : 0.6,
                position: "relative",
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: "160px",
                  overflow: "hidden",
                }}
              >
                <img
                  src={hospital.image}
                  alt={hospital.name}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                />
              </div>
              <div
                style={{
                  padding: "10px 14px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span
                  style={{
                    fontSize: "15px",
                    fontWeight: 600,
                    color: "#1A1A1A",
                  }}
                >
                  {hospital.name}
                </span>
                {!hospital.clickable && (
                  <span
                    style={{
                      fontSize: "11px",
                      color: "#FFFFFF",
                      background: "#C0C0C8",
                      borderRadius: "8px",
                      padding: "2px 8px",
                    }}
                  >
                    即将开放
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 底部说明 */}
      <div
        style={{
          padding: "24px 20px",
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontSize: "12px",
            color: "#C0C0C8",
            margin: 0,
          }}
        >
          浙江大学医学院附属邵逸夫医院
        </p>
      </div>
    </div>
  );
}
