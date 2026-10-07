"use client";
 
import Image from "next/image";
import {
  type FormEvent,
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
 
type Service = {
  id: number;
  name: string;
  description?: string | null;
  price?: string | null;
  imageUrl?: string | null;
  category?: string | null;
  isActive?: boolean;
};

type Review = {
  id: number;
  customerName: string;
  rating: number;
  review: string;
  imageUrl?: string | null;
  videoUrl?: string | null;
  isActive?: boolean;
  sortOrder?: number;
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
      "/nail.png",
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
    "HD Groom Makeup",
    "Groom Makeup",
  ],
};

/* Service-specific content used when the admin has not supplied it. */
const serviceDetails: Record<string, { description: string; image: string }> = {
  "facials": { description: "A tailored facial cleanse and treatment that helps remove buildup, refresh the skin and leave it feeling soft and hydrated.", image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=900&q=80" },
  "hydra facial": { description: "A multi-step facial that cleanses, exfoliates and hydrates the skin for a smoother, refreshed appearance.", image: "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&w=900&q=80" },
  "korean glass glow facial": { description: "A glow-focused facial designed to support a dewy, smooth-looking complexion with layered hydration and gentle skin care.", image: "https://images.unsplash.com/photo-1600334129128-685c5582fd35?auto=format&fit=crop&w=900&q=80" },
  "organic facial": { description: "A facial using plant-based skin-care products selected to cleanse and condition the skin.", image: "https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&w=900&q=80" },
  "bridal glow facial": { description: "A skin-preparation facial intended to leave the skin looking fresh and radiant ahead of a bridal event.", image: "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&w=900&q=80" },
  "glow therapy": { description: "A refreshing skin-care session focused on cleansing and hydration to help bring out a healthy-looking glow.", image: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=900&q=80" },
  "glutathione facial": { description: "A facial treatment marketed for brighter-looking skin, with products selected according to your skin-care needs.", image: "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&w=900&q=80" },
  "pimple treatment": { description: "A skin-care session focused on cleansing and caring for blemish-prone skin. Treatment is tailored after checking your skin.", image: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=900&q=80" },
  "under eye treatment": { description: "A targeted care session for the delicate under-eye area, focused on gentle hydration and a refreshed appearance.", image: "https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?auto=format&fit=crop&w=900&q=80" },
  "waxing": { description: "Hair removal using wax, leaving the treated area smooth. The service area and suitable method can be confirmed during your appointment.", image: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=900&q=80" },
  "theading": { description: "Threading shapes and removes unwanted facial hair with a thread, commonly used for eyebrow and facial grooming.", image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=900&q=80" },
  "threading": { description: "Threading shapes and removes unwanted facial hair with a thread, commonly used for eyebrow and facial grooming.", image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=900&q=80" },
  "manicure": { description: "Nail and hand care that may include nail shaping, cuticle care and finishing for neat, well-groomed hands.", image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=900&q=80" },
  "pedicure": { description: "Foot and nail care that may include soaking, nail shaping and skin care for clean, well-groomed feet.", image: "https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&w=900&q=80" },
  "hair cutting and styling": { description: "A haircut and finish tailored to your preferred length, face shape and styling needs.", image: "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=900&q=80" },
  "botox": { description: "A hair-smoothing treatment designed to condition strands and reduce the appearance of frizz. Results vary by hair type.", image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=900&q=80" },
  "nanoplastia": { description: "A hair treatment intended to smooth and soften the hair while helping manage frizz. Suitability depends on hair condition.", image: "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=900&q=80" },
  "smoothening": { description: "A chemical hair-smoothing service that helps reduce frizz and make hair easier to manage. A consultation helps determine suitability.", image: "https://images.unsplash.com/photo-1521590832167-7bcbbae6381f?auto=format&fit=crop&w=900&q=80" },
  "keratin treatment": { description: "A smoothing and conditioning treatment that helps reduce frizz and improve manageability and shine.", image: "https://images.unsplash.com/photo-1560869713-7d0a29430803?auto=format&fit=crop&w=900&q=80" },
  "permanent blow dry": { description: "A longer-lasting styling service designed to keep hair looking smooth and blow-dried with less daily styling.", image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=900&q=80" },
  "customised botox": { description: "A hair-conditioning and smoothing service adjusted to your hair texture and concerns after consultation.", image: "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=900&q=80" },
  "colouring": { description: "Hair colouring customized to your preferred shade and look. A consultation can help choose a colour suitable for your hair.", image: "https://images.unsplash.com/photo-1519694019325-9d3ba7c9c5e5?auto=format&fit=crop&w=900&q=80" },
  "dandruff treatment": { description: "A scalp-care session focused on cleansing and managing visible flakes and buildup. The approach depends on your scalp condition.", image: "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=900&q=80" },
  "hair spa": { description: "A relaxing hair and scalp care session with cleansing and conditioning to help hair feel softer and more manageable.", image: "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=900&q=80" },
  "warts removal": { description: "A consultation-based service to assess the spot and discuss an appropriate removal option, if suitable.", image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=900&q=80" },
  "ear lobe": { description: "A beauty service for ear-lobe care. Please confirm the exact procedure and suitability with the studio before booking.", image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=900&q=80" },
  "nail extension & nail art": { description: "Nail extensions with decorative nail art, customized to your preferred length, shape and design.", image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=900&q=80" },
  "hair extension": { description: "Hair extensions added to create extra length or volume, with placement and styling selected to suit your look.", image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=900&q=80" },
  "microblading": { description: "A brow-enhancement service that creates fine, hair-like strokes. A consultation is needed to discuss shape and suitability.", image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=900&q=80" },
  "tattooing": { description: "A tattoo service planned around your preferred design and placement. Discuss the design and aftercare with the studio before booking.", image: "https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?auto=format&fit=crop&w=900&q=80" },
  "beauty spot": { description: "A beauty-spot service to create or enhance a small beauty mark. Confirm the exact method and aftercare with the studio.", image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=900&q=80" },
  "airbrush makeup": { description: "Makeup applied with an airbrush for a fine, even finish. The look can be tailored to your event and preferred coverage.", image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=900&q=80" },
  "skin glass glow makeup": { description: "A luminous makeup look focused on a fresh, dewy, glass-skin-inspired finish.", image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=900&q=80" },
  "hd makeup": { description: "High-definition makeup designed to look smooth on camera while maintaining a natural-looking finish in person.", image: "https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?auto=format&fit=crop&w=900&q=80" },
  "hd signature makeup": { description: "The studio's signature high-definition makeup look, customized to your features, outfit and occasion.", image: "https://images.unsplash.com/photo-1519694019325-9d3ba7c9c5e5?auto=format&fit=crop&w=900&q=80" },
  "party makeup": { description: "Event-ready makeup tailored to your outfit, personal style and the occasion, from soft glam to a more defined look.", image: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=900&q=80" },
  "hd groom makeup": { description: "A camera-friendly groom makeup look focused on an even, natural-looking finish for the wedding day.", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=80" },
  "groom makeup": { description: "Subtle makeup and grooming for the groom, tailored to the event and desired natural finish.", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=80" },
};

const getServiceDetails = (name: string) => serviceDetails[name.trim().toLowerCase()];
 
/* =========================================================
   TEMPORARY BRANCH DATA
========================================================= */
 
const branches = [
  {
    name: "Meenakshi Bridal Studio & Family Saloon",
    location: "Near Lulu Mall, Kottiyam",
    map: "https://maps.app.goo.gl/foQVzzJvZRs8qELk8?g_st=aw",
  },
  {
    name: "Meenakshi Hair & Beauty Studio",
    location: "Near Simla Textiles, Kottiyam",
    map: "https://maps.google.com/?q=8.865957,76.671799",
  },
  {
    name: "Meenakshi Brides & Beauty Studio",
    location: "Near Iyyallor Mahavishnu Temple, Nedumancavu",
    map:"https://maps.google.com/?q=8.924138,76.734474"
  },
];
 
/* =========================================================
   REVEAL — fade-up on scroll (IntersectionObserver)
========================================================= */
 
function Reveal({
  children,
  delay = 0,
  y = 36,
  scale = 1,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  scale?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [shown, setShown] = useState(false);
 
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
 
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

    // Keep content visible on browsers where IntersectionObserver is missing.
    if (reduceMotion || !("IntersectionObserver" in window)) {
      setShown(true);
      return;
    }

    // iOS fallback: reveal from the actual viewport position as the user
    // scrolls, rather than relying only on IntersectionObserver callbacks.
    if (isIOS) {
      return watchReveal(() => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.92 && rect.bottom > 0) {
          setShown(true);
          return true;
        }
        return false;
      });
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          observer.disconnect();
        }
      },
      // A zero threshold is more reliable for short/narrow elements on mobile.
      { threshold: 0, rootMargin: "0px 0px 0px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);
 
  const ease = "cubic-bezier(0.22, 1, 0.36, 1)";
 
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown
          ? "translate3d(0, 0, 0) scale(1)"
          : `translate3d(0, ${y}px, 0) scale(${scale})`,
        transition: `opacity 900ms ${ease} ${delay}ms, transform 1000ms ${ease} ${delay}ms`,
        willChange: shown ? "auto" : "opacity, transform",
      }}
    >
      {children}
    </div>
  );
}
 
 
/* =========================================================
   SHARED REVEAL WATCHER (iOS fallback)
   One scroll listener + one rAF for ALL Reveal elements, instead of a
   separate scroll listener (and layout read) per element.
========================================================= */

const revealWatchers = new Set<() => boolean>();
let revealFrame = 0;
let revealListening = false;

function runRevealWatchers() {
  revealFrame = 0;
  revealWatchers.forEach((check) => {
    if (check()) revealWatchers.delete(check);
  });
}

function scheduleRevealWatchers() {
  if (!revealFrame) revealFrame = window.requestAnimationFrame(runRevealWatchers);
}

function watchReveal(check: () => boolean) {
  revealWatchers.add(check);
  if (!revealListening) {
    revealListening = true;
    window.addEventListener("scroll", scheduleRevealWatchers, { passive: true });
    window.addEventListener("resize", scheduleRevealWatchers);
  }
  scheduleRevealWatchers();
  return () => {
    revealWatchers.delete(check);
  };
}

/* =========================================================
   SLIDESHOW — owns its own timer so the 3-second tick only
   re-renders this small component, not the whole 3000-line page.
========================================================= */

function Slideshow({
  images,
  getAlt,
  sizes,
}: {
  images: string[];
  getAlt: (index: number) => string;
  sizes: string;
}) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const interval = window.setInterval(() => {
      setActive((current) => (current + 1) % images.length);
    }, 3000);
    return () => window.clearInterval(interval);
  }, [images.length]);

  return (
    <>
      {images.map((image, index) => (
        <Image
          key={`${image}-${index}`}
          src={image}
          alt={getAlt(index)}
          fill
          priority={index === 0}
          sizes={sizes}
          className={`object-cover transition-opacity duration-1000 ease-in-out ${
            index === active ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
    </>
  );
}

const aboutImages = ["/about.jpeg", "/about2.jpeg", "/about3.jpeg", "/about5.jpeg", "/about6.jpeg"];

// Marquee speed in pixels per second (same on every screen and text length).
const MARQUEE_SPEED = 100;
const MARQUEE_CACHE_KEY = "meenakshi-marquee-text";

export default function Home() {
  // Always restart the intro from the top when the page is freshly loaded.
  // Browsers may otherwise restore the previous scroll position on reload,
  // causing the intro to appear already completed.
  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    const frame = window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);
 
  const introRef = useRef<HTMLElement | null>(null);
  const introStageRef = useRef<HTMLDivElement | null>(null);
  const introVideoRef = useRef<HTMLVideoElement | null>(null);
  const introHintRef = useRef<HTMLDivElement | null>(null);
  const [introFinished, setIntroFinished] = useState(false);
  const heroRef = useRef<HTMLElement | null>(null);
  const [heroEntered, setHeroEntered] = useState(false);
  const [marqueeEntered, setMarqueeEntered] = useState(false);

  // Scroll scrubbing. Everything here writes straight to the DOM (no React
  // state while scrolling).
  //
  // Mobile fixes in this version:
  //  - the loop settles on the TARGET time, never on video.currentTime
  //    (phones round currentTime to a frame, so comparing against it made the
  //    old loop re-seek forever = "stuck")
  //  - one seek in flight at a time + an exact final seek once scrolling stops
  //  - the video is downloaded fully into memory (blob) so seeks are local
  //  - phones try /intro3-mobile.mp4 first and fall back to the main file
  //  - iOS can't auto-play it: any play event is immediately paused
  useEffect(() => {
    const section = introRef.current;
    const stage = introStageRef.current;
    const video = introVideoRef.current;
    const hint = introHintRef.current;
    if (!section || !stage || !video) return;

    const VIDEO_END = 0.85;
    const EASE = 0.18;
    const MIN_STEP = 0.012; // seconds - don't re-seek for smaller changes

    let scrollFrame = 0;
    let tickFrame = 0;
    let settleTimer = 0;
    let targetTime = 0;
    let easedTime = 0;
    let requestedTime = -1;
    let stickyTop = 0;
    let distance = 1;
    let lastFade = -1;
    let lastHint = -1;
    let disposed = false;
    let blobUrl = "";

    const clamp = (v: number) => Math.min(1, Math.max(0, v));

    const measure = () => {
      stickyTop = parseFloat(getComputedStyle(stage).top) || 0;
      distance = Math.max(
        1,
        section.offsetHeight - stage.offsetHeight - stickyTop
      );
    };

    const paintHint = () => {
      if (!hint) return;
      const raw = clamp(-section.getBoundingClientRect().top / distance);
      // Visible only at the very top AND only once the video is really back
      // at the start, so it can never sit on top of a later frame.
      const opacity = Math.min(1 - clamp(raw / 0.02), 1 - clamp(easedTime / 0.25));
      if (opacity !== lastHint) {
        hint.style.opacity = String(opacity);
        lastHint = opacity;
      }
    };

    const tick = () => {
      tickFrame = 0;
      const diff = targetTime - easedTime;
      easedTime = Math.abs(diff) < 0.004 ? targetTime : easedTime + diff * EASE;

      let waiting = false;
      const needsSeek =
        Math.abs(easedTime - requestedTime) >= MIN_STEP ||
        (easedTime === targetTime && easedTime !== requestedTime);

      if (needsSeek) {
        if (video.seeking) {
          waiting = true; // try again next frame, never stack seeks
        } else {
          requestedTime = easedTime;
          video.currentTime = easedTime;
        }
      }

      paintHint();

      if (easedTime !== targetTime || waiting) {
        tickFrame = window.requestAnimationFrame(tick);
      }
    };

    const kick = () => {
      if (!tickFrame) tickFrame = window.requestAnimationFrame(tick);
    };

    const settle = () => {
      // Scrolling stopped: land exactly on the right frame.
      easedTime = targetTime;
      kick();
    };

    const update = () => {
      scrollFrame = 0;

      const raw = clamp(-section.getBoundingClientRect().top / distance);

      // Offers button only after the intro has fully finished.
      const finished = raw >= 1;
      setIntroFinished((current) => (current === finished ? current : finished));

      const duration = video.duration;
      if (Number.isFinite(duration) && duration > 0) {
        targetTime = clamp(raw / VIDEO_END) * Math.max(0, duration - 0.05);
      }

      const fade = clamp((raw - VIDEO_END) / (1 - VIDEO_END));
      if (fade !== lastFade) {
        stage.style.opacity = String(1 - fade);
        video.style.transform = fade > 0 ? `scale(${1 + fade * 0.08})` : "none";
        lastFade = fade;
      }

      paintHint();
      kick();

      window.clearTimeout(settleTimer);
      settleTimer = window.setTimeout(settle, 140);
    };

    const onScroll = () => {
      if (!scrollFrame) scrollFrame = window.requestAnimationFrame(update);
    };

    const onResize = () => {
      measure();
      onScroll();
    };

    const onPlay = () => video.pause();

    // ---- load the video into memory (phones: smaller file first) ----
    const small = window.matchMedia("(max-width: 768px), (pointer: coarse)").matches;
    const candidates = small
      ? ["/intro3-mobile.mp4", "/intro3-smooth.mp4"]
      : ["/intro3-smooth.mp4"];

    const loadVideo = async () => {
      for (const url of candidates) {
        try {
          const response = await fetch(url);
          if (!response.ok) continue;
          const blob = await response.blob();
          if (disposed) return;
          blobUrl = URL.createObjectURL(blob);
          video.src = blobUrl;
          video.load();
          return;
        } catch {
          // try the next candidate
        }
      }
      if (!disposed && !video.getAttribute("src")) {
        video.src = "/intro3-smooth.mp4"; // last resort: plain streaming
      }
    };

    video.addEventListener("play", onPlay);
    video.addEventListener("loadedmetadata", onScroll);
    video.addEventListener("loadeddata", onScroll);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    measure();
    update();
    loadVideo();

    return () => {
      disposed = true;
      video.removeEventListener("play", onPlay);
      video.removeEventListener("loadedmetadata", onScroll);
      video.removeEventListener("loadeddata", onScroll);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.clearTimeout(settleTimer);
      if (scrollFrame) window.cancelAnimationFrame(scrollFrame);
      if (tickFrame) window.cancelAnimationFrame(tickFrame);
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, []);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewRatingFilter, setReviewRatingFilter] = useState<number | "ALL">("ALL");

  const filteredReviews = useMemo(() => {
    if (reviewRatingFilter === "ALL") return reviews;
    return reviews.filter((review) => Number(review.rating) === reviewRatingFilter);
  }, [reviews, reviewRatingFilter]);
  const [services, setServices] = useState<Service[]>([]);
  const [portfolioImages, setPortfolioImages] = useState<string[]>([]);
  const [portfolioVideos, setPortfolioVideos] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] =
    useState<string | null>(null);
  const [expandedServiceId, setExpandedServiceId] = useState<number | null>(null);
 
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingCategory, setBookingCategory] = useState<string | null>(null);
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [marqueeText, setMarqueeText] = useState("");
  const [marqueeVisible, setMarqueeVisible] = useState(false);
  const marqueeRef = useRef<HTMLDivElement | null>(null);
  const [marqueePinned, setMarqueePinned] = useState(false);
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
    let cancelled = false;

    // Show the last known marquee immediately (no waiting for the API),
    // then refresh it in the background.
    try {
      const cached = window.localStorage.getItem(MARQUEE_CACHE_KEY);
      if (cached) {
        setMarqueeText(cached);
        setMarqueeVisible(true);
      }
    } catch {
      // storage unavailable (private mode) - ignore
    }

    async function loadMarquee() {
      for (let attempt = 0; attempt < 4; attempt += 1) {
        try {
          const response = await fetch("/api/marquee", {
            cache: "no-store",
          });

          if (!response.ok) {
            throw new Error("Failed to load marquee.");
          }

          const data = await response.json();
          const activeMarquee = Array.isArray(data)
            ? data.find((item) => item?.isActive && item?.text)
            : null;

          if (cancelled) return;

          if (activeMarquee) {
            const text = String(activeMarquee.text);
            setMarqueeText(text);
            setMarqueeVisible(true);
            try {
              window.localStorage.setItem(MARQUEE_CACHE_KEY, text);
            } catch {}
            return;
          }

          if (attempt === 3) {
            setMarqueeVisible(false);
            try {
              window.localStorage.removeItem(MARQUEE_CACHE_KEY);
            } catch {}
            return;
          }
        } catch (error) {
          if (attempt === 3) {
            if (!cancelled) console.error("Marquee loading error:", error);
            return; // keep showing the cached marquee if there is one
          }
        }

        await new Promise((resolve) => window.setTimeout(resolve, 400));
        if (cancelled) return;
      }
    }

    loadMarquee();
    return () => {
      cancelled = true;
    };
  }, []);
  // Show the floating Offers button only once the marquee has reached its
  // sticky position below the navbar. It hides again when scrolling upward.
  useEffect(() => {
    let frame = 0;
    let stickyTop = 0;

    const run = () => {
      frame = 0;
      const marquee = marqueeRef.current;
      if (!marquee || !introFinished || !marqueeVisible) {
        setMarqueePinned(false);
        return;
      }
      setMarqueePinned(marquee.getBoundingClientRect().top <= stickyTop + 1);
    };

    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(run);
    };

    const measure = () => {
      const marquee = marqueeRef.current;
      stickyTop = marquee ? parseFloat(getComputedStyle(marquee).top) || 0 : 0;
      schedule();
    };

    measure();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", measure);
    };
  }, [introFinished, marqueeVisible, marqueeText]);

  // Constant marquee speed: the duration is derived from the real text width
  // (short text used to crawl, because the old duration was a fixed 24s).
  const marqueeTrackRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const track = marqueeTrackRef.current;
    const group = track?.firstElementChild as HTMLElement | null;
    if (!track || !group) return;

    const apply = () => {
      const width = group.getBoundingClientRect().width;
      if (width > 0) {
        // the track holds 8 groups and animates by -50% = 4 groups
        track.style.animationDuration = `${(width * 4) / MARQUEE_SPEED}s`;
      }
    };

    apply();
    window.addEventListener("resize", apply);
    return () => window.removeEventListener("resize", apply);
  }, [marqueeVisible, marqueeText]);

  // Reveal the marquee and hero as they enter the viewport after the intro.
  // This is separate from the video scroll-scrubbing effect above.
  useEffect(() => {
    const marquee = marqueeRef.current;
    const hero = heroRef.current;
    let marqueeObserver: IntersectionObserver | null = null;
    let heroObserver: IntersectionObserver | null = null;

    if (marquee) {
      marqueeObserver = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setMarqueeEntered(true);
            marqueeObserver?.disconnect();
          }
        },
        { threshold: 0.1 }
      );
      marqueeObserver.observe(marquee);
    }

    if (hero) {
      heroObserver = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setHeroEntered(true);
            heroObserver?.disconnect();
          }
        },
        { threshold: 0.08, rootMargin: "0px 0px -8% 0px" }
      );
      heroObserver.observe(hero);
    }

    return () => {
      marqueeObserver?.disconnect();
      heroObserver?.disconnect();
    };
  }, [marqueeVisible]);

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
     LOAD CUSTOMER REVIEWS
  ======================================================= */
  useEffect(() => {
    async function loadReviews() {
      try {
        const response = await fetch("/api/reviews", { cache: "no-store" });
        if (!response.ok) throw new Error("Failed to load reviews.");
        const data = await response.json();
        if (Array.isArray(data)) {
          setReviews(data.filter((item: Review) => item.isActive !== false));
        }
      } catch (error) {
        console.error("Reviews loading error:", error);
      }
    }
    loadReviews();
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
    description: getServiceDetails(name)?.description ?? null,
    price: null,
    imageUrl: getServiceDetails(name)?.image ?? null,
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
          description: getServiceDetails(name)?.description ?? null,
          price: null,
          imageUrl: getServiceDetails(name)?.image ?? null,
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
    if (!bookingForm.service) {
      alert("Please choose a category and select a service.");
      return;
    }
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
 /* booking from offer page */
 useEffect(() => {
  if (window.location.search.includes("booking=1")) {
    setShowBookingForm(true);

    window.history.replaceState({}, "", "/");
  }
}, []);
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
    <main className="relative min-h-screen overflow-x-clip bg-transparent text-white">
 
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
 
<header className="fixed left-0 right-0 top-0 z-50 border-b border-white/10 bg-black/90 md:backdrop-blur-xl">
 
  <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-3 sm:px-8 lg:px-10">
 
 {/* LOGO */}
<a
  href="#home"
  onClick={() => setMobileMenuOpen(false)}
  className="flex min-w-0 items-center gap-2 sm:gap-3"
>
  {/* Existing circular logo — KEEP */}
  <Image
    src="/logo.jpg"
    alt="Meenakshi"
    width={70}
    height={70}
    className="h-12 w-12 rounded-full object-contain"
    priority
  />
 
  {/* New logo image — replaces the text */}
  <Image
    src="/meenakshi-header-logo.png"
    alt="Meenakshi Bridal Studio & Family Salon"
    width={994}
    height={261}
    className="h-auto w-[130px] object-contain sm:w-[180px] lg:w-[210px]"
    priority
  />
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

{/* DESKTOP SOCIAL LINKS */}
<div className="hidden items-center gap-4 md:flex">
  {/* Instagram */}
  <a
    href="https://www.instagram.com/meenakshi.familysalon/"
    target="_blank"
    rel="noreferrer"
    aria-label="Instagram"
    className="text-zinc-400 transition hover:text-[#9c810c]"
  >
    <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 448 512"
            fill="currentColor"
            className="h-5 w-5"
            aria-hidden="true"
          >
            <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.2 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.5 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.9-26.9 26.9s-26.9-12-26.9-26.9 12-26.9 26.9-26.9 26.9 12 26.9 26.9zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9s-58-34.5-93.9-36.2c-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1S3.2 127.6 1.5 163.5c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.5 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2s34.5-58 36.2-93.9c2.1-37 2.1-147.9 0-184.9zM398.8 388c-7.8 19.6-23 34.8-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.8-23-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 23-34.8 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.8 23 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z" />
          </svg>
  </a>

  {/* Facebook */}
  <a
    href="https://www.facebook.com/share/1HVRyaxZZc/"
    target="_blank"
    rel="noreferrer"
    aria-label="Facebook"
    className="text-lg font-bold text-zinc-400 transition hover:text-[#9c810c]"
  >
    f
  </a>
</div>
 
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
      <div className="flex items-center gap-6 pt-5">
        <a href="https://www.instagram.com/meenakshi.familysalon/" target="_blank" rel="noreferrer" aria-label="Instagram" className="text-2xl text-[#9c810c]"><svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 448 512"
            fill="currentColor"
            className="h-5 w-5"
            aria-hidden="true"
          >
            <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.2 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.5 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.9-26.9 26.9s-26.9-12-26.9-26.9 12-26.9 26.9-26.9 26.9 12 26.9 26.9zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9s-58-34.5-93.9-36.2c-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1S3.2 127.6 1.5 163.5c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.5 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2s34.5-58 36.2-93.9c2.1-37 2.1-147.9 0-184.9zM398.8 388c-7.8 19.6-23 34.8-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.8-23-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 23-34.8 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.8 23 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z" />
          </svg></a>
        <a href="https://www.facebook.com/share/1HVRyaxZZc/" target="_blank" rel="noreferrer" aria-label="Facebook" className="text-xl font-bold text-[#9c810c]">f</a>
      </div>
 
    </div>
  )}
 
</header>
{/* MEENAKSHI SCROLL INTRO */}
<section
  ref={introRef}
  className="relative h-[400vh] bg-black"
  aria-label="Meenakshi brand introduction"
>
  <div
    ref={introStageRef}
    className="sticky top-20 flex h-[calc(100svh-5rem)] items-center justify-center overflow-hidden bg-black"
  >
    <video
      ref={introVideoRef}
      muted
      playsInline
      preload="auto"
      controls={false}
      disablePictureInPicture
      disableRemotePlayback
      aria-label="Meenakshi brand introduction video"
      className="h-full w-full object-contain will-change-transform"
      style={{ display: "block" }}
    />
    <div
  className="particle-layer intro-particle-layer"
  aria-hidden="true"
>
  {Array.from({ length: 10 }).map((_, index) => (
    <span key={index} className="particle" />
  ))}
</div>
    <div
      ref={introHintRef}
      className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center text-center text-white/60"
      style={{ transition: "opacity 350ms ease" }}
    >
      <span className="mb-3 text-3xl leading-none text-white/70 animate-bounce" aria-hidden="true">
        ↓
      </span>
      <span className="text-[10px] tracking-[0.3em] text-white/55 animate-pulse">
        SCROLL TO ENTER
      </span>
    </div>
  </div>
</section>
      {/* ===================================================
    MARQUEE
=================================================== */}
 
{/* ===================================================
    MARQUEE
=================================================== */}
 
{marqueeVisible && marqueeText && (
 
<div
  ref={marqueeRef}
  className="sticky top-20 z-40 w-full overflow-hidden border-y border-[#9c810c]/20 bg-[#080808] py-3 sm:py-4"
  style={{
    opacity: marqueeEntered ? 1 : 0,
    transform: marqueeEntered ? "translate3d(0, 0, 0)" : "translate3d(0, 18px, 0)",
    transition: "opacity 700ms cubic-bezier(0.22, 1, 0.36, 1), transform 800ms cubic-bezier(0.22, 1, 0.36, 1)",
  }}
>
    <style>{`
      @keyframes meenakshi-marquee-scroll {
        from { transform: translate3d(0, 0, 0); }
        to { transform: translate3d(-50%, 0, 0); }
      }
      @-webkit-keyframes meenakshi-marquee-scroll {
        from { -webkit-transform: translate3d(0, 0, 0); }
        to { -webkit-transform: translate3d(-50%, 0, 0); }
      }
      .meenakshi-marquee-track {
        display: flex;
        width: max-content;
        flex-wrap: nowrap;
        animation: meenakshi-marquee-scroll 24s linear infinite;
        -webkit-animation: meenakshi-marquee-scroll 24s linear infinite;
        animation-play-state: running;
        -webkit-animation-play-state: running;
        will-change: transform;
        -webkit-backface-visibility: hidden;
        backface-visibility: hidden;
      }
      .meenakshi-marquee-group {
        display: flex;
        flex: 0 0 auto;
        align-items: center;
        white-space: nowrap;
        padding-right: 2rem;
      }
    `}</style>
    <div ref={marqueeTrackRef} className="meenakshi-marquee-track">
      {Array.from({ length: 8 }).map((_, index) => (
        <div
          className="meenakshi-marquee-group"
          key={index}
          aria-hidden={index >= 4}
        >
          <span className="px-2 text-xs font-medium tracking-[0.25em] text-[#9c810c] sm:text-sm">
            {marqueeText}
          </span>
          <span className="px-2 text-[#9c810c]" aria-hidden="true">•</span>
        </div>
      ))}
    </div>
  </div>
)}
      
{/* FLOATING OFFERS BUTTON — appears after the intro, below the marquee */}
{introFinished && marqueePinned && (
  <div className="pointer-events-none fixed right-4 top-[9.5rem] z-[60] sm:right-6">
    <a
      href="/offers"
      className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-[#9c810c]/70 bg-[#9c810c] px-4 py-3 text-[10px] font-bold tracking-[0.18em] text-black shadow-lg transition duration-300 hover:scale-105 hover:bg-white sm:px-5 sm:text-xs"
    >
      ✦ OFFERS
    </a>
  </div>
)}

{/* ===================================================
    HERO
=================================================== */}
 
<section
  ref={heroRef}
  id="home"
  className="relative flex min-h-[calc(100svh-5rem)] items-center overflow-hidden px-5 pb-20 pt-28 sm:px-10 lg:px-16"
  style={{
    opacity: heroEntered ? 1 : 0,
    transform: heroEntered ? "translate3d(0, 0, 0)" : "translate3d(0, 36px, 0)",
    transition: "opacity 1000ms cubic-bezier(0.22, 1, 0.36, 1), transform 1100ms cubic-bezier(0.22, 1, 0.36, 1)",
  }}
>
  {/* Background glow */}
  <div
    aria-hidden="true"
    className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#9c810c]/10 blur-[150px]"
  />
 
  <div className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
 
    {/* LEFT: TEXT */}
    <div className="text-center lg:text-left">
 
      <Reveal>
        <p className="text-xs font-semibold tracking-[0.4em] text-[#9c810c] sm:text-sm">
          MEENAKSHI BRIDAL STUDIO
        </p>
      </Reveal>
 
      <Reveal delay={120} y={48}>
        <h1 className="heading-font mt-6 text-5xl font-normal leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl xl:text-8xl">
          Beauty
          <br />
          <span className="font-semibold text-[#9c810c]">
            Beyond Beauty.
          </span>
        </h1>
      </Reveal>
 
      <Reveal delay={260}>
        <p className="mx-auto mt-7 max-w-xl text-sm leading-7 text-zinc-400 sm:text-base lg:mx-0">
          Bridal artistry, professional beauty care and premium
          salon services designed to bring out your confidence.
        </p>
      </Reveal>
 
      {/* Buttons */}
      <Reveal delay={400}>
      <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
 
        <button
          type="button"
          onClick={() => openBookingForm()}
          className="touch-manipulation rounded-full bg-[#9c810c] px-8 py-4 text-xs font-bold tracking-[0.15em] text-black transition duration-300 hover:-translate-y-1 hover:bg-white active:scale-95"
        >
          BOOK APPOINTMENT
        </button>
 
        <a
          href="#services"
          className="touch-manipulation rounded-full border border-white/20 px-8 py-4 text-xs font-semibold tracking-[0.15em] text-white transition duration-300 hover:-translate-y-1 hover:border-[#9c810c] hover:text-[#9c810c] active:scale-95"
        >
          VIEW SERVICES
        </a>
 
        <a
          href="#portfolio"
          className="touch-manipulation rounded-full border border-white/20 px-8 py-4 text-xs font-semibold tracking-[0.15em] text-white transition duration-300 hover:-translate-y-1 hover:border-[#9c810c] hover:text-[#9c810c] active:scale-95"
        >
          PORTFOLIO
        </a>
 
      </div>
      </Reveal>
 
      {/* Small decorative detail */}
      <div className="mt-12 hidden items-center gap-4 lg:flex">
        <span className="h-px w-12 bg-[#9c810c]/70" />
        <p className="text-[10px] tracking-[0.3em] text-zinc-500">
          BEAUTY • ELEGANCE • CONFIDENCE
        </p>
      </div>
 
    </div>
 
    {/* RIGHT: STUDIO PORTFOLIO IMAGE */}
    <Reveal delay={300} y={56} scale={0.96} className="mx-auto w-full max-w-lg">
    <div className="relative w-full">
 
      <div className="absolute -inset-4 rounded-[2rem] border border-[#9c810c]/20" />
 
      <div className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem] border border-[#9c810c]/30 bg-[#0b0b0b]">
 
      {portfolioImages.length > 0 ? (
  <Slideshow
    images={portfolioImages}
    getAlt={(index) => `Meenakshi Bridal Studio portfolio image ${index + 1}`}
    sizes="(max-width: 1024px) 90vw, 45vw"
  />
) : (
  <div className="flex h-full flex-col items-center justify-center px-8 text-center">
    <span className="heading-font text-4xl text-[#9c810c]">
      Meenakshi
    </span>
    <span className="mt-3 text-[10px] tracking-[0.35em] text-zinc-500">
      BRIDAL STUDIO
    </span>
    <span className="mt-8 h-px w-16 bg-[#9c810c]/50" />
    <p className="mt-5 text-xs leading-6 text-zinc-500">
      Studio portfolio image will appear here.
    </p>
  </div>
)}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
 
        <div className="absolute bottom-5 left-5 right-5">
          <p className="text-[10px] tracking-[0.3em] text-[#e0c45c]">
            THE ART OF BEAUTY
          </p>
          <p className="heading-font mt-1 text-2xl text-white sm:text-3xl">
            Your special moments,
            <br />
            our artistry.
          </p>
        </div>
 
      </div>
 
      {/* Decorative corner */}
      <div className="absolute -bottom-5 -right-5 h-20 w-20 rounded-full border border-[#9c810c]/30" />
 
    </div>
    </Reveal>
 
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
 
          <Reveal className="max-w-4xl">
          <div>
 
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
          </Reveal>
 
          {/* CATEGORY CARDS */}
 
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
 
            {categories.map((category, index) => {
 
              const isSelected =
                selectedCategory === category.id;
 
              return (
 
                <Reveal key={category.id} delay={index * 120} y={48}>
                <button
                  onClick={() =>
                    setSelectedCategory(
                      isSelected ? null : category.id
                    )
                  }
                  className={`group touch-manipulation relative w-full overflow-hidden rounded-3xl border text-left transition-all duration-300 active:scale-[0.98] active:shadow-[0_0_30px_rgba(156,129,12,0.25)] ${
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
                </Reveal>
 
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
 
              <div className="mt-8 grid items-start gap-3 sm:grid-cols-2 lg:grid-cols-3">
 
                {selectedServices.map((service) => {
                  const isExpanded = expandedServiceId === service.id;
                  const details = getServiceDetails(service.name);
                  const serviceImage = service.imageUrl || details?.image || selectedCategoryData.image;
                  const fullDescription = service.description?.trim() || details?.description || `A personalized ${service.name.toLowerCase()} service tailored to your preferences. Contact the studio to learn more about the treatment and available options.`;
                  const isBrideFirst = service.name.trim().toLowerCase() === "airbrush makeup";
                  const isGroomFirst = service.name.trim().toLowerCase() === "hd groom makeup";

                  return (
                    <div key={service.id} className="contents">
                    {isBrideFirst && selectedCategoryData.id === "bridal" && (
                      <h4 className="col-span-full mb-1 mt-2 text-sm font-semibold tracking-[0.22em] text-[#9c810c]">BRIDE</h4>
                    )}
                    {isGroomFirst && selectedCategoryData.id === "bridal" && (
                      <h4 className="col-span-full mb-1 mt-5 text-sm font-semibold tracking-[0.22em] text-[#9c810c]">GROOM</h4>
                    )}
                    <div
                      key={service.id}
                      className="group overflow-hidden rounded-2xl border border-white/10 bg-black p-5 transition duration-500 hover:border-[#9c810c]/50"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <button
                          type="button"
                          onClick={() => setExpandedServiceId(isExpanded ? null : service.id)}
                          aria-expanded={isExpanded}
                          className="flex min-w-0 flex-1 items-start gap-4 text-left"
                        >
                          <span
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#9c810c]/10 text-[#9c810c] transition-transform duration-300 ${isExpanded ? "rotate-180" : "rotate-0"}`}
                            aria-hidden="true"
                          >
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="h-4 w-4"
                            >
                              <path d="m6 9 6 6 6-6" />
                            </svg>
                          </span>
                          <span className="min-w-0">
                            <span className="block font-medium text-white">{service.name}</span>
                            {service.price && (
                              <span className="mt-3 block text-sm font-semibold text-[#9c810c]">
                                ₹{service.price}
                              </span>
                            )}
                          </span>
                        </button>

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

                      <div
                        aria-hidden={!isExpanded}
                        className={`grid transition-[grid-template-rows,opacity,margin] duration-500 ease-in-out ${isExpanded ? 'mt-5 grid-rows-[1fr] opacity-100' : 'mt-0 grid-rows-[0fr] opacity-0'}`}
                      >
                        <div className="min-h-0 overflow-hidden">
                          <div className="border-t border-white/10 pt-5">
                            <img
                              src={serviceImage}
                              alt={`${service.name} service`}
                              loading="lazy"
                              className="h-36 w-full rounded-xl object-cover sm:h-40"
                            />
                            <p className="mt-4 text-sm leading-6 text-zinc-300">{fullDescription}</p>
                            <button
                              type="button"
                              onClick={() => openBookingForm(service.name)}
                              className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-[#9c810c] px-5 py-3 text-xs font-semibold tracking-[0.16em] text-black transition hover:bg-[#f9f104] sm:w-auto"
                            >
                              BOOK APPOINTMENT
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    </div>
                  );
                })}
 
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
        className="scroll-mt-28 border-t border-white/10 bg-transparent px-6 py-28 sm:px-10 lg:px-16"
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
                    preload="none"
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
        className="scroll-mt-28 border-t border-white/10 bg-transparent px-6 py-28 sm:px-10 lg:px-16"
      >
 
        <div className="mx-auto max-w-7xl">
 
          {/* ABOUT HEADING */}
 
          <div className="mb-16 max-w-4xl">
            <p className="text-xs font-semibold tracking-[0.35em] text-[#9c810c]">
              OUR STORY
            </p>
 
            <h2 className="heading-font mt-5 text-4xl font-normal leading-tight text-white sm:text-6xl">
              Beauty, Elevated Into an{" "}
              <span className="italic text-[#9c810c]">Experience.</span>
            </h2>
 
            <p className="mt-7 max-w-3xl text-sm leading-8 text-zinc-400 sm:text-base">
              Every beauty journey holds a story. It may be a bride preparing
              for her most cherished day, a mother celebrating a special
              moment, a groom getting ready for a new beginning, or a woman
              simply taking time for herself. At Meenakshi, we believe every
              moment deserves to feel personal, thoughtful and beautiful.
            </p>
          </div>
 
          {/* ABOUT IMAGE + STORY */}
 
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="relative">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-white/10 bg-transparent">
                <Slideshow
                  images={aboutImages}
                  getAlt={() => "Meenakshi Bridal Studio and Family Salon"}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-7 left-7">
                  <p className="text-xs tracking-[0.3em] text-[#f9f104]">
                    MEENAKSHI
                  </p>
                  <p className="heading-font mt-2 text-xl text-white sm:text-2xl">
                    Beauty, with a personal touch.
                  </p>
                </div>
              </div>
              <div className="pointer-events-none absolute -bottom-4 -right-4 -z-0 h-28 w-28 rounded-full border border-[#9c810c]/30" />
            </div>
 
            <div className="space-y-8">
              <div>
                <p className="text-xs font-semibold tracking-[0.3em] text-[#9c810c]">
                  WHERE BEAUTY BECOMES PERSONAL
                </p>
                <p className="mt-4 text-sm leading-8 text-zinc-400 sm:text-base">
                  Founded by Harshaja, a makeup artist and hairstylist with
                  over 20 years of experience, Meenakshi was built around a
                  simple belief: beauty should never feel one-size-fits-all.
                  Every person has a unique style, personality and story.
                </p>
              </div>
 
              <div>
                <p className="text-xs font-semibold tracking-[0.3em] text-[#9c810c]">
                  THE ART OF THE TRANSFORMATION
                </p>
                <p className="mt-4 text-sm leading-8 text-zinc-400 sm:text-base">
                  From the first conversation to the finishing touch, each
                  service is approached with care and attention. Our work
                  brings together artistry, experience and an understanding
                  of what makes every client feel like themselves.
                </p>
              </div>
 
              <div>
                <p className="text-xs font-semibold tracking-[0.3em] text-[#9c810c]">
                  A QUIET KIND OF LUXURY
                </p>
                <p className="mt-4 text-sm leading-8 text-zinc-400 sm:text-base">
                  For us, luxury is found in the details: a comfortable
                  experience, thoughtful service and the confidence that
                  comes from feeling cared for. Whether you visit for a
                  bridal transformation or an everyday beauty service, you
                  deserve that same attention.
                </p>
              </div>
            </div>
          </div>
 
          {/* FOUNDER */}
 
          <div className="mt-24 grid items-center gap-10 rounded-[2rem] border border-white/10 bg-black/60 p-6 sm:p-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16 lg:p-14">
            <div className="relative mx-auto w-full max-w-md">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[1.75rem] border border-[#9c810c]/30 bg-[#080808]">
                <Image
                  src="/founder2.png"
                  alt="Harshaja, founder of Meenakshi Bridal Studio & Family Salon"
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover"
                />
              </div>
            </div>
 
            <div>
              <p className="text-xs font-semibold tracking-[0.35em] text-[#9c810c]">
                MEET THE FOUNDER
              </p>
              <h3 className="heading-font mt-4 text-3xl font-normal text-white sm:text-5xl">
                Harshaja A
              </h3>
              <p className="mt-3 text-sm tracking-[0.15em] text-[#9c810c]">
                THE ARTIST BEHIND MEENAKSHI
              </p>
              <p className="mt-7 text-sm leading-8 text-zinc-400 sm:text-base">
                With more than two decades of experience in makeup and
                hairstyling, Harshaja has helped clients prepare for
                meaningful moments and milestones. Her approach is rooted
                in listening, understanding each person and creating a look
                that feels natural to them.
              </p>
              <p className="mt-5 text-sm leading-8 text-zinc-400 sm:text-base">
                Over the years, Meenakshi has been part of thousands of
                personal stories, welcoming more than 50,000 customers.
                The trust placed in the studio continues to shape its
                commitment to thoughtful service and individual beauty.
              </p>
            </div>
          </div>
 
          {/* THE MEENAKSHI PROMISE */}
 
          <div className="mx-auto mt-24 max-w-4xl text-center">
            <p className="text-xs font-semibold tracking-[0.35em] text-[#9c810c]">
              THE MEENAKSHI PROMISE
            </p>
            <h3 className="heading-font mt-5 text-3xl font-normal leading-tight text-white sm:text-5xl">
              Beyond the bridal day.
              <br />
              <span className="italic text-[#9c810c]">Beyond the mirror.</span>
            </h3>
            <p className="mx-auto mt-6 max-w-3xl text-sm leading-8 text-zinc-400 sm:text-base">
              Meenakshi is more than a destination for bridal beauty. It is a
              place to celebrate your individuality, care for yourself and
              feel confident through every stage of life. From makeup and
              hair to skin and everyday salon services, we are here for your
              story.
            </p>
            <p className="heading-font mt-10 text-xl text-white sm:text-2xl">
              Your Beauty. Your Story. Our Art.
            </p>
            <p className="mt-3 text-xs tracking-[0.18em] text-zinc-500 sm:text-sm">
              Come for the transformation. Leave with a memory.
            </p>
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
      <a
        key={`${branch.name}-${index}`}
        href={branch.map}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`View ${branch.name} on Google Maps`}
        className="group block rounded-3xl border border-white/10 bg-black p-7 transition duration-500 hover:-translate-y-2 hover:border-[#9c810c]/60 hover:bg-zinc-950"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold tracking-[0.3em] text-[#9c810c]">
            {String(index + 1).padStart(2, "0")}
          </span>

          <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-[#9c810c] transition duration-500 group-hover:border-[#9c810c] group-hover:bg-[#9c810c] group-hover:text-black">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            >
              <path d="M7 17 17 7" />
              <path d="M7 7h10v10" />
            </svg>
          </span>
        </div>

        <h4 className="heading-font mt-8 text-2xl font-normal leading-snug transition-colors duration-300 group-hover:text-[#9c810c]">
          {branch.name}
        </h4>

        <div className="mt-4 flex items-start gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#9c810c"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mt-0.5 shrink-0"
          >
            <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
            <circle cx="12" cy="10" r="2.5" />
          </svg>

          <p className="text-sm leading-6 text-zinc-500 transition-colors duration-300 group-hover:text-zinc-300">
            {branch.location}
          </p>
        </div>

        <div className="mt-8 h-px w-12 bg-[#9c810c] transition-all duration-500 group-hover:w-full" />

        <p className="mt-5 text-xs font-semibold tracking-[0.15em] text-[#9c810c]">
          VIEW ON GOOGLE MAPS
          <span className="ml-2 inline-block transition-transform duration-300 group-hover:translate-x-1">
            →
          </span>
        </p>
      </a>
    ))}
  </div>
</div>

</div>

</section>

      {/* ===================================================
    CUSTOMER IMAGE REVIEWS
=================================================== */}

<section
  id="reviews"
  className="scroll-mt-28 border-t border-white/10 px-6 py-28 sm:px-10 lg:px-16"
>
  <div className="mx-auto max-w-7xl">

    <p className="heading-font text-4xl font-semibold tracking-wide text-[#9c810c] sm:text-5xl">
      CUSTOMER REVIEWS
    </p>

    <h2 className="heading-font mt-3 text-2xl font-normal tracking-wide text-white sm:text-3xl">
      Words from our customers.
    </h2>

    <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-400 sm:text-base">
      Discover what our customers say about their experience at Meenakshi Bridal Studio.
    </p>

    {/* STAR FILTER */}

    <div className="mt-8">

      <p className="mb-4 text-xs font-semibold tracking-[0.25em] text-[#9c810c]">
        FILTER BY RATING
      </p>

      <div className="flex flex-wrap gap-2">

        {[
          {
            label: "All Reviews",
            value: "ALL" as const,
          },
          {
            label: "5 ★",
            value: 5,
          },
          {
            label: "4 ★",
            value: 4,
          },
          {
            label: "3 ★",
            value: 3,
          },
          {
            label: "2 ★",
            value: 2,
          },
          {
            label: "1 ★",
            value: 1,
          },
        ].map((filter) => (
          <button
            key={String(
              filter.value
            )}
            type="button"
            onClick={() =>
              setReviewRatingFilter(
                filter.value
              )
            }
            aria-pressed={
              reviewRatingFilter ===
              filter.value
            }
            className={`rounded-full border px-5 py-2.5 text-xs font-semibold transition ${
              reviewRatingFilter ===
              filter.value
                ? "border-[#9c810c] bg-[#9c810c] text-black"
                : "border-white/15 bg-[#080808] text-zinc-400 hover:border-[#9c810c] hover:text-[#9c810c]"
            }`}
          >
            {filter.label}
          </button>
        ))}

      </div>
    </div>

    {/* IMAGE REVIEW CARDS */}

    {filteredReviews.length >
    0 ? (
      <>
        <div className="mt-10 flex snap-x snap-mandatory gap-6 overflow-x-auto overscroll-x-contain scroll-smooth pb-6 [scrollbar-color:#9c810c_#171717] [scrollbar-width:thin]">

          {filteredReviews.map(
            (item) => {

              const rating =
                Math.max(
                  0,
                  Math.min(
                    5,
                    Number(
                      item.rating
                    ) || 0
                  )
                );

              return (
                <article
                  key={item.id}
                  className="w-[85vw] max-w-[380px] shrink-0 snap-start overflow-hidden rounded-3xl border border-white/10 bg-[#080808] transition duration-300 hover:-translate-y-1 hover:border-[#9c810c]/60 sm:w-[360px]"
                >

                  {/* IMAGE */}

                  {item.imageUrl && (
                    <div className="aspect-[4/3] w-full overflow-hidden bg-black">
                      <img
                        src={
                          item.imageUrl
                        }
                        alt={`${item.customerName} customer review`}
                        className="h-full w-full object-cover transition duration-500 hover:scale-105"
                      />
                    </div>
                  )}

                  {/* CONTENT */}

                  <div className="p-7">

                    <div
                      className="text-xl tracking-widest text-[#9c810c]"
                      aria-label={`${rating} out of 5 stars`}
                    >
                      {"★".repeat(
                        rating
                      )}

                      <span className="text-zinc-700">
                        {"★".repeat(
                          5 - rating
                        )}
                      </span>
                    </div>

                    <p className="mt-5 min-h-24 break-words text-sm leading-7 text-zinc-300">
                      “{item.review}”
                    </p>

                    <div className="mt-6 border-t border-white/10 pt-4">

                      <p className="text-sm font-semibold text-white">
                        {
                          item.customerName
                        }
                      </p>

                      <p className="mt-1 text-xs tracking-wider text-[#9c810c]">
                        CUSTOMER REVIEW
                      </p>

                    </div>

                  </div>

                </article>
              );
            }
          )}

        </div>

        <p className="mt-1 text-center text-[10px] tracking-[0.25em] text-zinc-600">
          ← SCROLL OR SWIPE TO EXPLORE →
        </p>
      </>
    ) : (
      <p className="mt-10 text-sm text-zinc-500">
        {reviews.filter(
          (review) =>
            Boolean(
              review.imageUrl
            )
        ).length === 0
          ? "Customer reviews will appear here soon."
          : "No reviews found for this rating."}
      </p>
    )}

  </div>
</section>


{/* ===================================================
    CUSTOMER REVIEW VIDEOS
=================================================== */}

<section
  id="review-videos"
  className="border-t border-white/10 px-6 py-28 sm:px-10 lg:px-16"
>
  <div className="mx-auto max-w-7xl">

    <p className="heading-font text-4xl font-semibold tracking-wide text-[#9c810c] sm:text-5xl">
      CUSTOMER REVIEW VIDEOS
    </p>

    <h2 className="heading-font mt-3 text-2xl font-normal tracking-wide text-white sm:text-3xl">
      Real experiences from our customers.
    </h2>

    <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-400 sm:text-base">
      Watch real experiences shared by our customers at Meenakshi Bridal Studio.
    </p>

    {reviews.filter(
      (review) =>
        Boolean(
          review.videoUrl
        )
    ).length > 0 ? (

      <>

        <div className="mt-10 flex snap-x snap-mandatory gap-6 overflow-x-auto overscroll-x-contain scroll-smooth pb-6 [scrollbar-color:#9c810c_#171717] [scrollbar-width:thin]">

          {reviews
            .filter(
              (review) =>
                Boolean(
                  review.videoUrl
                )
            )
            .map((item) => (
              <article
                key={`video-${item.id}`}
                className="w-[78vw] max-w-[360px] shrink-0 snap-start overflow-hidden rounded-3xl border border-white/10 bg-[#080808] transition duration-300 hover:-translate-y-1 hover:border-[#9c810c]/60 sm:w-[330px]"
              >

                {/* VIDEO */}

                {item.videoUrl && (
                  <div className="aspect-[9/16] w-full overflow-hidden bg-black">

                    <video
                      src={
                        item.videoUrl
                      }
                      controls
                      playsInline
                      preload="metadata"
                      className="h-full w-full object-cover"
                    />

                  </div>
                )}

                {/* CUSTOMER NAME */}

                <div className="border-t border-white/10 p-6">

                  <p className="text-sm font-semibold text-white">
                    {
                      item.customerName
                    }
                  </p>

                  <p className="mt-1 text-xs tracking-wider text-[#9c810c]">
                    CUSTOMER EXPERIENCE
                  </p>

                </div>

              </article>
            ))}

        </div>

        <p className="mt-1 text-center text-[10px] tracking-[0.25em] text-zinc-600">
          ← SCROLL OR SWIPE TO EXPLORE →
        </p>

      </>

    ) : (
      <p className="mt-10 text-sm text-zinc-500">
        Customer review videos will appear here soon.
      </p>
    )}

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
 
          <div className="mt-8 flex flex-wrap gap-4">
            <a href="https://www.instagram.com/meenakshi.familysalon/" target="_blank" rel="noreferrer" className="rounded-full border border-[#9c810c]/50 px-6 py-3 text-sm text-[#9c810c] transition hover:bg-[#9c810c] hover:text-black">Instagram</a>
            <a href="https://www.facebook.com/share/1HVRyaxZZc/" target="_blank" rel="noreferrer" className="rounded-full border border-[#9c810c]/50 px-6 py-3 text-sm text-[#9c810c] transition hover:bg-[#9c810c] hover:text-black">Facebook</a>
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

                  <div className="grid items-start gap-3 sm:grid-cols-2">
                    {servicesByCategory.map((category) => {
                      const isExpanded = bookingCategory === category.id;

                      return (
                        <div
                          key={category.id}
                          className={`self-start overflow-hidden rounded-2xl border transition-all duration-300 ${
                            isExpanded
                              ? "border-[#9c810c] bg-[#9c810c]/5"
                              : "border-white/10 bg-black"
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setBookingCategory(isExpanded ? null : category.id);
                              if (!isExpanded) {
                                setBookingForm((current) => ({
                                  ...current,
                                  service: "",
                                }));
                              }
                            }}
                            aria-expanded={isExpanded}
                            className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left transition hover:bg-[#9c810c]/5"
                          >
                            <div>
                              <p
                                className={`text-sm font-semibold ${
                                  isExpanded ? "text-[#9c810c]" : "text-white"
                                }`}
                              >
                                {category.title}
                              </p>
                              <p className="mt-1 text-xs text-zinc-500">
                                {category.services.length} services available
                              </p>
                            </div>

                            <svg
                              className={`h-4 w-4 shrink-0 text-[#9c810c] transition-transform duration-300 ${
                                isExpanded ? "rotate-180" : ""
                              }`}
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              aria-hidden="true"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="m6 9 6 6 6-6"
                              />
                            </svg>
                          </button>

                          <div
                            className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
                              isExpanded
                                ? "grid-rows-[1fr] opacity-100"
                                : "grid-rows-[0fr] opacity-0"
                            }`}
                          >
                            <div className="min-h-0 overflow-hidden">
                              <div className="space-y-2 border-t border-white/10 p-3">
                                {category.services.map((service) => {
                                  const isServiceSelected =
                                    bookingForm.service === service.name;

                                  return (
                                    <button
                                      key={`${category.id}-${service.id}-${service.name}`}
                                      type="button"
                                      onClick={() =>
                                        setBookingForm((current) => ({
                                          ...current,
                                          service: service.name,
                                        }))
                                      }
                                      aria-pressed={isServiceSelected}
                                      className={`flex w-full items-center justify-between gap-3 rounded-xl border px-3 py-3 text-left text-sm transition ${
                                        isServiceSelected
                                          ? "border-[#9c810c] bg-[#9c810c]/15 text-[#f9f104]"
                                          : "border-white/10 bg-black text-zinc-300 hover:border-[#9c810c]/50"
                                      }`}
                                    >
                                      <span>{service.name}</span>
                                      {isServiceSelected && (
                                        <svg
                                          className="h-4 w-4 shrink-0 text-[#9c810c]"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth="2.5"
                                          aria-hidden="true"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="m5 12 4 4L19 6"
                                          />
                                        </svg>
                                      )}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <p className="mt-2 text-xs text-zinc-500">
                    {bookingForm.service
                      ? `Selected service: ${bookingForm.service}`
                      : "Select a category, then choose a service."}
                  </p>
                </div>

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
 
          <div className="flex items-center gap-5">
            <a href="https://www.instagram.com/meenakshi.familysalon/" target="_blank" rel="noreferrer" aria-label="Instagram" className="text-2xl text-[#9c810c] transition hover:text-white"><svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 448 512"
            fill="currentColor"
            className="h-5 w-5"
            aria-hidden="true"
          >
            <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.2 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.5 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.9-26.9 26.9s-26.9-12-26.9-26.9 12-26.9 26.9-26.9 26.9 12 26.9 26.9zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9s-58-34.5-93.9-36.2c-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1S3.2 127.6 1.5 163.5c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.5 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2s34.5-58 36.2-93.9c2.1-37 2.1-147.9 0-184.9zM398.8 388c-7.8 19.6-23 34.8-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.8-23-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 23-34.8 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.8 23 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z" />
          </svg></a>
            <a href="https://www.facebook.com/share/1HVRyaxZZc/" target="_blank" rel="noreferrer" aria-label="Facebook" className="text-xl font-bold text-[#9c810c] transition hover:text-white">f</a>
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
