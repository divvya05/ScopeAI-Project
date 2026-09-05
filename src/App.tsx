import { AppProvider, useApp } from "./AppContext";
import { Footer } from "./components/Footer";
import { Navbar } from "./components/Navbar";
import { Assessment } from "./views/Assessment";
import { Landing } from "./views/Landing";
import { Plan } from "./views/Plan";
import { Results } from "./views/Results";
import { Roles } from "./views/Roles";
import { Setup } from "./views/Setup";

function Views() {
  const { route, results, navigate } = useApp();

  if (route === "results") {
    if (!results) {
      navigate("landing");
      return null;
    }
    return <Results />;
  }
  if (route === "roles") {
    if (!results) {
      navigate("landing");
      return null;
    }
    return <Roles />;
  }
  if (route === "plan") {
    if (!results) {
      navigate("landing");
      return null;
    }
    return <Plan />;
  }
  if (route === "setup") return <Setup />;
  if (route === "assessment") return <Assessment />;
  return <Landing />;
}

export default function App() {
  return (
    <AppProvider>
      <div className="flex min-h-screen flex-col bg-slate-50">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-blue-700 focus:px-4 focus:py-2 focus:text-sm focus:text-white"
        >
          Skip to content
        </a>
        <Navbar />
        <main id="main" className="flex-1">
          <Views />
        </main>
        <Footer />
      </div>
    </AppProvider>
  );
}