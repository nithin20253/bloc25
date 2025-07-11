
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FileX } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-red-100">
            <FileX className="h-12 w-12 text-red-600" />
          </div>
          <h1 className="mt-6 text-4xl font-extrabold text-gray-900">Page not found</h1>
          <p className="mt-2 text-base text-gray-500">
            Sorry, we couldn't find the page you're looking for.
          </p>
        </div>
        <div className="mt-8">
          <Link to="/">
            <Button className="w-full">
              Go back home
            </Button>
          </Link>
          <p className="mt-4 text-sm text-gray-500">
            Lost? Try checking the blockchain verification services from our homepage.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
