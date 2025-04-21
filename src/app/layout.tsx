import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
 import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
 import { LoginProvider } from "@/contexts/LoginContextProvider";
 import theme from "@/theme";
 import { AlertProvider } from "@/contexts/AlertContextProvider";
 import { ThemeProvider } from "@mui/material/styles";
 import { Box, CssBaseline } from "@mui/material";
 import DrawerAppBar from "@/components/Drawer";
import { SquareProvider } from "@/contexts/SquareContextProvider";
import { UserProvider } from "@/contexts/UserContextProvider";
import Logo from "@/constants/Logo";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Reciept Branch",
  description: "Generate reciept for your orders",
  openGraph: {
    images: [
      "/logo_primary.png",
      "https://receiptbranch.com/assets/images/logos/logo_primary.png",
    ],
  },
};

 export default function RootLayout({
   children,
 }: Readonly<{
   children: React.ReactNode;
 }>) {
   return (
     <html lang="en">
       <body
         className={`${geistSans.variable} ${geistMono.variable} antialiased`}
       >
         <AppRouterCacheProvider>
           {/* Wrapping the app in StrictMode for development purposes */}
           <ThemeProvider theme={theme}>
             {/* Provide the custom theme to all child components */}
             <CssBaseline />
             {/* Apply baseline styles (normalizing CSS) globally */}
             <AlertProvider>
               {/* Provide alert context to the entire app */}
               <LoginProvider>
                 <UserProvider>
                   <SquareProvider>
                     <DrawerAppBar>
                       <div className="p-[40px]">{children}</div>
                     </DrawerAppBar>
                   </SquareProvider>
                 </UserProvider>
               </LoginProvider>
             </AlertProvider>
           </ThemeProvider>
         </AppRouterCacheProvider>
       </body>
     </html>
   );
 }
