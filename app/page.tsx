"use client";

import Image from "next/image";
import { type FormEvent, useEffect, useMemo, useRef, useState } from "react";

type Service = {
  id: number;
  name: string;
  description?: string | null;
  price?: string | null;
  imageUrl?: string | null;
  category?: string | null;
  isActive?: boolean;
};

type Category = {
  id: string;
  title: string;
  description: string;
  image: string;
};

/* =========================================================
   SERVICE CATEGORIES
========================================================= */

const categories: Category[] = [
  {
    id: "skin",
    title: "Skin Services",
    description:
      "Glow, care and skin treatments designed for your skin.",
    image:
      "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "hair",
    title: "Hair Services",
    description:
      "Professional styling, treatments and transformations.",
    image:
      "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "special",
    title: "Special Services",
    description:
      "Detailed beauty services for your special moments.",
    image:
      "/nailimage.png",
  },
  {
    id: "bridal",
    title: "Bride & Groom",
    description:
      "Makeup and beauty services for unforgettable occasions.",
    image:
      "/destinationwedding.jpg",
  },
];

/* =========================================================
   SERVICE FALLBACK DATA
========================================================= */

const initialCategoryServices: Record<string, string[]> = {
  skin: [
    "Facials",
    "Hydra facial",
    "Korean glass glow facial",
    "Organic facial",
    "Bridal glow facial",
    "Glow therapy",
    "Glutathione facial",
    "Pimple treatment",
    "Under eye treatment",
    "Waxing",
    "Theading",
    "Manicure",
    "Pedicure",
  ],

  hair: [
    "Hair cutting and styling",
    "Botox",
    "Nanoplastia",
    "Smoothening",
    "Keratin treatment",
    "Permanent blow dry",
    "Customised Botox",
    "Colouring",
    "Dandruff treatment",
    "Hair spa",
  ],

  special: [
    "Warts removal",
    "Ear lobe",
    "Nail extension & nail art",
    "Hair extension",
    "Microblading",
    "Tattooing",
    "Beauty spot",
  ],

  bridal: [
    "Airbrush makeup",
    "Skin Glass glow makeup",
    "HD makeup",
    "HD signature makeup",
    "Party makeup",
  ],
};

/* =========================================================
   TEMPORARY BRANCH DATA
========================================================= */

const branches = [
  {
    name: "Kottiyam – Dreams Mall",
    location: "Near Lulu, Kottiyam",
  },
  {
    name: "Kottiyam – Shimla",
    location: "Near Shimla, Kottiyam",
  },
  {
    name: "Nedumankavu",
    location: "Nedumankavu",
  },
];

export default function Home() {
  const [services, setServices] = useState<Service[]>([]);
  const [portfolioImages, setPortfolioImages] = useState<string[]>([]);
  const [portfolioVideos, setPortfolioVideos] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] =
    useState<string | null>(null);

  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingCategory, setBookingCategory] = useState<string | null>(null);
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [marqueeText, setMarqueeText] = useState("");
  const [marqueeVisible, setMarqueeVisible] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    name: "",
    phone: "",
    service: "",
    appointmentDate: "",
    appointmentTime: "",
    message: "",
  });

  const servicesListRef = useRef<HTMLDivElement>(null);

  const portfolioImagesRef = useRef<HTMLDivElement>(null);

  const portfolioMediaRef = useRef<HTMLDivElement>(null);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  /* =======================================================
     LOAD SERVICES
  ======================================================= */

  useEffect(() => {
    async function loadServices() {
      try {
        const response = await fetch("/api/services");

        if (!response.ok) {
          throw new Error("Failed to load services");
        }

        const data = await response.json();

        setServices(data);
      } catch (error) {
        console.error("Services loading error:", error);
      }
    }

    loadServices();
  }, []);
 
  useEffect(() => {
  async function loadMarquee() {
    try {
      const response = await fetch("/api/marquee", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to load marquee.");
      }

      const data = await response.json();

      if (!Array.isArray(data) || data.length === 0) {
        setMarqueeVisible(false);
        return;
      }

      const activeMarquee = data[0];

      if (
        activeMarquee?.isActive &&
        activeMarquee?.text
      ) {
        setMarqueeText(String(activeMarquee.text));
        setMarqueeVisible(true);
      } else {
        setMarqueeVisible(false);
      }
    } catch (error) {
      console.error("Marquee loading error:", error);
      setMarqueeVisible(false);
    }
  }

  loadMarquee();
}, []);
  /* =======================================================
     LOAD PORTFOLIO
  ======================================================= */

  useEffect(() => {
    async function loadPortfolio() {
      try {
        const response = await fetch("/api/portfolio", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to load portfolio.");
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
          return;
        }

        const images = data
          .filter(
            (item) =>
              item.type === "IMAGE" &&
              item.isActive !== false
          )
          .sort(
            (a, b) =>
              Number(a.sortOrder) -
              Number(b.sortOrder)
          )
          .map((item) => String(item.url));

        const videos = data
          .filter(
            (item) =>
              item.type === "VIDEO" &&
              item.isActive !== false
          )
          .sort(
            (a, b) =>
              Number(a.sortOrder) -
              Number(b.sortOrder)
          )
          .map((item) => String(item.url));

        setPortfolioImages(images);
        setPortfolioVideos(videos);
      } catch (error) {
        console.error("Portfolio loading error:", error);
      }
    }

    loadPortfolio();
  }, []);

  /* =======================================================
     SELECTED CATEGORY
  ======================================================= */

  const selectedCategoryData = categories.find(
    (category) => category.id === selectedCategory
  );

  /* =======================================================
     SELECTED SERVICES
  ======================================================= */

  const selectedServices = useMemo(() => {
  if (!selectedCategoryData) {
    return [];
  }

  const databaseServices = services.filter((service) => {
    if (service.isActive === false) {
      return false;
    }

    const serviceCategory = String(service.category ?? "")
      .trim()
      .toLowerCase();

    const selectedId = selectedCategoryData.id
      .trim()
      .toLowerCase();

    const selectedTitle = selectedCategoryData.title
      .trim()
      .toLowerCase();

    return (
      serviceCategory === selectedId ||
      serviceCategory === selectedTitle
    );
  });

  const fallbackNames =
    initialCategoryServices[selectedCategoryData.id] || [];

  const fallbackServices = fallbackNames.map((name, index) => ({
    id: -(index + 1),
    name,
    description: null,
    price: null,
    imageUrl: null,
    category: selectedCategoryData.id,
    isActive: true,
  }));

  return [...fallbackServices, ...databaseServices];
}, [services, selectedCategoryData]);

  /* =======================================================
     CATEGORY-WISE SERVICES FOR APPOINTMENT
  ======================================================= */

  const servicesByCategory = useMemo(() => {
    return categories.map((category) => {
      const databaseServices = services.filter(
        (service) =>
          (service.category === category.id ||
            service.category === category.title) &&
          service.isActive !== false
      );

      if (databaseServices.length > 0) {
        return {
          ...category,
          services: databaseServices,
        };
      }

      const fallbackNames = initialCategoryServices[category.id] || [];

      return {
        ...category,
        services: fallbackNames.map((name, index) => ({
          id: Number(`${categories.indexOf(category) + 1}${index + 1}`),
          name,
          description: null,
          price: null,
          imageUrl: null,
          category: category.id,
          isActive: true,
        })),
      };
    });
  }, [services]);

  /* =======================================================
     OPEN APPOINTMENT FORM
  ======================================================= */

  const openBookingForm = (serviceName = "") => {
    const matchingCategory = servicesByCategory.find((category) =>
      category.services.some((service) => service.name === serviceName)
    );

    setBookingCategory(matchingCategory?.id || null);
    setBookingForm((current) => ({
      ...current,
      service: serviceName,
    }));
    setBookingSuccess(false);
    setShowBookingForm(true);
  };

  /* =======================================================
     SUBMIT APPOINTMENT
  ======================================================= */

  const handleBookingSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBookingSubmitting(true);
    setBookingSuccess(false);

    try {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingForm),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit appointment.");
      }

      setBookingSuccess(true);
      setBookingForm({
        name: "",
        phone: "",
        service: "",
        appointmentDate: "",
        appointmentTime: "",
        message: "",
      });
    } catch (error) {
      console.error("Appointment submission error:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setBookingSubmitting(false);
    }
  };

  /* =======================================================
     SCROLL TO SERVICES AFTER CLICK
  ======================================================= */

  useEffect(() => {
    if (!selectedCategory) {
      return;
    }

    const timer = setTimeout(() => {
      servicesListRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 150);

    return () => clearTimeout(timer);
  }, [selectedCategory]);

  /* =======================================================
     PORTFOLIO IMAGE SCROLL
  ======================================================= */

  const scrollPortfolioImages = (direction: "left" | "right") => {
    portfolioImagesRef.current?.scrollBy({
      left: direction === "right" ? 380 : -380,
      behavior: "smooth",
    });
  };

  /* =======================================================
     PORTFOLIO MEDIA SCROLL
  ======================================================= */

  const scrollPortfolioMedia = (direction: "left" | "right") => {
    portfolioMediaRef.current?.scrollBy({
      left: direction === "right" ? 380 : -380,
      behavior: "smooth",
    });
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">

      {/* ===================================================
          BACKGROUND PARTICLES
      =================================================== */}

      <div
        className="particle-layer"
        aria-hidden="true"
      >
        {Array.from({ length: 10 }).map((_, index) => (
          <span
            key={index}
            className="particle"
          />
        ))}
      </div>

      {/* ===================================================
    NAVBAR
=================================================== */}

<header className="fixed left-0 right-0 top-0 z-50 border-b border-white/10 bg-black/90 backdrop-blur-xl">

  <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-3 sm:px-8 lg:px-10">

    {/* LOGO */}

    <a
      href="#home"
      onClick={() => setMobileMenuOpen(false)}
      className="flex min-w-0 items-center gap-2 sm:gap-3"
    >

      <Image
        src="/logo.jpg"
        alt="Meenakshi Bridal Studio"
        width={70}
        height={70}
        className="h-12 w-12 rounded-full object-contain"
        priority
      />

      <div className="block min-w-0">

        <p className="brand-font text-sm sm:text-xl">
          MEENAKSHI
        </p>

        <p className="text-[7px] tracking-[0.14em] text-[#9c810c] sm:text-[9px] sm:tracking-[0.18em]">
          BRIDAL STUDIO & FAMILY SALON
        </p>

      </div>

    </a>

    {/* DESKTOP NAVIGATION */}

    <nav className="hidden items-center gap-7 md:flex">

      <a
        href="#home"
        className="text-xs text-zinc-400 transition hover:text-[#9c810c]"
      >
        Home
      </a>

      <a
        href="#services"
        className="text-xs text-zinc-400 transition hover:text-[#9c810c]"
      >
        Services
      </a>

      <a
        href="#portfolio"
        className="text-xs text-zinc-400 transition hover:text-[#9c810c]"
      >
        Portfolio
      </a>

      <a
        href="#appointment"
        className="text-xs text-zinc-400 transition hover:text-[#9c810c]"
      >
        Appointment
      </a>

      <a
        href="#about"
        className="text-xs text-zinc-400 transition hover:text-[#9c810c]"
      >
        About
      </a>

      <a
        href="#contact"
        className="text-xs text-zinc-400 transition hover:text-[#9c810c]"
      >
        Contact
      </a>

    </nav>

    {/* RIGHT SIDE */}

    <div className="flex items-center gap-2">

      {/* BOOK NOW */}

      <button
        type="button"
        onClick={() => {
          setMobileMenuOpen(false);
          openBookingForm();
        }}
        className="touch-manipulation rounded-full border border-[#9c810c] px-3 py-2 text-[10px] font-semibold tracking-wider text-[#9c810c] transition duration-200 hover:bg-[#9c810c] hover:text-black active:scale-95 active:bg-[#9c810c] active:text-black active:shadow-[0_0_20px_rgba(156,129,12,0.45)] sm:px-4 sm:text-xs"
      >
        BOOK NOW
      </button>

      {/* MOBILE MENU BUTTON */}

      <button
        type="button"
        onClick={() => setMobileMenuOpen((open) => !open)}
        aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
        aria-expanded={mobileMenuOpen}
        className="touch-manipulation flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white transition duration-200 hover:border-[#9c810c] hover:text-[#9c810c] active:scale-90 active:border-[#9c810c] active:text-[#9c810c] active:shadow-[0_0_20px_rgba(156,129,12,0.35)] md:hidden"
      >
        {mobileMenuOpen ? (
          <span className="text-xl leading-none">×</span>
        ) : (
          <span className="text-xl leading-none">☰</span>
        )}
      </button>

    </div>

  </div>

  {/* MOBILE MENU */}

  {mobileMenuOpen && (
    <div className="border-t border-white/10 bg-black/95 px-5 py-5 backdrop-blur-xl md:hidden">

      <nav className="flex flex-col">

        <a
          href="#home"
          onClick={() => setMobileMenuOpen(false)}
          className="border-b border-white/10 py-4 text-sm text-zinc-300 transition hover:text-[#9c810c]"
        >
          Home
        </a>

        <a
          href="#services"
          onClick={() => setMobileMenuOpen(false)}
          className="border-b border-white/10 py-4 text-sm text-zinc-300 transition hover:text-[#9c810c]"
        >
          Services
        </a>

        <a
          href="#portfolio"
          onClick={() => setMobileMenuOpen(false)}
          className="border-b border-white/10 py-4 text-sm text-zinc-300 transition hover:text-[#9c810c]"
        >
          Portfolio
        </a>

        <a
          href="#appointment"
          onClick={() => setMobileMenuOpen(false)}
          className="border-b border-white/10 py-4 text-sm text-zinc-300 transition hover:text-[#9c810c]"
        >
          Appointment
        </a>

        <a
          href="#about"
          onClick={() => setMobileMenuOpen(false)}
          className="border-b border-white/10 py-4 text-sm text-zinc-300 transition hover:text-[#9c810c]"
        >
          About
        </a>

        <a
          href="#contact"
          onClick={() => setMobileMenuOpen(false)}
          className="py-4 text-sm text-zinc-300 transition hover:text-[#9c810c]"
        >
          Contact
        </a>

      </nav>

    </div>
  )}

</header>
      {/* ===================================================
    MARQUEE
=================================================== */}

{/* ===================================================
    MARQUEE
=================================================== */}

{marqueeVisible && marqueeText && (
  <div className="marquee-wrapper mt-20">
    <div className="marquee-track">
      {Array.from({ length: 8 }).map((_, index) => (
        <div
          className="marquee-group"
          key={index}
          aria-hidden={index >= 4}
        >
          <span className="marquee-item">{marqueeText}</span>
          <span className="marquee-dot">•</span>
        </div>
      ))}
    </div>
  </div>
)}
      
{/* ===================================================
    HERO
=================================================== */}
      <section
        id="home"
        className="relative flex min-h-screen items-center overflow-hidden px-6 pt-32"
      >

        <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#9c810c]/10" />

        <div className="hero-circle absolute left-1/2 top-1/2 h-[430px] w-[430px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#9c810c]/20" />

        <div className="hero-glow absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#9c810c]/10 blur-[100px]" />

        <div className="relative z-10 mx-auto max-w-6xl text-center">

          <p className="hero-fade text-xs font-semibold tracking-[0.45em] text-[#9c810c] sm:text-sm">
            MEENAKSHI BRIDAL STUDIO
          </p>

          <h1 className="hero-fade-delay-1 mt-6 heading-font text-5xl font-normal leading-[0.95] tracking-tight sm:text-7xl lg:text-8xl">

            Beauty

            <br />

            <span className="font-semibold text-[#9c810c]">
              Beyond Beauty.
            </span>

          </h1>

          <p className="hero-fade-delay-2 mx-auto mt-8 max-w-2xl text-sm leading-7 text-zinc-400 sm:text-base">
            Bridal artistry, professional beauty care and premium salon
            services designed to bring out your confidence.
          </p>

          <div className="hero-fade-delay-3 mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">

            <button
              type="button"
              onClick={() => openBookingForm()}
              className="touch-manipulation rounded-full bg-[#9c810c] px-8 py-4 text-sm font-bold tracking-wider text-black transition duration-200 hover:scale-105 hover:bg-white active:scale-95 active:bg-white active:shadow-[0_0_30px_rgba(156,129,12,0.55)]"
            >
              BOOK APPOINTMENT
            </button>

            <a
              href="#services"
              className="touch-manipulation rounded-full border border-white/20 px-8 py-4 text-sm font-semibold tracking-wider text-white transition duration-200 hover:border-[#9c810c] hover:text-[#9c810c] active:scale-95 active:border-[#9c810c] active:text-[#9c810c] active:shadow-[0_0_25px_rgba(156,129,12,0.35)]"
            >
              VIEW SERVICES
            </a>

            <a
              href="#portfolio"
              className="touch-manipulation rounded-full border border-white/20 px-8 py-4 text-sm font-semibold tracking-wider text-white transition duration-200 hover:border-[#9c810c] hover:text-[#9c810c] active:scale-95 active:border-[#9c810c] active:text-[#9c810c] active:shadow-[0_0_25px_rgba(156,129,12,0.35)]"
            >
              VIEW PORTFOLIO
            </a>

          </div>

        </div>

      </section>

      {/* ===================================================
          SERVICES
      =================================================== */}

      <section
        id="services"
        className="scroll-mt-28 border-t border-white/10 px-6 py-28 sm:px-10 lg:px-16"
      >

        <div className="mx-auto max-w-7xl">

          {/* SECTION HEADING */}

          <div className="max-w-4xl">

            <p className="heading-font text-4xl font-semibold tracking-wide text-[#9c810c] sm:text-5xl">
              OUR SERVICES
            </p>

            <h2 className="heading-font mt-3 text-2xl font-normal tracking-wide text-white sm:text-3xl">
              Beauty, care & transformation.
            </h2>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-400 sm:text-base">
              Explore our professional beauty, hair, skin and bridal services.
              Choose a category to discover everything available.
            </p>

          </div>

          {/* CATEGORY CARDS */}

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">

            {categories.map((category, index) => {

              const isSelected =
                selectedCategory === category.id;

              return (

                <button
                  key={category.id}
                  onClick={() =>
                    setSelectedCategory(
                      isSelected ? null : category.id
                    )
                  }
                  className={`group touch-manipulation relative overflow-hidden rounded-3xl border text-left transition-all duration-300 active:scale-[0.98] active:shadow-[0_0_30px_rgba(156,129,12,0.25)] ${
                    isSelected
                      ? "border-[#9c810c] shadow-[0_0_50px_rgba(156,129,12,0.18)]"
                      : "border-white/10 hover:-translate-y-2 hover:border-[#9c810c]/60"
                  }`}
                >

                  <div className="relative h-[360px] overflow-hidden">

                    <Image
                      src={category.image}
                      alt={category.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover transition duration-1000 group-hover:scale-110"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

                    <div className="absolute bottom-0 left-0 right-0 p-7">

                      <p className="text-xs tracking-[0.3em] text-[#9c810c]">
                        {String(index + 1).padStart(2, "0")}
                      </p>

                      <h3 className="heading-font mt-2 text-2xl font-semibold">
                        {category.title}
                      </h3>

                      <p className="mt-3 text-sm leading-6 text-zinc-300">
                        {category.description}
                      </p>

                    </div>

                  </div>

                </button>

              );

            })}

          </div>

          {/* SELECTED SERVICES */}

          {selectedCategoryData && (

            <div
              ref={servicesListRef}
              className="mt-12 scroll-mt-32 rounded-3xl border border-[#9c810c]/30 bg-[#080808] p-6 sm:p-10"
            >

              <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">

                <div>

                  <p className="text-xs tracking-[0.3em] text-[#9c810c]">
                    SELECTED CATEGORY
                  </p>

                  <h3 className="heading-font mt-3 text-3xl font-normal sm:text-4xl">
                    {selectedCategoryData.title}
                  </h3>

                </div>

                <button
                  onClick={() => setSelectedCategory(null)}
                  className="text-sm text-zinc-400 transition hover:text-[#9c810c]"
                >
                  Close ×
                </button>

              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">

                {selectedServices.map((service) => (

                  <div
                    key={service.id}
                    className="group rounded-2xl border border-white/10 bg-black p-5 transition duration-500 hover:-translate-y-1 hover:border-[#9c810c]/50"
                  >

                    <div className="flex items-start justify-between gap-4">

                      <div className="flex min-w-0 items-start gap-4">

                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#9c810c]/10 text-xs text-[#9c810c]">
                          ✓
                        </span>

                        <div className="min-w-0">

                          <h4 className="font-medium text-white">
                            {service.name}
                          </h4>

                          {service.description && (
                            <p className="mt-2 text-xs leading-5 text-zinc-500">
                              {service.description}
                            </p>
                          )}

                          {service.price && (
                            <p className="mt-3 text-sm font-semibold text-[#9c810c]">
                              ₹{service.price}
                            </p>
                          )}

                        </div>

                      </div>

                      <button
                        type="button"
                        onClick={() => openBookingForm(service.name)}
                        aria-label={`Book appointment for ${service.name}`}
                        title={`Book ${service.name}`}
                        className="touch-manipulation flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#9c810c]/50 bg-[#9c810c]/10 text-[#9c810c] transition duration-200 hover:bg-[#9c810c] hover:text-black active:scale-90 active:bg-[#9c810c] active:text-black active:shadow-[0_0_20px_rgba(156,129,12,0.45)]"
                      >
                        <span className="text-base">📅</span>
                      </button>

                    </div>

                  </div>

                ))}

              </div>

            </div>

          )}

        </div>

      </section>

      {/* ===================================================
          PORTFOLIO
      =================================================== */}

      <section
        id="portfolio"
        className="scroll-mt-28 border-t border-white/10 bg-[#050505] px-6 py-28 sm:px-10 lg:px-16"
      >

        <div className="mx-auto max-w-7xl">

          {/* =================================================
              PORTFOLIO HEADING
          ================================================= */}

          <div className="max-w-4xl">

            <p className="heading-font text-4xl font-semibold tracking-wide text-[#9c810c] sm:text-5xl">
              OUR PORTFOLIO
            </p>

            <h2 className="heading-font mt-3 text-2xl font-normal tracking-wide text-white sm:text-3xl">
              Our work, your inspiration.
            </h2>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-400 sm:text-base">
              Explore our latest bridal looks, makeup transformations,
              hairstyles and beauty work.
            </p>

          </div>

          {/* =================================================
              PORTFOLIO IMAGES
          ================================================= */}

          <div className="mt-14">

            {/* IMAGE HEADER */}

            <div className="flex items-center justify-between">

              <div>

                <p className="text-xs font-semibold tracking-[0.35em] text-[#9c810c]">
                  PORTFOLIO IMAGES
                </p>

                <p className="mt-2 text-sm text-zinc-500">
                  Swipe or use the arrows to explore.
                </p>

              </div>

              {/* IMAGE ARROWS */}

              <div className="flex gap-2">

                <button
                  type="button"
                  onClick={() =>
                    scrollPortfolioImages("left")
                  }
                  aria-label="Previous portfolio image"
                  className="touch-manipulation flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-lg text-white transition duration-200 hover:border-[#9c810c] hover:bg-[#9c810c] hover:text-black active:scale-90 active:border-[#9c810c] active:bg-[#9c810c] active:text-black active:shadow-[0_0_20px_rgba(156,129,12,0.4)]"
                >
                  ←
                </button>

                <button
                  type="button"
                  onClick={() =>
                    scrollPortfolioImages("right")
                  }
                  aria-label="Next portfolio image"
                  className="touch-manipulation flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-lg text-white transition duration-200 hover:border-[#9c810c] hover:bg-[#9c810c] hover:text-black active:scale-90 active:border-[#9c810c] active:bg-[#9c810c] active:text-black active:shadow-[0_0_20px_rgba(156,129,12,0.4)]"
                >
                  →
                </button>

              </div>

            </div>

            {/* IMAGE CAROUSEL */}

            <div
              ref={portfolioImagesRef}
              className="mt-7 flex gap-5 overflow-x-auto scroll-smooth pb-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >

              {portfolioImages.map((image, index) => (

                <div
                  key={image}
                  className="group relative h-[400px] w-[280px] shrink-0 overflow-hidden rounded-3xl border border-white/10 bg-black sm:h-[460px] sm:w-[320px]"
                >

                  <Image
                    src={image}
                    alt={`Meenakshi portfolio image ${index + 1}`}
                    fill
                    sizes="320px"
                    className="object-cover transition duration-700 group-hover:scale-105"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                  <div className="absolute bottom-5 left-5">

                    <span className="rounded-full border border-[#9c810c]/50 bg-black/70 px-3 py-1 text-[10px] tracking-[0.2em] text-[#9c810c] backdrop-blur-md">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                  </div>

                </div>

              ))}

            </div>

            <div className="mt-2 text-center text-[10px] tracking-[0.3em] text-zinc-700">
              ← SWIPE TO EXPLORE →
            </div>

          </div>

          {/* =================================================
              PORTFOLIO MEDIA
          ================================================= */}

          <div className="mt-24">

            {/* MEDIA HEADER */}

            <div className="flex items-center justify-between">

              <div>

                <p className="text-xs font-semibold tracking-[0.35em] text-[#9c810c]">
                  PORTFOLIO MEDIA
                </p>

                <h3 className="heading-font mt-3 text-2xl font-normal text-white sm:text-3xl">
                  Watch our work in motion.
                </h3>

                <p className="mt-2 text-sm text-zinc-500">
                  Videos and other media from Meenakshi.
                </p>

              </div>

              {/* MEDIA ARROWS */}

              <div className="flex gap-2">

                <button
                  type="button"
                  onClick={() =>
                    scrollPortfolioMedia("left")
                  }
                  aria-label="Previous portfolio media"
                  className="touch-manipulation flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-lg text-white transition duration-200 hover:border-[#9c810c] hover:bg-[#9c810c] hover:text-black active:scale-90 active:border-[#9c810c] active:bg-[#9c810c] active:text-black active:shadow-[0_0_20px_rgba(156,129,12,0.4)]"
                >
                  ←
                </button>

                <button
                  type="button"
                  onClick={() =>
                    scrollPortfolioMedia("right")
                  }
                  aria-label="Next portfolio media"
                  className="touch-manipulation flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-lg text-white transition duration-200 hover:border-[#9c810c] hover:bg-[#9c810c] hover:text-black active:scale-90 active:border-[#9c810c] active:bg-[#9c810c] active:text-black active:shadow-[0_0_20px_rgba(156,129,12,0.4)]"
                >
                  →
                </button>

              </div>

            </div>

            {/* MEDIA CAROUSEL */}

            <div
              ref={portfolioMediaRef}
              className="mt-7 flex gap-5 overflow-x-auto scroll-smooth pb-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >

              {portfolioVideos.map((video, index) => (

                <div
                  key={video}
                  className="group relative h-[460px] w-[300px] shrink-0 overflow-hidden rounded-3xl border border-white/10 bg-black sm:h-[520px] sm:w-[340px]"
                >

                  <video
                    src={video}
                    controls
                    preload="metadata"
                    playsInline
                    className="h-full w-full object-cover"
                  />

                  <div className="pointer-events-none absolute left-5 top-5">

                    <span className="rounded-full border border-[#9c810c]/50 bg-black/75 px-3 py-1 text-[10px] tracking-[0.2em] text-[#9c810c] backdrop-blur-md">
                      VIDEO {String(index + 1).padStart(2, "0")}
                    </span>

                  </div>

                </div>

              ))}

            </div>

            <div className="mt-2 text-center text-[10px] tracking-[0.3em] text-zinc-700">
              ← SWIPE TO EXPLORE →
            </div>

          </div>

        </div>

      </section>

      {/* ===================================================
          APPOINTMENT
      =================================================== */}

      <section
        id="appointment"
        className="scroll-mt-28 border-t border-white/10 px-6 py-28 sm:px-10 lg:px-16"
      >

        <div className="mx-auto max-w-7xl">

          <p className="heading-font text-4xl font-semibold tracking-wide text-[#9c810c] sm:text-5xl">
            APPOINTMENT
          </p>

          <h2 className="heading-font mt-3 text-2xl font-normal tracking-wide text-white sm:text-3xl">
            Your beauty starts here.
          </h2>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-400 sm:text-base">
            Reserve your appointment with Meenakshi Bridal Studio & Family
            Salon.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">

            <button
              type="button"
              onClick={() => openBookingForm()}
              className="touch-manipulation rounded-full bg-[#9c810c] px-8 py-4 text-center text-sm font-bold tracking-wider text-black transition duration-200 hover:bg-white active:scale-95 active:bg-white active:shadow-[0_0_30px_rgba(156,129,12,0.55)]"
            >
              BOOK THROUGH WEBSITE
            </button>

            <a
              href="https://wa.me/919995013301"
              target="_blank"
              rel="noreferrer"
              className="touch-manipulation rounded-full border border-[#9c810c]/60 px-8 py-4 text-center text-sm font-semibold tracking-wider text-[#9c810c] transition duration-200 hover:bg-[#9c810c] hover:text-black active:scale-95 active:bg-[#9c810c] active:text-black active:shadow-[0_0_25px_rgba(156,129,12,0.45)]"
            >
              BOOK ON WHATSAPP
            </a>

            <a
              href="#contact"
              className="touch-manipulation rounded-full border border-white/15 px-8 py-4 text-center text-sm font-semibold tracking-wider transition duration-200 hover:border-[#9c810c] hover:text-[#9c810c] active:scale-95 active:border-[#9c810c] active:text-[#9c810c] active:shadow-[0_0_25px_rgba(156,129,12,0.35)]"
            >
              CONTACT US
            </a>

          </div>

        </div>

      </section>

      {/* ===================================================
          ABOUT
      =================================================== */}

      <section
        id="about"
        className="scroll-mt-28 border-t border-white/10 bg-[#080808] px-6 py-28 sm:px-10 lg:px-16"
      >

        <div className="mx-auto max-w-7xl">

          {/* ABOUT HEADING */}

          <div className="mb-14">

            <p className="heading-font text-4xl font-semibold tracking-wide text-[#9c810c] sm:text-5xl">
              ABOUT MEENAKSHI
            </p>

            <h2 className="heading-font mt-3 text-2xl font-normal tracking-wide text-white sm:text-3xl">
              Beauty, confidence & care.
            </h2>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-400 sm:text-base">
              A professional beauty destination for bridal artistry,
              hair care, skin treatments and everyday salon services.
            </p>

          </div>

          {/* ABOUT CONTENT */}

          <div className="grid items-center gap-14 lg:grid-cols-2">

            {/* PHOTO */}

            <div className="relative">

              <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-white/10">

                <Image
                  src="https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80"
                  alt="Meenakshi Studio"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                <div className="absolute bottom-7 left-7">

                  <p className="text-xs tracking-[0.3em] text-[#9c810c]">
                    MEENAKSHI
                  </p>

                  <p className="heading-font mt-2 text-xl">
                    Bridal Studio & Family Salon
                  </p>

                </div>

              </div>

            </div>

            {/* ABOUT TEXT */}

            <div>

              <p className="text-sm leading-8 text-zinc-400 sm:text-base">
                Meenakshi Bridal Studio & Family Salon brings together
                professional beauty care, hair styling, skin treatments and
                bridal artistry in one place.
              </p>

              <p className="mt-5 text-sm leading-8 text-zinc-400 sm:text-base">
                From everyday beauty treatments to important bridal moments,
                our aim is to help every client feel confident, comfortable
                and beautiful.
              </p>

            </div>

          </div>

          {/* BRANCHES */}

          <div className="mt-28">

            <p className="heading-font text-4xl font-semibold tracking-wide text-[#9c810c] sm:text-5xl">
              OUR BRANCHES
            </p>

            <h3 className="heading-font mt-3 text-2xl font-normal sm:text-3xl">
              Find us near you.
            </h3>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-400 sm:text-base">
              Visit any of our branches for professional beauty and salon
              services.
            </p>

            <div className="mt-10 grid gap-5 md:grid-cols-3">

              {branches.map((branch, index) => (

                <div
                  key={branch.name}
                  className="group rounded-3xl border border-white/10 bg-black p-7 transition duration-500 hover:-translate-y-2 hover:border-[#9c810c]/60"
                >

                  <span className="text-xs font-semibold tracking-[0.3em] text-[#9c810c]">
                    0{index + 1}
                  </span>

                  <h4 className="heading-font mt-8 text-2xl font-normal">
                    {branch.name}
                  </h4>

                  <p className="mt-3 text-sm leading-6 text-zinc-500">
                    {branch.location}
                  </p>

                  <div className="mt-8 h-px w-12 bg-[#9c810c] transition-all duration-500 group-hover:w-full" />

                </div>

              ))}

            </div>

          </div>

        </div>

      </section>

      {/* ===================================================
          CONTACT
      =================================================== */}

      <section
        id="contact"
        className="scroll-mt-28 border-t border-white/10 px-6 py-28 sm:px-10 lg:px-16"
      >

        <div className="mx-auto max-w-7xl">

          <p className="heading-font text-4xl font-semibold tracking-wide text-[#9c810c] sm:text-5xl">
            CONTACT
          </p>

          <h2 className="heading-font mt-3 text-2xl font-normal tracking-wide text-white sm:text-3xl">
            Let&apos;s create something beautiful.
          </h2>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-400 sm:text-base">
            Have a question or want to book an appointment? Get in touch with
            our team.
          </p>

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

            {/* PHONE */}

            <a
              href="tel:+919995013301"
              className="rounded-3xl border border-white/10 bg-[#080808] p-7 transition hover:border-[#9c810c]/60"
            >

              <p className="text-xs tracking-[0.3em] text-[#9c810c]">
                PHONE
              </p>

              <p className="mt-5 text-lg font-medium">
                +91 99950 13301
              </p>

            </a>

            {/* WHATSAPP */}

            <a
              href="https://wa.me/919995013301"
              target="_blank"
              rel="noreferrer"
              className="rounded-3xl border border-white/10 bg-[#080808] p-7 transition hover:border-[#9c810c]/60"
            >

              <p className="text-xs tracking-[0.3em] text-[#9c810c]">
                WHATSAPP
              </p>

              <p className="mt-5 text-lg font-medium">
                Chat with us
              </p>

            </a>

            {/* LOCATION */}

            <div className="rounded-3xl border border-white/10 bg-[#080808] p-7">

              <p className="text-xs tracking-[0.3em] text-[#9c810c]">
                LOCATION
              </p>

              <p className="mt-5 text-lg font-medium">
                Kottiyam, Kerala
              </p>

            </div>

          </div>

        </div>

      </section>

      {/* ===================================================
          BOOKING MODAL
      =================================================== */}

      {showBookingForm && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowBookingForm(false);
            }
          }}
        >
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-[#9c810c]/40 bg-[#080808] p-6 shadow-2xl sm:p-8">

            <button
              type="button"
              onClick={() => setShowBookingForm(false)}
              aria-label="Close booking form"
              className="touch-manipulation absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-xl text-white transition duration-200 hover:border-[#9c810c] hover:text-[#9c810c] active:scale-90 active:border-[#9c810c] active:text-[#9c810c] active:shadow-[0_0_20px_rgba(156,129,12,0.35)]"
            >
              ×
            </button>

            <div className="mb-7 pr-12">
              <p className="mb-2 text-xs font-semibold tracking-[0.3em] text-[#9c810c]">
                MEENAKSHI BRIDAL STUDIO
              </p>

              <h3 className="heading-font text-3xl text-[#9c810c] sm:text-4xl">
                Book Your Appointment
              </h3>

              <p className="mt-2 text-sm leading-6 text-zinc-400">
                Choose your service and preferred date and time. Our team will
                contact you to confirm your appointment.
              </p>
            </div>

            {bookingSuccess ? (
              <div className="rounded-2xl border border-[#9c810c]/30 bg-[#9c810c]/10 p-8 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#9c810c] text-2xl font-bold text-black">
                  ✓
                </div>

                <h4 className="heading-font text-2xl text-white">
                  Appointment Request Sent
                </h4>

                <p className="mt-3 text-sm leading-6 text-zinc-400">
                  Your appointment request has been received. Our team will
                  contact you to confirm the booking.
                </p>

                <button
                  type="button"
                  onClick={() => setShowBookingForm(false)}
                  className="touch-manipulation mt-6 rounded-full bg-[#9c810c] px-7 py-3 font-semibold text-black transition duration-200 hover:bg-white active:scale-95 active:bg-white active:shadow-[0_0_25px_rgba(156,129,12,0.45)]"
                >
                  CLOSE
                </button>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="space-y-5">

                <div>
                  <label className="mb-2 block text-sm font-medium text-white">
                    Name <span className="text-[#9c810c]">*</span>
                  </label>

                  <input
                    type="text"
                    required
                    value={bookingForm.name}
                    onChange={(event) =>
                      setBookingForm({
                        ...bookingForm,
                        name: event.target.value,
                      })
                    }
                    placeholder="Enter your name"
                    className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-[#9c810c]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-white">
                    Phone Number <span className="text-[#9c810c]">*</span>
                  </label>

                  <input
                    type="tel"
                    required
                    value={bookingForm.phone}
                    onChange={(event) =>
                      setBookingForm({
                        ...bookingForm,
                        phone: event.target.value,
                      })
                    }
                    placeholder="Enter your phone number"
                    className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-[#9c810c]"
                  />
                </div>

                <div>
                  <label className="mb-3 block text-sm font-medium text-white">
                    Choose Category <span className="text-[#9c810c]">*</span>
                  </label>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {servicesByCategory.map((category) => (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => {
                          setBookingCategory(category.id);
                          setBookingForm({
                            ...bookingForm,
                            service: "",
                          });
                        }}
                        className={`touch-manipulation rounded-2xl border px-4 py-4 text-left transition duration-200 active:scale-[0.98] active:shadow-[0_0_20px_rgba(156,129,12,0.25)] ${
                          bookingCategory === category.id
                            ? "border-[#9c810c] bg-[#9c810c]/10 text-[#9c810c]"
                            : "border-white/10 bg-black text-zinc-300 hover:border-[#9c810c]/50"
                        }`}
                      >
                        <p className="text-sm font-semibold">
                          {category.title}
                        </p>
                        <p className="mt-1 text-xs text-zinc-500">
                          {category.services.length} services available
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {bookingCategory && (
                  <div>
                    <label className="mb-2 block text-sm font-medium text-white">
                      Select Service <span className="text-[#9c810c]">*</span>
                    </label>

                    <select
                      required
                      value={bookingForm.service}
                      onChange={(event) =>
                        setBookingForm({
                          ...bookingForm,
                          service: event.target.value,
                        })
                      }
                      className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none transition focus:border-[#9c810c]"
                    >
                      <option value="">Select a service</option>

                      {servicesByCategory
                        .find((category) => category.id === bookingCategory)
                        ?.services.map((service) => (
                          <option
                            key={`${bookingCategory}-${service.id}-${service.name}`}
                            value={service.name}
                          >
                            {service.name}
                          </option>
                        ))}
                    </select>
                  </div>
                )}

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-white">
                      Preferred Date <span className="text-[#9c810c]">*</span>
                    </label>

                    <input
                      type="date"
                      required
                      min={new Date().toISOString().split("T")[0]}
                      value={bookingForm.appointmentDate}
                      onChange={(event) =>
                        setBookingForm({
                          ...bookingForm,
                          appointmentDate: event.target.value,
                        })
                      }
                      className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none transition focus:border-[#9c810c]"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-white">
                      Preferred Time <span className="text-[#9c810c]">*</span>
                    </label>

                    <input
                      type="time"
                      required
                      value={bookingForm.appointmentTime}
                      onChange={(event) =>
                        setBookingForm({
                          ...bookingForm,
                          appointmentTime: event.target.value,
                        })
                      }
                      className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none transition focus:border-[#9c810c]"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-white">
                    Message / Notes
                  </label>

                  <textarea
                    rows={4}
                    value={bookingForm.message}
                    onChange={(event) =>
                      setBookingForm({
                        ...bookingForm,
                        message: event.target.value,
                      })
                    }
                    placeholder="Any special requirements or notes..."
                    className="w-full resize-none rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-[#9c810c]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={bookingSubmitting}
                  className="touch-manipulation w-full rounded-full bg-[#9c810c] px-6 py-4 font-bold text-black transition duration-200 hover:bg-white active:scale-[0.98] active:bg-white active:shadow-[0_0_30px_rgba(156,129,12,0.5)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {bookingSubmitting
                    ? "SUBMITTING..."
                    : "SUBMIT APPOINTMENT"}
                </button>

              </form>
            )}

          </div>
        </div>
      )}

      {/* ===================================================
          FOOTER
      =================================================== */}

      <footer className="border-t border-white/10 px-6 py-10 sm:px-10">

        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-5 sm:flex-row sm:items-center">

          <div>

            <p className="brand-font text-xl font-bold tracking-[0.16em]">
              MEENAKSHI
            </p>

            <p className="mt-1 text-[10px] tracking-[0.2em] text-[#9c810c]">
              BRIDAL STUDIO & FAMILY SALON
            </p>

          </div>

          <p className="text-xs text-zinc-600">
            © {new Date().getFullYear()} Meenakshi Bridal Studio. All rights
            reserved.
          </p>

        </div>

      </footer>

    </main>
  );
}
