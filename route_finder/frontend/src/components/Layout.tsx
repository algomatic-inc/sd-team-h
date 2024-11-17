import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Outlet } from "react-router-dom";
import { APIProvider } from "@vis.gl/react-google-maps";

function Layout() {
  return (
    <div className="min-h-full w-screen">
      <Header />
      <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? ""}>
        <main className="flex-grow">
          <Outlet />
        </main>
      </APIProvider>
      <Footer />
    </div>
  );
}

export default Layout;
