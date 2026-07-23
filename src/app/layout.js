import { Cormorant_Garamond, Inter, Syne } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const syne = Syne({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata = {
  title: "iyi event | Kusursuz Etkinlik & Organizasyon Tasarımı",
  description: "iyi event, en seçkin anlarınızı benzersiz vizyonu, sanatsal hassasiyeti ve kusursuz operasyonel gücüyle unutulmaz anılara dönüştürür.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="tr"
      className={`${cormorant.variable} ${inter.variable} ${syne.variable}`}
      style={{ scrollBehavior: 'smooth' }}
    >
      <head>
        <link 
          rel="stylesheet" 
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" 
          integrity="sha512-iecdLmaskl7CVkqkXNQ/ZH/XLlvWZOJyj7Yy7tcenmpD1ypASozpmT/E0iPtmFIB46ZmdtAc9eNBvH0H/ZpiBw==" 
          crossOrigin="anonymous" 
          referrerPolicy="no-referrer" 
        />
      </head>
      <body>
        <div id="root">
          {children}
        </div>
      </body>
    </html>
  );
}
