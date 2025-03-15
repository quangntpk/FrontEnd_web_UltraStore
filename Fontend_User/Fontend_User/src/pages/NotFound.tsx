
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="max-w-md w-full text-center animate-fade-in">
        <div className="inline-block mb-8 p-4 rounded-full bg-primary/10">
          <span className="text-6xl">404</span>
        </div>
        <h1 className="text-3xl font-medium mb-4">Page not found</h1>
        <p className="text-muted-foreground mb-8">
          Sorry, we couldn't find the page you're looking for. It might have been moved or deleted.
        </p>
        <a 
          href="/" 
          className="inline-flex items-center justify-center h-12 px-6 bg-primary text-primary-foreground rounded-full hover:opacity-90 transition-opacity"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
