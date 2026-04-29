import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { Menu, Users, TrendingUp, TrendingDown, ArrowRight, X, ChevronLeft, ChevronRight, Target } from "lucide-react";
import { Sidebar } from "../components/Sidebar";
import { ChatMessage } from "../components/ChatMessage";
import { ChatInput } from "../components/ChatInput";
import { motion, AnimatePresence } from "motion/react";
import { QuickActions } from "../components/QuickActions";
import { HealthDataCardNew } from "../components/HealthDataCardNew";
import { DoctorDrawer } from "../components/DoctorDrawer";
import { DeviceDataCard } from "../components/DeviceDataCard";
import { MealReminderCard } from "../components/MealReminderCard";
import { MealProductCard } from "../components/MealProductCard";
import { MealProductDetailModal } from "../components/MealProductDetailModal";
import { PaymentModal } from "../components/PaymentModal";
import { DeviceBindingModal } from "../components/DeviceBindingModal";
import { DeviceInfoModal } from "../components/DeviceInfoModal";
import { MealServiceDrawer } from "../components/MealServiceDrawer";
import { MealProductList } from "../components/MealProductList";

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [doctorDrawerOpen, setDoctorDrawerOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const userInfoFormRef = useRef<HTMLDivElement>(null);
  const [highlightForm, setHighlightForm] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const searchParams = new URLSearchParams(location.search);
  const fromEntry = searchParams.get("from") || "qa";

  // 用户状态：'new' | 'existing'，支持通过 URL 参数 user=new 设置
  const userParam = searchParams.get("user");
  const [userStatus, setUserStatus] = useState<"new" | "existing">(userParam === "new" ? "new" : "existing");
  const isNewUser = userStatus === "new";
  
  // 设备绑定状态
  const [hasDeviceBound, setHasDeviceBound] = useState(false);
  
  // 是否显示代餐提醒（仅老用户）
  const [showMealReminder, setShowMealReminder] = useState(false);

  // 体重更新浮动通知
  const [weightToast, setWeightToast] = useState<{
    type: 'target' | 'current';
    oldValue: number;
    newValue: number;
  } | null>(null);
  
  // 病案号状态
  const [medicalRecordNumber, setMedicalRecordNumber] = useState("");
  const [showMedicalRecordModal, setShowMedicalRecordModal] = useState(false);
  const [tempMedicalRecord, setTempMedicalRecord] = useState("");
  const [showQRScanner, setShowQRScanner] = useState(false);
  
  // 设备相关弹窗状态
  const [showDeviceBindingModal, setShowDeviceBindingModal] = useState(false);
  const [showDeviceInfoModal, setShowDeviceInfoModal] = useState(false);
  
  // 蓝牙绑定流程状态
  type BluetoothBindingStage = "idle" | "searching" | "connecting" | "success";
  const [bluetoothBindingStage, setBluetoothBindingStage] = useState<BluetoothBindingStage>("idle");
  
  // 代餐商品相关状态
  const [showMealServiceDrawer, setShowMealServiceDrawer] = useState(false);
  const [showMealProductDetail, setShowMealProductDetail] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedMealPrice, setSelectedMealPrice] = useState(899);
  
  // 用户信息收集状态
  type UserInfoStage = "idle" | "phone" | "name" | "height" | "weight" | "complete";
  const [userInfoStage, setUserInfoStage] = useState<UserInfoStage>(isNewUser ? "phone" : "idle");
  
  // 导诊状态
  type TriageStage = "idle" | "basic" | "symptoms" | "risk" | "complete";
  const [triageStage, setTriageStage] = useState<TriageStage>("idle");
  const [triageQuestionIndex, setTriageQuestionIndex] = useState(0);
  
  // 导诊问题库
  const triageQuestions = {
    basic: [
      {
        question: "首先，请问您的年龄是多少？",
        options: ["18-25岁", "26-35岁", "36-45岁", "46-60岁", "60岁以上"],
      },
      {
        question: "请问您的性别是？",
        options: ["男", "女"],
      },
      {
        question: "您的体重管理目标是什么？",
        options: ["减重", "增重", "塑形", "健康管理"],
      },
    ],
    symptoms: [
      {
        question: "您是否有以下症状？\n\n• 经常感到疲劳乏力\n• 睡眠质量差或失眠\n• 食欲异常（暴饮暴食或食欲不振）\n• 情绪波动大",
        options: ["有", "没有", "部分有"],
      },
      {
        question: "您的饮食习惯如何？",
        options: ["规律三餐", "经常不吃早餐", "喜欢夜宵", "饮食不规律"],
      },
      {
        question: "您平时的运动习惯是？",
        options: ["每周3次以上", "偶尔运动", "很少运动", "完全不运动"],
      },
    ],
    risk: [
      {
        question: "您是否有以下慢性病史？\n\n• 高血压\n• 糖尿病\n• 高血脂\n• 心脏疾病",
        options: ["有", "没有"],
      },
      {
        question: "您的家族是否有肥胖或代谢疾病史？",
        options: ["有", "没有", "不清楚"],
      },
      {
        question: "最后一个问题：您之前是否尝试过减重？结果如何？",
        options: ["从未尝试", "尝试过但反弹", "尝试过有效果", "多次尝试失败"],
      },
    ],
  };
  
  // 切换用户状态按钮处理函数
  const toggleUserStatus = () => {
    setUserStatus(prev => prev === "new" ? "existing" : "new");
  };
  
  // 检查是否有未完成的导诊
  const checkTriageHistory = () => {
    const saved = localStorage.getItem("triageHistory");
    if (saved) {
      const data = JSON.parse(saved);
      return data.stage !== "complete" && data.messages.length > 2;
    }
    return false;
  };

  const [hasUnfinishedTriage, setHasUnfinishedTriage] = useState(checkTriageHistory());
  
  // 健康数据编辑弹窗状态
  const [showHealthDataModal, setShowHealthDataModal] = useState(false);
  const [tempHealthData, setTempHealthData] = useState({
    age: "",
    height: "",
    currentWeight: "",
    targetWeight: "",
  });
  
  // 消息列表状态
  const [messages, setMessages] = useState<any[]>([]);
  
  // 计划是否已开启状态
  const [isPlanActivated, setIsPlanActivated] = useState(false);
  const [aiMode, setAiMode] = useState<"fast" | "expert" | "predict">("fast");
  const aiModeRef = useRef<"fast" | "expert" | "predict">("fast");
  // 隐藏的演示模式：控制报告上传结果是否强制异常
  const [demoForceAbnormal, setDemoForceAbnormal] = useState(false);
  const handleModeChange = (mode: "fast" | "expert" | "predict") => {
    setAiMode(mode);
    aiModeRef.current = mode;
  };
  
  // 用户健康数据（使用状态管理以支持编辑）
  const [healthData, setHealthData] = useState({
    age: isNewUser ? 0 : 30,
    height: isNewUser ? 0 : 163, // cm
    currentWeight: isNewUser ? 0 : 49, // kg
    yesterdayWeight: isNewUser ? 0 : 49.2, // 昨天的体重
    targetWeight: isNewUser ? 0 : 48, // kg
    bmi: isNewUser ? 0 : 23, // BMI = weight / (height/100)^2
  });
  
  const planInfo = {
    name: "轻盈计划",
    daysRunning: 2,
    estimatedCompletion: "10天",
    todayProgress: 63,
  };

  // 计算体重变化
  const weightChange = healthData.currentWeight - healthData.yesterdayWeight;
  const weightChangeText = weightChange > 0 ? `+${weightChange.toFixed(1)}kg` : `${weightChange.toFixed(1)}kg`;
  const weightChangeColor = weightChange > 0 ? "text-red-500" : weightChange < 0 ? "text-green-500" : "text-gray-500";
  const WeightChangeIcon = weightChange > 0 ? TrendingUp : TrendingDown;

  // BMI状态判断
  const getBMIStatus = (bmi: number) => {
    if (bmi < 18.5) return { label: "偏瘦", color: "text-yellow-600", bg: "bg-yellow-50", barColor: "bg-yellow-500" };
    if (bmi < 24) return { label: "正常", color: "text-green-600", bg: "bg-green-50", barColor: "bg-green-500" };
    if (bmi < 28) return { label: "偏胖", color: "text-orange-600", bg: "bg-orange-50", barColor: "bg-orange-500" };
    return { label: "肥胖", color: "text-red-600", bg: "bg-red-50", barColor: "bg-red-500" };
  };

  const bmiStatus = getBMIStatus(healthData.bmi);

  // 所有常见问题库
  const allQuestions = [
    ["如何科学减重？", "今天吃什么比较健康？", "适合我的运动方案"],
    ["减重平台期怎么办？", "如何提高代谢率？", "晚餐吃什么不发胖？"],
    ["运动后肌肉酸痛正常吗？", "如何保持动力？", "怎样制定饮食计划？"],
  ];

  const [questionSet, setQuestionSet] = useState(0);
  const commonQuestions = allQuestions[questionSet];

  const handleRefreshQuestions = () => {
    setQuestionSet((prev) => (prev + 1) % allQuestions.length);
    
    // 更新消息列表中的常见问题卡片
    setMessages((prevMessages) => 
      prevMessages.map((msg) => 
        msg.id === "questions-card" 
          ? { ...msg, questions: allQuestions[(questionSet + 1) % allQuestions.length] }
          : msg
      )
    );
  };

  const generateFastReply = (message: string): string => {
    if (message.includes("减重") || message.includes("减肥") || message.includes("体重")) {
      return "减重这件事，咱们一步一步来，不用太着急 😊\n\n最简单有效的方法：\n• 每天少吃一点，比如少半碗饭\n• 饭后散步20分钟，坚持比强度更重要\n• 睡够7-8小时，睡眠不足真的会让人变胖\n\n你现在大概每天吃多少？我帮你看看从哪里入手比较容易～";
    }
    if (message.includes("饮食") || message.includes("吃什么") || message.includes("食谱") || message.includes("营养")) {
      return "吃对了真的很重要！给你一个简单好记的原则 🥗\n\n**每餐这样搭配：**\n• 半盘蔬菜（各种颜色都要有）\n• 四分之一蛋白质（鸡蛋、鱼、豆腐都行）\n• 四分之一主食（尽量选糙米或杂粮）\n\n不用刻意节食，吃饱很重要，只是换一下食物比例就好。你平时早餐一般吃什么？";
    }
    if (message.includes("运动") || message.includes("跑步") || message.includes("健身") || message.includes("锻炼") || message.includes("游泳") || message.includes("瑜伽")) {
      return "太好了，动起来就是最棒的！💪\n\n运动不用很猛，关键是坚持：\n• 每天30分钟快走，效果就很不错\n• 运动前热身5分钟，保护膝盖\n• 运动后补点水，别马上吃东西\n\n你现在大概多久运动一次？我帮你看看怎么安排更合适～";
    }
    if (message.includes("早餐") || message.includes("午餐") || message.includes("晚餐") || message.includes("吃了") || message.includes("食物") || message.match(/\d+.*卡/)) {
      return `记录下来了！养成记录饮食的习惯真的很有用 ✅\n\n整体来看还不错，小建议：\n• 记得多喝水，每天至少1500ml\n• 蔬菜可以再多一点\n• 吃饭别太快，细嚼慢咽更容易有饱腹感\n\n要去打卡中心记录详细数据吗？系统会帮你算热量 😊`;
    }
    if (message.includes("睡眠") || message.includes("作息") || message.includes("睡觉") || message.includes("失眠")) {
      return "睡眠对减重的影响比很多人想象的大！😴\n\n睡不好会让身体分泌更多饥饿素，让你更想吃东西。\n\n几个小技巧：\n• 尽量固定时间睡觉和起床\n• 睡前1小时不看手机\n• 睡前可以喝杯温牛奶\n\n你最近睡眠怎么样？";
    }
    return "收到你的消息啦！😊 我是你的体重管理助手，可以帮你解答饮食、运动、减重相关的问题。\n\n有什么想聊的，直接说吧～";
  };

  const generateExpertReply = (message: string): { message: string; citations: string[] } => {
    if (message.includes("减重") || message.includes("减肥") || message.includes("体重")) {
      return {
        message: "根据现有临床研究，能量负平衡是体重管理的核心机制。每减少 7700 kcal 的累积热量差约对应 1 kg 脂肪的消耗（Wishnofsky 公式）。\n\n**推荐干预策略：**\n1. 热量限制：在基础代谢率（BMR）基础上设置 500–750 kcal/d 缺口，避免超过 1000 kcal/d 以防肌肉流失\n2. 蛋白质摄入：维持 1.2–1.6 g/kg·d 以保护瘦体重（LBM），参考 ISSN 2017 立场声明\n3. 运动方案：有氧运动（MICT）结合抗阻训练（RT）优于单一模式，建议 ≥150 min/w 中等强度有氧 + 2次/w 力量训练\n4. 行为干预：饮食日记记录可提升依从性约 43%（Burke et al., 2011）",
        citations: [
          "Wishnofsky M. Caloric equivalents of gained or lost weight. Am J Clin Nutr. 1958",
          "Stokes T, et al. Recent Perspectives Regarding the Role of Dietary Protein. Nutrients. 2018",
          "Burke LE, et al. Self-monitoring in weight loss. J Am Diet Assoc. 2011",
        ],
      };
    }
    if (message.includes("饮食") || message.includes("吃什么") || message.includes("食谱") || message.includes("营养")) {
      return {
        message: "基于循证营养学，以下饮食模式在体重管理中具有较强证据支持：\n\n**地中海饮食（Mediterranean Diet）**\n以全谷物、蔬菜、橄榄油、鱼类为主，荟萃分析显示可显著降低 BMI 及腰围（Esposito et al., 2011）\n\n**宏量营养素分配建议（基于 DRI）：**\n- 碳水化合物：占总能量 45–60%，优先选择低 GI 食物\n- 蛋白质：占总能量 15–25%，分散于每餐（每餐 ≥20 g）\n- 脂肪：占总能量 20–35%，饱和脂肪 <10%\n\n**需避免：**超加工食品（UPF）摄入与体重增加呈显著正相关（NOVA 分类系统，Monteiro et al.）",
        citations: [
          "Esposito K, et al. Mediterranean diet and weight loss. Metab Syndr Relat Disord. 2011",
          "Institute of Medicine. Dietary Reference Intakes for Energy. 2005",
          "Monteiro CA, et al. Ultra-processed foods: what they are and how to identify them. Public Health Nutr. 2019",
        ],
      };
    }
    if (message.includes("运动") || message.includes("锻炼") || message.includes("健身")) {
      return {
        message: "运动处方应遵循 FITT-VP 原则（频率、强度、时间、类型、总量、进阶）进行个体化设计。\n\n**循证推荐（ACSM 2022 指南）：**\n- 有氧运动：150–300 min/w 中等强度（55–70% HRmax）或 75–150 min/w 高强度（70–85% HRmax）\n- 抗阻训练：每周 2–3 次，覆盖主要肌群，8–12 次/组，2–4 组，组间休息 60–90 s\n- HIIT：可在较短时间内获得等效代谢适应，适合时间有限者\n\n**体重管理特别说明：**单纯有氧运动的减重效果受代偿机制限制，建议结合饮食干预以实现持续负能量平衡（Swift et al., 2018）",
        citations: [
          "ACSM's Guidelines for Exercise Testing and Prescription. 11th Ed. 2022",
          "Swift DL, et al. The Role of Exercise and Physical Activity in Weight Loss. Prog Cardiovasc Dis. 2018",
        ],
      };
    }
    if (message.includes("早餐") || message.includes("午餐") || message.includes("晚餐") || message.includes("吃了") || message.includes("食物") || message.match(/\d+.*卡/)) {
      return {
        message: "饮食记录是体重管理中依从性最强的行为干预手段之一。研究显示，坚持饮食日记可使减重效果提升约 43%（Burke et al., 2011）。\n\n**膳食质量评估维度：**\n- 能量密度：优先选择低能量密度食物（蔬菜、全谷物），有助于在控制热量的同时维持饱腹感\n- 血糖负荷（GL）：低 GL 饮食可改善胰岛素敏感性，减少脂肪储存\n- 蛋白质分布：建议每餐摄入 ≥20 g 优质蛋白，以最大化肌肉蛋白合成（MPS）\n\n建议在打卡中心完整记录食物种类与份量，系统将基于 DRI 标准进行宏量营养素分析。",
        citations: [
          "Burke LE, et al. Self-monitoring in weight loss: a systematic review. J Am Diet Assoc. 2011",
          "Rolls BJ. The relationship between dietary energy density and energy intake. Physiol Behav. 2009",
          "Moore DR, et al. Protein ingestion to stimulate myofibrillar protein synthesis. J Nutr. 2009",
        ],
      };
    }
    if (message.includes("睡眠") || message.includes("作息") || message.includes("睡觉") || message.includes("失眠")) {
      return {
        message: "睡眠不足是体重管理中常被忽视的独立风险因素。睡眠时间 <7 h/d 与 BMI 升高、腹型肥胖显著相关（Cappuccio et al., 2008）。\n\n**睡眠影响体重的核心机制：**\n1. 激素失调：睡眠剥夺导致瘦素（Leptin）↓、饥饿素（Ghrelin）↑，增加食欲约 24%\n2. 胰岛素抵抗：慢性睡眠不足可在 1 周内诱发胰岛素敏感性下降\n3. 皮质醇升高：促进内脏脂肪堆积\n\n**循证睡眠卫生建议（CBT-I 核心原则）：**\n- 固定起床时间（±30 min），优先于固定入睡时间\n- 睡前 2 h 避免蓝光暴露（屏幕）\n- 卧室温度维持 18–20°C 有助于核心体温下降，促进入睡",
        citations: [
          "Cappuccio FP, et al. Meta-analysis of short sleep duration and obesity. Sleep. 2008",
          "Spiegel K, et al. Sleep curtailment in healthy young men is associated with decreased leptin levels. Ann Intern Med. 2004",
          "Morin CM, et al. Cognitive behavioral therapy for insomnia. Sleep Med Rev. 2006",
        ],
      };
    }
    // 默认专家回复
    return {
      message: "根据当前健康管理领域的循证医学证据，您的问题涉及多维度的生理与行为因素。建议结合个人基础代谢、体成分数据及生活方式进行综合评估，以制定精准化干预方案。\n\n如需进一步分析，建议提供：BMI、腰臀比（WHR）、空腹血糖及近期运动记录，以便生成个性化健康建议。",
      citations: [
        "WHO. Obesity and Overweight Fact Sheet. 2024",
        "中国超重/肥胖医学营养治疗指南（2021年）",
      ],
    };
  };

  const handleSendMessage = (message: string, image?: File) => {
    // 如果有图片，先处理图片
    if (image) {
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: Date.now().toString(),
          message: `📷 [图片] ${message || "发送了一张图片"}`,
          isUser: true,
          time: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
        },
      ]);

      // AI回复
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            message: "我已收到您的图片。如果这是饮食或运动相关的照片，建议您前往打卡中心进行详细记录，系统会为您提供更准确的分析。",
            isUser: false,
            time: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
      }, 1000);
      return;
    }

    if (!message.trim()) return;

    // 预测模式下新用户未绑定，拦截手术预测
    if (aiModeRef.current === "predict" && isNewUser && userInfoStage !== "complete" && message.includes("手术")) {
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), message, isUser: true, time: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }) },
        { id: (Date.now() + 1).toString(), message: "请先完善基本信息，才能使用手术预测功能 👆", isUser: false, time: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }) },
      ]);
      setTimeout(() => {
        userInfoFormRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        setHighlightForm(true);
        setTimeout(() => setHighlightForm(false), 2000);
      }, 300);
      return;
    }

    // 新用户信息收集流程
    if (isNewUser && userInfoStage !== "idle" && userInfoStage !== "complete") {
      // 添加用户消息
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: Date.now().toString(),
          message,
          isUser: true,
          time: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
        },
      ]);

      // 解析用户输入的信息
      setTimeout(() => {
        // 使用正则表达式提取信息
        const phoneMatch = message.match(/手机号[：:]\s*(\d+)/);
        const nameMatch = message.match(/姓名[：:]\s*([^\n\r]+)/);
        const heightMatch = message.match(/身高[：:]\s*(\d+)/);
        const weightMatch = message.match(/体重[：:]\s*(\d+\.?\d*)/);

        // 验证是否所有信息都已提供
        if (!phoneMatch || !nameMatch || !heightMatch || !weightMatch) {
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now().toString(),
              message: "❌ 信息不完整，请按照格式提供所有信息：\n\n手机号：\n姓名：\n身高：（cm）\n体重：（kg）\n\n示例：\n手机号：13800138000\n姓名：张三\n身高：170\n体重：65",
              isUser: false,
              time: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
            },
          ]);
          return;
        }

        const phone = phoneMatch[1];
        const name = nameMatch[1].trim();
        const height = parseInt(heightMatch[1]);
        const weight = parseFloat(weightMatch[1]);

        // 验证手机号格式
        const phoneRegex = /^1[3-9]\d{9}$/;
        if (!phoneRegex.test(phone)) {
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now().toString(),
              message: "❌ 手机号格式不正确，请输入11位有效手机号。",
              isUser: false,
              time: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
            },
          ]);
          return;
        }

        // 验证身高范围
        if (isNaN(height) || height < 100 || height > 250) {
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now().toString(),
              message: "❌ 身高数据不合理，请输入100-250cm之间的数值。",
              isUser: false,
              time: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
            },
          ]);
          return;
        }

        // 验证体重范围
        if (isNaN(weight) || weight < 30 || weight > 300) {
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now().toString(),
              message: "❌ 体重数据不合理，请输入30-300kg之间的数值。",
              isUser: false,
              time: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
            },
          ]);
          return;
        }

        // 所有验证通过，保存数据
        const bmi = weight / Math.pow(height / 100, 2);
        setHealthData((prev) => ({
          ...prev,
          height,
          currentWeight: weight,
          yesterdayWeight: weight,
          targetWeight: weight > 60 ? weight - 5 : weight,
          bmi: parseFloat(bmi.toFixed(2)),
        }));

        // 完成信息收集
        setUserInfoStage("complete");

        setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now().toString(),
              message: `✅ 太好了，${name}！您的基本信息已成功录入。\n\n📊 您的健康数据：\n• 身高：${height}cm\n• 体重：${weight}kg\n• BMI：${bmi.toFixed(1)}\n\n💡 如果您有邵逸夫医院的病案号，可以点击「我的健康数据」卡片中的「绑定病案号」进行绑定。`,
              isUser: false,
              time: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
            },
          ]);

          // 推送导诊卡片
          setTimeout(() => {
            setMessages((prev) => [
              ...prev,
              {
                id: `triage-card-${Date.now()}`,
                message: "",
                isUser: false,
                time: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
                isTriageCard: true,
              },
            ]);
          }, 1000);
        }, 1000);
      }, 1000);
      return;
    }

    console.log("Adding user message:", message);
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        id: Date.now().toString(),
        message,
        isUser: true,
        time: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
      },
    ]);

    // 根据内容智能回复
    setTimeout(() => {
      console.log("AI replying to:", message);
      let replyMessage = "我已收到您的消息，让我为您分析一下...";
      let showCheckinCard = false;
      let showQuickAccessCard = false;
      let showDoctorListCard = false;
      let quickAccessType: 'all' | 'checkin' | 'triage' | 'doctor' | null = null;

      // 检测目标体重修改
      const targetWeightMatch = message.match(/目标体重[改设调](?:为|成|到)\s*(\d+\.?\d*)/);
      if (targetWeightMatch) {
        const newTarget = parseFloat(targetWeightMatch[1]);
        if (newTarget >= 30 && newTarget <= 200) {
          const oldTarget = healthData.targetWeight;
          setHealthData((prev) => ({ ...prev, targetWeight: newTarget }));
          setWeightToast({ type: 'target', oldValue: oldTarget, newValue: newTarget });
          setTimeout(() => setWeightToast(null), 4000);
          const diff = healthData.currentWeight - newTarget;
          replyMessage = `好的，已帮您将目标体重更新为 ${newTarget}kg 🎯\n\n当前体重 ${healthData.currentWeight}kg，距离目标还差 ${diff.toFixed(1)}kg，继续加油！`;
          setMessages((prev) => [...prev, {
            id: (Date.now() + 1).toString(),
            message: replyMessage,
            isUser: false,
            time: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
          }]);
          return;
        }
      }
      
      // 检测"打卡""导诊""医生分身"关键词，显示快捷入口
      if (message.includes("打卡") && message.includes("导诊") || 
          message.includes("打卡") && message.includes("医生") ||
          message.includes("导诊") && message.includes("医生")) {
        replyMessage = "体重管理助手为您提供三大核心功能：\n\n📅 **打卡中心**：记录每日体重、饮食、运动数据\n🩺 **智能导诊**：全面评估健康状，匹配专业方案\n👨‍⚕️ **医生分身**：24小时在线问诊，获取专业指导\n\n请选择您需要的功能：";
        showQuickAccessCard = true;
        quickAccessType = 'all';
      } else if (message.includes("打卡")) {
        replyMessage = "✅ 打卡功能可以帮您：\n\n📊 记录每日体重变化\n🍽️ 追踪饮食摄入\n💪 统计运动消耗\n📈 生成数据分析报告\n\n坚持打卡是成功减重的关键！";
        showQuickAccessCard = true;
        quickAccessType = 'checkin';
      } else if (message.includes("导诊")) {
        replyMessage = "智能导诊可以帮您：\n\n 全面评估健康状况\n✅ 识别潜在风险因素\n✅ 匹配专业医生分身\n✅ 制定个性化方案\n\n整个过程大约需要5-10分钟。";
        showQuickAccessCard = true;
        quickAccessType = 'triage';
      } else if (message.includes("医生") || message.includes("分身") || message.includes("问诊") || message.includes("咨询医生")) {
        replyMessage = "医生分身可以为您提供：\n\n👨‍⚕️ 24小时在线问诊\n💊 专业健康指导\n📋 个性化方案制定\n🏥 线上线下就诊建议\n\n我们有多位专业医生分身，涵盖内分泌、营养、运动、心理等领域。";
        showQuickAccessCard = true;
        quickAccessType = 'doctor';
      }
      // 检测打卡相关内容（仅设置卡片标志，回复由模式函数生成）
      else if (message.includes("早餐") || message.includes("午餐") || message.includes("晚餐") ||
          message.includes("吃了") || message.includes("食物") || message.match(/\d+.*卡/)) {
        showCheckinCard = true;
      } else if (message.includes("运动") || message.includes("跑步") || message.includes("健身") ||
                 message.includes("锻炼") || message.includes("游泳") || message.includes("瑜伽")) {
        showCheckinCard = true;
      }

      // 根据模式生成回复
      const currentMode = aiModeRef.current;
      const isExpert = currentMode === "expert";
      let finalMessage = replyMessage;
      let citations: string[] | undefined;

      // 预测模式
      if (currentMode === "predict" && !showQuickAccessCard) {
        if (message.includes("手术")) {
          // 根据 BMI 判断是否适合手术预测
          const h = healthData.height;
          const w = healthData.currentWeight;
          const bmiVal = h > 0 && w > 0 ? w / Math.pow(h / 100, 2) : 0;

          if (bmiVal > 0 && bmiVal < 18.5) {
            // 偏瘦
            setMessages((prev) => [...prev, {
              id: (Date.now() + 1).toString(),
              message: "⚠️ 根据您的数据，您的 BMI 为 " + bmiVal.toFixed(1) + "，属于偏瘦。\n\n体重偏低可能存在营养不良风险，不建议进行减重手术。建议您尽快到医院**营养科**就诊，进行专业的营养评估和干预。\n\n如果您有其他问题，也可以随时向我咨询。",
              isUser: false,
              time: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
            }]);
            return;
          } else if (bmiVal > 0 && bmiVal >= 18.5 && bmiVal < 24) {
            // 正常
            setMessages((prev) => [...prev, {
              id: (Date.now() + 1).toString(),
              message: "✅ 根据您的数据，您的 BMI 为 " + bmiVal.toFixed(1) + "，属于正常范围。\n\n目前各项指标正常，不建议进行减重手术。继续保持良好的饮食和运动习惯哦！\n\n如果您有其他问题，可以随时向我咨询。",
              isUser: false,
              time: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
            }]);
            return;
          }

          // 超重/肥胖 → 正常走手术预测流程
          if (!isNewUser) {
            setMessages((prev) => [...prev, {
              id: `surgery-info-${Date.now()}`,
              message: "",
              isUser: false,
              time: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
              isSurgeryInfoCard: true,
            }]);
            return;
          }
          setMessages((prev) => [...prev, {
            id: (Date.now() + 1).toString(),
            message: "",
            isUser: false,
            time: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
            ...generateSurgeryPredictMessage(),
          }]);
        } else {
          setMessages((prev) => [...prev, {
            id: (Date.now() + 1).toString(),
            message: "目前仅支持手术效果预测，其他预测功能正在开发中，敬请期待 🔬",
            isUser: false,
            time: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
          }]);
        }
        return;
      }

      if (!showQuickAccessCard) {
        if (isExpert) {
          const r = generateExpertReply(message);
          finalMessage = r.message;
          citations = r.citations;
        } else {
          finalMessage = generateFastReply(message);
        }
      }

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          message: finalMessage,
          isUser: false,
          time: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
          isExpertMode: isExpert,
          citations,
        },
      ]);

      // 显示打卡中心卡片
      if (showCheckinCard) {
        setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            {
              id: (Date.now() + 2).toString(),
              message: "",
              isUser: false,
              time: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
              isCheckinCard: true,
            },
          ]);
        }, 500);
      }

      // 显示快捷入口卡片
      if (showQuickAccessCard) {
        setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            {
              id: (Date.now() + 2).toString(),
              message: "",
              isUser: false,
              time: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
              isQuickAccessCard: true,
              quickAccessType,
            },
          ]);
        }, 500);
      }

      // 显示医生列表卡片
      if (showDoctorListCard) {
        const doctors = [
          {
            id: "1",
            name: "李明医生",
            title: "主任医师",
            specialty: "内分泌科专家",
            expertise: "肥胖症、代谢综合征、糖尿病、甲状腺疾病",
            avatar: "👨‍⚕️",
            gradient: "from-blue-500 to-purple-500",
          },
          {
            id: "2",
            name: "王芳医生",
            title: "副主医师",
            specialty: "营养科专家",
            expertise: "营养评估、饮食调理、体重管理、慢性病营养干预",
            avatar: "👩‍⚕️",
            gradient: "from-green-500 to-teal-500",
          },
          {
            id: "3",
            name: "张伟医生",
            title: "主治医师",
            specialty: "运动医学专家",
            expertise: "运动处方、运动损伤、康复训练、体能评估",
            avatar: "👨‍⚕️",
            gradient: "from-orange-500 to-red-500",
          },
        ];

        setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            {
              id: (Date.now() + 2).toString(),
              message: "",
              isUser: false,
              time: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
              isDoctorListCard: true,
              doctors,
            },
          ]);
        }, 500);
      }
    }, 1000);
  };

  const handleSurgeryInfoSubmit = (_data: { diabetes: boolean; hypertension: boolean; hyperlipidemia: boolean }) => {
    setTimeout(() => {
      setMessages((prev) => [...prev, {
        id: Date.now().toString(),
        message: "",
        isUser: false,
        time: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
        ...generateSurgeryPredictMessage(),
      }]);
    }, 600);
  };

  const generateSurgeryPredictMessage = () => {
    const { height, currentWeight, bmi } = healthData;
    const hasData = height > 0 && currentWeight > 0;
    if (hasData) {
      const idealWeight = (height / 100) * (height / 100) * 24;
      const ewl = currentWeight - idealWeight;
      const loss1y = Math.round(ewl * 0.68);
      return {
        isSurgeryPredictCard: true,
        surgeryPredictData: {
          height, currentWeight, bmi,
          weight3m: Math.round(currentWeight - ewl * 0.35),
          weight6m: Math.round(currentWeight - ewl * 0.55),
          weight1y: Math.round(currentWeight - loss1y),
          loss1y, diabetesRate: 65, bpRate: 72, lipidRate: 63,
        },
      };
    }
    return { message: "请告诉我您的基本信息，我来为您生成预测报告：\n\n1️⃣ 当前体重和身高是多少？\n2️⃣ 是否有糖尿病、高血压或高血脂？\n3️⃣ 考虑哪种手术方式（袖状胃切除 / 胃旁路）？" };
  };

  const handleQuickQuestion = (question: string) => {
    setMessages(prev => [...prev, { id: Date.now().toString(), message: question, isUser: true, time: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }) }]);

    setTimeout(() => {
      const mode = aiModeRef.current;
      if (mode === "predict") {
        if (question.includes("手术")) {
          setMessages(prev => [...prev, {
            id: (Date.now() + 1).toString(),
            message: "",
            isUser: false,
            time: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
            ...generateSurgeryPredictMessage(),
          }]);
        } else {
          setMessages(prev => [...prev, {
            id: (Date.now() + 1).toString(),
            message: "目前仅支持手术效果预测，其他预测功能正在开发中，敬请期待 🔬",
            isUser: false,
            time: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
          }]);
        }
        return;
      }
      const isExpert = mode === "expert";
      let finalMessage: string;
      let citations: string[] | undefined;
      if (isExpert) {
        const r = generateExpertReply(question);
        finalMessage = r.message;
        citations = r.citations;
      } else {
        finalMessage = generateFastReply(question);
      }
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        message: finalMessage,
        isUser: false,
        time: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
        isExpertMode: isExpert,
        citations,
      }]);
    }, 1000);
  };

  // 处理智能导诊
  const handleTriageStart = () => {
    console.log("handleTriageStart called");
    
    // 设置导诊状态为basic，开始第一阶段
    setTriageStage("basic");
    setTriageQuestionIndex(0);
    
    // 页面上滑效果
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
    
    // 添加用户消息
    setMessages(prev => [...prev, { 
      id: Date.now().toString(), 
      message: "我想开始智能导诊", 
      isUser: true, 
      time: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })
    }]);
    
    // AI 欢迎并开始第一个问题
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        id: (Date.now() + 1).toString(), 
        message: "好的！我来帮您进行智能导诊评估。\n\n接下来我会通过几个问题了解您的情况，为您推荐最合适的科室和医生。整个过程大约需要3-5分钟。\n\n让我们开始吧！", 
        isUser: false, 
        time: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })
      }]);
      
      // 第一个问题
      setTimeout(() => {
        const firstQuestion = triageQuestions.basic[0];
        setMessages(prev => [...prev, { 
          id: (Date.now() + 2).toString(), 
          message: firstQuestion.question, 
          isUser: false, 
          time: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
          options: firstQuestion.options
        }]);
      }, 1000);
    }, 1000);
  };

  // 处理导诊问题回答
  const handleTriageAnswer = (answer: string) => {
    console.log("Triage answer:", answer, "Stage:", triageStage, "Index:", triageQuestionIndex);
    
    // 特殊处理：如果导诊已完成，忽略后续选择（导诊结果卡片已自动推送）
    if (triageStage === "complete") {
      return;
    }
    
    // 添加用户的回答
    setMessages(prev => [...prev, { 
      id: Date.now().toString(), 
      message: answer, 
      isUser: true, 
      time: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })
    }]);
    
    // 增加问题索引
    const nextIndex = triageQuestionIndex + 1;
    setTriageQuestionIndex(nextIndex);
    
    setTimeout(() => {
      askNextTriageQuestion(triageStage, nextIndex);
    }, 1000);
  };

  // 询问下一个导诊问题
  const askNextTriageQuestion = (stage: TriageStage, questionIndex: number) => {
    if (stage === "idle" || stage === "complete") return;
    
    const currentQuestions = triageQuestions[stage];
    
    if (questionIndex >= currentQuestions.length) {
      // 当前阶段结束，进入下一阶段
      if (stage === "basic") {
        setTriageStage("symptoms");
        setTriageQuestionIndex(0);
        setTimeout(() => {
          setMessages(prev => [...prev, { 
            id: Date.now().toString(), 
            message: "很好！基信息已收集完成。\n\n接下来进入症状评估阶段，了解您的身体状况和生活习惯。", 
            isUser: false, 
            time: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })
          }]);
          
          setTimeout(() => {
            const firstQuestion = triageQuestions.symptoms[0];
            setMessages(prev => [...prev, { 
              id: (Date.now() + 1).toString(), 
              message: firstQuestion.question, 
              isUser: false, 
              time: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
              options: firstQuestion.options
            }]);
          }, 1000);
        }, 500);
      } else if (stage === "symptoms") {
        setTriageStage("risk");
        setTriageQuestionIndex(0);
        setTimeout(() => {
          setMessages(prev => [...prev, { 
            id: Date.now().toString(), 
            message: "症状评估完成！\n\n现在进入最后一个阶段：风险评估。这将帮助我们更好地为您制定安全有效的方案。", 
            isUser: false, 
            time: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })
          }]);
          
          setTimeout(() => {
            const firstQuestion = triageQuestions.risk[0];
            setMessages(prev => [...prev, { 
              id: (Date.now() + 1).toString(), 
              message: firstQuestion.question, 
              isUser: false, 
              time: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
              options: firstQuestion.options
            }]);
          }, 1000);
        }, 500);
      } else if (stage === "risk") {
        // 完成所有评估
        setTriageStage("complete");
        setTimeout(() => {
          setMessages(prev => [...prev, {
            id: Date.now().toString(),
            message: "🎉 太棒了！所有信息已收集完成。\n\n正在为您生成评估报告...",
            isUser: false,
            time: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })
          }]);

          // 显示导诊结果卡片（含互联网问诊 + 线下预约挂号两个按钮）
          setTimeout(() => {
            setMessages(prev => [...prev, {
              id: (Date.now() + 1).toString(),
              message: "",
              isUser: false,
              time: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
              isTriageResultCard: true,
            }]);
          }, 2000);
        }, 500);
      }
      return;
    }
    
    // 询问当前阶段的下一个问题
    const nextQuestion = currentQuestions[questionIndex];
    setMessages(prev => [...prev, { 
      id: Date.now().toString(), 
      message: nextQuestion.question, 
      isUser: false, 
      time: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
      options: nextQuestion.options
    }]);
  };

  // 获取 AI 回复
  const getAIResponse = (question: string) => {
    switch (question) {
      case "如何科学减重？":
        return "科学减重需要合理控制饮食和适量运动的结合。\n\n建议您：\n1️⃣ 每天控制热量摄入在1500-1800千卡\n2️⃣ 每周进行150分钟中等强度有氧运动\n3⃣ 保证充足睡眠和规律作息\n\n需要我为您制定详细的减重方案吗？";
      case "今天吃什么比较健康？":
        return "康饮食建：\n\n🥗 多吃：\n• 新鲜蔬菜水果\n• 全谷物（糙米、燕麦）\n• 优质蛋白（肉、鸡胸肉）\n\n🚫 少吃：\n• 高糖食物和饮料\n• 油食品\n• 加工肉制品\n\n需要查看详细的每日饮食方案吗？";
      case "适合我的运动方案":
        return "运动建议：\n\n• 运动前做好热身\n• 运动后及时补充水分\n• 注意循序渐进，避免过度疲劳\n\n💡 建议您前往打卡中心记录运动详情，系统会为您计消耗的卡路里。";
      default:
        return "我已收到您的消息，让我为您分析一下...";
    }
  };

  // 处理用户信息表单提交
  const handleUserInfoSubmit = (data: { phone: string; name: string; age: number; height: number; weight: number; medicalRecord?: string }) => {
    // 计算BMI
    const bmi = data.weight / Math.pow(data.height / 100, 2);
    
    // 更新健康数据
    setHealthData((prev) => ({
      ...prev,
      age: data.age,
      height: data.height,
      currentWeight: data.weight,
      yesterdayWeight: data.weight,
      targetWeight: data.weight > 60 ? data.weight - 5 : data.weight,
      bmi: parseFloat(bmi.toFixed(2)),
    }));

    // 如果填写了病案号，同时保存
    if (data.medicalRecord) {
      setMedicalRecordNumber(data.medicalRecord);
    }

    // 完成信息收集
    setUserInfoStage("complete");

    // 添加确认消息
    setTimeout(() => {
      const medicalRecordInfo = data.medicalRecord 
        ? `\n• 病案号：${data.medicalRecord}` 
        : '';
      
      const medicalRecordTip = data.medicalRecord
        ? ''
        : '\n\n💡 如果您有邵逸夫医院的病案号，可以点击「我的健康数据」卡片中的「绑定病案号」进行绑定。';
      
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          message: `✅ 太好了，${data.name}！您的基本信息已成功录入。\n\n📊 您的健康数据：\n• 年龄：${data.age}岁\n• 身高：${data.height}cm\n• 体重：${data.weight}kg\n• BMI${bmi.toFixed(1)}${medicalRecordInfo}${medicalRecordTip}`,
          isUser: false,
          time: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
        },
      ]);

      // 如果新用户未绑定设备，显示设备绑定提示弹窗
      if (!hasDeviceBound) {
        setTimeout(() => {
          setShowDeviceBindingModal(true);
        }, 1500);
      }
    }, 500);
  };

  // 打开编辑健康数据弹窗
  const handleOpenHealthDataModal = () => {
    setTempHealthData({
      age: healthData.age.toString(),
      height: healthData.height.toString(),
      currentWeight: healthData.currentWeight.toString(),
      targetWeight: healthData.targetWeight.toString(),
    });
    setShowHealthDataModal(true);
  };

  // 保存健康数据
  const handleSaveHealthData = () => {
    const age = parseInt(tempHealthData.age);
    const height = parseInt(tempHealthData.height);
    const currentWeight = parseFloat(tempHealthData.currentWeight);
    const targetWeight = parseFloat(tempHealthData.targetWeight);

    if (isNaN(age) || isNaN(height) || isNaN(currentWeight) || isNaN(targetWeight)) {
      alert("请输入有效的数据");
      return;
    }

    const bmi = currentWeight / Math.pow(height / 100, 2);

    setHealthData({
      ...healthData,
      age,
      height,
      currentWeight,
      targetWeight,
      bmi: parseFloat(bmi.toFixed(2)),
    });

    setShowHealthDataModal(false);
  };

  // 打开病案号绑定弹窗
  const handleOpenMedicalRecordModal = () => {
    setTempMedicalRecord(medicalRecordNumber);
    setShowQRScanner(false);
    setShowMedicalRecordModal(true);
  };

  // 互联网医院问诊 - 推送文字 + 医生卡片
  const handleOnlineConsult = () => {
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      message: "为您推荐互联网医院减重专家，可以在线咨询与挂号",
      isUser: false,
      time: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
    }]);

    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        message: "",
        isUser: false,
        time: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
        isDoctorListCard: true,
        doctors: [
          {
            id: "online-1",
            name: "张建华",
            title: "主任医师",
            specialty: "内分泌科 · 线上问诊",
            expertise: "擅长肥胖症、代谢综合征、糖尿病等内分泌疾病的诊疗",
            avatar: "",
            gradient: "linear-gradient(135deg, #2B5BFF 0%, #6B8FFF 100%)",
          },
          {
            id: "online-2",
            name: "王丽萍",
            title: "副主任医师",
            specialty: "营养科 · 线上问诊",
            expertise: "专注体重管理和营养干预，擅长定制个性化饮食方案",
            avatar: "",
            gradient: "linear-gradient(135deg, #2B5BFF 0%, #6B8FFF 100%)",
          },
        ],
      }]);
    }, 800);
  };

  // 线下预约挂号 - 推送文字 + 医院/医生卡片
  const handleOfflineAppointment = () => {
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      message: "已为您匹配附近可预约的线下门诊医生，您可以选择合适的医生进行预约挂号",
      isUser: false,
      time: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
    }]);

    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        message: "",
        isUser: false,
        time: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
        isHospitalCard: true,
      }]);
    }, 500);

    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: (Date.now() + 2).toString(),
        message: "",
        isUser: false,
        time: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
        isDoctorListCard: true,
        doctors: [
          {
            id: "offline-1",
            name: "张建华",
            title: "主任医师",
            specialty: "内分泌科 · 门诊",
            expertise: "擅长肥胖症、代谢综合征的诊疗，从业28年",
            avatar: "",
            gradient: "linear-gradient(135deg, #2B5BFF 0%, #6B8FFF 100%)",
          },
          {
            id: "offline-2",
            name: "李明",
            title: "副主任医师",
            specialty: "临床营养科 · 门诊",
            expertise: "专注体重管理和代谢性疾病营养干预，从业15年",
            avatar: "",
            gradient: "linear-gradient(135deg, #2B5BFF 0%, #6B8FFF 100%)",
          },
        ],
      }]);
    }, 1200);
  };

  // 健康评估 - 模拟报告上传
  const handleReportUpload = (type: "body-composition" | "medical-history") => {
    const typeLabel = type === "body-composition" ? "体脂成分分析报告" : "既往病史/体检报告";

    // 模拟用户上传
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      message: `[已上传 ${typeLabel}]`,
      isUser: true,
      time: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
    }]);

    // 模拟 AI 分析中
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        message: "正在分析您的报告，请稍候...",
        isUser: false,
        time: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
      }]);
    }, 800);

    // 模拟分析结果：由隐藏开关控制（默认正常，开启后异常）
    setTimeout(() => {
      const isNormal = !demoForceAbnormal;

      if (type === "body-composition") {
        if (isNormal) {
          setMessages(prev => [...prev, {
            id: (Date.now() + 2).toString(),
            message: "📊 **体脂成分分析结果**\n\n✅ 体脂率：22.3%（正常范围）\n✅ 内脏脂肪等级：4（正常范围）\n✅ 肌肉量：42.1kg（正常）\n✅ 基础代谢率：1,356 kcal/天\n\n各项指标均在正常范围内，建议定期复查，持续关注指标变化。",
            isUser: false,
            time: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
          }]);
        } else {
          setMessages(prev => [...prev, {
            id: (Date.now() + 2).toString(),
            message: "📊 **体脂成分分析结果**\n\n⚠️ 体脂率：31.5%（偏高）\n⚠️ 内脏脂肪等级：9（偏高）\n✅ 肌肉量：38.2kg（正常）\n✅ 基础代谢率：1,280 kcal/天\n\n发现体脂率和内脏脂肪偏高，存在代谢综合征风险，需要体重健康管理，建议到专科门诊进一步评估诊治。",
            isUser: false,
            time: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
          }]);
          // 推送线下挂号卡片
          setTimeout(() => {
            setMessages(prev => [...prev, {
              id: (Date.now() + 3).toString(),
              message: "",
              isUser: false,
              time: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
              isHealthAssessmentCard: true,
            }]);
          }, 1000);
        }
      } else {
        // 既往病史/体检报告
        if (isNormal) {
          setMessages(prev => [...prev, {
            id: (Date.now() + 2).toString(),
            message: "📋 **体检报告分析结果**\n\n✅ 血压：118/76 mmHg（正常）\n✅ 空腹血糖：4.8 mmol/L（正常）\n✅ 总胆固醇：4.2 mmol/L（正常）\n✅ 甘油三酯：1.1 mmol/L（正常）\n✅ 肝功能：ALT 22 U/L（正常）\n\n各项指标均在正常范围内，建议每年定期体检，持续关注各项指标变化。",
            isUser: false,
            time: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
          }]);
        } else {
          setMessages(prev => [...prev, {
            id: (Date.now() + 2).toString(),
            message: "📋 **体检报告分析结果**\n\n✅ 血压：120/80 mmHg（正常）\n⚠️ 空腹血糖：6.5 mmol/L（偏高）\n⚠️ 总胆固醇：5.8 mmol/L（偏高）\n✅ 甘油三酯：1.4 mmol/L（正常）\n✅ 肝功能：ALT 28 U/L（正常）\n\n发现血糖和胆固醇偏高，有糖尿病前期和心血管疾病风险。建议尽早到医院内分泌科就诊。",
            isUser: false,
            time: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
          }]);
          // 推送线下挂号卡片
          setTimeout(() => {
            setMessages(prev => [...prev, {
              id: (Date.now() + 3).toString(),
              message: "",
              isUser: false,
              time: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
              isHealthAssessmentCard: true,
            }]);
          }, 1000);
        }
      }
    }, 2500);
  };

  // 推送导诊卡片
  const pushTriageCard = () => {
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `triage-card-${Date.now()}`,
          message: "",
          isUser: false,
          time: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
          isTriageCard: true,
        },
      ]);
    }, 800);
  };

  // 处理代餐购买支付成功
  const handlePaymentSuccess = () => {
    setShowPaymentModal(false);
    setShowMealProductDetail(false);
    
    // 跳转到我的订单页面
    navigate('/orders');
  };

  // 保存病案号
  const handleSaveMedicalRecord = () => {
    if (!tempMedicalRecord.trim()) {
      alert("请输入病案号");
      return;
    }
    
    // 简单验证病案号格式（这里假设是8位数字）
    if (!/^\d{8,12}$/.test(tempMedicalRecord)) {
      alert("病案号格式不正确，请输入8-12位数字");
      return;
    }

    setMedicalRecordNumber(tempMedicalRecord);
    setShowMedicalRecordModal(false);
    
    // 显示成功提示消息
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          message: `✅ 病案号绑定成功！\n\n您的病案号：${tempMedicalRecord}`,
          isUser: false,
          time: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    }, 300);
  };

  // 模拟扫码绑定
  const handleQRCodeScan = () => {
    // 模拟扫码成功，生成一个随机病案号
    const mockMedicalRecord = Math.floor(10000000 + Math.random() * 90000000).toString();
    setTempMedicalRecord(mockMedicalRecord);
    setShowQRScanner(false);
    
    // 自动保存
    setTimeout(() => {
      setMedicalRecordNumber(mockMedicalRecord);
      setShowMedicalRecordModal(false);
      
      // 显示成功提示
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            message: `✅ 扫码成功！病案号已自动绑定。\n\n您的病案号：${mockMedicalRecord}\n\n现在您可以查看更完整的医疗记录和历史数据。`,
            isUser: false,
            time: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
      }, 300);
    }, 1500);
  };

  useEffect(() => {
    console.log("Messages updated, count:", messages.length, messages);
    if (messagesEndRef.current) {
      // 使用 setTimeout 确保 DOM 已更新
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
      }, 100);
    }
  }, [messages]);

  // 当用户状态改变时，重置消息列表
  useEffect(() => {
    console.log("User status changed to:", userStatus);
    if (isNewUser) {
      // 新用户：从 localStorage 读取弹窗填写的基本信息
      const savedInfo = localStorage.getItem("newUserInfo");
      if (savedInfo) {
        try {
          const info = JSON.parse(savedInfo);
          const bmi = info.weight / Math.pow(info.height / 100, 2);
          setHealthData({
            age: info.age || 0,
            height: info.height || 0,
            currentWeight: info.weight || 0,
            yesterdayWeight: info.weight || 0,
            targetWeight: info.weight > 60 ? info.weight - 5 : info.weight,
            bmi: parseFloat(bmi.toFixed(2)),
          });
        } catch {
          setHealthData({ age: 0, height: 0, currentWeight: 0, yesterdayWeight: 0, targetWeight: 0, bmi: 0 });
        }
      } else {
        setHealthData({ age: 0, height: 0, currentWeight: 0, yesterdayWeight: 0, targetWeight: 0, bmi: 0 });
      }
      
      // 设置初始消息 - 显示用户信息表单卡片
      setMessages([
        {
          id: "welcome-1",
          message: "您好！欢迎使用体重管理助手 👋",
          isUser: false,
          time: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
        },
        {
          id: "user-info-form",
          message: "",
          isUser: false,
          time: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
          isUserInfoFormCard: true,
        },
      ]);
      setUserInfoStage("phone");
    } else {
      // 老用户：优先从 localStorage 读取弹窗填写的数据，没有则用默认值
      const savedInfo = localStorage.getItem("newUserInfo");
      if (savedInfo) {
        try {
          const info = JSON.parse(savedInfo);
          const bmi = info.weight / Math.pow(info.height / 100, 2);
          setHealthData({
            age: info.age || 30,
            height: info.height || 163,
            currentWeight: info.weight || 49,
            yesterdayWeight: info.weight || 49.2,
            targetWeight: info.weight > 60 ? info.weight - 5 : info.weight || 48,
            bmi: parseFloat(bmi.toFixed(2)),
          });
        } catch {
          setHealthData({ age: 30, height: 163, currentWeight: 49, yesterdayWeight: 49.2, targetWeight: 48, bmi: 23 });
        }
      } else {
        setHealthData({
          age: 30,
          height: 163,
          currentWeight: 49,
          yesterdayWeight: 49.2,
          targetWeight: 48,
          bmi: 23,
        });
      }
      
      /* 快捷提问暂时隐藏，用户说"加上轻盈计划"时恢复:
      setMessages([
        {
          id: "questions-card",
          message: "",
          isUser: false,
          time: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
          isQuestionCard: true,
          questions: allQuestions[0],
        },
      ]);
      */
      setMessages([]);
      setUserInfoStage("idle");
    }
    // 重置问题集索引
    setQuestionSet(0);
  }, [userStatus]);

  // 监听从Plan页面返回时的状态
  useEffect(() => {
    if (location.state?.planActivated) {
      // 设置计划已开启状态
      setIsPlanActivated(true);
      
      // 添加AI消息
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          message: "🎉 太棒了！您的轻盈计划已成功开启！",
          isUser: false,
          time: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })
        }]);
        
        // 添加计划卡片（已开启状态）
        setTimeout(() => {
          setMessages(prev => [...prev, {
            id: (Date.now() + 1).toString(),
            message: "",
            isUser: false,
            time: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
            isPlanCard: true,
            isActivated: true, // 已开启状态
          }]);
        }, 500);
      }, 300);
      
      // 清除state以避免重复触发
      window.history.replaceState({}, document.title);
    }
  }, [location.state?.planActivated]);

  // 根据入口参数触发不同行为
  useEffect(() => {
    if (fromEntry === "qa") return;

    const timer = setTimeout(() => {
      if (fromEntry === "assessment") {
        // 健康评估：直接从 localStorage 读取用户填写的真实数据
        let h = healthData.height;
        let w = healthData.currentWeight;
        try {
          const savedInfo = localStorage.getItem("newUserInfo");
          if (savedInfo) {
            const info = JSON.parse(savedInfo);
            h = info.height || h;
            w = info.weight || w;
          }
        } catch {}
        const bmiVal = h > 0 && w > 0 ? w / Math.pow(h / 100, 2) : 0;

        let category = "";
        if (bmiVal < 18.5) {
          category = "偏瘦";
        } else if (bmiVal < 24) {
          category = "正常";
        } else if (bmiVal < 28) {
          category = "超重";
        } else {
          category = "肥胖";
        }

        // 第1步：推送 BMI 分析卡片（富文本卡片样式）
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          message: "",
          isUser: false,
          time: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
          isBmiAnalysisCard: true,
          bmiData: { height: h, weight: w, bmi: parseFloat(bmiVal.toFixed(1)), category },
        }]);

        // 第2步：根据分段推送不同的卡片
        setTimeout(() => {
          if (bmiVal >= 24 || bmiVal < 18.5) {
            // 肥胖/超重/偏瘦 → 线下挂号卡片
            setMessages(prev => [...prev, {
              id: (Date.now() + 1).toString(),
              message: "",
              isUser: false,
              time: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
              isHealthAssessmentCard: true,
            }]);
          } else {
            // 正常 → 报告上传卡片
            setMessages(prev => [...prev, {
              id: (Date.now() + 1).toString(),
              message: "",
              isUser: false,
              time: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
              isReportUploadCard: true,
            }]);
          }
        }, 1500);
      } else if (fromEntry === "appointment") {
        // 预约挂号：不再自动推送消息，由欢迎卡片引导
      } else if (fromEntry === "prediction") {
        handleModeChange("predict");
        // 不再自动推送消息，由欢迎卡片引导
      } else if (fromEntry === "package") {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          message: "",
          isUser: false,
          time: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
          isServicePackagePlaceholder: true,
        }]);
      } else if (fromEntry === "triage") {
        handleTriageStart();
      }
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="h-screen flex flex-col relative overflow-hidden" style={{ backgroundColor: "#FAFAFF" }}>
      {/* 体重更新 - 顶部通知条 + 情绪差异化 */}
      <AnimatePresence>
        {weightToast && (() => {
          const isPositive = weightToast.newValue < weightToast.oldValue;
          return (
            <motion.div
              initial={{ y: -80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -80, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={() => setWeightToast(null)}
              style={{
                position: "fixed",
                top: "calc(env(safe-area-inset-top, 0px) + 12px)",
                left: "16px",
                right: "16px",
                zIndex: 9999,
                background: isPositive
                  ? "linear-gradient(135deg, rgba(16,185,129,0.95) 0%, rgba(5,150,105,0.95) 100%)"
                  : "rgba(255, 255, 255, 0.92)",
                backdropFilter: isPositive ? "none" : "blur(20px)",
                WebkitBackdropFilter: isPositive ? "none" : "blur(20px)",
                borderRadius: "16px",
                padding: "14px 18px",
                boxShadow: isPositive
                  ? "0 8px 32px rgba(16, 185, 129, 0.3)"
                  : "0 8px 32px rgba(0, 0, 0, 0.1)",
                border: isPositive ? "none" : "1px solid rgba(255, 255, 255, 0.6)",
                display: "flex",
                alignItems: "center",
                gap: "14px",
                cursor: "pointer",
                overflow: "hidden",
              }}
            >
              {/* 正向时的撒花粒子 */}
              {isPositive && Array.from({ length: 8 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 1, x: 0, y: 0 }}
                  animate={{
                    opacity: [1, 1, 0],
                    x: (Math.random() - 0.5) * 200,
                    y: (Math.random() - 0.5) * 100,
                    scale: [1, 1.3, 0],
                    rotate: Math.random() * 360,
                  }}
                  transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 + Math.random() * 0.3 }}
                  style={{
                    position: "absolute",
                    top: "50%", left: "50%",
                    width: `${4 + Math.random() * 5}px`,
                    height: `${4 + Math.random() * 5}px`,
                    borderRadius: Math.random() > 0.5 ? "50%" : "1px",
                    background: ["#FFD700", "#FFF", "#FFEAA7", "#98D8C8", "#DDA0DD", "#FFE4E1"][i % 6],
                    pointerEvents: "none" as const,
                  }}
                />
              ))}
              {/* 左侧图标 */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.15 }}
                style={{
                  width: "42px", height: "42px", borderRadius: "12px",
                  background: isPositive
                    ? "rgba(255, 255, 255, 0.25)"
                    : "linear-gradient(135deg, #E0E7FF 0%, #C7D2FE 100%)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <span style={{ fontSize: "20px" }}>{isPositive ? '🎉' : '📝'}</span>
              </motion.div>
              {/* 文字内容 */}
              <div style={{ flex: 1, minWidth: 0, position: "relative", zIndex: 1 }}>
                <div style={{
                  fontSize: "14px", fontWeight: 600, marginBottom: "2px",
                  color: isPositive ? "#fff" : "#1A1A1A",
                }}>
                  {weightToast.type === 'target'
                    ? (isPositive ? '目标体重已下调 💪' : '目标体重已更新')
                    : (isPositive ? '体重下降了！' : '体重已记录')}
                </div>
                <div style={{
                  fontSize: "13px",
                  color: isPositive ? "rgba(255,255,255,0.8)" : "#8A8A93",
                  display: "flex", alignItems: "center", gap: "6px",
                }}>
                  <span>{weightToast.oldValue}kg</span>
                  <span style={{ color: isPositive ? "rgba(255,255,255,0.4)" : "#C0C0C8" }}>→</span>
                  <span style={{
                    fontWeight: 600,
                    color: isPositive ? "#fff" : "#1A1A1A",
                  }}>{weightToast.newValue}kg</span>
                </div>
              </div>
              {/* 右侧变化量 */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 15, stiffness: 300, delay: 0.2 }}
                style={{
                  background: isPositive ? "rgba(255,255,255,0.25)" : "rgba(59, 130, 246, 0.1)",
                  color: isPositive ? "#fff" : "#3B82F6",
                  borderRadius: "10px",
                  padding: "4px 10px",
                  fontSize: "13px",
                  fontWeight: 700,
                  flexShrink: 0,
                  position: "relative",
                  zIndex: 1,
                }}
              >
                {isPositive ? '↓' : '↑'}{Math.abs(weightToast.newValue - weightToast.oldValue).toFixed(1)}kg
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
      {/* 模糊渐变背景层 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
        {/* Vector 1 - 浅蓝紫色 */}
        <div
          className="absolute"
          style={{
            width: "246.5px",
            height: "398px",
            left: "0px",
            top: "0px",
            background: "#B3B7FF",
            filter: "blur(150px)",
            opacity: 1
          }}
        />
        
        {/* Vector 2 - 浅蓝色 */}
        <div
          className="absolute"
          style={{
            width: "399.5px",
            height: "216.5px",
            left: "0px",
            top: "659.5px",
            background: "#C5D8FF",
            filter: "blur(100px)",
            opacity: 1
          }}
        />
        
        {/* Ellipse 1 - 浅橙色 (左下) */}
        <div
          className="absolute"
          style={{
            width: "223px",
            height: "223px",
            left: "-125px",
            top: "548px",
            background: "#FFE3CB",
            opacity: 0.9,
            filter: "blur(150px)",
            borderRadius: "50%"
          }}
        />
        
        {/* Ellipse 2 - 浅橙色 (中间偏右) */}
        <div
          className="absolute"
          style={{
            width: "223px",
            height: "223px",
            left: "296px",
            top: "156px",
            background: "#FFD4B0",
            opacity: 0.9,
            filter: "blur(150px)",
            borderRadius: "50%"
          }}
        />
      </div>

      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        onTriageStart={handleTriageStart}
      />

      {/* 顶部导航 */}
      <div className="border-b border-gray-200 px-4 py-3 flex items-center justify-between relative" style={{ zIndex: 10 }}>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/campus")}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" style={{ color: "#1A1A1A" }} />
          </button>
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex items-center gap-2 hover:bg-gray-50 rounded-lg transition-colors px-1.5 py-1"
          >
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #2B5BFF 0%, #6B8FFF 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#FFFFFF",
                fontSize: "14px",
                fontWeight: 600,
                flexShrink: 0,
              }}
            >
              张
            </div>
            <span style={{ fontSize: "14px", fontWeight: 500, color: "#1A1A1A" }}>
              张**
            </span>
          </button>
        </div>
        <div className="flex items-center gap-2">
          {/* 老用户：切换代餐显示 */}
          {userStatus === "existing" && (
            <>
              <button
                onClick={() => setShowMealReminder(!showMealReminder)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-lg transition-all"
                style={{
                  background: showMealReminder ? "rgba(251, 146, 60, 0.1)" : "rgba(156, 163, 175, 0.1)",
                  backdropFilter: "blur(10px)",
                  border: showMealReminder ? "1px solid rgba(251, 146, 60, 0.2)" : "1px solid rgba(156, 163, 175, 0.2)",
                  color: showMealReminder ? "#FB923C" : "#6B7280",
                  fontWeight: 500
                }}
                title={showMealReminder ? "显示代餐提醒" : "隐藏代餐提醒"}
              >
                🥤
              </button>
            </>
          )}
          <button
            onClick={toggleUserStatus}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition-all"
            style={{
              background: "rgba(43, 91, 255, 0.1)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(43, 91, 255, 0.2)",
              color: "#2B5BFF",
              fontWeight: 500
            }}
            title="切换用户状态"
          >
            <Users className="w-3.5 h-3.5" />
            {userStatus === "new" ? "新用户" : "老用户"}
          </button>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="flex-1 overflow-y-auto relative" ref={messagesContainerRef} style={{ zIndex: 1 }}>
        <div className="max-w-4xl mx-auto p-4 space-y-4">
          {/* 健康数据卡片 - 固定第一位所有用户都显示 */}
          <HealthDataCardNew
            healthData={healthData}
            onEdit={handleOpenHealthDataModal}
            onMedicalRecordClick={handleOpenMedicalRecordModal}
            hasMedicalRecord={!!medicalRecordNumber}
            time={new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}
            planInfo={undefined} /* 轻盈计划暂时隐藏，用户说"加上轻盈计划"时恢复为: planInfo={userStatus === "existing" ? planInfo : undefined} */
          />

          {/* 老用户：显示代餐提醒卡片 */}
          {userStatus === "existing" && showMealReminder && (
            <MealReminderCard
              onConfirm={() => {
                // 记录代餐打卡并跳转到打卡页面
                setShowMealReminder(false);
                setMessages(prev => [...prev, {
                  id: Date.now().toString(),
                  message: "✅ 已记录您的代餐打卡！\n\n早餐代餐奶昔已完成，继续保持哦~",
                  isUser: false,
                  time: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })
                }]);
                // 跳转到打卡页面
                navigate("/checkin");
              }}
              onViewMealDetails={() => {
                // 打开代餐服务抽屉查看详情
                setShowMealServiceDrawer(true);
              }}
            />
          )}

          {/* 未完成导诊提示 */}
          {hasUnfinishedTriage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-4"
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-lg">📋</span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-amber-900 mb-1">
                    您有未完成的智能导诊
                  </h3>
                  <p className="text-sm text-amber-700 mb-3">
                    继续之前的导诊流程，完成后可获得专业的科室推荐和医生匹配
                  </p>
                  <Link
                    to="/triage"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-all shadow-md hover:shadow-lg"
                  >
                    继续导诊
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </motion.div>
          )}

          {/* 有问必答 - 功能介绍卡片（参照运动健康小助手样式） */}
          {userStatus === "existing" && fromEntry === "qa" && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: "linear-gradient(180deg, #F0F4FF 0%, #FFFFFF 60%)",
                borderRadius: "20px",
                overflow: "hidden",
                boxShadow: "0 2px 16px rgba(43, 91, 255, 0.08)",
                border: "1px solid rgba(43, 91, 255, 0.06)",
              }}
            >
              {/* 顶部 logo 居中 */}
              <div style={{
                display: "flex",
                justifyContent: "center",
                paddingTop: "28px",
                paddingBottom: "8px",
              }}>
                <div style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #2B5BFF 0%, #6B8FFF 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 16px rgba(43, 91, 255, 0.25)",
                }}>
                  <img
                    src={`${import.meta.env.BASE_URL}srrsh-logo.webp`}
                    alt="邵逸夫医院"
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "50%",
                      objectFit: "cover",
                    }}
                  />
                </div>
              </div>

              {/* 居中标题 + 副标题 */}
              <div style={{ textAlign: "center", padding: "8px 24px 6px" }}>
                <h3 style={{
                  fontSize: "17px",
                  fontWeight: 700,
                  color: "#1A1A1A",
                  margin: "0 0 8px 0",
                }}>
                  你好，我是体重管理助手
                </h3>
                <p style={{
                  fontSize: "13px",
                  color: "#8A8A93",
                  lineHeight: "20px",
                  margin: 0,
                }}>
                  专注体重健康管理，一键 AI 咨询，解答您的健康疑问
                </p>
              </div>

              {/* 功能亮点 */}
              <div style={{ padding: "12px 16px 6px", display: "flex", flexDirection: "column", gap: "6px" }}>
                {[
                  { icon: "💬", text: "可选快速 / 专家模式，精准解答健康问题" },
                  { icon: "📋", text: "减重方案、BMI 解读、术后指导一站式了解" },
                  { icon: "🔒", text: "对话内容加密存储，保护您的健康隐私" },
                ].map((item) => (
                  <div
                    key={item.text}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "10px 14px",
                      background: "rgba(43, 91, 255, 0.04)",
                      borderRadius: "10px",
                      fontSize: "13px",
                      color: "#5A5A6E",
                      lineHeight: "18px",
                    }}
                  >
                    <span style={{ fontSize: "14px", flexShrink: 0 }}>{item.icon}</span>
                    {item.text}
                  </div>
                ))}
              </div>

              {/* 模式说明 - 可点击切换 */}
              <div style={{ padding: "6px 16px 6px", display: "flex", gap: "8px" }}>
                <div
                  onClick={() => handleModeChange("fast")}
                  style={{
                    flex: 1, padding: "10px 12px",
                    background: aiMode === "fast" ? "rgba(43, 91, 255, 0.12)" : "rgba(43, 91, 255, 0.04)",
                    borderRadius: "10px",
                    textAlign: "center",
                    cursor: "pointer",
                    border: aiMode === "fast" ? "1.5px solid rgba(43, 91, 255, 0.3)" : "1.5px solid transparent",
                    transition: "all 0.2s",
                  }}
                >
                  <div style={{ fontSize: "22px", marginBottom: "6px" }}>⚡</div>
                  <div style={{ fontSize: "18px", fontWeight: 700, color: "#2B5BFF", marginBottom: "4px" }}>快速模式</div>
                  <div style={{ fontSize: "13px", color: "#8A8A93", lineHeight: "18px" }}>简洁回答，快速获取要点</div>
                </div>
                <div
                  onClick={() => handleModeChange("expert")}
                  style={{
                    flex: 1, padding: "10px 12px",
                    background: aiMode === "expert" ? "rgba(107, 143, 255, 0.12)" : "rgba(107, 143, 255, 0.04)",
                    borderRadius: "10px",
                    textAlign: "center",
                    cursor: "pointer",
                    border: aiMode === "expert" ? "1.5px solid rgba(107, 143, 255, 0.3)" : "1.5px solid transparent",
                    transition: "all 0.2s",
                  }}
                >
                  <div style={{ fontSize: "22px", marginBottom: "6px" }}>🎓</div>
                  <div style={{ fontSize: "18px", fontWeight: 700, color: "#6B8FFF", marginBottom: "4px" }}>专家模式</div>
                  <div style={{ fontSize: "13px", color: "#8A8A93", lineHeight: "18px" }}>详细解读，附参考文献</div>
                </div>
              </div>

              <div style={{ padding: "4px 16px 16px", textAlign: "center" }}>
                <p style={{ fontSize: "11px", color: "#C0C0C8", margin: 0 }}>
                  点击上方选择模式，也可在左下角随时切换
                </p>
              </div>
            </motion.div>
          )}

          {/* 预约挂号 - 功能介绍卡片 */}
          {userStatus === "existing" && fromEntry === "appointment" && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: "linear-gradient(180deg, #F0F4FF 0%, #FFFFFF 60%)",
                borderRadius: "20px",
                overflow: "hidden",
                boxShadow: "0 2px 16px rgba(43, 91, 255, 0.08)",
                border: "1px solid rgba(43, 91, 255, 0.06)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "center", paddingTop: "28px", paddingBottom: "8px" }}>
                <div style={{
                  width: "64px", height: "64px", borderRadius: "50%",
                  background: "linear-gradient(135deg, #2B5BFF 0%, #6B8FFF 100%)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 4px 16px rgba(43, 91, 255, 0.25)",
                }}>
                  <span style={{ fontSize: "32px" }}>🏥</span>
                </div>
              </div>
              <div style={{ textAlign: "center", padding: "8px 24px 20px" }}>
                <h3 style={{ fontSize: "17px", fontWeight: 700, color: "#1A1A1A", margin: "0 0 8px 0" }}>
                  邵逸夫体重管理中心门诊
                </h3>
                <p style={{ fontSize: "13px", color: "#8A8A93", lineHeight: "20px", margin: 0 }}>
                  我们有<span style={{ color: "#2B5BFF", fontWeight: 600 }}>内分泌科、营养科、外科</span>等多学科专家，为您提供<span style={{ color: "#2B5BFF", fontWeight: 600 }}>MDT多学科联合会诊</span>，一站式解决体重问题
                </p>
              </div>
              <div style={{ padding: "0 16px 20px", display: "flex", flexDirection: "column", gap: "10px" }}>
                <motion.div
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { /* 后续加跳转 */ }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "16px",
                    background: "rgba(255, 255, 255, 0.8)",
                    borderRadius: "12px",
                    cursor: "pointer",
                    border: "1px solid rgba(43, 91, 255, 0.08)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{
                      width: "44px", height: "44px", borderRadius: "12px",
                      background: "linear-gradient(135deg, #2B5BFF 0%, #6B8FFF 100%)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0,
                    }}>
                      <span style={{ fontSize: "22px" }}>🏥</span>
                    </div>
                    <div>
                      <div style={{ fontSize: "15px", fontWeight: 600, color: "#1A1A1A" }}>体重管理门诊</div>
                      <div style={{ fontSize: "12px", color: "#8A8A93", marginTop: "2px", paddingRight: "8px" }}>内分泌科 · 营养科 · 外科 · 多学科联合</div>
                    </div>
                  </div>
                  <div style={{
                    padding: "6px 14px", borderRadius: "8px",
                    background: "linear-gradient(135deg, #2B5BFF 0%, #6B8FFF 100%)",
                    color: "#FFFFFF", fontSize: "13px", fontWeight: 500, flexShrink: 0,
                  }}>
                    预约挂号
                  </div>
                </motion.div>
                <motion.div
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { /* 后续加互联网医院跳转 */ }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "16px",
                    background: "rgba(255, 255, 255, 0.8)",
                    borderRadius: "12px",
                    cursor: "pointer",
                    border: "1px solid rgba(43, 91, 255, 0.08)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{
                      width: "44px", height: "44px", borderRadius: "12px",
                      background: "linear-gradient(135deg, #7B5CF6 0%, #A78BFA 100%)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0,
                    }}>
                      <span style={{ fontSize: "22px" }}>💻</span>
                    </div>
                    <div>
                      <div style={{ fontSize: "15px", fontWeight: 600, color: "#1A1A1A" }}>邵逸夫互联网医院</div>
                      <div style={{ fontSize: "12px", color: "#8A8A93", marginTop: "2px", paddingRight: "8px" }}>在线问诊 · 远程会诊 · 足不出户</div>
                    </div>
                  </div>
                  <div style={{
                    padding: "6px 14px", borderRadius: "8px",
                    background: "linear-gradient(135deg, #7B5CF6 0%, #A78BFA 100%)",
                    color: "#FFFFFF", fontSize: "13px", fontWeight: 500, flexShrink: 0,
                  }}>
                    在线问诊
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* 减重预测 - 功能介绍卡片 */}
          {userStatus === "existing" && fromEntry === "prediction" && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: "linear-gradient(180deg, #F0F4FF 0%, #FFFFFF 60%)",
                borderRadius: "20px",
                overflow: "hidden",
                boxShadow: "0 2px 16px rgba(43, 91, 255, 0.08)",
                border: "1px solid rgba(43, 91, 255, 0.06)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "center", paddingTop: "28px", paddingBottom: "8px" }}>
                <div style={{
                  width: "64px", height: "64px", borderRadius: "50%",
                  background: "linear-gradient(135deg, #2B5BFF 0%, #6B8FFF 100%)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 4px 16px rgba(43, 91, 255, 0.25)",
                }}>
                  <span style={{ fontSize: "32px" }}>📊</span>
                </div>
              </div>
              <div style={{ textAlign: "center", padding: "8px 24px 20px" }}>
                <h3 style={{ fontSize: "17px", fontWeight: 700, color: "#1A1A1A", margin: "0 0 8px 0" }}>
                  AI 减重预测
                </h3>
                <p style={{ fontSize: "13px", color: "#8A8A93", lineHeight: "20px", margin: 0 }}>
                  根据您的健康评估数据，<span style={{ color: "#2B5BFF", fontWeight: 600 }}>AI 智能预测术后体重变化</span>，帮您提前了解手术效果，科学规划减重目标
                </p>
              </div>
              <div style={{ padding: "0 16px 20px", display: "flex", flexDirection: "column", gap: "10px" }}>
                <motion.div
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSendMessage("手术预测")}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "14px 16px",
                    background: "rgba(255, 255, 255, 0.8)",
                    borderRadius: "12px",
                    cursor: "pointer",
                    border: "1px solid rgba(43, 91, 255, 0.08)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{
                      width: "28px", height: "28px", borderRadius: "8px",
                      background: "linear-gradient(135deg, #E8EDFF 0%, #D6DEFF 100%)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0,
                    }}>
                      <span style={{ fontSize: "13px", fontWeight: 700, color: "#2B5BFF" }}>#</span>
                    </div>
                    <span style={{ fontSize: "14px", color: "#1A1A1A", fontWeight: 500 }}>减重手术疗效预测</span>
                  </div>
                  <div style={{
                    padding: "5px 14px", borderRadius: "8px",
                    background: "linear-gradient(135deg, #2B5BFF 0%, #6B8FFF 100%)",
                    color: "#FFFFFF", fontSize: "12px", fontWeight: 500, flexShrink: 0,
                  }}>
                    开始
                  </div>
                </motion.div>
                <div style={{
                  padding: "10px 12px",
                  background: "rgba(43, 91, 255, 0.04)",
                  borderRadius: "10px",
                  textAlign: "center",
                }}>
                  <p style={{ fontSize: "11px", color: "#8A8A93", lineHeight: "16px", margin: 0 }}>
                    更多预测（药物疗效、运动减重、饮食干预等）正在开发中
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* 聊天消息 */}
          <div className="space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} ref={msg.id === "user-info-form" ? userInfoFormRef : undefined}>
                <ChatMessage
                  {...msg}
                  onQuestionClick={handleQuickQuestion}
                  onRefreshQuestions={handleRefreshQuestions}
                  onTriageStart={handleTriageStart}
                  onTriageAnswer={handleTriageAnswer}
                  onUserInfoSubmit={handleUserInfoSubmit}
                  highlightUserInfoForm={msg.id === "user-info-form" ? highlightForm : false}
                  onSurgeryInfoSubmit={handleSurgeryInfoSubmit}
                  onMealProductClick={(product) => {
                    setSelectedMealPrice(product.price);
                    setShowPaymentModal(true);
                  }}
                  onOnlineConsult={handleOnlineConsult}
                  onOfflineAppointment={handleOfflineAppointment}
                  onReportUpload={handleReportUpload}
                  demoForceAbnormal={demoForceAbnormal}
                  onToggleDemoMode={() => setDemoForceAbnormal(prev => !prev)}
                />
              </div>
            ))}
          </div>
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 功能入口栏 */}
      <QuickActions
        onTriageClick={handleTriageStart}
        onDoctorClick={() => setDoctorDrawerOpen(true)}
        initialMode={fromEntry === "prediction" ? "predict" : "fast"}
        externalMode={aiMode}
        onDeviceClick={() => {
          // 根据设备绑定状态显示不同弹窗
          if (hasDeviceBound) {
            setShowDeviceInfoModal(true);
          } else {
            setShowDeviceBindingModal(true);
          }
        }}
        onMealServiceClick={() => {
          // 在对话中展示代餐服务列表
          setMessages(prev => [...prev, {
            id: Date.now().toString(),
            message: "我想看看代餐服务",
            isUser: true,
            time: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })
          }]);

          setTimeout(() => {
            setMessages(prev => [...prev, {
              id: (Date.now() + 1).toString(),
              message: "",
              isUser: false,
              time: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
              isMealProductList: true
            }]);
          }, 800);
        }}
        onAppointmentClick={() => {
          setMessages(prev => [...prev, {
            id: Date.now().toString(),
            message: "预约挂号",
            isUser: true,
            time: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })
          }]);
          setTimeout(() => {
            setMessages(prev => [...prev, {
              id: (Date.now() + 1).toString(),
              message: "",
              isUser: false,
              time: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
              isAppointmentCard: true,
            }]);
          }, 800);
        }}
        onModeChange={handleModeChange}
      />

      {/* 底部输框 */}
      <ChatInput
        onSend={handleSendMessage}
        placeholder="发消息或按住说话..."
        showImageUpload={true}
      />

      {/* 健数据编辑弹窗 */}
      <AnimatePresence>
        {showHealthDataModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowHealthDataModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-md w-full"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">编辑健康数据</h3>
                <button
                  onClick={() => setShowHealthDataModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">年龄</label>
                  <input
                    type="number"
                    value={tempHealthData.age}
                    onChange={(e) => setTempHealthData({...tempHealthData, age: e.target.value})}
                    placeholder="请输入年龄"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">身高（cm）</label>
                  <input
                    type="number"
                    value={tempHealthData.height}
                    onChange={(e) => setTempHealthData({...tempHealthData, height: e.target.value})}
                    placeholder="请输入身高"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">当前体重（kg）</label>
                  <input
                    type="number"
                    step="0.1"
                    value={tempHealthData.currentWeight}
                    onChange={(e) => setTempHealthData({...tempHealthData, currentWeight: e.target.value})}
                    placeholder="请输入当前体重"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">目标体重（kg）</label>
                  <input
                    type="number"
                    step="0.1"
                    value={tempHealthData.targetWeight}
                    onChange={(e) => setTempHealthData({...tempHealthData, targetWeight: e.target.value})}
                    placeholder="请输入目标体重"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowHealthDataModal(false)}
                    className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleSaveHealthData}
                    className="flex-1 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
                  >
                    保存
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 医生列表抽屉 */}
      <DoctorDrawer
        isOpen={doctorDrawerOpen}
        onClose={() => setDoctorDrawerOpen(false)}
      />

      {/* 代餐服务列表弹窗 */}
      <MealServiceDrawer
        isOpen={showMealServiceDrawer}
        onClose={() => setShowMealServiceDrawer(false)}
        onProductClick={(product) => {
          setSelectedMealPrice(product.price);
          setShowMealServiceDrawer(false);
          setShowMealProductDetail(true);
        }}
      />

      {/* 代餐商品详情弹窗 */}
      <MealProductDetailModal
        isOpen={showMealProductDetail}
        onClose={() => setShowMealProductDetail(false)}
        onPurchase={() => {
          setShowPaymentModal(true);
        }}
      />

      {/* 支付弹窗 */}
      <PaymentModal
        isOpen={showPaymentModal}
        amount={selectedMealPrice}
        onClose={() => setShowPaymentModal(false)}
        onSuccess={handlePaymentSuccess}
      />

      {/* 设备绑定引导弹窗 */}
      <DeviceBindingModal
        isOpen={showDeviceBindingModal}
        onClose={() => setShowDeviceBindingModal(false)}
        onBindSuccess={() => {
          // 绑定成功，更新设备绑定状态
          setHasDeviceBound(true);
        }}
      />

      {/* 设备信息概览弹窗 */}
      <DeviceInfoModal
        isOpen={showDeviceInfoModal}
        onClose={() => setShowDeviceInfoModal(false)}
      />

      {/* 病案号绑定弹窗 */}
      <AnimatePresence>
        {showMedicalRecordModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowMedicalRecordModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-md w-full"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">
                  {medicalRecordNumber ? "修改病案号" : "绑定病案号"}
                </h3>
                <button
                  onClick={() => setShowMedicalRecordModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {!showQRScanner ? (
                <>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        病案号
                      </label>
                      <input
                        type="text"
                        value={tempMedicalRecord}
                        onChange={(e) => setTempMedicalRecord(e.target.value)}
                        placeholder="请输入8-12位病案号"
                        maxLength={12}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        病案号可在邵逸夫医院就诊卡或病历本上找到
                      </p>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={() => {
                          setShowQRScanner(true);
                        }}
                        className="flex-1 py-3 bg-purple-50 text-purple-600 rounded-lg font-medium hover:bg-purple-100 transition-colors border-2 border-purple-200"
                      >
                        📱 扫码绑定
                      </button>
                      <button
                        onClick={handleSaveMedicalRecord}
                        className="flex-1 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
                      >
                        保存
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  {/* 扫码界面 */}
                  <div className="bg-gray-100 rounded-xl p-8 flex flex-col items-center justify-center min-h-[300px]">
                    <div className="w-48 h-48 bg-white rounded-xl flex items-center justify-center mb-4 border-4 border-dashed border-blue-300 animate-pulse">
                      <div className="text-center">
                        <div className="text-6xl mb-2">📷</div>
                        <p className="text-sm text-gray-600">扫描中...</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 text-center">
                      请将二维码对准扫描框
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowQRScanner(false)}
                      className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                    >
                      取消
                    </button>
                    <button
                      onClick={handleQRCodeScan}
                      className="flex-1 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
                    >
                      模拟扫码成功
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}