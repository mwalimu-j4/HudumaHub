// HudumaHub — Single source of truth for all government service data
// Every URL is a REAL, verified Kenyan government link

export interface ServiceRequirement {
  id: number;
  text: string;
  note?: string;
  icon: string;
}

export interface ServiceStep {
  step: number;
  title: string;
  description: string;
  time: string;
  difficulty: "easy" | "medium" | "complex";
}

export interface ServiceCost {
  item: string;
  amount: number;
  note?: string;
}

export interface ServiceFAQ {
  q: string;
  a: string;
}

export interface ServiceData {
  slug: string;
  title: string;
  description: string;
  icon: string;
  category: "documents" | "finance" | "health" | "transport" | "business";
  accentColor: string;
  officialUrl: string;
  portalUrl: string;
  requirements: ServiceRequirement[];
  steps: ServiceStep[];
  costs: ServiceCost[];
  commonMistakes: string[];
  faq: ServiceFAQ[];
}

export const ACCENT_COLORS: Record<string, string> = {
  documents: "#10b981",
  finance: "#06b6d4",
  health: "#8b5cf6",
  transport: "#f59e0b",
  business: "#f43f5e",
};

export const SERVICES_DATA: Record<string, ServiceData> = {
  "national-id": {
    slug: "national-id",
    title: "National ID Card",
    description: "Apply for or replace your Kenyan National Identity Document",
    icon: "CreditCard",
    category: "documents",
    accentColor: "#10b981",
    officialUrl: "https://www.immigration.go.ke/national-registration-bureau/",
    portalUrl: "https://hudumakenya.go.ke",
    requirements: [
      {
        id: 1,
        text: "Original Birth Certificate",
        note: "Photocopies not accepted",
        icon: "FileText",
      },
      {
        id: 2,
        text: "2 passport-size photos",
        note: "White background only",
        icon: "Camera",
      },
      {
        id: 3,
        text: "Parent/Guardian ID copy",
        note: "Required if applicant is under 18",
        icon: "Users",
      },
      {
        id: 4,
        text: "Completed Form DP1",
        note: "Available free at any Huduma Centre",
        icon: "ClipboardList",
      },
      {
        id: 5,
        text: "KES 300 fee (replacement only)",
        note: "First application is FREE",
        icon: "Banknote",
      },
    ],
    steps: [
      {
        step: 1,
        title: "Gather your documents",
        description:
          "Collect all requirements listed above before visiting any office.",
        time: "1 day prior",
        difficulty: "easy",
      },
      {
        step: 2,
        title: "Visit your nearest Huduma Centre",
        description:
          "Go to the Huduma Centre in your sub-county of birth, not your current residence.",
        time: "~30 mins travel",
        difficulty: "easy",
      },
      {
        step: 3,
        title: "Fill Form DP1",
        description:
          "Collect and fill the application form at the centre. Staff will assist if needed.",
        time: "~10 mins",
        difficulty: "easy",
      },
      {
        step: 4,
        title: "Submit documents & biometrics",
        description:
          "Submit your documents, get photographed and fingerprinted at the registration desk.",
        time: "~20 mins",
        difficulty: "easy",
      },
      {
        step: 5,
        title: "Receive acknowledgement slip",
        description:
          "Keep this slip safely — you will need it to collect your ID card.",
        time: "~5 mins",
        difficulty: "easy",
      },
      {
        step: 6,
        title: "Collect your ID",
        description:
          "Return after 2-3 weeks with your acknowledgement slip and birth certificate.",
        time: "~15 mins",
        difficulty: "easy",
      },
    ],
    costs: [
      {
        item: "First-time application",
        amount: 0,
        note: "Free for first-time applicants",
      },
      {
        item: "Replacement (lost/damaged)",
        amount: 300,
        note: "Official government fee",
      },
      { item: "Form DP1", amount: 0, note: "Free at Huduma Centre" },
    ],
    commonMistakes: [
      "Going to a Huduma Centre outside your sub-county of birth",
      "Bringing photocopies of birth certificate instead of the original",
      "Using photos with colored or dark backgrounds (must be white/light blue)",
      "Not carrying cash for replacement fee (some centres don't accept cards)",
      "Applying before turning 18 (minimum age requirement)",
    ],
    faq: [
      {
        q: "How long does it take to get my ID?",
        a: "Typically 2-3 weeks after application. You'll be notified via SMS when it's ready for collection.",
      },
      {
        q: "Can I apply if I was born in a different county?",
        a: "Yes, but you must apply at a Huduma Centre in your sub-county of birth, not your current residence.",
      },
      {
        q: "What if I lost my acknowledgement slip?",
        a: "Visit the same Huduma Centre with your original birth certificate and they can trace your application.",
      },
      {
        q: "Can someone collect my ID on my behalf?",
        a: "Yes, with a signed authorization letter and their own valid ID.",
      },
      {
        q: "Is there an online application option?",
        a: "Currently limited. Some services are available on eCitizen (ecitizen.go.ke) but physical appearance is usually required for biometrics.",
      },
    ],
  },
  "kra-pin": {
    slug: "kra-pin",
    title: "KRA PIN & Tax Returns",
    description:
      "Register for your KRA PIN and file annual tax returns on iTax",
    icon: "Landmark",
    category: "finance",
    accentColor: "#06b6d4",
    officialUrl: "https://itax.kra.go.ke",
    portalUrl:
      "https://www.kra.go.ke/individual/filing-paying/types-of-taxes/income-tax-resident",
    requirements: [
      {
        id: 1,
        text: "National ID or Passport",
        note: "Must be valid and not expired",
        icon: "CreditCard",
      },
      {
        id: 2,
        text: "Active email address",
        note: "You'll receive your PIN certificate here",
        icon: "Mail",
      },
      {
        id: 3,
        text: "Active phone number",
        note: "For OTP verification",
        icon: "Phone",
      },
      {
        id: 4,
        text: "Postal address",
        note: "Your P.O. Box or physical address",
        icon: "MapPin",
      },
    ],
    steps: [
      {
        step: 1,
        title: "Visit iTax portal",
        description: "Go to itax.kra.go.ke and click 'New PIN Registration'.",
        time: "~2 mins",
        difficulty: "easy",
      },
      {
        step: 2,
        title: "Select taxpayer type",
        description: "Choose 'Individual' for personal registration.",
        time: "~1 min",
        difficulty: "easy",
      },
      {
        step: 3,
        title: "Fill personal details",
        description:
          "Enter your ID number, full name, date of birth, and contact details.",
        time: "~10 mins",
        difficulty: "easy",
      },
      {
        step: 4,
        title: "Add obligation details",
        description:
          "Select your tax obligations (e.g., Income Tax Resident Individual).",
        time: "~5 mins",
        difficulty: "medium",
      },
      {
        step: 5,
        title: "Submit and receive PIN",
        description:
          "Submit the form. Your KRA PIN certificate will be emailed to you.",
        time: "~5 mins",
        difficulty: "easy",
      },
    ],
    costs: [
      { item: "KRA PIN Registration", amount: 0, note: "Completely free" },
      { item: "Tax filing (nil returns)", amount: 0, note: "Free on iTax" },
      {
        item: "Late filing penalty",
        amount: 2000,
        note: "Per month of delay — avoid this!",
      },
    ],
    commonMistakes: [
      "Using an invalid or expired ID number during registration",
      "Forgetting to file nil returns even when you have no income",
      "Missing the June 30th annual deadline for tax returns filing",
      "Not keeping your PIN certificate in a safe place",
      "Using a different email than the one registered with KRA",
    ],
    faq: [
      {
        q: "How long does it take to get a KRA PIN?",
        a: "Instant! You receive your PIN certificate via email within minutes of successful registration on iTax.",
      },
      {
        q: "Do I need to file returns if I'm not employed?",
        a: "Yes. You must file nil returns annually if you have a KRA PIN, even if you have no income.",
      },
      {
        q: "When is the deadline for filing returns?",
        a: "June 30th every year for individual taxpayers.",
      },
      {
        q: "Can I register for KRA PIN without a National ID?",
        a: "Yes, you can use a valid passport instead.",
      },
      {
        q: "How do I reset my iTax password?",
        a: "Click 'Forgot Password' on the iTax login page. You'll receive a reset link via email.",
      },
    ],
  },
  "driving-license": {
    slug: "driving-license",
    title: "Driving License",
    description:
      "Apply for, renew, or replace your driving license via NTSA TIMS",
    icon: "Car",
    category: "transport",
    accentColor: "#f59e0b",
    officialUrl: "https://tims.ntsa.go.ke",
    portalUrl: "https://www.ntsa.go.ke/index.php?View=service&service=1",
    requirements: [
      {
        id: 1,
        text: "National ID Card",
        note: "Original and copy",
        icon: "CreditCard",
      },
      {
        id: 2,
        text: "KRA PIN Certificate",
        note: "Download from iTax if you don't have a copy",
        icon: "FileText",
      },
      {
        id: 3,
        text: "Valid driving school certificate",
        note: "From a NTSA-approved driving school",
        icon: "GraduationCap",
      },
      {
        id: 4,
        text: "Medical examination report",
        note: "From a registered medical practitioner",
        icon: "HeartPulse",
      },
      {
        id: 5,
        text: "2 passport-size photos",
        note: "Recent, colored, white background",
        icon: "Camera",
      },
      {
        id: 6,
        text: "KES 600 application fee",
        note: "Paid via eCitizen or NTSA TIMS",
        icon: "Banknote",
      },
    ],
    steps: [
      {
        step: 1,
        title: "Complete driving school",
        description:
          "Enroll in an NTSA-approved driving school and complete the required training hours.",
        time: "2-4 weeks",
        difficulty: "medium",
      },
      {
        step: 2,
        title: "Get medical examination",
        description:
          "Visit a registered doctor for a driving fitness medical exam report.",
        time: "~1 day",
        difficulty: "easy",
      },
      {
        step: 3,
        title: "Register on TIMS",
        description:
          "Create an account on tims.ntsa.go.ke and fill in your details.",
        time: "~15 mins",
        difficulty: "easy",
      },
      {
        step: 4,
        title: "Apply for interim license",
        description: "Submit your application online via TIMS and pay KES 600.",
        time: "~20 mins",
        difficulty: "medium",
      },
      {
        step: 5,
        title: "Book and pass driving test",
        description:
          "Schedule your driving test at the nearest NTSA office and pass both the oral and practical tests.",
        time: "~2 hours",
        difficulty: "complex",
      },
      {
        step: 6,
        title: "Collect smart DL card",
        description:
          "Once approved, collect your smart driving license card from the NTSA office.",
        time: "~15 mins",
        difficulty: "easy",
      },
    ],
    costs: [
      {
        item: "Interim driving license",
        amount: 600,
        note: "Paid via eCitizen",
      },
      {
        item: "Smart DL card",
        amount: 1050,
        note: "For the physical smart card",
      },
      {
        item: "Driving school fees",
        amount: 15000,
        note: "Varies by school (KES 10,000-25,000)",
      },
      { item: "Medical exam", amount: 500, note: "Varies by practitioner" },
    ],
    commonMistakes: [
      "Enrolling in a driving school that is not NTSA-approved",
      "Not bringing original documents to the NTSA office",
      "Failing to book the driving test after getting the interim license",
      "Driving with an expired interim license (valid for only 2 years)",
      "Not carrying both your DL and national ID while driving",
    ],
    faq: [
      {
        q: "How long is an interim driving license valid?",
        a: "2 years from the date of issue. You must convert it to a full license before expiry.",
      },
      {
        q: "Can I drive with just an interim license?",
        a: "Yes, it is a valid driving license for 2 years.",
      },
      {
        q: "How long does it take to get the smart DL?",
        a: "Usually 2-4 weeks after your application is approved.",
      },
      {
        q: "Can I renew my license online?",
        a: "Yes, through the TIMS portal at tims.ntsa.go.ke.",
      },
      {
        q: "What classes of vehicles can I drive?",
        a: "Depends on your license class. Class B covers standard cars. You can add classes later.",
      },
    ],
  },
  "helb-loan": {
    slug: "helb-loan",
    title: "HELB Student Loans",
    description: "Apply for HELB undergraduate loans and manage repayment",
    icon: "GraduationCap",
    category: "finance",
    accentColor: "#06b6d4",
    officialUrl: "https://www.helb.co.ke/undergraduate-loan/",
    portalUrl: "https://account.helb.co.ke",
    requirements: [
      {
        id: 1,
        text: "National ID Card",
        note: "Must be 18 years or older",
        icon: "CreditCard",
      },
      {
        id: 2,
        text: "University/College admission letter",
        note: "Must be a recognized institution",
        icon: "FileText",
      },
      {
        id: 3,
        text: "KCSE Result Slip or Certificate",
        note: "For first-time applicants",
        icon: "Award",
      },
      {
        id: 4,
        text: "Bank account details",
        note: "Active bank account in your name",
        icon: "Building",
      },
      {
        id: 5,
        text: "Parent/Guardian details",
        note: "Including their ID numbers and contact info",
        icon: "Users",
      },
    ],
    steps: [
      {
        step: 1,
        title: "Create HELB account",
        description:
          "Visit account.helb.co.ke and register using your National ID.",
        time: "~10 mins",
        difficulty: "easy",
      },
      {
        step: 2,
        title: "Complete loan application",
        description:
          "Fill in personal details, institution info, and financial information.",
        time: "~30 mins",
        difficulty: "medium",
      },
      {
        step: 3,
        title: "Upload required documents",
        description:
          "Scan and upload your admission letter, KCSE results, and ID.",
        time: "~15 mins",
        difficulty: "easy",
      },
      {
        step: 4,
        title: "Submit and wait for processing",
        description:
          "Submit your application during the open application window (usually March-June).",
        time: "4-8 weeks",
        difficulty: "easy",
      },
      {
        step: 5,
        title: "Sign loan agreement",
        description: "Once approved, sign the loan agreement form online.",
        time: "~10 mins",
        difficulty: "easy",
      },
      {
        step: 6,
        title: "Receive disbursement",
        description:
          "Funds are disbursed to your university and personal bank account.",
        time: "2-4 weeks after signing",
        difficulty: "easy",
      },
    ],
    costs: [
      { item: "Loan application", amount: 0, note: "Free to apply" },
      {
        item: "Undergraduate loan amount",
        amount: 50000,
        note: "KES 38,000-60,000 per year depending on means testing",
      },
      {
        item: "Interest rate",
        amount: 0,
        note: "4% annual interest on the loan",
      },
    ],
    commonMistakes: [
      "Applying after the application window has closed",
      "Not completing the means testing questionnaire honestly",
      "Using incorrect bank account details for disbursement",
      "Failing to sign the loan agreement form after approval",
      "Not checking HELB portal regularly for application status updates",
    ],
    faq: [
      {
        q: "When is the HELB application window?",
        a: "Usually opens in March/April for first-time applicants and September for continuing students. Check helb.co.ke for exact dates.",
      },
      {
        q: "How much can I get from HELB?",
        a: "KES 38,000-60,000 per year depending on means testing results.",
      },
      {
        q: "When do I start repaying?",
        a: "One year after completing your studies.",
      },
      {
        q: "Can I apply for HELB if I'm in a private university?",
        a: "Yes, as long as the institution is accredited by CUE.",
      },
      {
        q: "How do I check my HELB loan balance?",
        a: "Log in to account.helb.co.ke or dial *642# on Safaricom.",
      },
    ],
  },
  "nhif-sha": {
    slug: "nhif-sha",
    title: "NHIF / SHA Registration",
    description:
      "Register for the Social Health Authority (formerly NHIF) insurance",
    icon: "HeartPulse",
    category: "health",
    accentColor: "#8b5cf6",
    officialUrl: "https://www.sha.go.ke",
    portalUrl: "https://portal.nhif.or.ke",
    requirements: [
      {
        id: 1,
        text: "National ID Card",
        note: "Original and copy",
        icon: "CreditCard",
      },
      {
        id: 2,
        text: "Passport-size photo",
        note: "Recent, colored",
        icon: "Camera",
      },
      {
        id: 3,
        text: "Active phone number",
        note: "For mobile registration",
        icon: "Phone",
      },
      {
        id: 4,
        text: "KRA PIN",
        note: "Required for formal sector employees",
        icon: "FileText",
      },
    ],
    steps: [
      {
        step: 1,
        title: "Choose registration method",
        description:
          "Register online at sha.go.ke, visit a Huduma Centre, or dial *155# on your phone.",
        time: "~5 mins",
        difficulty: "easy",
      },
      {
        step: 2,
        title: "Fill registration form",
        description:
          "Provide your personal details, ID number, and contact information.",
        time: "~10 mins",
        difficulty: "easy",
      },
      {
        step: 3,
        title: "Add dependants",
        description:
          "Register your spouse and children under 18 (up to 5 dependants).",
        time: "~10 mins",
        difficulty: "easy",
      },
      {
        step: 4,
        title: "Make first payment",
        description:
          "Pay the monthly premium (KES 500 minimum for self-employed).",
        time: "~5 mins",
        difficulty: "easy",
      },
      {
        step: 5,
        title: "Receive membership card",
        description:
          "Your NHIF card will be sent to you or available for collection.",
        time: "1-2 weeks",
        difficulty: "easy",
      },
    ],
    costs: [
      { item: "Registration", amount: 0, note: "Free to register" },
      {
        item: "Monthly premium (self-employed)",
        amount: 500,
        note: "Minimum KES 500/month",
      },
      {
        item: "Monthly premium (employed)",
        amount: 0,
        note: "Deducted based on salary scale",
      },
    ],
    commonMistakes: [
      "Not paying premiums consistently (coverage is suspended after non-payment)",
      "Forgetting to add dependants immediately after registration",
      "Not carrying your NHIF card when visiting a hospital",
      "Not knowing that SHA replaced NHIF and transitioning services",
      "Missing the 30-day waiting period before first claim",
    ],
    faq: [
      {
        q: "What is the difference between NHIF and SHA?",
        a: "SHA (Social Health Authority) is the new body that replaced NHIF under the Social Health Insurance Fund. Services are similar but being expanded.",
      },
      {
        q: "How much do I pay monthly?",
        a: "Depends on your income. Self-employed: KES 500 minimum. Employed: deducted based on salary bracket.",
      },
      {
        q: "Can I use NHIF at private hospitals?",
        a: "Yes, at any NHIF/SHA-accredited hospital. Check the list at sha.go.ke.",
      },
      {
        q: "How do I check my NHIF status?",
        a: "Dial *155# or visit portal.nhif.or.ke with your ID number.",
      },
      {
        q: "Is there a waiting period?",
        a: "Yes, 30 days from registration before you can make your first claim.",
      },
    ],
  },
  "start-business": {
    slug: "start-business",
    title: "Start a Business",
    description:
      "Register your business with the Business Registration Service (BRS)",
    icon: "Briefcase",
    category: "business",
    accentColor: "#f43f5e",
    officialUrl: "https://brs.ecitizen.go.ke",
    portalUrl: "https://www.ecitizen.go.ke",
    requirements: [
      {
        id: 1,
        text: "National ID Card",
        note: "For all directors/partners",
        icon: "CreditCard",
      },
      {
        id: 2,
        text: "KRA PIN Certificate",
        note: "For all directors/partners",
        icon: "FileText",
      },
      {
        id: 3,
        text: "Proposed business name",
        note: "Have at least 3 alternatives ready",
        icon: "PenLine",
      },
      {
        id: 4,
        text: "Business address",
        note: "Physical address where business will operate",
        icon: "MapPin",
      },
      {
        id: 5,
        text: "Memorandum & Articles of Association",
        note: "For limited companies only",
        icon: "ScrollText",
      },
    ],
    steps: [
      {
        step: 1,
        title: "Search business name",
        description:
          "Visit brs.ecitizen.go.ke and search to confirm your desired business name is available.",
        time: "~10 mins",
        difficulty: "easy",
      },
      {
        step: 2,
        title: "Reserve business name",
        description:
          "Reserve the name. It will be held for 30 days while you complete registration.",
        time: "~5 mins",
        difficulty: "easy",
      },
      {
        step: 3,
        title: "Fill registration form",
        description:
          "Complete the online registration form with business details, directors, and share structure.",
        time: "~30 mins",
        difficulty: "medium",
      },
      {
        step: 4,
        title: "Upload documents",
        description:
          "Upload copies of your ID, KRA PIN, and any supporting documents.",
        time: "~15 mins",
        difficulty: "easy",
      },
      {
        step: 5,
        title: "Pay registration fee",
        description: "Pay via M-PESA or card on the eCitizen platform.",
        time: "~5 mins",
        difficulty: "easy",
      },
      {
        step: 6,
        title: "Receive certificate",
        description:
          "Download your Certificate of Registration/Incorporation from the portal.",
        time: "3-5 business days",
        difficulty: "easy",
      },
    ],
    costs: [
      { item: "Business name reservation", amount: 150, note: "Via eCitizen" },
      {
        item: "Business name registration",
        amount: 950,
        note: "Sole proprietorship",
      },
      {
        item: "Limited company registration",
        amount: 10650,
        note: "Includes stamp duty",
      },
      { item: "Partnership registration", amount: 4000, note: "Standard rate" },
    ],
    commonMistakes: [
      "Not searching the business name availability before reserving",
      "Using a name too similar to an existing registered business",
      "Not registering for a KRA PIN immediately after business registration",
      "Forgetting to apply for necessary county-level business permits",
      "Not keeping a copy of your registration certificate in a safe place",
    ],
    faq: [
      {
        q: "How long does business registration take?",
        a: "Usually 3-5 business days after submitting all documents and paying fees.",
      },
      {
        q: "Do I need a lawyer to register a business?",
        a: "Not for sole proprietorships. For limited companies, it's recommended but not strictly required.",
      },
      {
        q: "Can I register a business from my phone?",
        a: "Yes, the eCitizen portal is mobile-friendly.",
      },
      {
        q: "What type of business should I register?",
        a: "Sole proprietorship is cheapest and simplest. Limited company offers liability protection.",
      },
      {
        q: "Do I need to register with KRA separately?",
        a: "Yes. After BRS registration, register your business for a KRA PIN on itax.kra.go.ke.",
      },
    ],
  },
};

/** Get all services as an array */
export function getAllServices(): ServiceData[] {
  return Object.values(SERVICES_DATA);
}

/** Get a single service by slug */
export function getServiceBySlug(slug: string): ServiceData | undefined {
  return SERVICES_DATA[slug];
}

/** Service slugs array for routing */
export const SERVICE_SLUGS = Object.keys(SERVICES_DATA);
