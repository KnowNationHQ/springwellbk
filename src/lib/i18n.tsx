"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type Locale = "en" | "es" | "fr" | "de" | "pt" | "zh" | "ar";

export const LOCALES: Locale[] = ["en", "es", "fr", "de", "pt", "zh", "ar"];

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English", es: "Español", fr: "Français", de: "Deutsch", pt: "Português", zh: "中文", ar: "العربية",
};

export const RTL_LOCALES: Locale[] = ["ar"];

type Dict = Record<string, Partial<Record<Locale, string>>>;

export const translations: Dict = {
  // ----- Navigation -----
  "nav.home": { en: "Home", es: "Inicio", fr: "Accueil", de: "Startseite", pt: "Início", zh: "首页", ar: "الرئيسية" },
  "nav.about": { en: "About", es: "Acerca de", fr: "À propos", de: "Über uns", pt: "Sobre", zh: "关于我们", ar: "حول" },
  "nav.services": { en: "Services", es: "Servicios", fr: "Services", de: "Leistungen", pt: "Serviços", zh: "服务", ar: "الخدمات" },
  "nav.loan": { en: "Loan", es: "Préstamo", fr: "Prêt", de: "Kredit", pt: "Empréstimo", zh: "贷款", ar: "القرض" },
  "nav.contact": { en: "Contact", es: "Contacto", fr: "Contact", de: "Kontakt", pt: "Contato", zh: "联系我们", ar: "اتصل بنا" },

  // ----- Header -----
  "header.onlineBanking": { en: "Online Banking", es: "Banca en línea", fr: "Banque en ligne", de: "Online-Banking", pt: "Banca online", zh: "网上银行", ar: "الخدمات المصرفية عبر الإنترنت" },
  "header.openAnAccount": { en: "Open an Account", es: "Abrir una cuenta", fr: "Ouvrir un compte", de: "Konto eröffnen", pt: "Abrir uma conta", zh: "开户", ar: "افتح حساباً" },
  "header.logIn": { en: "Log In", es: "Iniciar sesión", fr: "Se connecter", de: "Anmelden", pt: "Entrar", zh: "登录", ar: "تسجيل الدخول" },
  "header.openAccount": { en: "Open Account", es: "Abrir cuenta", fr: "Ouvrir un compte", de: "Konto eröffnen", pt: "Abrir conta", zh: "开户", ar: "افتح حساباً" },
  "header.menu": { en: "Menu", es: "Menú", fr: "Menu", de: "Menü", pt: "Menu", zh: "菜单", ar: "القائمة" },

  // ----- Hero -----
  "hero.eyebrow": { en: "Your Trusted Banking Partner", es: "Su socio bancario de confianza", fr: "Votre partenaire bancaire de confiance", de: "Ihr vertrauenswürdiger Bankpartner", pt: "Seu parceiro bancário confiável", zh: "您值得信赖的银行伙伴", ar: "شريكك المصرفي الموثوق" },
  "hero.title1": { en: "Banking Made", es: "Banca fácil", fr: "La banque simplifiée", de: "Banking leicht gemacht", pt: "Banco fácil", zh: "轻松银行", ar: "خدمات مصرفية بسهولة" },
  "hero.title2": { en: "Simple & Secure", es: "Simple y segura", fr: "Simple et sécurisée", de: "Einfach & Sicher", pt: "Simples e segura", zh: "简单安全", ar: "بسيطة وآمنة" },
  "hero.subtitle": { en: "Open a free account in minutes. Manage your money, send payments, and track your finances — all from one place.", es: "Abra una cuenta gratuita en minutos. Gestione su dinero, envíe pagos y controle sus finanzas, todo desde un solo lugar.", fr: "Ouvrez un compte gratuit en quelques minutes. Gérez votre argent, envoyez des paiements et suivez vos finances, le tout en un seul endroit.", de: "Eröffnen Sie in Minuten ein kostenloses Konto. Verwalten Sie Ihr Geld, senden Sie Zahlungen und verfolgen Sie Ihre Finanzen – alles an einem Ort.", pt: "Abra uma conta gratuita em minutos. Gerencie seu dinheiro, envie pagamentos e acompanhe suas finanças, tudo em um só lugar.", zh: "几分钟内免费开户。管理资金、转账付款、追踪财务，尽在一个平台。", ar: "افتح حساباً مجانياً في دقائق. أدر أموالك وأرسل المدفوعات وتتبع أموالك من مكان واحد." },
  "hero.cta1": { en: "Open Free Account", es: "Abrir cuenta gratis", fr: "Ouvrir un compte gratuit", de: "Kostenloses Konto eröffnen", pt: "Abrir conta grátis", zh: "免费开户", ar: "افتح حساباً مجانياً" },
  "hero.cta2": { en: "Apply for Loan", es: "Solicitar préstamo", fr: "Faire une demande de prêt", de: "Kredit beantragen", pt: "Pedir empréstimo", zh: "申请贷款", ar: "التقدم للقرض" },
  "hero.badge1": { en: "FDIC Insured", es: "Asegurado por la FDIC", fr: "Assuré par la FDIC", de: "FDIC-versichert", pt: "Segurado pela FDIC", zh: "FDIC 承保", ar: "مؤمن من FDIC" },
  "hero.badge2": { en: "256-bit Encryption", es: "Cifrado de 256 bits", fr: "Chiffrement 256 bits", de: "256-Bit-Verschlüsselung", pt: "Criptografia de 256 bits", zh: "256 位加密", ar: "تشفير 256 بت" },
  "hero.badge3": { en: "24/7 Support", es: "Soporte 24/7", fr: "Assistance 24/7", de: "24/7 Support", pt: "Suporte 24/7", zh: "全天候支持", ar: "دعم على مدار الساعة" },
  "hero.cardTitle": { en: "Online Banking", es: "Banca en línea", fr: "Banque en ligne", de: "Online-Banking", pt: "Banca online", zh: "网上银行", ar: "الخدمات المصرفية عبر الإنترنت" },
  "hero.cardSub": { en: "Sign in to access your account", es: "Inicie sesión para acceder a su cuenta", fr: "Connectez-vous pour accéder à votre compte", de: "Melden Sie sich an, um auf Ihr Konto zuzugreifen", pt: "Entre para acessar sua conta", zh: "登录以访问您的账户", ar: "سجل الدخول للوصول إلى حسابك" },
  "hero.email": { en: "Email", es: "Correo electrónico", fr: "E-mail", de: "E-Mail", pt: "E-mail", zh: "电子邮箱", ar: "البريد الإلكتروني" },
  "hero.username": { en: "Username", es: "Nombre de usuario", fr: "Nom d'utilisateur", de: "Benutzername", pt: "Nome de usuário", zh: "用户名", ar: "اسم المستخدم" },
  "hero.password": { en: "Password", es: "Contraseña", fr: "Mot de passe", de: "Passwort", pt: "Senha", zh: "密码", ar: "كلمة المرور" },
  "hero.signIn": { en: "Sign In", es: "Iniciar sesión", fr: "Se connecter", de: "Anmelden", pt: "Entrar", zh: "登录", ar: "تسجيل الدخول" },
  "hero.signingIn": { en: "Signing in...", es: "Iniciando sesión...", fr: "Connexion...", de: "Anmelden...", pt: "Entrando...", zh: "登录中...", ar: "جارٍ تسجيل الدخول..." },
  "hero.forgot": { en: "Forgot Password?", es: "¿Olvidó su contraseña?", fr: "Mot de passe oublié ?", de: "Passwort vergessen?", pt: "Esqueceu a senha?", zh: "忘记密码？", ar: "هل نسيت كلمة المرور؟" },

  // ----- Features -----
  "features.eyebrow": { en: "Why Choose Us", es: "Por qué elegirnos", fr: "Pourquoi nous choisir", de: "Warum wir", pt: "Por que nos escolher", zh: "为什么选择我们", ar: "لماذا تختارنا" },
  "features.heading": { en: "Modern Banking for Everyone", es: "Banca moderna para todos", fr: "La banque moderne pour tous", de: "Moderne Bank für alle", pt: "Banco moderno para todos", zh: "人人适用的现代银行", ar: "الخدمات المصرفية الحديثة للجميع" },
  "features.easyToUse.title": { en: "Easy to use", es: "Fácil de usar", fr: "Facile à utiliser", de: "Einfach zu bedienen", pt: "Fácil de usar", zh: "易于使用", ar: "سهل الاستخدام" },
  "features.easyToUse.desc": { en: "Our platform is easy and flexible with high definition interest rate.", es: "Nuestra plataforma es fácil y flexible con tasas de interés de alta definición.", fr: "Notre plateforme est facile et flexible avec des taux d'intérêt de haute définition.", de: "Unsere Plattform ist einfach und flexibel mit hochwertigen Zinsen.", pt: "Nossa plataforma é fácil e flexível com taxas de juros de alta definição.", zh: "我们的平台简单灵活，利率优越。", ar: "منصتنا سهلة ومرونة مع أسعار فائدة عالية الدقة." },
  "features.support247.title": { en: "24/7 customer support", es: "Soporte al cliente 24/7", fr: "Support client 24/7", de: "24/7 Kundensupport", pt: "Suporte ao cliente 24/7", zh: "全天候客户支持", ar: "دعم العملاء على مدار الساعة" },
  "features.support247.desc": { en: "Our support section is available via email 24/7 to help and attend to bookings and enquiries.", es: "Nuestra sección de soporte está disponible por correo electrónico 24/7 para ayudar y atender reservas y consultas.", fr: "Notre section de support est disponible par e-mail 24/7 pour aider et traiter les réservations et demandes.", de: "Unser Support ist rund um die Uhr per E-Mail erreichbar, um Buchungen und Anfragen zu bearbeiten.", pt: "Nossa seção de suporte está disponível por e-mail 24/7 para ajudar e atender reservas e consultas.", zh: "我们的支持团队全天候通过电子邮件提供帮助，处理预订和咨询。", ar: "قسم الدعم لدينا متاح عبر البريد الإلكتروني على مدار الساعة للمساعدة والرد على الحجوزات والاستفسارات." },
  "features.hybridAccounts.title": { en: "Hybrid accounts", es: "Cuentas híbridas", fr: "Comptes hybrides", de: "Hybridkonten", pt: "Contas híbridas", zh: "混合账户", ar: "حسابات هجينة" },
  "features.hybridAccounts.desc": { en: "Personal or business accounts are available in savings and current.", es: "Cuentas personales o empresariales disponibles en ahorro y corriente.", fr: "Comptes personnels ou professionnels disponibles en épargne et courant.", de: "Persönliche oder Geschäftskonten als Spar- und Girokonten verfügbar.", pt: "Contas pessoais ou empresariais disponíveis em poupança e corrente.", zh: "个人或企业账户，提供储蓄和活期两种选择。", ar: "الحسابات الشخصية أو التجارية متوفرة في التوفير الجاري." },
  "features.fastTransfers.title": { en: "Fast Transfers", es: "Transferencias rápidas", fr: "Transferts rapides", de: "Schnelle Überweisungen", pt: "Transferências rápidas", zh: "快速转账", ar: "تحويلات سريعة" },
  "features.fastTransfers.desc": { en: "Send and receive money instantly with zero fees on domestic transfers.", es: "Envíe y reciba dinero al instante sin comisiones en transferencias nacionales.", fr: "Envoyez et recevez de l'argent instantanément sans frais sur les virements nationaux.", de: "Senden und empfangen Sie Geld sofort ohne Gebühren bei Inlandsüberweisungen.", pt: "Envie e receba dinheiro instantaneamente sem taxas em transferências nacionais.", zh: "国内转账零费用，即时收付款。", ar: "أرسل واستقبل الأموال فوراً بدون رسوم على التحويلات المحلية." },
  "features.mobileBanking.title": { en: "Mobile Banking", es: "Banca móvil", fr: "Banque mobile", de: "Mobile Banking", pt: "Banco móvel", zh: "移动银行", ar: "الخدمات المصرفية عبر الجوال" },
  "features.mobileBanking.desc": { en: "Manage your accounts anytime, anywhere from your phone or tablet.", es: "Gestione sus cuentas en cualquier momento y lugar desde su teléfono o tablet.", fr: "Gérez vos comptes à tout moment, où que vous soyez, depuis votre téléphone ou tablette.", de: "Verwalten Sie Ihre Konten jederzeit und überall mit Handy oder Tablet.", pt: "Gerencie suas contas a qualquer hora e lugar pelo celular ou tablet.", zh: "随时随地通过手机或平板管理账户。", ar: "أدر حساباتك في أي وقت ومن أي مكان عبر هاتفك أو جهازك اللوحي." },
  "features.growMoney.title": { en: "Grow Your Money", es: "Haga crecer su dinero", fr: "Faites fructifier votre argent", de: "Lassen Sie Ihr Geld wachsen", pt: "Faça seu dinheiro crescer", zh: "让财富增值", ar: "نمِّ أموالك" },
  "features.growMoney.desc": { en: "Earn competitive interest rates on savings and investment accounts.", es: "Gane tasas de interés competitivas en cuentas de ahorro e inversión.", fr: "Gagnez des taux d'intérêt compétitifs sur les comptes d'épargne et d'investissement.", de: "Erzielen Sie wettbewerbsfähige Zinsen auf Spar- und Anlagekonten.", pt: "Ganhe taxas de juros competitivas em contas de poupança e investimento.", zh: "在储蓄和投资账户上赚取有竞争力的利率。", ar: "اكسب أسعار فائدة تنافسية على حسابات التوفير والاستثمار." },

  // ----- Promos -----
  "promos.eyebrow": { en: "Offers", es: "Ofertas", fr: "Offres", de: "Angebote", pt: "Ofertas", zh: "优惠", ar: "العروض" },
  "promos.heading": { en: "Banking built around your goals", es: "Banca creada según sus metas", fr: "Une banque centrée sur vos objectifs", de: "Banking rund um Ihre Ziele", pt: "Banco feito para seus objetivos", zh: "围绕您的目标打造的银行服务", ar: "خدمات مصرفية مبنية حول أهدافك" },
  "promo.checking.eyebrow": { en: "GET $125", es: "OBTENGA $125", fr: "RECEVEZ 125 $", de: "HOLEN SIE SICH 125 $", pt: "GANHE $125", zh: "获赠 125 美元", ar: "احصل على 125 دولاراً" },
  "promo.checking.title": { en: "with SpringWell Checking", es: "con la Cuenta Corriente SpringWell", fr: "avec le compte courant SpringWell", de: "mit dem SpringWell-Girokonto", pt: "com a Conta Corrente SpringWell", zh: "使用 SpringWell 支票账户", ar: "مع الحساب الجاري SpringWell" },
  "promo.checking.desc": { en: "Open a checking account today and earn a $125 bonus with qualifying direct deposits.", es: "Abra hoy una cuenta corriente y gane un bono de $125 con depósitos directos elegibles.", fr: "Ouvrez dès aujourd'hui un compte courant et gagnez une prime de 125 $ avec des dépôts directs éligibles.", de: "Eröffnen Sie noch heute ein Girokonto und erhalten Sie einen Bonus von 125 $ mit qualifizierten Direkteinzahlungen.", pt: "Abra hoje uma conta corrente e ganhe um bônus de $125 com depósitos diretos qualificados.", zh: "立即开设支票账户，符合条件直接存款可获 125 美元奖励。", ar: "افتح حساباً جارياً اليوم واكسب مكافأة 125 دولاراً مع الإيداعات المباشرة المؤهلة." },
  "promo.checking.cta": { en: "Open Account", es: "Abrir cuenta", fr: "Ouvrir un compte", de: "Konto eröffnen", pt: "Abrir conta", zh: "开户", ar: "افتح حساباً" },
  "promo.business.eyebrow": { en: "START EXPANDING", es: "COMIENCE A CRECER", fr: "COMMENCEZ À GRANDIR", de: "WACHSEN SIE", pt: "COMECE A EXPANDIR", zh: "开始扩张", ar: "ابدأ بالتوسع" },
  "promo.business.title": { en: "Grow your business", es: "Haga crecer su negocio", fr: "Faites croître votre entreprise", de: "Lassen Sie Ihr Geschäft wachsen", pt: "Faça seu negócio crescer", zh: "发展您的业务", ar: "نمِّ عملك" },
  "promo.business.desc": { en: "Explore how your business can grow with tailored accounts and cash-flow tools.", es: "Explore cómo su negocio puede crecer con cuentas a medida y herramientas de flujo de efectivo.", fr: "Découvrez comment votre entreprise peut se développer grâce à des comptes sur mesure et des outils de trésorerie.", de: "Entdecken Sie, wie Ihr Unternehmen mit maßgeschneiderten Konten und Cashflow-Tools wachsen kann.", pt: "Veja como sua empresa pode crescer com contas sob medida e ferramentas de fluxo de caixa.", zh: "通过专属账户与现金流工具助力业务发展。", ar: "اكتشف كيف يمكن لعملك النمو بحسابات مخصصة وأدوات التدفق النقدي." },
  "promo.business.cta": { en: "Business Banking", es: "Banca empresarial", fr: "Banque d'entreprise", de: "Geschäftsbanking", pt: "Banco empresarial", zh: "企业银行", ar: "الخدمات المصرفية للأعمال" },
  "promo.home.eyebrow": { en: "START OWNING", es: "COMIENCE A SER PROPIETARIO", fr: "COMMENCEZ À ÊTRE PROPRIÉTAIRE", de: "WERDEN SIE EIGENTÜMER", pt: "COMECE A SER DONO", zh: "开启置业", ar: "ابدأ بامتلاك" },
  "promo.home.title": { en: "Strive for your dream home", es: "Alcance la casa de sus sueños", fr: "Visez la maison de vos rêves", de: "Streben Sie nach Ihrem Traumhaus", pt: "Conquiste a casa dos seus sonhos", zh: "圆您安居梦", ar: "اسعَ لامتلاك منزل أحلامك" },
  "promo.home.desc": { en: "Competitive mortgage rates and a guided path from pre-approval to closing.", es: "Tasas hipotecarias competitivas y un camino guiado desde la preaprobación hasta el cierre.", fr: "Taux hypothécaires compétitifs et un cheminement guidé de la préapprobation à la clôture.", de: "Wettbewerbsfähige Hypothekenzinsen und ein geführter Weg von der Vorabgenehmigung bis zum Abschluss.", pt: "Taxas hipotecárias competitivas e um caminho guiado da pré-aprovação ao fechamento.", zh: "极具竞争力的房贷利率，从预审到过户全程指导。", ar: "أسعار رهن تنافسية ومسار موجه من الموافقة المبدئية إلى الإغلاق." },
  "promo.home.cta": { en: "Learn More", es: "Saber más", fr: "En savoir plus", de: "Mehr erfahren", pt: "Saiba mais", zh: "了解更多", ar: "اعرف المزيد" },
  "promo.savings.eyebrow": { en: "GET MONEY SMART", es: "SEA LISTO CON SU DINERO", fr: "DEVENEZ MALIN FINANCIÈREMENT", de: "WORDEN SIE FINANZKLUG", pt: "FIQUE ESPECIALISTA EM DINHEIRO", zh: "聪明理财", ar: "كن ذكياً مع المال" },
  "promo.savings.title": { en: "Build for tomorrow", es: "Construya para el mañana", fr: "Construisez pour demain", de: "Bauen Sie für morgen", pt: "Construa para o amanhã", zh: "为未来积累", ar: "ابنِ للمستقبل" },
  "promo.savings.desc": { en: "It's never too early to start building for tomorrow with our savings tools.", es: "Nunca es demasiado pronto para empezar a construir el mañana con nuestras herramientas de ahorro.", fr: "Il n'est jamais trop tôt pour commencer à construire demain avec nos outils d'épargne.", de: "Es ist nie zu früh, mit unseren Sparwerkzeugen für morgen zu bauen.", pt: "Nunca é cedo demais para começar a construir o amanhã com nossas ferramentas de poupança.", zh: "借助我们的储蓄工具，为未来规划永远不嫌早。", ar: "لا يفتح وقت مبكراً أبداً للبدء في البناء للمستقبل بأدوات التوفير لدينا." },
  "promo.savings.cta": { en: "Start Saving", es: "Empiece a ahorrar", fr: "Commencez à épargner", de: "Sparen beginnen", pt: "Comece a poupar", zh: "开始储蓄", ar: "ابدأ بالادخار" },

  // ----- Services -----
  "services.eyebrow": { en: "Our Products", es: "Nuestros productos", fr: "Nos produits", de: "Unsere Produkte", pt: "Nossos produtos", zh: "我们的产品", ar: "منتجاتنا" },
  "services.heading": { en: "Choose the Right Account", es: "Elija la cuenta adecuada", fr: "Choisissez le bon compte", de: "Wählen Sie das richtige Konto", pt: "Escolha a conta certa", zh: "选择适合的账户", ar: "اختر الحساب المناسب" },
  "services.getStarted": { en: "Get Started", es: "Comenzar", fr: "Commencer", de: "Loslegen", pt: "Começar", zh: "立即开始", ar: "ابدأ" },
  "services.eyebrow2": { en: "Services", es: "Servicios", fr: "Services", de: "Leistungen", pt: "Serviços", zh: "服务", ar: "الخدمات" },
  "services.heading2": { en: "Everything you need in one place", es: "Todo lo que necesita en un solo lugar", fr: "Tout ce dont vous avez besoin au même endroit", de: "Alles, was Sie an einem Ort brauchen", pt: "Tudo o que você precisa em um só lugar", zh: "您所需，尽在一处", ar: "كل ما تحتاجه في مكان واحد" },
  "account.checking.title": { en: "Checking Account", es: "Cuenta corriente", fr: "Compte courant", de: "Girokonto", pt: "Conta corrente", zh: "支票账户", ar: "الحساب الجاري" },
  "account.checking.f1": { en: "No monthly fees", es: "Sin comisiones mensuales", fr: "Sans frais mensuels", de: "Keine monatlichen Gebühren", pt: "Sem taxas mensais", zh: "无月费", ar: "بدون رسوم شهرية" },
  "account.checking.f2": { en: "Free debit card", es: "Tarjeta de débito gratuita", fr: "Carte de débit gratuite", de: "Gratis Girokarte", pt: "Cartão de débito grátis", zh: "免费借记卡", ar: "بطاقة خصم مجانية" },
  "account.checking.f3": { en: "Online & mobile banking", es: "Banca en línea y móvil", fr: "Banque en ligne et mobile", de: "Online- und Mobile-Banking", pt: "Banca online e móvel", zh: "线上与移动银行", ar: "الخدمات المصرفية عبر الإنترنت والجوال" },
  "account.savings.title": { en: "Savings Account", es: "Cuenta de ahorros", fr: "Compte d'épargne", de: "Sparkonto", pt: "Conta poupança", zh: "储蓄账户", ar: "حساب التوفير" },
  "account.savings.f1": { en: "No minimum deposit", es: "Sin depósito mínimo", fr: "Sans dépôt minimum", de: "Keine Mindesteinlage", pt: "Sem depósito mínimo", zh: "无最低存款", ar: "بدون إيداع أدنى" },
  "account.savings.f2": { en: "Compound daily interest", es: "Interés compuesto diario", fr: "Intérêts composés quotidiens", de: "Täglich aufzinsend", pt: "Juros compostos diários", zh: "每日复利", ar: "فائدة مركبة يومية" },
  "account.savings.f3": { en: "FDIC insured", es: "Asegurado por la FDIC", fr: "Assuré par la FDIC", de: "FDIC-versichert", pt: "Segurado pela FDIC", zh: "FDIC 承保", ar: "مؤمن من FDIC" },
  "account.business.title": { en: "Business Account", es: "Cuenta empresarial", fr: "Compte professionnel", de: "Geschäftskonto", pt: "Conta empresarial", zh: "企业账户", ar: "الحساب التجاري" },
  "account.business.f1": { en: "Unlimited transactions", es: "Transacciones ilimitadas", fr: "Transactions illimitées", de: "Unbegrenzte Transaktionen", pt: "Transações ilimitadas", zh: "无限交易", ar: "معاملات غير محدودة" },
  "account.business.f2": { en: "Team access", es: "Acceso para equipos", fr: "Accès équipe", de: "Team-Zugang", pt: "Acesso da equipe", zh: "团队访问", ar: "وصول الفريق" },
  "account.business.f3": { en: "Invoice tools", es: "Herramientas de facturación", fr: "Outils de facturation", de: "Rechnungstools", pt: "Ferramentas de faturamento", zh: "发票工具", ar: "أدوات الفواتير" },
  "offering.loans.title": { en: "Loans", es: "Préstamos", fr: "Prêts", de: "Kredite", pt: "Empréstimos", zh: "贷款", ar: "القروض" },
  "offering.loans.desc": { en: "Personal, auto, and home loans with fast approvals.", es: "Préstamos personales, de auto y hipotecarios con aprobación rápida.", fr: "Prêts personnels, auto et immobilier avec approbation rapide.", de: "Persönliche, Auto- und Immobilienkredite mit schneller Genehmigung.", pt: "Empréstimos pessoais, de carro e imobiliários com aprovação rápida.", zh: "个人、汽车与房屋贷款，审批迅速。", ar: "قروض شخصية وسيارات وعقارية بموافقات سريعة." },
  "offering.loans.eyebrow": { en: "Lending", es: "Préstamos", fr: "Crédit", de: "Kreditvergabe", pt: "Empréstimos", zh: "贷款服务", ar: "الإقراض" },
  "offering.loans.f1": { en: "No origination fees", es: "Sin comisiones de apertura", fr: "Sans frais de dossier", de: "Keine Bearbeitungsgebühren", pt: "Sem taxas de abertura", zh: "无开户费", ar: "بدون رسوم إنشاء" },
  "offering.loans.f2": { en: "Fixed & variable rates", es: "Tasas fijas y variables", fr: "Taux fixes et variables", de: "Feste & variable Zinsen", pt: "Taxas fixas e variáveis", zh: "固定与浮动利率", ar: "أسعار ثابتة ومتغيرة" },
  "offering.loans.f3": { en: "Pre-qualify in 2 minutes", es: "Pre-calificación en 2 minutos", fr: "Pré-qualification en 2 minutes", de: "Vorqualifikation in 2 Minuten", pt: "Pré-qualificação em 2 minutos", zh: "2 分钟预审批", ar: "مؤهل مبدئياً في دقيقتين" },
  "offering.loans.cta": { en: "Apply Now", es: "Solicitar ahora", fr: "Postuler maintenant", de: "Jetzt beantragen", pt: "Solicitar agora", zh: "立即申请", ar: "قدّم الآن" },

  "offering.transfer.title": { en: "Fund Transfer", es: "Transferencia de fondos", fr: "Virement de fonds", de: "Geldftransfer", pt: "Transferência de fundos", zh: "资金转账", ar: "تحويل الأموال" },
  "offering.transfer.desc": { en: "Move money locally and internationally in seconds.", es: "Mueva dinero local e internacionalmente en segundos.", fr: "Déplacez de l'argent localement et internationalement en quelques secondes.", de: "Bewegen Sie Geld lokal und international in Sekunden.", pt: "Mova dinheiro local e internacionalmente em segundos.", zh: "本地与国际转账，秒级到账。", ar: "حرّك الأموال محلياً ودولياً في ثوانٍ." },
  "offering.transfer.eyebrow": { en: "Payments", es: "Pagos", fr: "Paiements", de: "Zahlungen", pt: "Pagamentos", zh: "支付服务", ar: "المدفوعات" },
  "offering.transfer.f1": { en: "Zero domestic fees", es: "Sin comisiones nacionales", fr: "Frais nationaux gratuits", de: "Keine Inlandsgebühren", pt: "Sem taxas nacionais", zh: "国内零费用", ar: "بدون رسوم محلية" },
  "offering.transfer.f2": { en: "Real-time settlement", es: "Liquidación en tiempo real", fr: "Règlement en temps réel", de: "Echtzeit-Abwicklung", pt: "Liquidação em tempo real", zh: "实时结算", ar: "تسوية فورية" },
  "offering.transfer.f3": { en: "200+ countries supported", es: "Más de 200 países soportados", fr: "200+ pays supportés", de: "200+ Länder unterstützt", pt: "Mais de 200 países suportados", zh: "覆盖 200+ 国家", ar: "أكثر من 200 دولة مدعومة" },
  "offering.transfer.cta": { en: "Send Money", es: "Enviar dinero", fr: "Envoyer de l'argent", de: "Geld senden", pt: "Enviar dinheiro", zh: "汇款", ar: "أرسل أموالاً" },

  "offering.prepaid.title": { en: "Prepaid Card", es: "Tarjeta prepaga", fr: "Carte prépayée", de: "Prepaidkarte", pt: "Cartão pré-pago", zh: "预付卡", ar: "بطاقة مدفوعة مسبقاً" },
  "offering.prepaid.desc": { en: "Load and spend with a contactless prepaid card.", es: "Cargue y gaste con una tarjeta prepaga sin contacto.", fr: "Chargez et dépensez avec une carte prépayée sans contact.", de: "Laden und ausgeben mit einer kontaktlosen Prepaidkarte.", pt: "Carregue e gaste com um cartão pré-pago sem contato.", zh: "使用非接触式预付卡充值消费。", ar: "حمّل وأنفق ببطاقة مدفوعة مسبقاً بدون تلامس." },
  "offering.prepaid.eyebrow": { en: "Cards", es: "Tarjetas", fr: "Cartes", de: "Karten", pt: "Cartões", zh: "卡片", ar: "البطاقات" },
  "offering.prepaid.f1": { en: "Contactless payments", es: "Pagos sin contacto", fr: "Paiements sans contact", de: "Kontaktlose Zahlungen", pt: "Pagamentos por aproximação", zh: "非接触支付", ar: "مدفوعات بدون تلامس" },
  "offering.prepaid.f2": { en: "Instant card load", es: "Carga instantánea de tarjeta", fr: "Chargement instantané", de: "Sofortige Aufladung", pt: "Carregamento instantâneo", zh: "即时充值", ar: "شحن البطاقة فوراً" },
  "offering.prepaid.f3": { en: "Worldwide acceptance", es: "Aceptación mundial", fr: "Acceptation mondiale", de: "Weltweite Akzeptanz", pt: "Aceitação mundial", zh: "全球通用", ar: "قبول عالمي" },
  "offering.prepaid.cta": { en: "Get Card", es: "Obtener tarjeta", fr: "Obtenir la carte", de: "Karte erhalten", pt: "Obter cartão", zh: "获取卡片", ar: "احصل على البطاقة" },

  "offering.net.title": { en: "Net Banking", es: "Banca por internet", fr: "Banque en ligne", de: "Online-Banking", pt: "Banca online", zh: "网上银行", ar: "الخدمات المصرفية عبر الإنترنت" },
  "offering.net.desc": { en: "Bank online securely from any device, 24/7.", es: "Banca en línea de forma segura desde cualquier dispositivo, 24/7.", fr: "Banquez en ligne en toute sécurité depuis n'importe quel appareil, 24/7.", de: "Bankieren Sie sicher online von jedem Gerät, 24/7.", pt: "Banca online com segurança de qualquer dispositivo, 24/7.", zh: "全天候安全线上银行，任意设备。", ar: "مصرف عبر الإنترنت بأمان من أي جهاز على مدار الساعة." },
  "offering.net.eyebrow": { en: "Digital", es: "Digital", fr: "Digital", de: "Digital", pt: "Digital", zh: "数字银行", ar: "رقمي" },
  "offering.net.f1": { en: "256-bit encryption", es: "Cifrado de 256 bits", fr: "Chiffrement 256 bits", de: "256-Bit-Verschlüsselung", pt: "Criptografia de 256 bits", zh: "256 位加密", ar: "تشفير 256 بت" },
  "offering.net.f2": { en: "Biometric login", es: "Inicio biométrico", fr: "Connexion biométrique", de: "Biometrische Anmeldung", pt: "Login biométrico", zh: "生物识别登录", ar: "دخول بيومتري" },
  "offering.net.f3": { en: "Real-time alerts", es: "Alertas en tiempo real", fr: "Alertes en temps réel", de: "Echtzeit-Benachrichtigungen", pt: "Alertas em tempo real", zh: "实时提醒", ar: "تنبيهات فورية" },
  "offering.net.cta": { en: "Start Banking", es: "Comenzar a bancar", fr: "Commencer à banker", de: "Jetzt bankieren", pt: "Começar a bancar", zh: "开始网银", ar: "ابدأ الخدمات المصرفية" },

  "offering.mcash.title": { en: "Mcash", es: "Mcash", fr: "Mcash", de: "Mcash", pt: "Mcash", zh: "Mcash", ar: "Mcash" },
  "offering.mcash.desc": { en: "Tap-to-pay and mobile wallet integration.", es: "Pago por acercamiento e integración de billetera móvil.", fr: "Paiement sans contact et intégration de portefeuille mobile.", de: "Tap-to-pay und Mobile-Wallet-Integration.", pt: "Pagamento por aproximação e integração de carteira móvel.", zh: "碰一碰支付与移动钱包集成。", ar: "الدفع باللمس وتكامل المحفظة الجوال." },
  "offering.mcash.eyebrow": { en: "Mobile", es: "Móvil", fr: "Mobile", de: "Mobil", pt: "Móvel", zh: "移动支付", ar: "جوال" },
  "offering.mcash.f1": { en: "Tap & go payments", es: "Pagos con toque", fr: "Paiements en un tap", de: "Tap & Go-Zahlungen", pt: "Pagamentos por toque", zh: "碰一碰付款", ar: "مدفوعات باللمس" },
  "offering.mcash.f2": { en: "Apple & Google Pay", es: "Apple y Google Pay", fr: "Apple et Google Pay", de: "Apple & Google Pay", pt: "Apple e Google Pay", zh: "支持 Apple 与 Google Pay", ar: "يدعم Apple و Google Pay" },
  "offering.mcash.f3": { en: "Cashback on every tap", es: "Reembolso en cada toque", fr: "Cashback à chaque tap", de: "Cashback bei jedem Tap", pt: "Cashback a cada toque", zh: "每笔消费返现", ar: "استرداد نقدي مع كل لمسة" },
  "offering.mcash.cta": { en: "Enable Mcash", es: "Activar Mcash", fr: "Activer Mcash", de: "Mcash aktivieren", pt: "Ativar Mcash", zh: "启用 Mcash", ar: "فعّل Mcash" },

  "offering.cards.title": { en: "Debit & Credit", es: "Débito y crédito", fr: "Débit et crédit", de: "Debit & Kredit", pt: "Débito e crédito", zh: "借记与信用", ar: "الخصم والائتمان" },
  "offering.cards.desc": { en: "Everyday cards with rewards and zero hidden fees.", es: "Tarjetas diarias con recompensas y sin comisiones ocultas.", fr: "Cartes quotidiennes avec récompenses et zéro frais cachés.", de: "Alltagskarten mit Prämien und ohne versteckte Gebühren.", pt: "Cartões do dia a dia com recompensas e zero taxas ocultas.", zh: "日常用卡，有奖励且无隐藏费用。", ar: "بطاقات يومية بمكافآت وبدون رسوم خفية." },
  "offering.cards.eyebrow": { en: "Everyday", es: "Diario", fr: "Quotidien", de: "Alltag", pt: "Dia a dia", zh: "日常用卡", ar: "يومي" },
  "offering.cards.f1": { en: "Up to 5% cashback", es: "Hasta 5% de reembolso", fr: "Jusqu'à 5% de cashback", de: "Bis zu 5% Cashback", pt: "Até 5% de cashback", zh: "最高 5% 返现", ar: "حتى 5% استرداد نقدي" },
  "offering.cards.f2": { en: "No annual fee", es: "Sin cuota anual", fr: "Sans frais annuels", de: "Keine Jahresgebühr", pt: "Sem anuidade", zh: "无年费", ar: "بدون رسوم سنوية" },
  "offering.cards.f3": { en: "Zero foreign transaction fees", es: "Sin comisiones extranjeras", fr: "Zéro frais à l'étranger", de: "Keine Fremdgebühren", pt: "Sem taxas estrangeiras", zh: "零外币交易费", ar: "بدون رسوم المعاملات الأجنبية" },
  "offering.cards.cta": { en: "Compare Cards", es: "Comparar tarjetas", fr: "Comparer les cartes", de: "Karten vergleichen", pt: "Comparar cartões", zh: "对比卡片", ar: "قارن البطاقات" },

  // ----- About -----
  "about.eyebrow": { en: "About SpringWell", es: "Acerca de SpringWell", fr: "À propos de SpringWell", de: "Über SpringWell", pt: "Sobre a SpringWell", zh: "关于 SpringWell", ar: "حول SpringWell" },
  "about.heading": { en: "Built on Trust, Driven by Innovation", es: "Construido sobre la confianza, impulsado por la innovación", fr: "Bâti sur la confiance, porté par l'innovation", de: "Auf Vertrauen gebaut, von Innovation getrieben", pt: "Construído sobre confiança, impulsionado por inovação", zh: "以信任为基，以创新为驱", ar: "مبني على الثقة، مدفوع بالابتكار" },
  "about.body": { en: "SpringWell Bank combines cutting-edge technology with traditional banking values to give you the best of both worlds.", es: "SpringWell Bank combina tecnología de vanguardia con valores bancarios tradicionales para ofrecerle lo mejor de ambos mundos.", fr: "SpringWell Bank associe une technologie de pointe aux valeurs bancaires traditionnelles pour vous offrir le meilleur des deux mondes.", de: "SpringWell Bank verbindet modernste Technologie mit traditionellen Bankwerten, um Ihnen das Beste aus beiden Welten zu bieten.", pt: "O SpringWell Bank combina tecnologia de ponta com valores bancários tradicionais para lhe dar o melhor dos dois mundos.", zh: "SpringWell 银行融合前沿科技与传统银行理念，兼得二者之长。", ar: "يجمع بنك SpringWell بين التكنولوجيا المتطورة والقيم المصرفية التقليدية ليمنحك أفضل العالمين." },
  "about.stat1": { en: "Assets Managed", es: "Activos gestionados", fr: "Actifs gérés", de: "Verwaltete Vermögenswerte", pt: "Ativos gerenciados", zh: "管理资产", ar: "الأصول المُدارة" },
  "about.stat2": { en: "Active Users", es: "Usuarios activos", fr: "Utilisateurs actifs", de: "Aktive Nutzer", pt: "Usuários ativos", zh: "活跃用户", ar: "المستخدمون النشطون" },
  "about.stat3": { en: "Uptime", es: "Tiempo activo", fr: "Disponibilité", de: "Betriebszeit", pt: "Tempo de atividade", zh: "正常运行时间", ar: "وقت التشغيل" },
  "about.pillar1.title": { en: "Security First", es: "Seguridad primero", fr: "La sécurité d'abord", de: "Sicherheit zuerst", pt: "Segurança primeiro", zh: "安全优先", ar: "الأمان أولاً" },
  "about.pillar1.desc": { en: "Bank-level encryption and FDIC insurance protect every transaction.", es: "El cifrado a nivel bancario y el seguro FDIC protegen cada transacción.", fr: "Le chiffrement de niveau bancaire et l'assurance FDIC protègent chaque transaction.", de: "Bankenverschlüsselung und FDIC-Versicherung schützen jede Transaktion.", pt: "Criptografia de nível bancário e seguro FDIC protegem cada transação.", zh: "银行级加密与 FDIC 保险保障每笔交易。", ar: "تشفير بمستوى البنوك وتأمين FDIC يحميان كل معاملة." },
  "about.pillar2.title": { en: "Instant Access", es: "Acceso instantáneo", fr: "Accès instantané", de: "Sofortiger Zugriff", pt: "Acesso instantâneo", zh: "即时访问", ar: "وصول فوري" },
  "about.pillar2.desc": { en: "Real-time balance updates and instant notifications on every activity.", es: "Actualizaciones de saldo en tiempo real y notificaciones instantáneas en cada actividad.", fr: "Mises à jour de solde en temps réel et notifications instantanées à chaque activité.", de: "Echtzeit-Kontostandsaktualisierungen und sofortige Benachrichtigungen bei jeder Aktivität.", pt: "Atualizações de saldo em tempo real e notificações instantâneas em cada atividade.", zh: "实时余额更新与每笔活动的即时通知。", ar: "تحديثات الرصيد الفورية وإشعارات فورية مع كل نشاط." },
  "about.pillar3.title": { en: "24/7 Support", es: "Soporte 24/7", fr: "Assistance 24/7", de: "24/7 Support", pt: "Suporte 24/7", zh: "全天候支持", ar: "دعم على مدار الساعة" },
  "about.pillar3.desc": { en: "Our team is always available to help via chat, email, or phone.", es: "Nuestro equipo siempre está disponible para ayudar por chat, correo o teléfono.", fr: "Notre équipe est toujours disponible pour vous aider par chat, e-mail ou téléphone.", de: "Unser Team ist immer per Chat, E-Mail oder Telefon erreichbar.", pt: "Nossa equipe está sempre disponível para ajudar via chat, e-mail ou telefone.", zh: "我们的团队随时通过聊天、邮件或电话为您提供帮助。", ar: "فريقنا متاح دائماً للمساعدة عبر الدردشة أو البريد أو الهاتف." },
  "about.mission.title": { en: "Mission", es: "Misión", fr: "Mission", de: "Mission", pt: "Missão", zh: "使命", ar: "الرسالة" },
  "about.mission.desc": { en: "To make secure, modern banking accessible to everyone and help our customers build a brighter financial future.", es: "Hacer que la banca segura y moderna sea accesible para todos y ayudar a nuestros clientes a construir un futuro financiero mejor.", fr: "Rendre la banque moderne et sécurisée accessible à tous et aider nos clients à bâtir un avenir financier radieux.", de: "Sichere, moderne Bankdienstleistungen für alle zugänglich zu machen und unseren Kunden eine bessere finanzielle Zukunft aufzubauen.", pt: "Tornar a banca segura e moderna acessível a todos e ajudar nossos clientes a construir um futuro financeiro melhor.", zh: "让安全、现代的银行服务惠及每一个人，助客户构建更光明的财务未来。", ar: "جعل الخدمات المصرفية الحديثة والآمنة متاحة للجميع ومساعدة عملائنا على بناء مستقبل مالي أفضل." },
  "about.vision.title": { en: "Vision", es: "Visión", fr: "Vision", de: "Vision", pt: "Visão", zh: "愿景", ar: "الرؤية" },
  "about.vision.desc": { en: "A world where everyone has a financial plan and contributes to a stronger, more inclusive global economy.", es: "Un mundo donde todos tengan un plan financiero y contribuyan a una economía global más fuerte e inclusiva.", fr: "Un monde où chacun a un plan financier et contribue à une économie mondiale plus forte et inclusive.", de: "Eine Welt, in der jeder einen Finanzplan hat und zu einer stärkeren, integrativeren globalen Wirtschaft beiträgt.", pt: "Um mundo onde todos tenham um plano financeiro e contribuam para uma economia global mais forte e inclusiva.", zh: "一个人人拥有财务规划、共建更具包容性的全球经济的世界。", ar: "عالم يعتمد فيه الجميع خطة مالية ويسهم في اقتصاد عالمي أقوى وأكثر شمولاً." },
  "about.what.title": { en: "What we do", es: "Qué hacemos", fr: "Ce que nous faisons", de: "Was wir tun", pt: "O que fazemos", zh: "我们的业务", ar: "ما نقوم به" },
  "about.what.desc": { en: "We are a modern financial institution helping people save, borrow, and grow their money with transparency and care.", es: "Somos una institución financiera moderna que ayuda a las personas a ahorrar, pedir prestado y hacer crecer su dinero con transparencia y cuidado.", fr: "Nous sommes une institution financière moderne qui aide les gens à épargner, emprunter et faire fructifier leur argent avec transparence et soin.", de: "Wir sind eine moderne Finanzinstitution, die Menschen dabei hilft, Geld transparent und sorgsam zu sparen, zu leihen und wachsen zu lassen.", pt: "Somos uma instituição financeira moderna que ajuda as pessoas a poupar, emprestar e fazer crescer seu dinheiro com transparência e cuidado.", zh: "我们是一家现代金融机构，以透明与用心帮助人们储蓄、借贷与增值。", ar: "نحن مؤسسة مالية حديثة تساعد الناس على الادخار والاقتراض وتنمية أموالهم بشفافية وعناية." },

  // ----- Why Bank -----
  "why.eyebrow": { en: "Why SpringWell" },
  "why.heading": { en: "Why Bank With SpringWell" },
  "why.quote": { en: "The world is a financial village. Understanding money is the key to financial freedom. Money is like a seed — when you plant it, it multiplies. That is why SpringWell was created: to help people understand money and plant seeds that yield fruit." },
  "why.quoteName": { en: "President of SpringWell Bank" },
  "why.convenient.title": { en: "Convenient banking" },
  "why.convenient.desc": { en: "At SpringWell Bank, there are so many ways to bank. You can bank online, in branch, and on the phone." },
  "why.hours.title": { en: "Longer branch hours" },
  "why.hours.desc": { en: "Open Sunday at over 310 locations to serve you better." },
  "why.hours.note": { en: "(Individual branch hours may vary)" },
  "why.security.title": { en: "Funds security has never been easier" },
  "why.security.desc": { en: "Since our inception, we have helped millions of people with international-standard banking services by providing cost-effective loans and funds security for the betterment of the global economy." },

  // ----- Offers -----
  "offers.eyebrow": { en: "Limited Time Offers" },
  "offers.heading": { en: "Exclusive offers for you" },

  // ----- Rates -----
  "rates.eyebrow": { en: "Rates & Offers", es: "Tasas y ofertas", fr: "Taux et offres", de: "Zinsen & Angebote", pt: "Taxas e ofertas", zh: "利率与优惠", ar: "الأسعار والعروض" },
  "rates.heading": { en: "Make your money work harder", es: "Haga que su dinero trabaje más", fr: "Faites travailler votre argent plus dur", de: "Lassen Sie Ihr Geld härter arbeiten", pt: "Faça seu dinheiro render mais", zh: "让您的钱更努力地增值", ar: "اجعل أموالك تعمل بجدية أكبر" },
  "rates.cd.title": { en: "Certificate of Deposit", es: "Certificado de depósito", fr: "Certificat de dépôt", de: "Einlagenzertifikat", pt: "Certificado de depósito", zh: "定期存款证", ar: "شهادة إيداع" },
  "rates.cd.desc": { en: "Make your money grow with our 14-month CD.", es: "Haga crecer su dinero con nuestro CD a 14 meses.", fr: "Faites fructifier votre argent avec notre CD de 14 mois.", de: "Lassen Sie Ihr Geld mit unserem 14-monatigen CD wachsen.", pt: "Faça seu dinheiro crescer com nosso CD de 14 meses.", zh: "使用我们的 14 个月定期存款让财富增值。", ar: "انمِ أموالك بشهادة إيداع لمدة 14 شهراً." },
  "rates.cd.cta": { en: "Open a CD", es: "Abrir un CD", fr: "Ouvrir un CD", de: "CD eröffnen", pt: "Abrir um CD", zh: "开立定存", ar: "افتح شهادة إيداع" },
  "rates.heloc.title": { en: "Home Equity Line", es: "Línea de equidad hipotecaria", fr: "Crédit sur valeur domiciliaire", de: "Hypothekenkreditlinie", pt: "Linha de equidade imobiliária", zh: "房屋净值信贷", ar: "خط عقاري للمنزل" },
  "rates.heloc.desc": { en: "Take advantage of a great equity rate!", es: "¡Aproveche una gran tasa de equidad!", fr: "Profitez d'un excellent taux de capital!", de: "Nutzen Sie einen großartigen Eigenkapitalsatz!", pt: "Aproveite uma ótima taxa de patrimônio!", zh: "把握优惠的净值利率！", ar: "استفد من سعر أسهم ممتاز!" },
  "rates.heloc.cta": { en: "Apply Online", es: "Solicitar en línea", fr: "Postuler en ligne", de: "Online beantragen", pt: "Pedir online", zh: "在线申请", ar: "التقدم عبر الإنترنت" },
  "rates.heloc.term": { en: "for first 6 months", es: "durante los primeros 6 meses", fr: "pendant les 6 premiers mois", de: "für die ersten 6 Monate", pt: "pelos primeiros 6 meses", zh: "前 6 个月", ar: "خلال أول 6 أشهر" },
  "rates.footnote": { en: "*Rates are illustrative and subject to change. SpringWell Bank is a demonstration project.", es: "*Las tasas son ilustrativas y están sujetas a cambios. SpringWell Bank es un proyecto de demostración.", fr: "*Les taux sont indicatifs et susceptibles de changer. SpringWell Bank est un projet de démonstration.", de: "*Zinsen sind illustrativ und können sich ändern. SpringWell Bank ist ein Demonstrationsprojekt.", pt: "*As taxas são ilustrativas e sujeitas a alterações. O SpringWell Bank é um projeto de demonstração.", zh: "*利率仅供参考，可能随时调整。SpringWell 银行为演示项目。", ar: "*الأسعار توضيحية وقابلة للتغيير. بنك SpringWell مشروع توضيحي." },

  // ----- CTA -----
  "cta.heading": { en: "Ready to Start Banking Smarter?", es: "¿Listo para un banco más inteligente?", fr: "Prêt à une banque plus intelligente ?", de: "Bereit, intelligenter zu bankieren?", pt: "Pronto para um banco mais inteligente?", zh: "准备好更聪明地管理银行事务了吗？", ar: "مستعد لبدء الخدمات المصرفية بشكل أذكى؟" },
  "cta.body": { en: "Join thousands of customers who trust SpringWell for their daily banking needs.", es: "Únase a miles de clientes que confían en SpringWell para sus necesidades bancarias diarias.", fr: "Rejoignez des milliers de clients qui font confiance à SpringWell pour leurs besoins bancaires quotidiens.", de: "Schließen Sie sich Tausenden von Kunden an, die SpringWell für ihren täglichen Bankbedarf vertrauen.", pt: "Junte-se a milhares de clientes que confiam no SpringWell para suas necessidades bancárias diárias.", zh: "加入数千名信赖 SpringWell 处理日常银行需求的客户。", ar: "انضم إلى آلاف العملاء الذين يثقون بـ SpringWell لاحتياجاتهم المصرفية اليومية." },
  "cta.button": { en: "Open Free Account", es: "Abrir cuenta gratis", fr: "Ouvrir un compte gratuit", de: "Kostenloses Konto eröffnen", pt: "Abrir conta grátis", zh: "免费开户", ar: "افتح حساباً مجانياً" },

  // ----- Contact -----
  "contact.eyebrow": { en: "Get in Touch", es: "Póngase en contacto", fr: "Contactez-nous", de: "Kontaktieren Sie uns", pt: "Fale conosco", zh: "联系我们", ar: "تواصل معنا" },
  "contact.heading": { en: "Contact Us", es: "Contáctenos", fr: "Contactez-nous", de: "Kontaktieren Sie uns", pt: "Fale conosco", zh: "联系我们", ar: "اتصل بنا" },
  "contact.email": { en: "Email", es: "Correo electrónico", fr: "E-mail", de: "E-Mail", pt: "E-mail", zh: "电子邮箱", ar: "البريد الإلكتروني" },
  "contact.phone": { en: "Phone", es: "Teléfono", fr: "Téléphone", de: "Telefon", pt: "Telefone", zh: "电话", ar: "الهاتف" },
  "contact.address": { en: "Address", es: "Dirección", fr: "Adresse", de: "Adresse", pt: "Endereço", zh: "地址", ar: "العنوان" },
  "contact.formTitle": { en: "Send a Message", es: "Envíe un mensaje", fr: "Envoyez un message", de: "Senden Sie eine Nachricht", pt: "Envie uma mensagem", zh: "发送消息", ar: "أرسل رسالة" },
  "contact.name": { en: "Name", es: "Nombre", fr: "Nom", de: "Name", pt: "Nome", zh: "姓名", ar: "الاسم" },
  "contact.subject": { en: "Subject", es: "Asunto", fr: "Sujet", de: "Betreff", pt: "Assunto", zh: "主题", ar: "الموضوع" },
  "contact.message": { en: "Message", es: "Mensaje", fr: "Message", de: "Nachricht", pt: "Mensagem", zh: "消息", ar: "الرسالة" },
  "contact.send": { en: "Send Message", es: "Enviar mensaje", fr: "Envoyer le message", de: "Nachricht senden", pt: "Enviar mensagem", zh: "发送消息", ar: "أرسل الرسالة" },
  "contact.success": { en: "Message sent successfully!", es: "¡Mensaje enviado con éxito!", fr: "Message envoyé avec succès !", de: "Nachricht erfolgreich gesendet!", pt: "Mensagem enviada com sucesso!", zh: "消息发送成功！", ar: "تم إرسال الرسالة بنجاح!" },
  "contact.error": { en: "Failed to send message. Please try again.", es: "No se pudo enviar el mensaje. Inténtelo de nuevo.", fr: "Échec de l'envoi du message. Veuillez réessayer.", de: "Nachricht konnte nicht gesendet werden. Bitte erneut versuchen.", pt: "Falha ao enviar mensagem. Tente novamente.", zh: "消息发送失败，请重试。", ar: "فشل إرسال الرسالة. حاول مرة أخرى." },
};

type LocaleCtxValue = { locale: Locale; setLocale: (l: Locale) => void };

const LocaleCtx = createContext<LocaleCtxValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    const saved = localStorage.getItem("locale") as Locale | null;
    if (saved && LOCALES.includes(saved)) setLocaleState(saved);
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = RTL_LOCALES.includes(locale) ? "rtl" : "ltr";
  }, [locale]);

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    localStorage.setItem("locale", l);
  };

  return <LocaleCtx.Provider value={{ locale, setLocale }}>{children}</LocaleCtx.Provider>;
}

export function useLocale(): LocaleCtxValue {
  const ctx = useContext(LocaleCtx);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
}

export function useT() {
  const { locale } = useLocale();
  return (key: string): string => translations[key]?.[locale] ?? translations[key]?.en ?? key;
}

export function T({ k, className }: { k: string; className?: string }) {
  const { locale } = useLocale();
  const value = translations[k]?.[locale] ?? translations[k]?.en ?? k;
  return <span className={className}>{value}</span>;
}
