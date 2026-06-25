import { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  GraduationCap, Users, ClipboardList, BookOpen, BarChart3,
  DollarSign, Library, Home, Bus, UserCog, LineChart, Shield,
  Smartphone, Zap, MessageSquare, Database, ChevronDown, Menu,
  X, Star, ArrowRight, Clock, FileText, Mail, Phone, MapPin,
  Twitter, Facebook, Linkedin, CheckCircle, Play, TrendingUp,
  Bell, Globe,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar,
} from "recharts";

// ─── DATA ─────────────────────────────────────────────────────────────────────

const NAV_LINKS = ["Features", "Modules", "Pricing", "About", "Contact"];

const MODULES = [
  { icon: GraduationCap, title: "Student Management", desc: "Complete student lifecycle — profiles, documents, academic records, and progress tracking.", color: "blue" },
  { icon: ClipboardList, title: "Admissions", desc: "Online applications, merit lists, seat allocation, and automated enrollment workflows.", color: "indigo" },
  { icon: Clock, title: "Attendance Tracking", desc: "Biometric integration, real-time tracking, and automated parent alerts with monthly reports.", color: "violet" },
  { icon: UserCog, title: "Faculty Management", desc: "Workload assignment, performance reviews, appraisals, and professional development.", color: "purple" },
  { icon: FileText, title: "Examination & Results", desc: "Timetable scheduling, hall tickets, online grading, and grade card generation.", color: "pink" },
  { icon: DollarSign, title: "Fee Management", desc: "Flexible fee structures, online payments, receipts, and scholarship management.", color: "rose" },
  { icon: BookOpen, title: "Learning Management", desc: "Course builder, video lectures, assignments, discussion forums, and progress analytics.", color: "orange" },
  { icon: Library, title: "Library Management", desc: "Digital catalog, RFID tracking, issue/return automation, and e-book integration.", color: "amber" },
  { icon: Home, title: "Hostel Management", desc: "Room allocation, occupancy tracking, mess management, and maintenance requests.", color: "lime" },
  { icon: Bus, title: "Transport Management", desc: "Route planning, GPS tracking, driver management, and fuel analytics.", color: "emerald" },
  { icon: Users, title: "HR & Payroll", desc: "Employee records, salary computation, tax deductions, and payslip generation.", color: "teal" },
  { icon: BarChart3, title: "Analytics Dashboard", desc: "Real-time KPIs, enrollment trends, revenue analytics, and predictive insights.", color: "cyan" },
];

const BENEFITS = [
  { icon: Database, title: "Centralized Data Management", desc: "All institutional data in one unified platform, permanently eliminating silos across departments." },
  { icon: LineChart, title: "Real-time Reporting", desc: "Instant dashboards for administrators and management with multi-level drill-down capabilities." },
  { icon: Smartphone, title: "Mobile Accessibility", desc: "Native iOS and Android apps with offline capability and push notifications for every stakeholder." },
  { icon: Zap, title: "Automated Workflows", desc: "Smart automation eliminates paperwork — approvals, reminders, and document generation on autopilot." },
  { icon: MessageSquare, title: "Enhanced Communication", desc: "Integrated messaging, SMS, email, and parent portal keeps every stakeholder connected." },
  { icon: Shield, title: "Secure Cloud Infrastructure", desc: "256-bit encryption, role-based access, daily backups, and 99.9% SLA uptime guarantee." },
];

const ENROLLMENT_DATA = [
  { month: "Jul", students: 2840, revenue: 42 },
  { month: "Aug", students: 3120, revenue: 48 },
  { month: "Sep", students: 3450, revenue: 51 },
  { month: "Oct", students: 3280, revenue: 49 },
  { month: "Nov", students: 3510, revenue: 54 },
  { month: "Dec", students: 3340, revenue: 50 },
  { month: "Jan", students: 3680, revenue: 58 },
  { month: "Feb", students: 3920, revenue: 61 },
  { month: "Mar", students: 4100, revenue: 65 },
];

const ATTENDANCE_DATA = [
  { day: "Mon", present: 92, absent: 8 },
  { day: "Tue", present: 88, absent: 12 },
  { day: "Wed", present: 95, absent: 5 },
  { day: "Thu", present: 91, absent: 9 },
  { day: "Fri", present: 87, absent: 13 },
  { day: "Sat", present: 78, absent: 22 },
];

const TESTIMONIALS = [
  {
    quote: "EduERP transformed our administrative chaos into a streamlined operation. Fee collection efficiency improved by 40% and parent communication is now seamless across all departments.",
    name: "Dr. Priya Sharma",
    role: "Vice Chancellor",
    institution: "Bharati Vidyapeeth University",
    avatar: "photo-1494790108377-be9c29b29330",
    rating: 5,
  },
  {
    quote: "The admissions module alone saved us 200+ man-hours during peak season. Our board now has the real-time data they need to make decisions confidently — no more waiting for weekly reports.",
    name: "Prof. Rajesh Kumar",
    role: "Principal",
    institution: "Delhi Technical College",
    avatar: "photo-1507003211169-0a1dd7228f2d",
    rating: 5,
  },
  {
    quote: "Attendance tracking with parent alerts reduced absenteeism by 35%. The mobile app is intuitive enough that even our senior faculty adopted it within the first week of onboarding.",
    name: "Ms. Anita Menon",
    role: "Director — Academic Affairs",
    institution: "Symbiosis Institute of Technology",
    avatar: "photo-1438761681033-6461ffad8d80",
    rating: 5,
  },
];

const PRICING = [
  {
    name: "Starter",
    desc: "For small colleges and junior colleges",
    monthly: 299,
    annual: 239,
    limit: "Up to 500 students",
    features: [
      "Student & Faculty Management",
      "Attendance Tracking",
      "Fee Collection Module",
      "Basic Reports & Analytics",
      "Mobile App Access",
      "Email Support",
      "2 Admin Accounts",
    ],
    cta: "Start Free Trial",
    popular: false,
  },
  {
    name: "Professional",
    desc: "For growing institutions with complex needs",
    monthly: 699,
    annual: 559,
    limit: "Up to 3,000 students",
    features: [
      "All Starter Features",
      "Examination & Results",
      "Library & Hostel Management",
      "LMS with Video Support",
      "HR & Payroll Module",
      "Advanced Analytics Dashboard",
      "Priority Phone Support",
      "10 Admin Accounts",
      "Custom Branding",
    ],
    cta: "Request Demo",
    popular: true,
  },
  {
    name: "Enterprise",
    desc: "For universities and multi-campus institutions",
    monthly: 1499,
    annual: 1199,
    limit: "Unlimited students",
    features: [
      "All Professional Features",
      "Transport Management",
      "Multi-campus Support",
      "Custom Module Development",
      "API & ERP Integrations",
      "Dedicated Account Manager",
      "24/7 On-call Support",
      "Unlimited Admin Accounts",
      "On-premise Deployment Option",
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

const FAQS = [
  {
    q: "How long does implementation typically take?",
    a: "A typical mid-size college with 5–7 modules goes live in 4–6 weeks. Our onboarding team handles configuration, data migration, and staff training throughout the entire process — with zero disruption to ongoing academic operations.",
  },
  {
    q: "Can we migrate data from our existing system?",
    a: "Yes. We provide structured data migration for student records, fee histories, academic data, and HR records — from Excel sheets, legacy databases, or third-party systems. Every migration includes a full integrity validation before go-live.",
  },
  {
    q: "Is EduERP accessible on mobile devices?",
    a: "Absolutely. Native iOS and Android apps are available for students, parents, faculty, and administrators. The web platform is fully responsive. Offline support is built in for attendance and grade entry.",
  },
  {
    q: "How is our institutional data secured?",
    a: "Data is hosted on ISO 27001-certified infrastructure with 256-bit AES encryption in transit and at rest. We maintain role-based access control, IP whitelisting, and automated daily backups with 30-day retention. EduERP is FERPA and GDPR compliant.",
  },
  {
    q: "Can modules be customized for our workflows?",
    a: "Yes. Professional and Enterprise plans include workflow customization. Enterprise supports custom module development, custom report builders, and API integrations with any third-party tools your institution already uses.",
  },
  {
    q: "What training and support is included?",
    a: "All plans include onboarding training, video tutorials, and a comprehensive knowledge base. Professional subscribers get priority phone support with a 4-hour SLA. Enterprise customers receive a dedicated account manager and 24/7 emergency support.",
  },
];

const CLIENTS = [
  "Amity University", "Manipal Academy", "Lovely Professional Univ.",
  "Symbiosis International", "Chandigarh University", "VIT University",
  "SRM Institute", "Christ University", "Thapar Institute", "BITS Pilani",
];

type ColorKey = "blue" | "indigo" | "violet" | "purple" | "pink" | "rose" | "orange" | "amber" | "lime" | "emerald" | "teal" | "cyan";

const COLOR_MAP: Record<ColorKey, { bg: string; text: string; light: string }> = {
  blue: { bg: "bg-blue-600", text: "text-blue-600", light: "bg-blue-50" },
  indigo: { bg: "bg-indigo-600", text: "text-indigo-600", light: "bg-indigo-50" },
  violet: { bg: "bg-violet-600", text: "text-violet-600", light: "bg-violet-50" },
  purple: { bg: "bg-purple-600", text: "text-purple-600", light: "bg-purple-50" },
  pink: { bg: "bg-pink-600", text: "text-pink-600", light: "bg-pink-50" },
  rose: { bg: "bg-rose-600", text: "text-rose-600", light: "bg-rose-50" },
  orange: { bg: "bg-orange-500", text: "text-orange-600", light: "bg-orange-50" },
  amber: { bg: "bg-amber-500", text: "text-amber-600", light: "bg-amber-50" },
  lime: { bg: "bg-lime-600", text: "text-lime-700", light: "bg-lime-50" },
  emerald: { bg: "bg-emerald-600", text: "text-emerald-600", light: "bg-emerald-50" },
  teal: { bg: "bg-teal-600", text: "text-teal-600", light: "bg-teal-50" },
  cyan: { bg: "bg-cyan-600", text: "text-cyan-600", light: "bg-cyan-50" },
};

// ─── NAVBAR ───────────────────────────────────────────────────────────────────

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <nav
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/96 backdrop-blur-sm shadow-sm border-b border-blue-100/60"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-[70px]">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-md shadow-blue-600/30">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <span
              className={`font-extrabold text-xl tracking-tight transition-colors ${
                scrolled ? "text-slate-900" : "text-white"
              }`}
            >
              Edu<span className="text-blue-400">ERP</span>
            </span>
          </a>

          {/* Desktop links */}
          <div className="hidden lg:flex items-center gap-7">
            {NAV_LINKS.map((link) => (
              <a
                key={link}
                href={`#${link.toLowerCase()}`}
                className={`text-sm font-medium transition-colors hover:text-blue-400 ${
                  scrolled ? "text-slate-600" : "text-white/80"
                }`}
              >
                {link}
              </a>
            ))}
          </div>

          {/* CTAs */}
          <div className="hidden lg:flex items-center gap-3">
            <a
              href="#contact"
              className={`text-sm font-semibold transition-colors ${
                scrolled ? "text-slate-600 hover:text-blue-600" : "text-white/80 hover:text-white"
              }`}
            >
              Sign In
            </a>
            <a
              href="#contact"
              className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all shadow-md shadow-blue-600/25 hover:shadow-blue-500/40"
            >
              Request Demo
            </a>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className={`lg:hidden transition-colors ${scrolled ? "text-slate-700" : "text-white"}`}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden bg-white border-t border-slate-100 shadow-xl">
          <div className="px-4 py-5 space-y-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link}
                href={`#${link.toLowerCase()}`}
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-3 text-sm font-semibold text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
              >
                {link}
              </a>
            ))}
            <div className="pt-3 border-t border-slate-100">
              <a
                href="#contact"
                className="block w-full bg-blue-600 text-white text-sm font-bold py-3 px-4 rounded-xl text-center"
              >
                Request Demo
              </a>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

// ─── HERO ─────────────────────────────────────────────────────────────────────

function HeroSection() {
  return (
    <section
      id="features"
      className="relative min-h-screen flex items-center overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #0B1120 0%, #0F1F3D 40%, #0F172A 100%)",
      }}
    >
      {/* Dot grid */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(99,102,241,0.18) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
      {/* Glow blobs */}
      <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] rounded-full blur-[120px]" style={{ background: "rgba(37,99,235,0.18)" }} />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-[100px]" style={{ background: "rgba(6,182,212,0.12)" }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* Left: copy */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75 }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-2.5 border border-blue-400/30 bg-blue-500/10 rounded-full px-4 py-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-cyan-300 text-sm font-semibold">
                Trusted by 500+ Educational Institutions
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.08] tracking-tight">
              Smart ERP Solution{" "}
              <br className="hidden sm:block" />
              for{" "}
              <span
                className="text-transparent bg-clip-text"
                style={{ backgroundImage: "linear-gradient(90deg, #60A5FA, #22D3EE)" }}
              >
                Modern Colleges
              </span>
            </h1>

            <p className="text-lg text-slate-300 leading-relaxed max-w-lg">
              Automate academic and administrative processes across your entire institution — from admissions to alumni — with one integrated, intelligent platform built for higher education.
            </p>

            <div className="flex flex-wrap gap-4">
              <a
                href="#contact"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-7 py-4 rounded-xl transition-all shadow-lg shadow-blue-700/40 hover:shadow-blue-500/50"
              >
                Request Demo <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="#modules"
                className="inline-flex items-center gap-2 border border-white/20 hover:border-white/40 bg-white/5 hover:bg-white/10 text-white font-bold px-7 py-4 rounded-xl transition-all"
              >
                <Play className="w-4 h-4" /> Explore Modules
              </a>
            </div>

            <div className="flex flex-wrap gap-8 pt-4 border-t border-white/10">
              {[
                { value: "50K+", label: "Students Managed" },
                { value: "500+", label: "Institutions" },
                { value: "99.9%", label: "Uptime SLA" },
                { value: "4.9★", label: "Avg Rating" },
              ].map((s) => (
                <div key={s.label}>
                  <div className="text-2xl font-extrabold text-white">{s.value}</div>
                  <div className="text-xs text-slate-400 mt-0.5 font-medium">{s.label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right: Dashboard card */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.75, delay: 0.2 }}
            className="relative"
          >
            <div
              className="rounded-2xl overflow-hidden shadow-2xl border border-white/10"
              style={{ background: "rgba(255,255,255,0.07)", backdropFilter: "blur(24px)" }}
            >
              {/* Window chrome */}
              <div className="flex items-center gap-3 px-5 py-3.5 border-b border-white/10" style={{ background: "rgba(255,255,255,0.07)" }}>
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400/70" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400/70" />
                  <div className="w-3 h-3 rounded-full bg-green-400/70" />
                </div>
                <div className="flex-1 bg-white/10 rounded-md px-3 py-1 text-xs text-slate-400">
                  app.eduerp.in/dashboard
                </div>
                <Bell className="w-4 h-4 text-slate-400" />
              </div>

              <div className="p-5 space-y-4">
                {/* KPI row */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Students", value: "4,127", delta: "+12%", color: "text-blue-400" },
                    { label: "Attendance", value: "94.2%", delta: "+2.1%", color: "text-emerald-400" },
                    { label: "Revenue", value: "₹12.4M", delta: "+8%", color: "text-cyan-400" },
                  ].map((k) => (
                    <div key={k.label} className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.08)" }}>
                      <div className="text-xs text-slate-400 mb-1">{k.label}</div>
                      <div className="text-lg font-extrabold text-white leading-none">{k.value}</div>
                      <div className={`text-xs font-semibold mt-1 ${k.color}`}>{k.delta}</div>
                    </div>
                  ))}
                </div>

                {/* Mini sparkline */}
                <div className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.05)" }}>
                  <div className="text-xs text-slate-400 mb-3">Student Enrollment — Academic Year 2024–25</div>
                  <div className="h-[88px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={ENROLLMENT_DATA.slice(0, 6)}>
                        <defs>
                          <linearGradient id="heroSparkline" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.45} />
                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <Area
                          type="monotone"
                          dataKey="students"
                          stroke="#3B82F6"
                          strokeWidth={2}
                          fill="url(#heroSparkline)"
                          dot={false}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Activity feed */}
                <div className="space-y-2">
                  {[
                    { icon: "🎓", text: "Sneha Patel enrolled — B.Tech CSE 2025", time: "2 min ago" },
                    { icon: "📊", text: "March exam results published for all batches", time: "1 hr ago" },
                    { icon: "💰", text: "Fee reminder dispatched to 48 students", time: "3 hr ago" },
                  ].map((a, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5"
                      style={{ background: "rgba(255,255,255,0.06)" }}
                    >
                      <span className="text-base shrink-0">{a.icon}</span>
                      <span className="text-xs text-slate-300 flex-1 truncate">{a.text}</span>
                      <span className="text-xs text-slate-500 shrink-0">{a.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Floating badge: NAAC */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.9 }}
              className="absolute -top-5 -right-5 bg-white rounded-2xl shadow-2xl px-4 py-3 flex items-center gap-2.5"
            >
              <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
              <div>
                <div className="text-xs font-extrabold text-slate-800">NAAC Compliant</div>
                <div className="text-xs text-slate-500">All reports ready</div>
              </div>
            </motion.div>

            {/* Floating badge: growth */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 1.1 }}
              className="absolute -bottom-5 -left-5 bg-white rounded-2xl shadow-2xl px-4 py-3 flex items-center gap-2.5"
            >
              <TrendingUp className="w-5 h-5 text-blue-500 shrink-0" />
              <div>
                <div className="text-xs font-extrabold text-slate-800">Admissions +23%</div>
                <div className="text-xs text-slate-500">vs last semester</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ─── CLIENTS STRIP ────────────────────────────────────────────────────────────

function ClientsSection() {
  return (
    <section className="bg-white py-10 border-y border-slate-100">
      <div className="max-w-7xl mx-auto px-6">
        <p className="text-center text-xs font-bold text-slate-400 uppercase tracking-[0.18em] mb-7">
          Trusted by leading institutions across India
        </p>
        <div className="overflow-hidden">
          <div className="flex gap-14 items-center animate-marquee">
            {[...CLIENTS, ...CLIENTS].map((c, i) => (
              <span
                key={i}
                className="text-slate-400 font-bold text-sm whitespace-nowrap hover:text-blue-600 transition-colors cursor-default"
              >
                {c}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── MODULES ──────────────────────────────────────────────────────────────────

function ModulesSection() {
  return (
    <section id="modules" className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-block bg-blue-100 text-blue-700 text-xs font-extrabold uppercase tracking-widest px-3 py-1.5 rounded-full mb-4">
            Complete Platform
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">
            12 Integrated Modules, One Platform
          </h2>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            Every department, every process — from admissions to analytics — unified in a seamlessly connected system designed for higher education.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {MODULES.map((mod, i) => {
            const c = COLOR_MAP[mod.color as ColorKey];
            const Icon = mod.icon;
            return (
              <motion.div
                key={mod.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.045 }}
                className="group bg-white rounded-2xl p-6 border border-slate-100 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-50/80 transition-all duration-300 cursor-default"
              >
                <div
                  className={`w-11 h-11 ${c.light} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                >
                  <Icon className={`w-5 h-5 ${c.text}`} />
                </div>
                <h3 className="font-extrabold text-slate-800 text-base mb-2 leading-snug">{mod.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{mod.desc}</p>
                <div
                  className={`mt-4 text-xs font-bold ${c.text} flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200`}
                >
                  Learn more <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── BENEFITS ─────────────────────────────────────────────────────────────────

function BenefitsSection() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">

          {/* Left: benefits list */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65 }}
          >
            <div className="inline-block bg-blue-100 text-blue-700 text-xs font-extrabold uppercase tracking-widest px-3 py-1.5 rounded-full mb-4">
              Why EduERP
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-6 leading-tight">
              Built for the Complexities of Higher Education
            </h2>
            <p className="text-slate-500 text-lg leading-relaxed mb-10">
              Unlike generic ERP tools, EduERP is purpose-built for academic institutions — with workflows, compliance requirements, and stakeholder expectations that define higher education.
            </p>
            <div className="space-y-6">
              {BENEFITS.map((b, i) => {
                const Icon = b.icon;
                return (
                  <motion.div
                    key={b.title}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.08 }}
                    className="flex gap-4 group"
                  >
                    <div className="w-11 h-11 bg-blue-600 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-blue-500 transition-colors">
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-800 mb-1">{b.title}</h4>
                      <p className="text-sm text-slate-500 leading-relaxed">{b.desc}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Right: student portal mockup */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65 }}
            className="relative"
          >
            <div
              className="rounded-3xl overflow-hidden shadow-2xl p-7"
              style={{ background: "linear-gradient(135deg, #1E40AF 0%, #1D4ED8 50%, #2563EB 100%)" }}
            >
              <div className="text-white font-extrabold text-lg mb-5 flex items-center gap-2">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <GraduationCap className="w-4 h-4 text-white" />
                </div>
                Student Portal — Aryan Mehta
              </div>

              {/* Schedule */}
              <div className="bg-white/10 rounded-2xl p-4 mb-4">
                <div className="text-xs font-bold text-white/60 uppercase tracking-wider mb-3">
                  Today's Timetable — Monday
                </div>
                <div className="space-y-2">
                  {[
                    { time: "09:00", subject: "Data Structures", room: "CS-201", type: "Lecture" },
                    { time: "11:00", subject: "Operating Systems", room: "CS-105", type: "Lab" },
                    { time: "14:00", subject: "Engineering Mathematics", room: "LH-302", type: "Lecture" },
                    { time: "16:00", subject: "Communication Skills", room: "LH-101", type: "Seminar" },
                  ].map((cls, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 bg-white/10 hover:bg-white/15 rounded-xl px-3 py-2.5 transition-colors"
                    >
                      <span className="text-xs font-extrabold text-cyan-300 w-12 shrink-0">{cls.time}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-white truncate">{cls.subject}</div>
                        <div className="text-xs text-white/55">{cls.room}</div>
                      </div>
                      <span className="text-xs bg-white/15 text-white px-2 py-0.5 rounded-lg shrink-0 font-semibold">
                        {cls.type}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick stats */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Attendance", value: "92%", ok: true },
                  { label: "Pending", value: "5 tasks", ok: false },
                  { label: "CGPA", value: "8.7", ok: true },
                ].map((s) => (
                  <div key={s.label} className="bg-white/10 rounded-xl p-3 text-center">
                    <div
                      className={`text-xl font-extrabold ${s.ok ? "text-emerald-300" : "text-yellow-300"}`}
                    >
                      {s.value}
                    </div>
                    <div className="text-xs text-white/55 mt-0.5 font-medium">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Floating badges */}
            <div className="absolute -top-5 -right-5 bg-white rounded-2xl shadow-2xl px-4 py-3 flex items-center gap-3">
              <div className="w-9 h-9 bg-emerald-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <div className="text-sm font-extrabold text-slate-800">Auto Workflows</div>
                <div className="text-xs text-slate-500">Approvals in 2 clicks</div>
              </div>
            </div>

            <div className="absolute -bottom-5 -left-5 bg-white rounded-2xl shadow-2xl px-4 py-3 flex items-center gap-3">
              <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center">
                <Globe className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-sm font-extrabold text-slate-800">Cloud-hosted</div>
                <div className="text-xs text-slate-500">Access from anywhere</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ─── DASHBOARD PREVIEW ────────────────────────────────────────────────────────

type DashTab = "overview" | "attendance" | "finance";

function DashboardSection() {
  const [tab, setTab] = useState<DashTab>("overview");

  const kpis: Record<DashTab, Array<{ label: string; value: string; delta: string; up: boolean | null }>> = {
    overview: [
      { label: "Total Enrolled", value: "4,127", delta: "+12.3%", up: true },
      { label: "New This Month", value: "283", delta: "+18%", up: true },
      { label: "Active Courses", value: "342", delta: "Stable", up: null },
      { label: "Pass Rate", value: "96.4%", delta: "+1.2%", up: true },
    ],
    attendance: [
      { label: "Avg Attendance", value: "91.4%", delta: "+2.1%", up: true },
      { label: "Present Today", value: "3,801", delta: "of 4,127", up: null },
      { label: "On Approved Leave", value: "186", delta: "-5%", up: true },
      { label: "Alerts Sent", value: "47", delta: "parent SMS", up: null },
    ],
    finance: [
      { label: "Total Revenue", value: "₹12.4M", delta: "+8.2%", up: true },
      { label: "Pending Dues", value: "₹1.2M", delta: "89 students", up: null },
      { label: "Collected YTD", value: "₹48.2M", delta: "+11%", up: true },
      { label: "Scholarships", value: "₹3.1M", delta: "disbursed", up: null },
    ],
  };

  const tabs: Array<{ key: DashTab; label: string }> = [
    { key: "overview", label: "Enrollment" },
    { key: "attendance", label: "Attendance" },
    { key: "finance", label: "Finance" },
  ];

  return (
    <section
      id="about"
      className="py-24 relative overflow-hidden"
      style={{ background: "linear-gradient(150deg, #0B1120 0%, #0F1F3D 60%, #0B1120 100%)" }}
    >
      <div
        className="absolute inset-0 opacity-15"
        style={{
          backgroundImage:
            "linear-gradient(rgba(99,102,241,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.12) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      <div className="absolute top-1/4 right-1/4 w-[600px] h-[400px] rounded-full blur-[140px]" style={{ background: "rgba(37,99,235,0.14)" }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div
            className="inline-block text-cyan-300 text-xs font-extrabold uppercase tracking-widest px-3 py-1.5 rounded-full mb-4 border border-blue-400/25"
            style={{ background: "rgba(37,99,235,0.15)" }}
          >
            Live Analytics
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Decisions Powered by Real Data
          </h2>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto">
            Your management board gets the insights they need, exactly when they need them — with drill-down reports and fully customizable dashboards.
          </p>
        </motion.div>

        {/* Tab bar */}
        <div className="flex justify-center mb-8">
          <div
            className="flex p-1 gap-1 rounded-xl"
            style={{ background: "rgba(255,255,255,0.08)" }}
          >
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-6 py-2.5 text-sm font-bold rounded-lg transition-all ${
                  tab === t.key
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-900/40"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dashboard card */}
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-3xl border border-white/10 p-8"
          style={{ background: "rgba(255,255,255,0.07)", backdropFilter: "blur(20px)" }}
        >
          {/* KPI row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {kpis[tab].map((k) => (
              <div
                key={k.label}
                className="rounded-2xl p-5"
                style={{ background: "rgba(255,255,255,0.08)" }}
              >
                <div className="text-xs text-slate-400 mb-1 font-medium">{k.label}</div>
                <div className="text-2xl font-extrabold text-white leading-none">{k.value}</div>
                <div
                  className={`text-xs font-bold mt-1.5 ${
                    k.up === true
                      ? "text-emerald-400"
                      : k.up === false
                      ? "text-red-400"
                      : "text-slate-400"
                  }`}
                >
                  {k.delta}
                </div>
              </div>
            ))}
          </div>

          {/* Chart */}
          <div className="h-64 sm:h-80">
            {tab === "overview" && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={ENROLLMENT_DATA} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="enrollGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" stroke="#475569" tick={{ fill: "#94A3B8", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis stroke="#475569" tick={{ fill: "#94A3B8", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: "#1E2D4F", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#fff", fontSize: 13 }}
                    cursor={{ stroke: "rgba(99,102,241,0.3)", strokeWidth: 1 }}
                  />
                  <Area type="monotone" dataKey="students" stroke="#3B82F6" strokeWidth={2.5} fill="url(#enrollGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
            {tab === "attendance" && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ATTENDANCE_DATA} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="day" stroke="#475569" tick={{ fill: "#94A3B8", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis stroke="#475569" tick={{ fill: "#94A3B8", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: "#1E2D4F", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#fff", fontSize: 13 }}
                  />
                  <Bar dataKey="present" name="Present" fill="#10B981" radius={[5, 5, 0, 0]} />
                  <Bar dataKey="absent" name="Absent" fill="#EF4444" radius={[5, 5, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
            {tab === "finance" && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={ENROLLMENT_DATA} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="finGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" stroke="#475569" tick={{ fill: "#94A3B8", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis stroke="#475569" tick={{ fill: "#94A3B8", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: "#1E2D4F", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#fff", fontSize: 13 }}
                    formatter={(v) => [`₹${v}L`, "Revenue"]}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#06B6D4" strokeWidth={2.5} fill="url(#finGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── TESTIMONIALS ─────────────────────────────────────────────────────────────

function TestimonialsSection() {
  return (
    <section className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-block bg-blue-100 text-blue-700 text-xs font-extrabold uppercase tracking-widest px-3 py-1.5 rounded-full mb-4">
            Success Stories
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">
            Loved by Educators Across India
          </h2>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto">
            Hundreds of institutions have transformed their daily operations with EduERP.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: i * 0.1 }}
              className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all duration-300 flex flex-col"
            >
              <div className="flex gap-1 mb-5">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <blockquote className="text-slate-600 leading-relaxed text-sm flex-1 mb-6">
                "{t.quote}"
              </blockquote>
              <div className="flex items-center gap-3">
                <img
                  src={`https://images.unsplash.com/${t.avatar}?w=56&h=56&fit=crop&auto=format`}
                  alt={t.name}
                  className="w-12 h-12 rounded-full object-cover bg-blue-100 shrink-0"
                />
                <div>
                  <div className="font-extrabold text-slate-800 text-sm">{t.name}</div>
                  <div className="text-xs text-slate-500">{t.role}</div>
                  <div className="text-xs text-blue-600 font-semibold">{t.institution}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── PRICING ──────────────────────────────────────────────────────────────────

function PricingSection() {
  const [annual, setAnnual] = useState(false);

  return (
    <section id="pricing" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-block bg-blue-100 text-blue-700 text-xs font-extrabold uppercase tracking-widest px-3 py-1.5 rounded-full mb-4">
            Pricing
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">
            Plans for Every Institution Size
          </h2>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto mb-8">
            Transparent pricing with no hidden fees. Scale as your institution grows.
          </p>

          {/* Billing toggle */}
          <div className="flex items-center justify-center gap-3">
            <span className={`text-sm font-bold transition-colors ${!annual ? "text-slate-800" : "text-slate-400"}`}>
              Monthly
            </span>
            <button
              onClick={() => setAnnual(!annual)}
              className={`relative w-12 h-6 rounded-full transition-colors ${annual ? "bg-blue-600" : "bg-slate-200"}`}
              aria-label="Toggle billing period"
            >
              <span
                className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-200 ${annual ? "left-7" : "left-1"}`}
              />
            </button>
            <span className={`text-sm font-bold transition-colors ${annual ? "text-slate-800" : "text-slate-400"}`}>
              Annual{" "}
              <span className="bg-emerald-100 text-emerald-700 text-xs font-extrabold px-2 py-0.5 rounded-lg ml-1">
                Save 20%
              </span>
            </span>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {PRICING.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: i * 0.1 }}
              className={`relative rounded-2xl p-8 flex flex-col transition-transform ${
                plan.popular
                  ? "bg-blue-600 text-white shadow-2xl shadow-blue-600/35 md:-mt-4 md:-mb-4"
                  : "bg-white border border-slate-100 shadow-sm"
              }`}
            >
              {plan.popular && (
                <div
                  className="absolute -top-4 left-1/2 -translate-x-1/2 text-white text-xs font-extrabold px-5 py-1.5 rounded-full whitespace-nowrap"
                  style={{ background: "linear-gradient(90deg, #22D3EE, #3B82F6)" }}
                >
                  Most Popular
                </div>
              )}

              <div className="mb-6">
                <h3 className={`text-xl font-extrabold mb-1 ${plan.popular ? "text-white" : "text-slate-900"}`}>
                  {plan.name}
                </h3>
                <p className={`text-sm mb-5 ${plan.popular ? "text-blue-100" : "text-slate-500"}`}>
                  {plan.desc}
                </p>
                <div className="flex items-end gap-1">
                  <span className={`text-4xl font-extrabold ${plan.popular ? "text-white" : "text-slate-900"}`}>
                    ${annual ? plan.annual : plan.monthly}
                  </span>
                  <span className={`text-sm mb-1.5 ${plan.popular ? "text-blue-200" : "text-slate-400"}`}>
                    /month
                  </span>
                </div>
                <div className={`text-xs font-semibold mt-1 ${plan.popular ? "text-blue-200" : "text-slate-400"}`}>
                  {plan.limit}
                </div>
              </div>

              <ul className="space-y-3 flex-1 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <CheckCircle
                      className={`w-4 h-4 mt-0.5 shrink-0 ${plan.popular ? "text-cyan-300" : "text-blue-600"}`}
                    />
                    <span className={`text-sm ${plan.popular ? "text-blue-50" : "text-slate-600"}`}>{f}</span>
                  </li>
                ))}
              </ul>

              <a
                href="#contact"
                className={`block w-full text-center font-bold py-3.5 rounded-xl transition-all ${
                  plan.popular
                    ? "bg-white text-blue-600 hover:bg-blue-50"
                    : "bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-600/25"
                }`}
              >
                {plan.cta}
              </a>
            </motion.div>
          ))}
        </div>

        <p className="text-center text-sm text-slate-400 mt-10 font-medium">
          All plans include a 14-day free trial · No credit card required · Cancel anytime
        </p>
      </div>
    </section>
  );
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────

function FAQSection() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="py-24 bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-block bg-blue-100 text-blue-700 text-xs font-extrabold uppercase tracking-widest px-3 py-1.5 rounded-full mb-4">
            FAQ
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-slate-500 text-lg">
            Everything you need to know before getting started.
          </p>
        </motion.div>

        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm"
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-5 text-left group"
              >
                <span className="font-bold text-slate-800 pr-4 group-hover:text-blue-600 transition-colors">
                  {faq.q}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-200 ${open === i ? "rotate-180 text-blue-500" : ""}`}
                />
              </button>
              {open === i && (
                <div className="px-6 pb-6 -mt-1">
                  <p className="text-slate-500 leading-relaxed text-sm">{faq.a}</p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CONTACT ──────────────────────────────────────────────────────────────────

function ContactSection() {
  const [form, setForm] = useState({ name: "", institution: "", email: "", phone: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [k]: e.target.value });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const inputCls =
    "w-full border border-slate-200 bg-white rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all";

  return (
    <section id="contact" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-start">

          {/* Left */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65 }}
          >
            <div className="inline-block bg-blue-100 text-blue-700 text-xs font-extrabold uppercase tracking-widest px-3 py-1.5 rounded-full mb-4">
              Get in Touch
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4 leading-tight">
              Ready to Transform Your Institution?
            </h2>
            <p className="text-slate-500 text-lg leading-relaxed mb-10">
              Request a personalized demo today. Our education technology experts will walk you through the full platform and tailor the demonstration to your institution's specific needs.
            </p>

            <div className="space-y-6 mb-10">
              {[
                { icon: Mail, label: "Email Us", value: "sales@eduerp.in" },
                { icon: Phone, label: "Call Us", value: "+91 98765 43210" },
                { icon: MapPin, label: "Office", value: "Tech Park, Sector 44, Gurugram, Haryana 122003" },
              ].map((c) => {
                const Icon = c.icon;
                return (
                  <div key={c.label} className="flex items-start gap-4">
                    <div className="w-11 h-11 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-0.5">
                        {c.label}
                      </div>
                      <div className="text-slate-700 font-semibold text-sm">{c.value}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-wrap gap-2.5">
              {["ISO 27001 Certified", "GDPR Compliant", "NAAC Ready", "99.9% SLA"].map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1.5 rounded-lg"
                >
                  <CheckCircle className="w-3 h-3 text-emerald-500" />
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Right: form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65 }}
          >
            {submitted ? (
              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-12 text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
                  <CheckCircle className="w-8 h-8 text-emerald-500" />
                </div>
                <h3 className="text-xl font-extrabold text-slate-800 mb-2">
                  Request Received!
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Our team will reach out within 24 hours to schedule your personalized demo session.
                </p>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="bg-slate-50 rounded-2xl p-8 border border-slate-100 space-y-5"
              >
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-extrabold text-slate-600 mb-2">
                      Full Name *
                    </label>
                    <input type="text" required placeholder="Dr. Rajesh Kumar" value={form.name} onChange={set("name")} className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-xs font-extrabold text-slate-600 mb-2">
                      Institution *
                    </label>
                    <input type="text" required placeholder="ABC University" value={form.institution} onChange={set("institution")} className={inputCls} />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-extrabold text-slate-600 mb-2">
                      Work Email *
                    </label>
                    <input type="email" required placeholder="principal@abc.edu.in" value={form.email} onChange={set("email")} className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-xs font-extrabold text-slate-600 mb-2">
                      Phone Number
                    </label>
                    <input type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={set("phone")} className={inputCls} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-slate-600 mb-2">
                    Tell Us About Your Institution
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Number of students, departments, current pain points, specific modules you need..."
                    value={form.message}
                    onChange={set("message")}
                    className={`${inputCls} resize-none`}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 hover:shadow-blue-500/40"
                >
                  Request Your Free Demo <ArrowRight className="w-4 h-4" />
                </button>
                <p className="text-xs text-slate-400 text-center font-medium">
                  We respect your privacy. No spam, ever. Unsubscribe anytime.
                </p>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ─── FOOTER ───────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer style={{ background: "#0B1120" }} className="text-slate-400">
      {/* CTA band */}
      <div className="border-b border-white/8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-8">
            <div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
                Start your digital transformation today
              </h3>
              <p className="text-slate-400 font-medium">
                Join 500+ institutions already running on EduERP — get set up in 4 weeks.
              </p>
            </div>
            <a
              href="#contact"
              className="shrink-0 bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-4 rounded-xl transition-all shadow-lg shadow-blue-900/50 flex items-center gap-2 whitespace-nowrap"
            >
              Get Started Free <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-md shadow-blue-900/50">
                <GraduationCap className="w-4 h-4 text-white" />
              </div>
              <span className="font-extrabold text-xl text-white">
                Edu<span className="text-blue-400">ERP</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed mb-6 max-w-xs">
              India's most comprehensive education ERP — built for colleges, trusted by universities, loved by administrators.
            </p>
            <div className="flex gap-2.5">
              {[Twitter, Linkedin, Facebook].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-blue-600"
                  style={{ background: "rgba(255,255,255,0.08)" }}
                >
                  <Icon className="w-4 h-4 text-slate-300" />
                </a>
              ))}
            </div>
          </div>

          {/* Product */}
          <div>
            <div className="text-xs font-extrabold text-white uppercase tracking-widest mb-5">Product</div>
            <ul className="space-y-3 text-sm">
              {["Features", "All Modules", "Pricing", "Changelog", "Product Roadmap", "Security"].map((l) => (
                <li key={l}>
                  <a href="#" className="hover:text-white transition-colors">{l}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <div className="text-xs font-extrabold text-white uppercase tracking-widest mb-5">Company</div>
            <ul className="space-y-3 text-sm">
              {["About Us", "Careers", "Press Kit", "Blog", "Partners", "Contact Us"].map((l) => (
                <li key={l}>
                  <a href="#" className="hover:text-white transition-colors">{l}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <div className="text-xs font-extrabold text-white uppercase tracking-widest mb-5">Resources</div>
            <ul className="space-y-3 text-sm">
              {["Documentation", "API Reference", "Help Center", "Webinars", "Case Studies", "System Status"].map((l) => (
                <li key={l}>
                  <a href="#" className="hover:text-white transition-colors">{l}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-14 pt-8 border-t border-white/8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium">
          <span>© 2025 EduERP Pvt. Ltd. All rights reserved.</span>
          <div className="flex gap-6">
            {["Privacy Policy", "Terms of Service", "Cookie Policy"].map((l) => (
              <a key={l} href="#" className="hover:text-white transition-colors">{l}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <div
      className="min-h-screen"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: flex;
          width: max-content;
          animation: marquee 28s linear infinite;
        }
        html { scroll-behavior: smooth; }
        ::-webkit-scrollbar { width: 0; height: 0; }
      `}</style>

      <Navbar />
      <main>
        <HeroSection />
        <ClientsSection />
        <ModulesSection />
        <BenefitsSection />
        <DashboardSection />
        <TestimonialsSection />
        <PricingSection />
        <FAQSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}
